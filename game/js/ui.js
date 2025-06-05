import { initThreeDModal } from "./threeDModal.js";
import { initFdgModal } from "./fdgModal.js";
import { initHiveModal } from "./hiveModal.js"; 
import { initPrometheusModal } from "./prometheusModal.js";
import { initCrossModal } from "./crossModal.js";
import { initSlingersModal } from "./slingersModal.js";
import { initAliensModal } from "./aliensModal.js";
import { initHomeModal } from "./homeModal.js";
import { initGlobeView } from "./globeView.js";
import { initWelcomeModal, openWelcomeModal } from "./welcomeModal.js";
import { startTutorial } from "./tutorial/index.js";
// The main prepareEventModal module (`./prepareEventModal/index.js`) self-initializes.
// We only need to import it if we need to call its exported functions, like openPrepareEventModal.
// Since openPrepareEventModal is typically called from event markers, it's exposed globally by its own module.
// Thus, a direct import here for initialization might not be strictly necessary unless other UI elements call it.
// However, to ensure its code runs and self-initializes, importing it is a safe bet.
import "./prepareEventModal/index.js";

export function initUI(map) {
  try {
    initThreeDModal(map); 
    initFdgModal();
    initHiveModal(); 
    initPrometheusModal();
    initCrossModal();
    initSlingersModal();
    initAliensModal();
    initHomeModal();
    initGlobeView(map);
    initWelcomeModal();

    const tutorialBtn = document.getElementById('tutorial-btn');
    if (tutorialBtn) {
      tutorialBtn.addEventListener('click', startTutorial);
    }
    openWelcomeModal();
    // initPrepareEventModal(); // No longer needed here, self-initializes via import
  } catch (error) {
    console.error("Error initializing UI components:", error);
  }
}