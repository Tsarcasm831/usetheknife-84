export function initMapBase() {
  const map = L.map("map", {
    fullscreenControl: true,
    permalink: true,
    zoomControl: false,
    doubleClickZoom: false,
    minZoom: 5,
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0
  }).setView([40.153654, -105.109248], 13);

  const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'OpenStreetMap' 
  });
  const satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "Esri Satellite" } 
  );
  const topoLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: 'OpenTopoMap' 
  });

  const baseMaps = {
    "Street Map": osmLayer,
    "Satellite": satelliteLayer,
    "Topographic": topoLayer
  };

  let currentLeftLayer = osmLayer;
  let currentRightLayer = satelliteLayer;

  // Add both layers to the map
  currentLeftLayer.addTo(map);
  currentRightLayer.addTo(map);

  // Check for side-by-side control plugin with better error handling
  let sideBySideControl = null;
  
  try {
    if (L.control && typeof L.control.sideBySide === 'function') {
      sideBySideControl = L.control.sideBySide(currentLeftLayer, currentRightLayer);
      sideBySideControl.addTo(map);
      console.log("Side-by-side control initialized successfully");
    } else {
      console.warn("L.control.sideBySide function not available - using standard layer control instead");
    }
  } catch (error) {
    console.error("Error setting up side-by-side control:", error);
  }

  // Add standard layer control as main control or fallback
  L.control.layers(baseMaps, null, { collapsed: false, position: "topright" }).addTo(map);

  // Handle layer changes
  map.on('baselayerchange', function(e) {
    if (e.layer === currentLeftLayer || e.layer === currentRightLayer) {
      if (e.layer === currentLeftLayer) {
        currentLeftLayer = e.layer;
      } else {
        currentRightLayer = e.layer;
      }
      
      // Update the side-by-side control if available
      if (sideBySideControl) {
        try {
          if (e.layer === currentLeftLayer) {
            sideBySideControl.setLeftLayers(currentLeftLayer);
          } else {
            sideBySideControl.setRightLayers(currentRightLayer);
          }
        } catch (err) {
          console.warn("Error updating side-by-side layers:", err);
        }
      }
    }
  });
  
  // Add basic controls
  L.control.zoom({ position: "topleft" }).addTo(map);
  L.control.scale({
    position: "bottomleft",
    maxWidth: 200,
    metric: true,
    imperial: true,
    updateWhenIdle: false
  }).addTo(map);

  return map;
}