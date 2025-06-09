// All dependencies are loaded globally via script tags. No import/export/module syntax. Attach globally needed functions to window below.

/**
 * Attempts to move an item from its origin to a specific grid slot.
 * Handles removing the item from equipment or other grid tabs if necessary.
 * @param {string} targetTabId - The ID of the grid tab to move the item to.
 * @param {number} targetCol - The target column.
 * @param {number} targetRow - The target row.
 * @returns {boolean} - True if the move was successful, false otherwise.
 */
function moveItemToGrid(targetTabId, targetCol, targetRow) {
    const draggingItem = getDraggingItem();
    const origin = getOrigin();
    if (!draggingItem || !origin) return false;

    const targetTabData = inventoryData[targetTabId];
    if (!targetTabData || !targetTabData.gridState) {
        console.error(`Target tab data or grid state missing for ${targetTabId}`);
        return false;
    }
    const targetGrid = targetTabData.gridState;
    const targetItems = targetTabData.items;

    // Check boundaries and occupancy
    if (targetCol < 1 || targetRow < 1 || targetCol + draggingItem.width - 1 > 12 || targetRow + draggingItem.height - 1 > 6) { 
        console.warn("Target grid location is out of bounds.");
        return false;
    }
    if (isOccupied(targetGrid, targetRow, targetCol, draggingItem.width, draggingItem.height, draggingItem.id)) {
        console.warn("Target grid location is occupied.");
        return false;
    }

    // Remove item from its original location's data structure
    if (origin.type === 'grid') {
        const originTabData = inventoryData[origin.tabId];
        if (!originTabData) {
            console.error(`Origin tab data missing for ${origin.tabId}`);
            // Don't necessarily fail, maybe the item was already moved? Continue cautiously.
        } else {
            // Clear occupancy was done at drag start
            // Remove from origin items list *only if moving tabs*
            if (origin.tabId !== targetTabId) {
                const itemIndex = originTabData.items.findIndex(i => i.id === draggingItem.id);
                if (itemIndex > -1) {
                     originTabData.items.splice(itemIndex, 1);
                     console.log(`Removed item ${draggingItem.id} from origin tab ${origin.tabId} items list.`);
                }
                 // Add to new tab's item list
                 if (!targetItems.some(i => i.id === draggingItem.id)) {
                     targetItems.push(draggingItem);
                     console.log(`Added item ${draggingItem.id} to target tab ${targetTabId} items list.`);
                 }
            }
            // If same tab, item is already in the list.
        }
    } else if (origin.type === 'equipment') {
        // Equipment slot was cleared at drag start
        // Add item to the target grid's data structure
        if (!targetItems.some(i => i.id === draggingItem.id)) {
             targetItems.push(draggingItem);
             console.log(`Added item ${draggingItem.id} (from equipment) to target tab ${targetTabId} items list.`);
        }
    }

    // Update item data with new position
    draggingItem.col = targetCol;
    draggingItem.row = targetRow;
    delete draggingItem.slot; // Remove slot property if it had one
    markOccupancy(targetGrid, draggingItem, draggingItem.id); // Mark new position
    console.log(`Item ${draggingItem.id} successfully placed in grid ${targetTabId} at (${targetCol}, ${targetRow})`);

    return true;
}

/**
 * Attempts to move an item from its origin to a specific equipment slot.
 * Handles removing the item from the grid or another equipment slot.
 * Handles potential swaps if the target slot is occupied.
 * @param {string} targetSlotKey - The key of the equipment slot (e.g., 'Helmet', 'Ring1', 'Flask3').
 * @returns {boolean} - True if the move was successful, false otherwise.
 */
function moveItemToEquipment(targetSlotKey) {
    const draggingItem = getDraggingItem();
    const origin = getOrigin();
    if (!draggingItem || !origin) return false;

    // Check compatibility first
    if (!canDropItemInSlot(draggingItem, targetSlotKey)) {
        console.warn(`Item ${draggingItem.id} cannot be placed in slot ${targetSlotKey}`);
        return false;
    }

    const currentItemInSlot = equipmentData[targetSlotKey];

    // Handle Swap if the slot is occupied
    if (currentItemInSlot) {
        console.log(`Attempting swap: ${draggingItem.name} into slot ${targetSlotKey} occupied by ${currentItemInSlot.name}`);
        if (!handleItemSwap(targetSlotKey, currentItemInSlot)) {
            console.log("Swap failed (could not place displaced item). Cancelling drop.");
            return false; // Swap failed, cannot place item
        }
         console.log("Swap successful (displaced item placed).");
    }

    // --- Place the dragging item ---

    // Remove item from its original location's data structure
    if (origin.type === 'grid') {
        const originTabData = inventoryData[origin.tabId];
         if (originTabData) {
            const itemIndex = originTabData.items.findIndex(i => i.id === draggingItem.id);
            if (itemIndex > -1) {
                originTabData.items.splice(itemIndex, 1);
                console.log(`Removed item ${draggingItem.id} from origin tab ${origin.tabId} items list (moving to equipment).`);
            }
         } else {
             console.warn(`Origin tab data ${origin.tabId} not found when moving item ${draggingItem.id} to equipment.`);
         }
        // Grid occupancy was cleared at drag start
        delete draggingItem.col;
        delete draggingItem.row;
    } else if (origin.type === 'equipment') {
        // If origin was equipment, it was cleared at drag start.
        // If a swap happened, the origin slot might now contain the swapped item.
        // No specific action needed here for the dragging item's origin removal.
    }

    // Add item to equipment data
    equipmentData[targetSlotKey] = draggingItem;
    draggingItem.slot = targetSlotKey; // Assign slot property
    console.log(`Item ${draggingItem.id} successfully placed in equipment slot ${targetSlotKey}`);

    return true;
}

/**
 * Handles the logic for swapping an item from an equipment slot back to the inventory.
 * Tries the original grid position first, then finds the first available slot.
 * @param {string} occupiedSlotKey - The equipment slot key holding the item to be moved.
 * @param {object} itemToMove - The item object currently in the equipment slot.
 * @returns {boolean} - True if the swap placement was successful, false otherwise.
 */
function handleItemSwap(occupiedSlotKey, itemToMove) {
    const origin = getOrigin(); // Origin of the *dragging* item
    if (!origin) return false;

    // Determine the target tab for the item being displaced
    const targetTabId = (origin.type === 'grid') ? origin.tabId : getCurrentTabId(); // Fallback to current tab if origin was equipment
    const targetTabData = inventoryData[targetTabId];

    if (!targetTabData || !targetTabData.gridState) {
        console.error(`Cannot perform swap: Target tab data or grid state missing for ${targetTabId}`);
        return false;
    }
    const targetGrid = targetTabData.gridState;
    const targetItems = targetTabData.items;

    let placed = false;

    // 1. Try placing the displaced item back into the dragging item's original grid slot (if applicable)
    if (origin.type === 'grid') {
        // Check if the origin slot is actually free (it might have been filled if the drag was slow/complex)
        if (!isOccupied(targetGrid, origin.row, origin.col, itemToMove.width, itemToMove.height, null)) {
            console.log(`Swapping ${itemToMove.name} back to original grid slot ${origin.row},${origin.col} in tab ${targetTabId}`);
            // No need to clear equipment slot yet, only do it if placement is successful
            itemToMove.col = origin.col;
            itemToMove.row = origin.row;
            delete itemToMove.slot;
             if (!targetItems.some(i => i.id === itemToMove.id)) { // Add if not already there
                 targetItems.push(itemToMove);
             }
            markOccupancy(targetGrid, itemToMove, itemToMove.id);
            placed = true;
        } else {
            console.log(`Original grid slot (${origin.row},${origin.col}) is occupied. Trying first available.`);
        }
    }

    // 2. If origin wasn't grid or the original slot was occupied, find the first available slot in the target tab
    if (!placed) {
        console.log(`Finding first available slot for ${itemToMove.name} in tab ${targetTabId}`);
        const availableSlot = findFirstAvailableSlot(targetTabId, itemToMove.width, itemToMove.height);
        if (availableSlot) {
            console.log(`Found available slot for ${itemToMove.name} at ${availableSlot.row},${availableSlot.col}`);
            // No need to clear equipment slot yet
            itemToMove.col = availableSlot.col;
            itemToMove.row = availableSlot.row;
            delete itemToMove.slot;
            if (!targetItems.some(i => i.id === itemToMove.id)) { // Add if not already there
                 targetItems.push(itemToMove);
            }
            markOccupancy(targetGrid, itemToMove, itemToMove.id);
            placed = true;
        } else {
            console.warn(`No available slot found for swapped item ${itemToMove.name} in tab ${targetTabId}. Swap failed.`);
        }
    }

    // Only clear the equipment slot if the displaced item was successfully placed elsewhere
    if (placed) {
         delete equipmentData[occupiedSlotKey];
         console.log(`Cleared equipment slot ${occupiedSlotKey} after placing displaced item.`);
    }

    return placed;
}

/**
 * Reverts the dragging item back to its original position if the drop was invalid.
 */
function revertItemToOrigin() {
    const draggingItem = getDraggingItem();
    const origin = getOrigin();
    if (!draggingItem || !origin) return;

     console.log(`Reverting ${draggingItem.name} to origin:`, origin);

    if (origin.type === 'grid') {
        const originTabData = inventoryData[origin.tabId];
         if (!originTabData || !originTabData.gridState) {
             console.error(`Cannot revert item ${draggingItem.id} to grid: Origin tab data or grid state missing for ${origin.tabId}. Trying fallback.`);
             placeItemInFirstAvailableSlot(draggingItem); // Fallback if origin data is broken
             return;
         }
        // Ensure item is in the correct list (it might have been removed if attempting cross-tab drag)
        if (!originTabData.items.some(i => i.id === draggingItem.id)) {
             originTabData.items.push(draggingItem);
        }
        // Restore position and mark occupancy
        draggingItem.col = origin.col;
        draggingItem.row = origin.row;
        delete draggingItem.slot;
        markOccupancy(originTabData.gridState, draggingItem, draggingItem.id);
         console.log(`Reverted ${draggingItem.id} to grid ${origin.tabId} (${origin.col}, ${origin.row})`);
    } else if (origin.type === 'equipment') {
        // Put item back into the equipment slot, checking if it's now occupied (e.g., failed swap revert)
        if (!equipmentData[origin.slotKey]) {
            equipmentData[origin.slotKey] = draggingItem;
            draggingItem.slot = origin.slotKey;
            delete draggingItem.col;
            delete draggingItem.row;
             console.log(`Reverted ${draggingItem.id} to equipment slot ${origin.slotKey}`);
        } else {
            // The original equipment slot is occupied. Try placing in inventory.
            console.warn(`Cannot revert item ${draggingItem.id} to occupied equipment slot ${origin.slotKey}. Attempting inventory placement.`);
            placeItemInFirstAvailableSlot(draggingItem);
        }
    }
}

// Helper function to place an item in the first available slot of the *current* tab,
// used as a fallback during revert failures.
function placeItemInFirstAvailableSlot(item) {
    const fallbackTabId = getCurrentTabId(); // Use current tab as fallback destination
    const fallbackTabData = inventoryData[fallbackTabId];
    if (!fallbackTabData || !fallbackTabData.gridState) {
        console.error(`FATAL: Cannot place item ${item.id} in fallback tab ${fallbackTabId} - tab data or grid missing. Item potentially lost!`);
        // Consider adding a "lost item stash" or similar recovery mechanism here
        return;
    }

    const availableSlot = findFirstAvailableSlot(fallbackTabId, item.width, item.height);
    if (availableSlot) {
        console.log(`Placing item ${item.id} in fallback inventory slot in tab ${fallbackTabId} at ${availableSlot.row},${availableSlot.col}`);
        item.col = availableSlot.col;
        item.row = availableSlot.row;
        delete item.slot;
        if (!fallbackTabData.items.some(i => i.id === item.id)) {
            fallbackTabData.items.push(item);
        }
        markOccupancy(fallbackTabData.gridState, item, item.id);
    } else {
        console.error(`FATAL: Cannot revert item ${item.id} to origin and no space in fallback tab ${fallbackTabId}! Item potentially lost.`);
        // Recovery mechanism needed here too
    }
}