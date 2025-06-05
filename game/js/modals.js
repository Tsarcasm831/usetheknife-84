import { initPoiModal } from './poiModal.js';
import { initSurveyPointPopup } from './surveyPointPopup.js';
import { initBestiaryModal } from './bestiaryModal.js';
import { initCoreRulesModal } from './coreRulesModal.js';
import { initGddModal } from './gddModal.js';
import { initGenericIframeModal } from './genericIframeModal.js';
// The prepareEventModal is self-initializing when its index.js is imported.
// We ensure it's imported so its `initPrepareEventModal()` runs.
import './prepareEventModal/index.js'; 

export function initModals(map) {
  initPoiModal(map);
  initSurveyPointPopup(); 
  initBestiaryModal(); 
  initCoreRulesModal();
  initGddModal();
  initGenericIframeModal(); 
  // initPrepareEventModal(); // No longer needed here. The import above handles its initialization.
}