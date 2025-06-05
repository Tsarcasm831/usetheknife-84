export function initEastOverlay(map) {
  // Create a pane for the eastern US overlay
  map.createPane("eastUSPane");
  map.getPane("eastUSPane").style.zIndex = 599; // Just below the westUS overlay

  // URL to GeoJSON of US states
  const url = "https://cdn.jsdelivr.net/gh/PublicaMundi/MappingAPI@master/data/geojson/us-states.json";
  fetch(url)
    .then(res => res.json())
    .then(data => {
      // States east of the Mississippi River
      const eastStates = [
        "Alabama", "Connecticut", "Delaware", "Florida", "Georgia", 
        "Illinois", "Indiana", "Kentucky", "Maine", "Maryland", 
        "Massachusetts", "Michigan", "Mississippi", "New Hampshire", 
        "New Jersey", "New York", "North Carolina", "Ohio", 
        "Pennsylvania", "Rhode Island", "South Carolina", "Tennessee", 
        "Vermont", "Virginia", "West Virginia", "Wisconsin"
      ];
      
      // Filter for eastern states
      const eastFeatures = data.features.filter(feature => {
        const name = feature.properties.name;
        return eastStates.includes(name);
      });

      // Create individual state overlays with yellow outlines and light yellow fill
      eastFeatures.forEach(feature => {
        // Add each state individually with its own styling
        L.geoJson(feature, {
          pane: "eastUSPane",
          style: {
            color: "yellow",        // Yellow outline
            weight: 2,              // Line thickness
            fillColor: "#FFFFE0",   // Light yellow fill
            fillOpacity: 0.3,       // Partially transparent fill
            opacity: 0.8            // Outline opacity
          }
        }).addTo(map);
      });
    })
    .catch(err => console.error("Error loading eastern US overlay:", err));
}