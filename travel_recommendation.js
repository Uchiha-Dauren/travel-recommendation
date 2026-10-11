/* Roamly: buildless, browser-local travel discovery. */
(() => {
  'use strict';

  const searchForm = document.getElementById('search-form');
  const contactForm = document.getElementById('contact-form');

  if (searchForm) {
    const input = document.getElementById('destination-search');
    const clearButton = document.getElementById('clear-search');
    const results = document.getElementById('search-results');
    const resultsTitle = document.getElementById('results-title');
    const summary = document.getElementById('results-summary');
    const content = document.getElementById('results-content');
    const introduction = document.getElementById('home-introduction');
    let dataPromise = null;
    let searchVersion = 0;

    const normalize = value => value.trim().toLocaleLowerCase('en');

    function loadDestinations() {
      if (!dataPromise) {
        dataPromise = fetch('./travel_recommendation_api.json')
          .then(response => {
            if (!response.ok) throw new Error('Destination data could not be loaded.');
            return response.json();
          })
          .then(data => {
            if (!data || !Array.isArray(data.countries) || !Array.isArray(data.beaches) || !Array.isArray(data.temples)) {
              throw new Error('Destination data is not in the expected format.');
            }
            return data;
          })
          .catch(error => {
            dataPromise = null; // A later submission can retry a failed request.
            throw error;
          });
      }
      return dataPromise;
    }

    function selectDestinations(data, query) {
      if (query === 'beach' || query === 'beaches') {
        return data.beaches.map(place => ({ ...place, category: 'Beach' }));
      }
      if (query === 'temple' || query === 'temples') {
        return data.temples.map(place => ({ ...place, category: 'Temple' }));
      }
      if (query === 'country' || query === 'countries') {
        // Take one city from each of two different countries, rather than two
        // cities from the same country. Country names remain visible on cards.
        const uniqueCountries = new Map();
        data.countries.forEach(country => {
          if (typeof country.name === 'string' && Array.isArray(country.cities) && country.cities.length) {
            const key = normalize(country.name);
            if (!uniqueCountries.has(key)) uniqueCountries.set(key, country);
          }
        });
        return Array.from(uniqueCountries.values()).slice(0, 2).map(country => ({
          ...country.cities[0], category: country.name
        }));
      }
      const country = data.countries.find(item => typeof item.name === 'string' && normalize(item.name) === query);
      return country && Array.isArray(country.cities)
        ? country.cities.map(place => ({ ...place, category: country.name }))
        : [];
    }

    function element(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    }

    function showMessage(title, text, loading = false) {
      const message = element('div', 'result-message' + (loading ? ' loading-message' : ''));
      if (loading) {
        const spinner = element('span', 'loading-spinner');
        spinner.setAttribute('aria-hidden', 'true');
        message.append(spinner);
      }
      const body = element('div');
      if (title) body.append(element('h2', '', title));
      body.append(element('p', '', text));
      message.append(body);
      content.replaceChildren(message);
    }

    function localTime(timeZone) {
      if (!timeZone) return '';
      try {
        return new Intl.DateTimeFormat('en-US', {
          hour: 'numeric', minute: '2-digit', timeZone
        }).format(new Date());
      } catch {
        return '';
      }
    }

    function safeImageUrl(imageUrl) {
      if (typeof imageUrl !== 'string') return './images/hero.jpg';
      try {
        const url = new URL(imageUrl, document.baseURI);
        // The bundled data uses local assets. Keep data-driven images local.
        return url.origin === window.location.origin && /^https?:$/.test(url.protocol)
          ? url.href : './images/hero.jpg';
      } catch {
        return './images/hero.jpg';
      }
    }

    function renderDestinations(places) {
      const grid = element('div', 'results-grid');
      places.forEach(place => {
        const card = element('article', 'destination-card');
        const picture = element('div', 'destination-image-wrap');
        const img = element('img', 'destination-image');
        img.src = safeImageUrl(place.imageUrl);
        img.alt = typeof place.name === 'string' ? place.name : 'Travel destination';
        img.width = 800;
        img.height = 500;
        img.loading = 'eager';
        img.decoding = 'async';
        img.addEventListener('error', () => {
          img.src = './images/hero.jpg';
          img.alt = 'Scenic travel inspiration; destination photo unavailable';
        }, { once: true });
        picture.append(img, element('span', 'destination-category', place.category));
        const body = element('div', 'destination-content');
        body.append(element('h2', '', place.name || 'A new destination'));
        body.append(element('p', 'destination-description', place.description || 'A place to explore on your next journey.'));
        const bottom = element('div', 'destination-bottom');
        const time = localTime(place.timeZone);
        bottom.append(element('span', 'destination-time', time ? 'LOCAL TIME · ' + time : 'YOUR NEXT CHAPTER'));
        const link = element('a', 'destination-link', 'Plan a visit ');
        link.href = './contact.html';
        link.setAttribute('aria-label', 'Plan a visit to ' + (place.name || 'this destination'));
        const arrow = element('span', '', '↗');
        arrow.setAttribute('aria-hidden', 'true');
        link.append(arrow);
        bottom.append(link);
        body.append(bottom);
        card.append(picture, body);
        grid.append(card);
      });
      content.replaceChildren(grid);
    }

    searchForm.addEventListener('submit', async event => {
      event.preventDefault();
      const version = ++searchVersion;
      const enteredQuery = input.value.trim();
      const query = normalize(enteredQuery);
      input.value = enteredQuery;
      introduction.hidden = true;
      results.hidden = false;
      resultsTitle.textContent = enteredQuery ? 'Places for “' + enteredQuery + '”' : 'Where would you like to go?';
      resultsTitle.focus({ preventScroll: true });
      results.scrollIntoView({ behavior: 'auto', block: 'start' });
      if (!query) {
        results.setAttribute('aria-busy', 'false');
        summary.textContent = 'Enter a search to begin';
        showMessage('A little inspiration?', 'Try beaches, temples, countries, or a country name such as Australia.');
        return;
      }
      results.setAttribute('aria-busy', 'true');
      summary.textContent = 'Finding your places…';
      showMessage('', 'A new adventure is on its way…', true);
      try {
        const data = await loadDestinations();
        if (version !== searchVersion) return;
        const places = selectDestinations(data, query);
        if (places.length) {
          renderDestinations(places);
          summary.textContent = places.length + (places.length === 1 ? ' place to spark your curiosity' : ' places to spark your curiosity');
        } else {
          const countryNames = data.countries.map(country => country.name).filter(name => typeof name === 'string').join(', ');
          summary.textContent = 'No matching places';
          showMessage('A different direction, perhaps?', 'We couldn’t find a match for “' + enteredQuery + '”. Try beaches, temples, countries' + (countryNames ? ', or one of these country names: ' + countryNames + '.' : '.'));
        }
      } catch {
        if (version !== searchVersion) return;
        summary.textContent = 'Destinations are unavailable';
        showMessage('We couldn’t load the destinations.', 'Please try Search again. If you opened this page directly from a file, run it through a local web server so it can load the destination data.');
      } finally {
        if (version === searchVersion) results.setAttribute('aria-busy', 'false');
      }
    });

    clearButton.addEventListener('click', () => {
      searchVersion += 1; // Ignore a pending fetch after the visitor clears.
      input.value = '';
      results.hidden = true;
      results.setAttribute('aria-busy', 'false');
      summary.textContent = '';
      content.replaceChildren();
      introduction.hidden = false;
      input.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'auto' });
    });

    document.querySelectorAll('[data-search-suggestion]').forEach(button => {
      button.addEventListener('click', () => {
        input.value = button.dataset.searchSuggestion;
        input.focus();
        input.scrollIntoView({ behavior: 'auto', block: 'center' });
      });
    });
  }

  if (contactForm) {
    const name = document.getElementById('contact-name');
    const message = document.getElementById('contact-message');
    const status = document.getElementById('form-status');

    [name, message].forEach(field => {
      field.addEventListener('input', () => field.setCustomValidity(''));
    });

    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      name.setCustomValidity(name.value.trim().length < 2 ? 'Please enter a name with at least two characters.' : '');
      message.setCustomValidity(message.value.trim().length < 10 ? 'Please enter a message with at least ten characters.' : '');
      if (!contactForm.reportValidity()) return;
      status.textContent = 'Thanks, ' + name.value.trim() + '. This demo validated your message in this browser. Nothing has been sent or saved, and no booking has been made.';
      status.hidden = false;
      status.focus({ preventScroll: true });
      status.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    });
  }
})();
