# Tactical Map Viewer

This folder contains the Leaflet-based map used to explore the world of **Remnants of Destruction**. The viewer is fully client-side and can be opened directly in a browser or from a lightweight local server.

## Features

- Split screen map that lets you compare street, satellite and topographic layers.
- Grid overlay with tools to scan subcells, map roads and search for events.
- Reverse geocoding on double click to display coordinates and an address popup.
- Home base marker and geolocation helper.
- Optional 3D terrain view powered by Three.js.
- Globe mode for a simplified planetary overview.
- Modals for factions, bestiary and other game data.

## Running Locally

Open the viewer using a basic web server so all assets load correctly:

```bash
cd public/game
python -m http.server
```

Then visit `http://localhost:8000` in your browser. Opening the `index.html` file directly may cause CORS errors.

## Configuration

The Google Maps API script in `index.html` includes a placeholder key:

```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY_HERE&loading=async"></script>
```

Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your own API key if you want to enable Street View and geocoding features.
