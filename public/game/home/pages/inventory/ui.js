// All dependencies are loaded globally via script tags. No import/export/module syntax. Attach globally needed functions to window below.

const tabsElement = document.querySelector('.tabs');
let currentTabId = initialTabId; // Initialize with the default tab

// Attach globally needed functions to window for use in script.js
window.getCurrentTabId = getCurrentTabId;
window.switchTab = switchTab;
window.initializeUI = initializeUI;

function getCurrentTabId() {
    return currentTabId;
}

function switchTab(newTabId) {
    if (newTabId === currentTabId) return;

    // Update tab visuals
    const currentActiveTab = tabsElement.querySelector(`[data-tab-id="${currentTabId}"]`);
    const newActiveTab = tabsElement.querySelector(`[data-tab-id="${newTabId}"]`);

    if (currentActiveTab) currentActiveTab.classList.remove('active');
    if (newActiveTab) {
        newActiveTab.classList.add('active');
    } else {
        console.error(`Tab element not found for ID: ${newTabId}`);
        return; // Don't switch if the new tab element doesn't exist
    }

    currentTabId = newTabId;

    // Check if grid state exists, initialize if not (should ideally be done earlier)
    if (!inventoryData[currentTabId]?.gridState) {
        console.warn(`Initializing grid state for tab ${newTabId} on demand.`);
        initializeGridState(newTabId); // Assuming initializeGridState is available globally or imported
    }

    renderGrid(currentTabId); // Render the grid for the new tab
}

function initializeUI() {
    const inventoryModal = document.querySelector('.inventory-modal');
    const closeBtn = inventoryModal.querySelector('.inventory-close-btn');
    let inventoryOpen = true;

    function setInventoryOpen(open) {
        inventoryOpen = open;
        if (open) {
            inventoryModal.classList.remove('closed');
            inventoryModal.setAttribute('aria-hidden', 'false');
        } else {
            inventoryModal.classList.add('closed');
            inventoryModal.setAttribute('aria-hidden', 'true');
        }
    }

    // Initial state: open
    setInventoryOpen(true);

    // Keyboard toggle
    document.addEventListener('keydown', (e) => {
        if (e.key === 'i' || e.key === 'I') {
            // Always toggle based on inventoryOpen state, not DOM class
            setInventoryOpen(!inventoryOpen);
            if (!inventoryModal.classList.contains('closed')) {
                inventoryModal.focus && inventoryModal.focus();
            }
            e.preventDefault();
        }
    });

    // Close button
    if (closeBtn) {
        closeBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            setInventoryOpen(false);
        };
    }

    // Event delegation for tab clicks
    tabsElement.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('tab') && target.dataset.tabId) {
            switchTab(target.dataset.tabId);
        }
    });

    // Set initial active tab
    const initialActiveTab = tabsElement.querySelector(`[data-tab-id="${currentTabId}"]`);
    if (initialActiveTab) {
        initialActiveTab.classList.add('active');
    } else {
         console.error(`Initial tab element not found for ID: ${currentTabId}`);
         // Fallback to the first tab if the initial one doesn't exist
         const firstTab = tabsElement.querySelector('.tab');
         if (firstTab) {
             currentTabId = firstTab.dataset.tabId;
             firstTab.classList.add('active');
             console.log(`Falling back to first tab: ${currentTabId}`);
         }
    }
}