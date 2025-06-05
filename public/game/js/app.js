// Improved initialization to avoid React errors
import { initMap } from "./map.js";
import { initSidebar } from "./sidebar.js";
import { initModals } from "./modals.js";
import { initStreetViewPanelEvents } from "./streetview.js";
import { initScreenRecorder } from "./screenRecorder.js";
import { initUI } from "./ui.js";
import { initAuthModal } from "./authModal.js";

document.addEventListener('DOMContentLoaded', () => {
  // Give React a chance to hydrate the page first
  setTimeout(() => { 
    try {
      const { map: mapInstance, gridSystem } = initMap();
      window.mapInstance = mapInstance;
      if (gridSystem && gridSystem.subgrid) {
        window.subgridModule = gridSystem.subgrid;
      }
      
      // Initialize UI components
      initSidebar();
      initModals(mapInstance);
      initUI(mapInstance);
      initAuthModal();initStreetViewPanelEvents();
      initScreenRecorder();
      
      console.log("Application successfully initialized after increased delay.");
    } catch (error) {
      console.error("Error initializing application:", error);
    }
  }, 1500); 
});