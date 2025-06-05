// Controls UI aspects of grid functionality
export function initGridController() {
  const scanBtn = document.getElementById("grid-action-btn");
  const mapRoadsBtn = document.getElementById("map-roads-btn");
  const findEventsBtn = document.getElementById("find-events-btn");
  const toggle3DBtn = document.getElementById("toggle-3d-btn"); // Get 3D button
  
  let gridVisible = false;
  let selectedCellBounds = null;
  let selectedSubCellData = null;
  let scanCompletedForMainCell = false;
  let currentMappingCompleted = false; 
  let currentRoadGeoJson = null;

  function updateActionButtonsVisibility() {
    if (!gridVisible || !selectedCellBounds) {
      if (scanBtn) scanBtn.style.display = "none";
      if (mapRoadsBtn) mapRoadsBtn.style.display = "none";
      if (findEventsBtn) findEventsBtn.style.display = "none";
      if (toggle3DBtn) toggle3DBtn.style.display = "none"; // Hide 3D button
      return;
    }

    if (scanBtn) scanBtn.style.display = "inline-block";
    
    if (mapRoadsBtn) {
        mapRoadsBtn.style.display = (gridVisible && selectedCellBounds && selectedSubCellData) ? "inline-block" : "none";
    }

    if (findEventsBtn) {
      if (scanCompletedForMainCell && currentMappingCompleted && 
          selectedSubCellData && currentRoadGeoJson) {
        findEventsBtn.style.display = "inline-block";
      } else {
        findEventsBtn.style.display = "none";
      }
    }

    // Control visibility of the 3D Terrain button
    if (toggle3DBtn) {
      if (gridVisible && selectedCellBounds && selectedSubCellData) {
        toggle3DBtn.style.display = "inline-block"; // Show if a subcell is selected
      } else {
        toggle3DBtn.style.display = "none";
      }
    }
  }

  // Listen for grid toggling
  document.addEventListener('gridToggled', (e) => {
    gridVisible = e.detail.visible;
    if (!gridVisible) {
      selectedCellBounds = null;
      selectedSubCellData = null;
      scanCompletedForMainCell = false;
      currentMappingCompleted = false;
      currentRoadGeoJson = null;
    }
    updateActionButtonsVisibility();
  });
  
  // Listen for grid cell selection
  document.addEventListener('gridCellSelected', (e) => {
    selectedCellBounds = e.detail.bounds;
    selectedSubCellData = null; 
    scanCompletedForMainCell = false;
    currentMappingCompleted = false;
    currentRoadGeoJson = null;
    updateActionButtonsVisibility();
  });
  
  // Listen for subgrid cell selection
  document.addEventListener('subgridCellSelected', (e) => {
    selectedSubCellData = e.detail.data;
    currentMappingCompleted = false; 
    currentRoadGeoJson = null;
    updateActionButtonsVisibility();
  });
  
  // Listen for scan completion
  document.addEventListener('scanCompleted', (e) => {
    scanCompletedForMainCell = e.detail.success;
    if (scanBtn) {
      scanBtn.disabled = false;
      scanBtn.textContent = "Scan Again";
      scanBtn.style.backgroundColor = "";
    }
    updateActionButtonsVisibility();
  });
  
  // Listen for scan start
  document.addEventListener('scanStarted', () => {
    if (scanBtn) {
      scanBtn.disabled = true;
      scanBtn.textContent = "Scanning...";
      scanBtn.style.backgroundColor = "#00ff00";
    }
  });
  
  // Listen for road mapping completion
  document.addEventListener('roadMappingCompleted', (e) => {
    currentMappingCompleted = e.detail.success;
    if (e.detail.success) {
      currentRoadGeoJson = e.detail.data;
    } else {
      currentRoadGeoJson = null; 
    }
    if (mapRoadsBtn) {
      mapRoadsBtn.disabled = false;
      mapRoadsBtn.textContent = "Map";
    }
    updateActionButtonsVisibility();
  });
  
  // Listen for road mapping failure
  document.addEventListener('roadMappingFailed', () => {
    currentMappingCompleted = false;
    currentRoadGeoJson = null;
    if (mapRoadsBtn) {
      mapRoadsBtn.disabled = false;
      mapRoadsBtn.textContent = "Map";
    }
    updateActionButtonsVisibility();
  });
  
  // Listen for road mapping start
  document.addEventListener('roadMappingStarted', () => {
    if (mapRoadsBtn) {
      mapRoadsBtn.textContent = "Mapping...";
      mapRoadsBtn.disabled = true;
    }
  });
  
  // Listen for event finding start
  document.addEventListener('eventFindingStarted', () => {
    if (findEventsBtn) {
      findEventsBtn.disabled = true;
      findEventsBtn.textContent = "Finding...";
    }
  });
  
  // Listen for event finding completion or failure
  document.addEventListener('eventFindingCompleted', () => {
    if (findEventsBtn) {
      findEventsBtn.disabled = false;
      findEventsBtn.textContent = "Find Events";
    }
  });
  
  document.addEventListener('eventFindingFailed', () => {
    if (findEventsBtn) {
      findEventsBtn.disabled = false;
      findEventsBtn.textContent = "Find Events";
    }
  });
  
  // Initial state of buttons
  updateActionButtonsVisibility();
  
  return {
    updateActionButtonsVisibility,
    getState: () => ({
      gridVisible,
      selectedCellBounds,
      selectedSubCellData,
      scanCompletedForMainCell,
      currentMappingCompleted 
    })
  };
}