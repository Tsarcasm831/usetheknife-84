// Removed ES module imports for browser compatibility
// Assume all dependencies are loaded globally via <script> tags

// The following variables/functions should be available on window:
// - initializeUI
// - initializeDragDrop
// - initialTabId
// - inventoryData
// - initializeGridState
// - renderGrid
// - renderEquipment


// --- Initial Setup ---
function initializeApp() {
    // Initialize grid states for all tabs first
    Object.keys(inventoryData).forEach(tabId => {
        initializeGridState(tabId);
    });

    initializeUI(); // Sets up tab switching and initial rendering calls within it
    initializeDragDrop(); // Sets up interact.js listeners

    // Initial render based on default tab
    renderGrid(initialTabId);
    renderEquipment(); // Render initially equipped items (if any)

    console.log("Inventory initialized.");
}

// Start the application
initializeApp();