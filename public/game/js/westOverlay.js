export function initWestOverlay(map) {
  // create a pane for the western US overlay
  map.createPane("westUSPane");
  map.getPane("westUSPane").style.zIndex = 600;

  // URL to GeoJSON of US states
  const url = "https://cdn.jsdelivr.net/gh/PublicaMundi/MappingAPI@master/data/geojson/us-states.json";
  fetch(url)
    .then(res => res.json())
    .then(data => {
      // Only these western states; Colorado will be clipped at Boulder longitude
      const westStates = [
        "California","Oregon","Washington","Idaho","Nevada",
        "Utah","Arizona","Montana","Wyoming","Colorado","New Mexico"
      ];
      const boulderLon = -105.2705; // cutoff longitude for Boulder, CO
      const clippedFeatures = [];

      data.features.forEach(feature => {
        const name = feature.properties.name;
        if (!westStates.includes(name)) return;

        if (name === "Colorado") {
          try {
            // Create a custom polygon that's the western half of Colorado
            // Colorado is roughly a rectangle, so we can create a simplified version
            // Get the bounds of Colorado
            const bounds = L.geoJSON(feature).getBounds();
            const north = bounds.getNorth();
            const south = bounds.getSouth();
            const west = bounds.getWest();
            
            // Create a rectangle for western Colorado
            const westernHalf = {
              type: "Feature",
              properties: feature.properties,
              geometry: {
                type: "Polygon",
                coordinates: [[
                  [west, south],
                  [west, north],
                  [boulderLon, north],
                  [boulderLon, south],
                  [west, south]
                ]]
              }
            };
            
            clippedFeatures.push(westernHalf);
          } catch (e) {
            console.error("Error creating western Colorado polygon:", e);
          }
        } else {
          clippedFeatures.push(feature);
        }
      });

      // render the clipped western-US overlay
      L.geoJson(clippedFeatures, {
        pane: "westUSPane",
        style: {
          color: "green",
          weight: 2,
          fillColor: "green",
          fillOpacity: 0.3
        }
      }).addTo(map);
    })
    .catch(err => console.error("Error loading western US overlay:", err));
}