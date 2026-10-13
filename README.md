# Netflix (private frontend prototype)

An interactive replica of the modern Netflix desktop browsing experience, connected to the real EvanPlayer watch routes. The root page is the application, never a marketing or sign-in landing page.

## Implemented

- Profile chooser, profile switching and rename, with local browser persistence
- Featured-title hero, navigation, horizontally scrolling rails, Top 10, search, and a My List collection
- Movies, TV Shows, New & Popular, language filtering, responsive layout, title detail dialogs
- TMDB-backed metadata, dynamic artwork, season/episode lists, with a curated offline fallback catalog
- EvanPlayer integration via movie and series ID, including specific seasons and episodes

## Local preview

Requires only a static HTTP server:

    python -m http.server 8765

Open http://localhost:8765 in your browser.

## Player configuration

The EvanPlayer project lives in the private lauraevan/Evan-player repository. It is a separate FastAPI application and exposes these playback pages:

    /watch/movie/550?title=Fight%20Club
    /watch/tv/1399?season=1&episode=1&title=Game%20of%20Thrones

Deploy EvanPlayer to a browser-reachable HTTPS server, and set playerBaseUrl in config.js. Alternatively, press Play in the Netflix interface and enter the base URL; this is saved locally in the browser. The app embeds the existing EvanPlayer page in an iframe, retaining its own playback UI, HLS handling, subtitles and fallback behavior.

A static preview does not include the FastAPI media resolver. The EvanPlayer backend needs to be running separately and must permit embedding; live availability of any particular stream is not guaranteed. This first release tracks recently opened titles under Continue Watching, but exact playback position sync across cross-origin frames is not implemented. EvanPlayer itself owns the resume state.

TMDB provides artwork, discovery and episode metadata. config.js currently reuses the existing EvanPlayer metadata API key. Client-side keys are visible to anyone who can view a deployment; production should proxy metadata requests through a server.

## Private GitHub and GitHack

The repository is private. GitHack only serves publicly accessible files, and therefore cannot open its contents. The following URL is the intended GitHack preview route once the static frontend is published to a public mirror or this repository becomes public:

https://raw.githack.com/lauraevan/Netflix/main/index.html

Do not interpret that URL as an active preview while the repository remains private. To preserve repo privacy, preview locally or use an authenticated preview server.

## QA

Run Node syntax validation:

    node --check app.js
    node --check config.js

The included GitHub Actions workflow runs these checks on pushes.

This is an unofficial private interface prototype and is not affiliated with Netflix. Metadata and artwork are not sourced from Netflix's private APIs.
