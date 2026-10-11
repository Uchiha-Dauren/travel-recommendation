# Roamly travel recommendations

A responsive, buildless travel discovery demo made with HTML, CSS, and vanilla JavaScript. No package installation or API key is needed.

## Pages and files

- `index.html` and `travel_recommendation.html`: identical home pages. `index.html` is the default entry point for static hosting.
- `about.html`: company concept, values, and clearly identified fictional demonstration team.
- `contact.html`: name, email, and message form with native browser validation.
- `travel_recommendation.js`: submitted searches, safe DOM rendering, Clear behavior, local time display, and demo form acknowledgment.
- `travel_recommendation_api.json`: local destination data.
- `styles.css`: responsive presentation and keyboard focus states.
- `images/`: bundled images. See the accompanying asset attribution file, if present, for sources and credits.

## Run locally

Serve this folder over HTTP so `fetch('./travel_recommendation_api.json')` can load the data. Opening HTML with a `file://` URL may prevent the JSON request.

From this folder, run:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/` or `http://localhost:8000/travel_recommendation.html` in your browser. Stop the server with Control-C.

## Try the site

1. Enter `beach`, `beaches`, `temple`, `temples`, `country`, `countries`, or a country name in the home page search, then press Search or Enter.
2. Searches ignore capitalization and leading/trailing spaces. Category inspiration buttons fill the field; select Search to run the search.
3. `country` and `countries` show one city from each of two distinct countries, with each country visibly labeled. A country-name search shows the cities for that country. The JSON file contains the available names.
4. Select Clear to remove the query and results and restore the home introduction.
5. Open About Us and Contact Us using the navigation. Book Now and destination links lead to Contact Us.

The search includes loading, empty-result, missing-image, and data-request failure states. Each result image has alternative text, and results are rendered with DOM APIs and `textContent` rather than interpolated HTML. Destination times use each destination’s IANA time zone and are calculated when results render.

## Contact form behavior

Name, a valid email address, and a message of at least ten characters are required. Submit performs browser validation and displays an honest, browser-local acknowledgment. **No email is sent, no information is saved, and no booking is made.** The displayed `hello@roamly.example` address is reserved demonstration content and does not receive email. The form has no backend or external integration.

## Publish with GitHub Pages

1. Put all files from this folder in the root of your GitHub repository (or in a `docs` folder). Keep the JSON and `images` folder alongside `index.html`.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select the branch containing your files, and choose the root or `docs` folder used in step 1.
4. Save and wait for GitHub Pages to publish. Open the URL shown in Pages settings.

The site uses relative paths and works under a repository subpath. Keep `index.html` and `travel_recommendation.html` in sync when editing the home page. No build step, environment variables, or server-side service is required.

## Destination data contract

The JSON root contains `countries`, `temples`, and `beaches` arrays. A country has `id`, `name`, and a `cities` array. Each city, temple, and beach has `id`, `name`, `imageUrl`, `description`, and `timeZone`. Image URLs should point to bundled assets on the same origin, and time zones should be valid IANA names, such as `Australia/Sydney`.

Roamly is an illustrative project; its company, team, and contact details are demonstration content.
