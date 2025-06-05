import { updateGeolocation } from "./geolocation.js";

export function initSubgrid(map) {
  const subGridLayer = L.layerGroup();
  const subLabelLayer = L.layerGroup();
  const subHighlightLayer = L.layerGroup();
  
  let selectedSubCellData = null;
  let scanCompletedForMainCell = false;
  let selectedCellBounds = null;
  
  // Add layers to map
  subHighlightLayer.addTo(map);

  function highlightSubGridCell(data) {
    selectedSubCellData = data;
    subHighlightLayer.clearLayers();

    if (data && data.bounds) {
      L.rectangle(data.bounds, {
        color: "cyan",
        weight: 3,
        fill: true,
        fillColor: "cyan",
        fillOpacity: 0.2,
        interactive: false
      }).addTo(subHighlightLayer);
      console.log("Subgrid cell selected:", data.id, data.bounds);
    }
    
    // Signal that a subgrid cell was selected
    document.dispatchEvent(new CustomEvent('subgridCellSelected', { 
      detail: { data: selectedSubCellData }
    }));
    
    if (data && data.bounds) {
      const center = [
        (data.bounds[0][0] + data.bounds[1][0]) / 2,
        (data.bounds[0][1] + data.bounds[1][1]) / 2
      ];
      updateGeolocation(center[0], center[1]);
    }
  }

  function flashAndZoomToCell(bounds, mapInstance, times, durationPerFlash, subCellToSelect) {
    if (times <= 0) {
      mapInstance.flyToBounds(bounds, { 
        duration: 1.0, 
        paddingTopLeft: [30, 30], 
        paddingBottomRight: [30, 30] 
      });
      
      // Signal that scanning is complete
      document.dispatchEvent(new CustomEvent('scanCompleted', {
        detail: { success: true }
      }));
      
      highlightSubGridCell(subCellToSelect);
      return;
    }

    const highlightRect = L.rectangle(bounds, { 
        color: "yellow", 
        weight: 4, 
        fillColor: "yellow", 
        fillOpacity: 0.6, 
        pane: 'popupPane' 
    });
    highlightRect.addTo(mapInstance);

    setTimeout(() => {
        mapInstance.removeLayer(highlightRect);
        setTimeout(() => {
            flashAndZoomToCell(bounds, mapInstance, times - 1, durationPerFlash, subCellToSelect);
        }, durationPerFlash / 2); 
    }, durationPerFlash / 2); 
  }

  function startSubgridScan() {
    if (!selectedCellBounds) return;

    selectedSubCellData = null;
    subHighlightLayer.clearLayers();
    scanCompletedForMainCell = false;
    
    // Signal that scanning is starting
    document.dispatchEvent(new CustomEvent('scanStarted'));

    if (map.hasLayer(subGridLayer)) map.removeLayer(subGridLayer);
    if (map.hasLayer(subLabelLayer)) map.removeLayer(subLabelLayer);
    
    subGridLayer.clearLayers();
    subLabelLayer.clearLayers();

    if (!map.hasLayer(subGridLayer)) subGridLayer.addTo(map);
    if (!map.hasLayer(subLabelLayer)) subLabelLayer.addTo(map);
    if (!map.hasLayer(subHighlightLayer)) subHighlightLayer.addTo(map);

    const subs = 5;
    const delay = 120;
    let count = 0;
    const total = subs * subs;
    const [sw, ne] = selectedCellBounds;

    const drawnSubCellsData = [];

    const cellsToScan = [];
    for (let i = subs - 1; i >= 0; i--) {
      for (let j = 0; j < subs; j++) {
        cellsToScan.push({ i, j });
      }
    }
    
    cellsToScan.sort(() => Math.random() - 0.5);

    cellsToScan.forEach((cellData, index) => {
      setTimeout(() => {
        const { i, j } = cellData;
        const subCellLatStep = (ne[0] - sw[0]) / subs;
        const subCellLonStep = (ne[1] - sw[1]) / subs;

        const subCellSWLat = ne[0] - (i + 1) * subCellLatStep;
        const subCellSWLon = sw[1] + j * subCellLonStep;
        const subCellNELat = ne[0] - i * subCellLatStep;
        const subCellNELon = sw[1] + (j + 1) * subCellLonStep;

        const boundsArr = [[subCellSWLat, subCellSWLon], [subCellNELat, subCellNELon]];
        const currentSubCellData = { bounds: boundsArr, i: subs-1-i, j: j, id: `SubR${subs-1-i}C${j}` };
        drawnSubCellsData.push(currentSubCellData);

        const subRect = L.rectangle(boundsArr, {
          color: "green",
          weight: 3,
          dashArray: "4",
          fillColor: "green",
          fillOpacity: 0.2,
          className: "subgrid-rect",
          interactive: true
        }).addTo(subGridLayer);

        subRect.subCellData = currentSubCellData;
        subRect.on('click', (ev) => {
            L.DomEvent.stopPropagation(ev);
            highlightSubGridCell(ev.target.subCellData);
        });

        const center = [
          subCellSWLat + subCellLatStep / 2,
          subCellSWLon + subCellLonStep / 2
        ];
        subLabelLayer.addLayer(
          L.marker(center, {
            icon: L.divIcon({
              className: "subgrid-label",
              html: `${subs-i},${j + 1}`,
              iconSize: [0, 0],
              iconAnchor: [0,0]
            }),
            interactive: false
          })
        );

        count++;
        if (count === total) {
          scanCompletedForMainCell = true;
          if (drawnSubCellsData.length > 0) {
            const randomIndex = Math.floor(Math.random() * drawnSubCellsData.length);
            const randomSubCell = drawnSubCellsData[randomIndex];
            flashAndZoomToCell(randomSubCell.bounds, map, 2, 600, randomSubCell);
          } else {
            // Signal that scanning is complete with no results
            document.dispatchEvent(new CustomEvent('scanCompleted', {
              detail: { success: false }
            }));
          }
        }
      }, index * delay);
    });
  }

  // Listen for grid cell selection
  document.addEventListener('gridCellSelected', (e) => {
    selectedCellBounds = e.detail.bounds;
    // Clear subgrid when new grid cell is selected
    subGridLayer.clearLayers();
    subLabelLayer.clearLayers();
    subHighlightLayer.clearLayers();
    selectedSubCellData = null;
    scanCompletedForMainCell = false;
  });
  
  // Listen for grid toggle
  document.addEventListener('gridToggled', (e) => {
    if (!e.detail.visible) {
      // Clean up subgrid layers when grid is toggled off
      if (map.hasLayer(subGridLayer)) map.removeLayer(subGridLayer);
      if (map.hasLayer(subLabelLayer)) map.removeLayer(subLabelLayer);
      if (map.hasLayer(subHighlightLayer)) map.removeLayer(subHighlightLayer);
      selectedCellBounds = null;
      selectedSubCellData = null;
      scanCompletedForMainCell = false;
    }
  });

  return {
    startSubgridScan,
    highlightSubGridCell,
    getSelectedSubCellData: () => selectedSubCellData,
    hasCompletedScan: () => scanCompletedForMainCell,
    layers: {
      subGridLayer,
      subLabelLayer,
      subHighlightLayer
    }
  };
}