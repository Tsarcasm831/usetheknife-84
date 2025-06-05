import { initGridOverlay as createGridOverlay } from "./gridOverlay.js";
import { initSubgrid } from "./subgrid.js";
import { initRoadMapper } from "./roadMapper.js";
import { initEventFinder } from "./eventFinder.js";
import { initGridController } from "./gridController.js";

export function initGridOverlay(map) {
  const gridOverlay = createGridOverlay(map);
  const subgrid = initSubgrid(map);
  const roadMapper = initRoadMapper(map);
  const eventFinder = initEventFinder(map);
  const gridController = initGridController();
  
  const scanBtn = document.getElementById("grid-action-btn");
  const mapRoadsBtn = document.getElementById("map-roads-btn");
  const findEventsBtn = document.getElementById("find-events-btn");

  const homeCoords = { lat: 40.153654, lng: -105.109248 }; // Fixed Home location
  
  if (scanBtn) scanBtn.addEventListener("click", () => {
    subgrid.startSubgridScan();
  });
  
  if (mapRoadsBtn) mapRoadsBtn.addEventListener("click", () => {
    const subCellData = subgrid.getSelectedSubCellData();
    if (subCellData && subCellData.bounds) {
      roadMapper.fetchAndDisplayRoads(subCellData.bounds, homeCoords); // Pass homeCoords
    } else {
      console.warn("Map button clicked, but no subgrid cell is selected or selection has no bounds.");
    }
  });
  
  if (findEventsBtn) findEventsBtn.addEventListener("click", () => {
    const subCellData = subgrid.getSelectedSubCellData();
    const roadData = roadMapper.getCurrentRoadGeoJson();
    if (subCellData && subCellData.bounds && roadData) {
      eventFinder.findEventsInSubgrid(subCellData, roadData);
    } else {
        console.warn("Find Events button clicked, but subgrid data or road data is missing.");
    }
  });

  return {
    toggleGrid: gridOverlay.toggleGrid,
    gridOverlay,
    subgrid,
    roadMapper,
    eventFinder,
    controller: gridController
  };
}