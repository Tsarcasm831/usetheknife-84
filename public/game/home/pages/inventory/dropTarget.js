// All dependencies are loaded globally via script tags. No import/export/module syntax.
// Functions that need to be accessed globally are attached to window below.

/**
 * Finds the potential drop target (grid or equipment slot) based on cursor position.
 * @param {Event} event - The mouse/pointer event.
 * @returns {object} - { element: HTMLElement | null, type: 'grid' | 'equipment' | null, slotKey?: string, col?: number, row?: number }
 */
function getDropTarget(event) {
    let dropzoneElement = null;
    let dropType = null;
    let slotKey = null;
    let col = null;
    let row = null;
    let gridCol = null; 
    let gridRow = null;

    // Check equipment slots first
    for (const slot of allEquipmentSlots) { 
        const rect = slot.getBoundingClientRect();
        if (event.clientX >= rect.left && event.clientX <= rect.right &&
            event.clientY >= rect.top && event.clientY <= rect.bottom) {
            dropzoneElement = slot;
            dropType = 'equipment';
            slotKey = getSlotKeyFromElement(slot); 
            break; 
        }
    }

    // If not over equipment, check grid
    if (!dropzoneElement) {
        const gridRect = gridContainerElement.getBoundingClientRect();
        if (event.clientX >= gridRect.left && event.clientX <= gridRect.right &&
            event.clientY >= gridRect.top && event.clientY <= gridRect.bottom) {

             // Calculate potential grid coords based on item's *top-left* corner during drag
             const dragOffset = getDragStartOffset();
             const itemTopLeftX = event.clientX - dragOffset.x;
             const itemTopLeftY = event.clientY - dragOffset.y;

            ({ col: gridCol, row: gridRow } = getGridCoordsFromPosition(gridRect, itemTopLeftX, itemTopLeftY));

            dropzoneElement = gridElement; 
            dropType = 'grid';
        }
    }

    return { element: dropzoneElement, type: dropType, slotKey, col: gridCol, row: gridRow };
}

/**
 * Gets the unique slot key (e.g., 'Helmet', 'Ring1', 'Flask3') from an equipment slot element.
 * @param {HTMLElement} slotElement - The equipment slot DOM element.
 * @returns {string | null} The slot key or null if not identifiable.
 */
function getSlotKeyFromElement(slotElement) {
    if (!slotElement) return null;

    // Standard slots have data-slot-type
    const slotType = slotElement.dataset.slotType;
    if (slotType) {
        // Need to differentiate Ring1/Ring2 and Weapon1/Weapon2 based on class
        if (slotType === 'Ring') {
            return slotElement.classList.contains('ring1') ? 'Ring1' : 'Ring2';
        }
        if (slotType === 'Weapon') {
             return slotElement.classList.contains('weapon1') ? 'Weapon1' : 'Weapon2';
        }
        return slotType;
    }

    // Check for Flasks
    if (slotElement.classList.contains('flask')) {
        const flaskSlotsContainer = slotElement.closest('.flask-slots');
        if (!flaskSlotsContainer) return null;
        const flasks = Array.from(flaskSlotsContainer.querySelectorAll('.equipment-slot.flask'));
        const index = flasks.indexOf(slotElement);
        return index !== -1 ? `Flask${index + 1}` : null;
    }

    return null; 
}


/**
 * Checks if the currently dragged item can be dropped into the specified equipment slot type.
 * Considers item type, class, and special cases like two-handed weapons.
 * @param {object} item - The item object being dragged.
 * @param {string} slotTypeOrKey - The general slot type ('Weapon', 'Ring') or specific key ('Ring1', 'Flask3').
 * @returns {boolean} - True if the item can be dropped, false otherwise.
 */
function canDropItemInSlot(item, slotTypeOrKey) {
    if (!item || !slotTypeOrKey) return false;

    // Determine the base slot type (e.g., 'Weapon' from 'Weapon1')
    let baseSlotType = slotTypeOrKey;
    if (slotTypeOrKey.startsWith('Ring')) baseSlotType = 'Ring';
    else if (slotTypeOrKey.startsWith('Weapon')) baseSlotType = 'Weapon';
    else if (slotTypeOrKey.startsWith('Flask')) baseSlotType = 'Flask';

    const compatibleTypes = slotCompatibility[baseSlotType] || [];

    // Direct compatibility check (covers most cases)
    if (compatibleTypes.includes(item.itemClass) || compatibleTypes.includes(item.type)) {
         // Special check for two-handed weapons - requires *both* weapon slots to be potentially usable
         // Note: Actual swap/placement logic happens elsewhere, this is just possibility check.
        if (item.type.includes("Two-Handed") || item.type === "Bow") {
             if (baseSlotType === 'Weapon') {
                 // Can place a 2H if EITHER target slot is the one being considered AND the OTHER slot is empty or holds the item being dragged (allowing placing back)
                 const otherSlotKey = slotTypeOrKey === 'Weapon1' ? 'Weapon2' : 'Weapon1';
                 const otherSlotItem = equipmentData[otherSlotKey];
                 const draggingItem = getDraggingItem(); 
                 return !otherSlotItem || otherSlotItem.id === draggingItem?.id;
             } else {
                 return false; // Cannot place 2H in non-weapon slots
             }
         }
         // Special check for one-handed weapons - cannot go into the offhand if a two-handed weapon is in the main hand
          if (baseSlotType === 'Weapon' && slotTypeOrKey === 'Weapon2') {
               const mainHandItem = equipmentData['Weapon1'];
               if (mainHandItem && (mainHandItem.type.includes("Two-Handed") || mainHandItem.type === "Bow")) {
                   return false; // Cannot place 1H in offhand if main hand has 2H
               }
          }
         return true; 
    }

    return false; 
}


/**
 * Updates the visual indicator showing where an item will land in the grid.
 * @param {number} col - Target column.
 * @param {number} row - Target row.
 * @param {number} width - Item width in cells.
 * @param {number} height - Item height in cells.
 * @param {boolean} isValid - Whether the drop location is valid.
 */
function updateDropIndicator(col, row, width, height, isValid) {
     if (!dropIndicator || col === null || row === null) {
         resetDropIndicator(); 
         return;
     }

    // Check if the calculated coords are potentially within bounds for placement start
    if (col >= 1 && row >= 1 && col <= GRID_COLS && row <= GRID_ROWS) {
        dropIndicator.style.width = `${width * CELL_SIZE + (width - 1) * GRID_GAP}px`;
        dropIndicator.style.height = `${height * CELL_SIZE + (height - 1) * GRID_GAP}px`;
        // Calculate top/left based on cell coords, ensuring alignment with grid gaps
        const leftPos = (col - 1) * (CELL_SIZE + GRID_GAP);
        const topPos = (row - 1) * (CELL_SIZE + GRID_GAP);
        dropIndicator.style.left = `${leftPos}px`;
        dropIndicator.style.top = `${topPos}px`;
        dropIndicator.className = `drop-indicator visible ${isValid ? 'valid' : 'invalid'}`;
    } else {
         // Hide indicator if the calculated top-left is outside the grid bounds
         resetDropIndicator();
    }
}

/**
 * Hides the drop indicator.
 */
function resetDropIndicator() {
     if (dropIndicator) {
        dropIndicator.className = 'drop-indicator';
     }
}

/**
 * Updates the visual feedback (classes) on an equipment slot during drag.
 * @param {HTMLElement} slotElement - The equipment slot element.
 * @param {boolean} isValid - Whether the drop is valid for this slot.
 */
function updateEquipmentSlotFeedback(slotElement, isValid) {
    if (!slotElement) return;
    slotElement.classList.add('drop-target');
    slotElement.classList.toggle('can-drop', isValid);
    slotElement.classList.toggle('cannot-drop', !isValid);
}

/**
 * Resets the visual feedback (classes) on all equipment slots.
 */
function resetEquipmentSlotFeedback() {
    allEquipmentSlots.forEach(slot => slot.classList.remove('drop-target', 'can-drop', 'cannot-drop'));
}