// Core grid drawing and management functionality
import { updateGeolocation } from "./geolocation.js";

export function initGridOverlay(map) {
  const gridLayer = L.layerGroup();
  const gridLabelLayer = L.layerGroup();
  const highlightLayer = L.layerGroup();
  
  const latStep = 10 / 110.574;
  const lonStep = latStep;
  const LABEL_ZOOM_MIN = 12;
  let gridVisible = false;
  let selectedCellBounds = null;
  
  function drawGrid() {
    gridLayer.clearLayers();
    gridLabelLayer.clearLayers();
    const b = map.getBounds();
    const s = b.getSouth(), n = b.getNorth(), w = b.getWest(), e = b.getEast();
    const startLat = Math.floor(s / latStep) * latStep;
    const endLat = Math.ceil(n / latStep) * latStep;
    const startLng = Math.floor(w / lonStep) * lonStep;
    const endLng = Math.ceil(e / lonStep) * lonStep;

    for (let lat = startLat; lat <= endLat; lat += latStep) {
      gridLayer.addLayer(L.polyline([[lat, w], [lat, e]], { color: "#FFA500", weight: 3, opacity: 1, interactive: false }));
    }
    for (let lng = startLng; lng <= endLng; lng += lonStep) {
      gridLayer.addLayer(L.polyline([[s, lng], [n, lng]], { color: "#FFA500", weight: 3, opacity: 1, interactive: false }));
    }
    if (map.getZoom() >= LABEL_ZOOM_MIN) {
      for (let lat = startLat; lat < endLat; lat += latStep) {
        for (let lng = startLng; lng < endLng; lng += lonStep) {
          const centerLat = lat + latStep / 2;
          const centerLng = lng + lonStep / 2;
          const row = Math.floor((lat + 90) / latStep);
          const col = Math.floor((lng + 180) / lonStep);
          const id = `R${row}C${col}`;
          gridLabelLayer.addLayer(L.marker([centerLat, centerLng], {
            icon: L.divIcon({ className: "grid-label", html: id, iconSize: [0,0], iconAnchor: [0,0] }),
            interactive: false
          }));
        }
      }
    }
  }

  function highlightGridCell(e) {
    const lat = Math.floor(e.latlng.lat / latStep) * latStep;
    const lng = Math.floor(e.latlng.lng / lonStep) * lonStep;
    selectedCellBounds = [[lat, lng], [lat + latStep, lng + lonStep]];
    highlightLayer.clearLayers();
    highlightLayer.addLayer(L.rectangle(selectedCellBounds, { color: "blue", weight: 2, fill: false }));
    highlightLayer.addTo(map);

    // Signal that a new cell was selected - event-based communication
    const event = new CustomEvent('gridCellSelected', {
      detail: { bounds: selectedCellBounds }
    });
    document.dispatchEvent(event);
    
    updateGeolocation(e.latlng.lat, e.latlng.lng);
  }

  function doubleClickGridCell(e) {
    if (!gridVisible) return;
    const lat = Math.floor(e.latlng.lat / latStep) * latStep + latStep/2;
    const lng = Math.floor(e.latlng.lng / lonStep) * lonStep + lonStep/2;
    const half = (6 / 110.574) / 2;
    map.flyToBounds([[lat-half, lng-half],[lat+half, lng+half]], { duration: 0.5 });
  }

  function toggleGrid() {
    if (gridVisible) {
      map.removeLayer(gridLayer);
      map.removeLayer(gridLabelLayer);
      map.off("moveend", drawGrid);
      map.off("zoomend", drawGrid);
      map.off("click", highlightGridCell);
      map.off("dblclick", doubleClickGridCell);
      highlightLayer.clearLayers();
      map.removeLayer(highlightLayer);
      
      // Signal that grid is being toggled off
      document.dispatchEvent(new CustomEvent('gridToggled', { detail: { visible: false } }));
    } else {
      drawGrid();
      gridLayer.addTo(map);
      gridLabelLayer.addTo(map);
      map.on("moveend", drawGrid);
      map.on("zoomend", drawGrid);
      map.on("click", highlightGridCell);
      map.on("dblclick", doubleClickGridCell);
      
      // Signal that grid is being toggled on
      document.dispatchEvent(new CustomEvent('gridToggled', { detail: { visible: true } }));
    }
    gridVisible = !gridVisible;
  }

  // Register shortcut key for grid toggle
  document.addEventListener("keydown", e => { if (e.key.toLowerCase()==="g") toggleGrid(); });
  
  return {
    toggleGrid,
    getSelectedCellBounds: () => selectedCellBounds,
    isGridVisible: () => gridVisible,
    layers: {
      gridLayer,
      gridLabelLayer,
      highlightLayer
    }
  };
}