// Entry point for prepareEventModal module
import { initPrepareEventModal, openPrepareEventModal } from './core/modalCore.js';

// Initialize the modal when this module is imported
initPrepareEventModal();

// Export the public API
export { openPrepareEventModal };

// Make openPrepareEventModal available globally
window.openPrepareEventModal = openPrepareEventModal;