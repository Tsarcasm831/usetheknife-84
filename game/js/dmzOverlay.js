export function initDMZOverlay(map) {
  // Create a pane for the DMZ (middle states) overlay
  map.createPane("dmzPane");
  map.getPane("dmzPane").style.zIndex = 598; // Below east and west overlays

  // URL to GeoJSON of US states
  const url = "https://cdn.jsdelivr.net/gh/PublicaMundi/MappingAPI@master/data/geojson/us-states.json";
  fetch(url)
    .then(res => res.json())
    .then(data => {
      // States in the DMZ zone (between East and West)
      const dmzStates = [
        "North Dakota", "South Dakota", "Nebraska", "Kansas", 
        "Oklahoma", "Texas", "Minnesota", "Iowa", "Missouri", 
        "Arkansas", "Louisiana"
      ];
      
      // Filter for DMZ states
      const dmzFeatures = data.features.filter(feature => {
        const name = feature.properties.name;
        return dmzStates.includes(name);
      });

      // Create individual state overlays with grey outlines
      dmzFeatures.forEach(feature => {
        L.geoJson(feature, {
          pane: "dmzPane",
          style: {
            color: "#777777",      // Grey outline
            weight: 2,             // Line thickness
            fillColor: "#DDDDDD",  // Light grey fill
            fillOpacity: 0.3,      // Partially transparent fill
            opacity: 0.8           // Outline opacity
          }
        }).addTo(map);
      });
    })
    .catch(err => console.error("Error loading DMZ overlay:", err));
}