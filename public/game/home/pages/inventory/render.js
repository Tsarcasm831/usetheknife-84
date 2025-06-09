// All dependencies are loaded globally via script tags. No import/export/module syntax. Attach globally needed functions and DOM references to window below.

// --- DOM Element References ---
const gridElement = document.getElementById('inventory-grid');
const gridContainerElement = document.querySelector('.grid-container');
const equipmentSlots = document.querySelectorAll('.equipment-container .equipment-slot[data-slot-type]');
const flaskSlots = document.querySelectorAll('.equipment-slot.flask');
const allEquipmentSlots = document.querySelectorAll('.equipment-container .equipment-slot:not(.flask-slots)');
const dropIndicator = gridContainerElement.querySelector('.drop-indicator');
const equipmentGridElement = document.querySelector('.equipment-grid');

// Attach DOM references to window for global use
window.gridElement = gridElement;
window.gridContainerElement = gridContainerElement;
window.equipmentSlots = equipmentSlots;
window.flaskSlots = flaskSlots;
window.allEquipmentSlots = allEquipmentSlots;
window.dropIndicator = dropIndicator;
window.equipmentGridElement = equipmentGridElement;

// --- Rendering Logic ---
function getItemIcon(item) {
    if (item.icon) {
        return item.icon;
    }
    // Try specific type, then broader class, then default
    return defaultIcons[item.type] || defaultIcons[item.itemClass] || defaultIcons["Default"];
}

/**
 * Parses stack size information from item stats.
 * Looks for "Stack Size: current / max" format.
 * @param {object} item - The item data object.
 * @returns {object|null} - { current: number, max: number } or null if not found/applicable.
 */
function parseStackSize(item) {
    if (!item.stats?.explicit || !Array.isArray(item.stats.explicit)) {
        return null;
    }
    const stackLine = item.stats.explicit.find(line => typeof line === 'string' && line.toLowerCase().includes('stack size:'));
    if (!stackLine) {
        return null;
    }
    // Match "Stack Size: current / max" or "Stack Size: current/max"
    const match = stackLine.match(/stack size:\s*(\d+)\s*\/\s*(\d+)/i);
    if (match && match.length === 3) {
        return { current: parseInt(match[1], 10), max: parseInt(match[2], 10) };
    }
    return null;
}

function renderItem(item) {
    if (!item || !item.id) {
        console.error("Attempted to render invalid item:", item);
        return null;
    }

    let itemElement = document.getElementById(item.id);
    let isNewElement = !itemElement;

    // --- Element Creation & Basic Styling ---
    if (isNewElement) {
        itemElement = document.createElement('div');
        itemElement.id = item.id;
        itemElement.style.position = 'absolute'; // Critical for positioning
        itemElement.classList.add('item', 'item-entering');
        // Trigger reflow for animation
        void itemElement.offsetWidth;
        requestAnimationFrame(() => {
            itemElement.classList.add('item-entered');
            itemElement.classList.remove('item-entering');
        });
    } else {
        itemElement.className = 'item'; // Reset classes (keeps ID)
        itemElement.style.position = 'absolute'; // Ensure position is absolute even if reused
        // Clear potential stack count from previous render
        const existingStackCount = itemElement.querySelector('.stack-count');
        if (existingStackCount) existingStackCount.remove();
    }

    // --- Add Core Classes ---
    const rarityClass = `rarity-${item.rarity || 'Normal'}`;
    itemElement.classList.add(rarityClass);
    if (item.itemClass) itemElement.classList.add(`item-type-${item.itemClass.replace(/\s+/g, '-')}`);
    itemElement.dataset.itemId = item.id;

    // --- Calculate Geometry & Determine Container ---
    let itemWidth = 0;
    let itemHeight = 0;
    let itemLeft = 0;
    let itemTop = 0;
    let baseFontSize = 10; // Default for grid
    let targetContainer = null;

    if (item.slot) {
        const slotElement = findEquipmentSlotElement(item.slot);
        if (slotElement) {
            targetContainer = slotElement;
            itemWidth = slotElement.clientWidth;  // Use clientWidth/Height for slot
            itemHeight = slotElement.clientHeight;
            itemLeft = 0; // Position relative to slot corner
            itemTop = 0;
            baseFontSize = 16; // Larger font for equipment
            // Apply 100% width/height style specifically for slots
            itemElement.style.width = `100%`;
            itemElement.style.height = `100%`;
        } else {
            console.warn(`Slot element ${item.slot} not found for item ${item.id}. Attempting grid render.`);
            // Fallback to grid positioning if slot is invalid but item has coords
            if (item.col != null && item.row != null) {
                targetContainer = gridElement;
                 itemWidth = item.width * CELL_SIZE + (item.width - 1) * GRID_GAP;
                 itemHeight = item.height * CELL_SIZE + (item.height - 1) * GRID_GAP;
                 itemLeft = (item.col - 1) * (CELL_SIZE + GRID_GAP);
                 itemTop = (item.row - 1) * (CELL_SIZE + GRID_GAP);
                 const scaleFactor = Math.min(item.width, item.height);
                 baseFontSize = Math.max(8, baseFontSize * scaleFactor * 0.8 + item.width * 1);
                 // Remove potential 100% width/height if falling back from slot
                 itemElement.style.width = `${itemWidth}px`;
                 itemElement.style.height = `${itemHeight}px`;
            } else {
                 console.error(`Cannot render item ${item.id}: Invalid slot ${item.slot} and no grid coordinates.`);
                 return null; // Cannot render
            }
        }
    } else if (item.col != null && item.row != null) {
        targetContainer = gridElement;
        itemWidth = item.width * CELL_SIZE + (item.width - 1) * GRID_GAP;
        itemHeight = item.height * CELL_SIZE + (item.height - 1) * GRID_GAP;
        itemLeft = (item.col - 1) * (CELL_SIZE + GRID_GAP);
        itemTop = (item.row - 1) * (CELL_SIZE + GRID_GAP);
        const scaleFactor = Math.min(item.width, item.height);
        baseFontSize = Math.max(8, baseFontSize * scaleFactor * 0.8 + item.width * 1);
         // Apply explicit width/height for grid items
         itemElement.style.width = `${itemWidth}px`;
         itemElement.style.height = `${itemHeight}px`;
    } else {
        console.warn(`Item ${item.id} (${item.name}) has no position (slot/col/row), cannot render.`);
        return null; // Don't return the element if it can't be positioned
    }

    // --- Apply Styles ---
    itemElement.style.left = `${itemLeft}px`;
    itemElement.style.top = `${itemTop}px`;
    itemElement.style.fontSize = `${baseFontSize}px`;
    itemElement.dataset.x = itemLeft; // Store position if needed
    itemElement.dataset.y = itemTop;

    itemElement.textContent = getItemIcon(item);

    // --- Add Stack Count ---
    const stackSize = parseStackSize(item);
    if (stackSize) {
        const stackCountElement = document.createElement('div');
        stackCountElement.classList.add('stack-count');
        stackCountElement.textContent = `${stackSize.current}`;
        itemElement.appendChild(stackCountElement);
    }

    // --- Attach Listeners ---
    itemElement.removeEventListener('mouseenter', handleMouseEnter); // Prevent duplicates
    itemElement.removeEventListener('mouseleave', handleMouseLeave);
    itemElement.removeEventListener('mousemove', positionTooltip);
    itemElement.addEventListener('mouseenter', handleMouseEnter);
    itemElement.addEventListener('mouseleave', handleMouseLeave);
    itemElement.addEventListener('mousemove', positionTooltip);

    // --- Append to Correct Container ---
    if (targetContainer && itemElement.parentElement !== targetContainer) {
        targetContainer.appendChild(itemElement);
    } else if (!targetContainer) {
        console.error(`Could not determine target container for item ${item.id}`);
        return null;
    }

    return itemElement;
}


function renderGrid(tabId) {
    if (!gridElement) {
        console.error("Grid element not found!");
        return;
    }
    // Detach grid element for batch update (potential performance improvement)
    // const parent = gridElement.parentNode;
    // if (parent) parent.removeChild(gridElement);

    gridElement.innerHTML = ''; // Clear previous items
    const tabData = inventoryData[tabId];
    if (!tabData) {
        console.error(`No data found for tab: ${tabId}`);
        // if (parent) parent.appendChild(gridElement); // Re-attach empty grid
        return;
    }

    if (!tabData.gridState) {
        console.warn(`Grid state not initialized for tab: ${tabId}. Items might render incorrectly.`);
        // Ensure grid state exists, even if empty, to prevent errors downstream if needed
        // initializeGridState(tabId); // Or handle appropriately
    }

    console.log(`Rendering grid for tab: ${tabId}. Items in data: ${tabData.items.length}`); // Debug log

    let renderCount = 0;
    tabData.items.forEach(item => {
        // Only render items that have grid coordinates AND do *not* have a slot property
        if (item.col !== undefined && item.row !== undefined && item.slot === undefined) {
             console.log(`Attempting to render grid item: ${item.id} (${item.name}) at ${item.col},${item.row}`); // Debug log
             const renderedElement = renderItem(item); // Use the refactored function
             if (renderedElement) {
                 renderCount++;
             }
        } else if (item.slot !== undefined) {
             // Item belongs to equipment, ignore in grid render
        } else {
            // Item is in this tab's data but lacks grid coordinates and isn't equipped
             if (!Object.values(equipmentData).some(eq => eq && eq.id === item.id)) {
                 console.warn(`Item ${item.id} (${item.name}) in tab ${tabId} is missing grid coordinates and is not equipped.`);
             }
        }
    });
    console.log(`Rendered ${renderCount} items in grid ${tabId}.`); // Debug log

    // Re-attach grid element if detached
    // if (parent && !gridElement.parentNode) parent.appendChild(gridElement);
}
window.renderGrid = renderGrid;

function renderEquipment() {
    // Clear previous items from slots and reset slot states
    allEquipmentSlots.forEach(slot => {
        const existingItem = slot.querySelector('.item');
        if (existingItem) {
            // Clean up listeners before removing
            existingItem.removeEventListener('mouseenter', handleMouseEnter);
            existingItem.removeEventListener('mouseleave', handleMouseLeave);
            existingItem.removeEventListener('mousemove', positionTooltip);
            slot.removeChild(existingItem);
        }
        slot.classList.remove('occupied', 'blocked'); // Reset state
        // Ensure placeholder SVGs are visible if slot is now empty
        const placeholder = slot.querySelector('.slot-placeholder-svg');
        if (placeholder) placeholder.style.opacity = '0.7'; // Reset opacity
    });

    // Determine if main hand is 2H before rendering items
    let isMainHand2H = false;
    const mainHandItem = equipmentData['Weapon1'];
    if (mainHandItem && (mainHandItem.type.includes("Two-Handed") || mainHandItem.type === "Bow")) {
        isMainHand2H = true;
    }

    // Render items currently in equipmentData
    for (const slotKey in equipmentData) {
        const item = equipmentData[slotKey];
        if (item) { // Ensure item exists for the key
            const slotElement = findEquipmentSlotElement(slotKey);
            if (slotElement) {
                // Ensure the item's slot property matches the key it's being rendered into
                item.slot = slotKey;
                // Clear potential grid coords if they exist (shouldn't, but safe)
                delete item.col;
                delete item.row;
                const renderedElement = renderItem(item); // Use the refactored function
                if (renderedElement) {
                    slotElement.classList.add('occupied');
                    // Hide placeholder SVG when occupied
                    const placeholder = slotElement.querySelector('.slot-placeholder-svg');
                    if (placeholder) placeholder.style.opacity = '0';
                }
            } else {
                console.warn(`Could not find slot element for equipped item in slot: ${slotKey} (Item ID: ${item.id})`);
                // Item is in equipmentData but its slot element doesn't exist.
                // Consider moving
            }
        } else {
            // Slot is empty, ensure it's marked as such (done by initial clearing)
        }
    }

    // Block offhand slot if main hand is 2H
    const offHandSlot = findEquipmentSlotElement('Weapon2');
    if (offHandSlot) {
        if (isMainHand2H) {
            offHandSlot.classList.add('blocked');
        } else {
            offHandSlot.classList.remove('blocked'); // Ensure it's unblocked if main hand is not 2H
        }
    }
}