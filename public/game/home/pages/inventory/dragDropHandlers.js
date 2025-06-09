// All dependencies are loaded globally via script tags. No import/export/module syntax.
// Handler functions are attached to window for global access.

// Store drag start position and original styles/parent
let originalParent = null;
let originalSibling = null; // To maintain order if possible
let startX = 0;
let startY = 0;
let originalTransform = '';

// Attach handlers to window for global access
window.handleDragStart = handleDragStart;
window.handleDragMove = handleDragMove;
window.handleDragEnd = handleDragEnd;

/**
 * Handles the start of a drag operation.
 * @param {object} event - The interact.js drag start event.
 */
/**
 * Handles the start of a drag operation
 * @param {Event} event - The interact.js drag start event
 */
function handleDragStart(event) {
    try {
        const itemElement = event.target;
        window.isDragging = true;
        
        // Don't hide tooltip here - we'll manage it in the move/end handlers
        if (!itemElement || !itemElement.dataset) {
            console.error('Invalid drag target:', itemElement);
            event.interaction.stop();
            return;
        }

        const itemId = itemElement.dataset.itemId;
        if (!itemId) {
            console.error('Dragged element has no itemId:', itemElement);
            event.interaction.stop();
            return;
        }

        // Find the item data in the current tab or equipment
        const currentTabId = getCurrentTabId();
        const itemData = findItemDataById(itemId, currentTabId);

        if (!itemData) {
            console.error('Could not find dragging item data for ID:', itemId);
            event.interaction.stop();
            return;
        }

        // Store initial pointer position for click detection
        startX = event.pageX;
        startY = event.pageY;

        // Calculate and store the initial offset relative to the item's top-left
        const itemRect = itemElement.getBoundingClientRect();
        const offsetX = event.clientX - itemRect.left;
        const offsetY = event.clientY - itemRect.top;
        setDragStartOffset({ x: offsetX, y: offsetY });

        // Set up drag state
        setDraggingItem(itemData);
        setInteraction(event.interaction);

        // Determine origin and temporarily clear data/occupancy
        let originInfo = null;
        const closestGrid = itemElement.closest('.inventory-grid');
        const closestSlot = itemElement.closest('.equipment-slot');

        if (closestGrid) {
            // Item is being dragged from a grid
            const originTab = currentTabId;
            const gridState = inventoryData[originTab]?.gridState;
            
            if (itemData.col != null && itemData.row != null && gridState) {
                originInfo = { 
                    type: 'grid', 
                    tabId: originTab, 
                    col: itemData.col, 
                    row: itemData.row 
                };
                
                // Clear the occupancy in the grid
                if (!clearOccupancy(gridState, itemData)) {
                    console.warn('Failed to clear occupancy for item:', itemData.id);
                }
                
                console.log(`Drag start from Grid: ${originTab} (${itemData.col}, ${itemData.row})`);
                originalParent = closestGrid;
            } else {
                console.error('Dragged item from grid lacks valid origin coordinates or grid state:', itemData);
                clearDragState();
                event.interaction.stop();
                return;
            }
        } else if (closestSlot) {
            // Item is being dragged from an equipment slot
            const slotKey = findEquipmentSlotElementKey(closestSlot);
            
            if (slotKey && equipmentData[slotKey]?.id === itemId) {
                originInfo = { 
                    type: 'equipment', 
                    slotKey,
                    // Store original position in case of revert
                    originalPosition: {
                        slot: slotKey,
                        item: { ...equipmentData[slotKey] }
                    }
                };
                
                // Temporarily clear the equipment slot
                delete equipmentData[slotKey];
                console.log(`Drag start from Equipment: ${slotKey}`);
                originalParent = closestSlot;
                
                // Update the UI to show the slot as empty
                renderEquipment();
            } else {
                console.error(`Dragged item from equipment slot mismatch. Slot: ${slotKey}, Item ID: ${itemId}`);
                clearDragState();
                event.interaction.stop();
                return;
            }
        } else {
            console.error('Could not determine drag origin. Not in grid or equipment slot.');
            clearDragState();
            event.interaction.stop();
            return;
        }

        // If we got this far, set the origin info
        if (originInfo) {
            setOrigin(originInfo);
        } else {
            console.error('Failed to set origin info for drag operation');
            clearDragState();
            event.interaction.stop();
            return;
        }

        // --- Visual Feedback ---
        // Add visual feedback for the dragged item
        itemElement.classList.add('dragging');
        itemElement.style.pointerEvents = 'none';
        itemElement.style.zIndex = '1000';
        itemElement.style.opacity = '0.7';
        itemElement.style.transform = 'scale(1.05)';
        itemElement.style.transition = 'transform 0.1s ease, opacity 0.1s ease';
        
        // Store original styles for restoration
        originalTransform = itemElement.style.transform;
        originalParent = itemElement.parentNode;
        originalSibling = itemElement.nextElementSibling;
        
        // Add a clone as a placeholder in the original position
        const placeholder = itemElement.cloneNode(true);
        placeholder.classList.add('drag-placeholder');
        placeholder.style.opacity = '0.4';
        placeholder.style.pointerEvents = 'none';
        itemElement.parentNode.insertBefore(placeholder, itemElement.nextSibling);
        
        // Move the actual element to the body for smooth dragging
        document.body.appendChild(itemElement);
        itemElement.style.position = 'absolute';
        itemElement.style.left = `${itemRect.left}px`;
        itemElement.style.top = `${itemRect.top}px`;
        
    } catch (error) {
        console.error('Error in handleDragStart:', error);
        clearDragState();
        if (event.interaction) {
            event.interaction.stop();
        }
    }
}

/**
 * Handles the move event during a drag operation.
 * @param {object} event - The interact.js drag move event.
 */
function handleDragMove(event) {
    try {
        const itemElement = event.target;
        if (!itemElement || !itemElement.dataset) {
            console.error('Invalid drag target in move handler:', itemElement);
            return;
        }
        
        // Hide tooltip during movement to prevent it from getting in the way
        if (window.tooltipElement && window.tooltipElement.style.display === 'block') {
            window.hideTooltip();
        }

        // Only proceed if we're actually dragging
        if (!itemElement.classList.contains('dragging')) {
            return;
        }

        const dragOffset = getDragStartOffset();
        const draggingItem = getDraggingItem();
        
        if (!draggingItem) {
            console.error('No dragging item in handleDragMove');
            return;
        }

        // Calculate new position based on pointer position and initial offset
        const x = event.clientX - dragOffset.x;
        const y = event.clientY - dragOffset.y;
        
        // Throttle position updates for better performance (~60fps)
        if (typeof window.lastDragUpdate === 'number' && 
            event.timeStamp - window.lastDragUpdate < 16) {
            return;
        }
        window.lastDragUpdate = event.timeStamp;
        
        // Apply the position using transform for better performance
        requestAnimationFrame(() => {
            itemElement.style.transform = `translate(${x}px, ${y}px)`;
            
            // Add a subtle shadow effect while dragging
            if (!itemElement.classList.contains('dragging-active')) {
                itemElement.classList.add('dragging-active');
                itemElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
                itemElement.style.transition = 'box-shadow 0.1s ease, transform 0s';
            }
        });
        
        // Get the drop target under the pointer
        const dropTarget = getDropTarget(event);
        
        // Update visual feedback based on the drop target
        if (dropTarget && dropTarget.type === 'grid') {
            // Handle grid drop target
            const { col, row } = dropTarget;
            const currentTabId = getCurrentTabId();
            const gridState = inventoryData[currentTabId]?.gridState;
            
            if (!gridState) {
                console.error('No grid state available for current tab:', currentTabId);
                resetDropIndicator();
                resetEquipmentSlotFeedback();
                return;
            }
            
            // Check if the drop would be valid
            const isValid = !isOccupied(
                gridState,
                row,
                col,
                draggingItem.width || 1,
                draggingItem.height || 1,
                draggingItem.id
            );
            
            // Update the drop indicator
            updateDropIndicator(
                col, 
                row, 
                draggingItem.width || 1, 
                draggingItem.height || 1, 
                isValid
            );
            
            // Reset any equipment slot feedback
            resetEquipmentSlotFeedback();
            
        } else if (dropTarget && dropTarget.type === 'equipment') {
            // Handle equipment slot drop target
            const slotElement = dropTarget.element;
            const slotKey = dropTarget.slotKey;
            
            if (!slotKey) {
                console.error('No slot key for equipment drop target');
                return;
            }
            
            // Check if the item can be dropped in this slot
            const isValid = canDropItemInSlot(draggingItem, slotKey);
            
            // Update the slot's visual feedback
            updateEquipmentSlotFeedback(slotElement, isValid);
            
            // Reset the grid drop indicator
            resetDropIndicator();
            
        } else {
            // No valid drop target under the pointer
            resetDropIndicator();
            resetEquipmentSlotFeedback();
        }
        
    } catch (error) {
        console.error('Error in handleDragMove:', error);
        // Try to recover by resetting visual feedback
        resetDropIndicator();
        resetEquipmentSlotFeedback();
    }
}

/**
 * Handles the end of a drag operation.
 * @param {object} event - The interact.js drag end event.
 */
function handleDragEnd(event) {
    try {
        const itemElement = event.target;
        window.isDragging = false;
        if (!itemElement) {
            console.error('No target element in drag end');
            clearDragState();
            return;
        }
        
        // Show tooltip again if we're hovering over an item
        const relatedTarget = document.elementFromPoint(event.clientX, event.clientY);
        if (relatedTarget) {
            const hoveredItem = relatedTarget.closest('.item');
            if (hoveredItem && hoveredItem.dataset.itemId) {
                // Small delay to ensure the drop is complete before showing tooltip
                setTimeout(() => {
                    if (window.showTooltip) {
                        window.showTooltip({
                            clientX: event.clientX,
                            clientY: event.clientY,
                            target: hoveredItem
                        }, hoveredItem);
                    }
                }, 50);
            }
        }

        // Clean up visual feedback
        itemElement.classList.remove('dragging', 'dragging-active');
        
        // Reset styles applied during drag
        itemElement.style.transform = originalTransform || '';
        itemElement.style.zIndex = '';
        itemElement.style.pointerEvents = '';
        itemElement.style.boxShadow = '';
        itemElement.style.transition = '';
        itemElement.style.opacity = '';
        itemElement.style.position = '';
        itemElement.style.left = '';
        itemElement.style.top = '';

        // Remove any placeholder that might have been added
        const placeholder = document.querySelector('.drag-placeholder');
        if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
        }

        // Reset visual feedback
        resetDropIndicator();
        resetEquipmentSlotFeedback();

        const draggingItem = getDraggingItem();
        const origin = getOrigin();

        // Handle missing drag data
        if (!draggingItem || !origin) {
            console.warn("Drag end with missing item data or origin. Cleaning up.");
            if (itemElement.parentElement) {
                itemElement.remove();
            }
            clearDragState();
            renderGrid(getCurrentTabId());
            renderEquipment();
            cleanupDragState();
            return;
        }

        // Get the drop target
        let dropTarget;
        try {
            dropTarget = getDropTarget(event);
        } catch (error) {
            console.error('Error getting drop target:', error);
            dropTarget = null;
        }

        let droppedSuccessfully = false;
        const { type: dropType, slotKey: dropSlotKey, col: dropCol, row: dropRow } = dropTarget || {};

        // --- Try Dropping ---
        try {
            if (dropType === 'equipment' && dropSlotKey) {
                if (canDropItemInSlot(draggingItem, dropSlotKey)) {
                    droppedSuccessfully = moveItemToEquipment(dropSlotKey);
                } else {
                    console.log(`Cannot drop ${draggingItem.name} in ${dropSlotKey} - invalid slot type`);
                }
            } else if (dropType === 'grid' && dropCol !== null && dropRow !== null) {
                const currentTabId = getCurrentTabId();
                if (inventoryData[currentTabId]?.gridState) {
                    droppedSuccessfully = moveItemToGrid(currentTabId, dropCol, dropRow);
                } else {
                    console.error(`Grid state for tab ${currentTabId} not found`);
                }
            } else if (dropType) {
                console.log(`Invalid drop target type: ${dropType}`);
            }
        } catch (error) {
            console.error('Error during drop operation:', error);
            droppedSuccessfully = false;
        }

        // --- Handle Drop Result ---
        if (!droppedSuccessfully) {
            console.log("Drop unsuccessful, reverting to origin");
            try {
                revertItemToOrigin();
                // Flash red to indicate invalid drop
                itemElement.style.transition = 'background-color 0.3s';
                itemElement.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                setTimeout(() => {
                    itemElement.style.backgroundColor = '';
                }, 300);
            } catch (error) {
                console.error('Error reverting item:', error);
            }
        } else {
            console.log("Drop successful");
            // Remove the dragged element as it will be recreated by the render functions
            if (itemElement.parentElement) {
                itemElement.remove();
            }
        }

        // --- Final Cleanup and Render ---
        try {
            renderGrid(getCurrentTabId());
            renderEquipment();
        } catch (renderError) {
            console.error('Error during render after drop:', renderError);
        }
        
    } catch (error) {
        console.error('Error in handleDragEnd:', error);
    } finally {
        // Always ensure we clean up the drag state
        clearDragState();
        cleanupDragState();
    }
}

/**
 * Cleans up the drag state and resets temporary variables
 */
function cleanupDragState() {
    // Remove any remaining placeholders
    document.querySelectorAll('.drag-placeholder').forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
    });
    
    // Reset variables
    originalParent = null;
    originalSibling = null;
    originalTransform = '';
    
    // Reset any visual feedback
    resetDropIndicator();
    resetEquipmentSlotFeedback();
    
    // Clear any active drag classes
    document.querySelectorAll('.dragging, .dragging-active').forEach(el => {
        el.classList.remove('dragging', 'dragging-active');
        el.style.transform = '';
        el.style.zIndex = '';
        el.style.pointerEvents = '';
        el.style.boxShadow = '';
        el.style.transition = '';
        el.style.opacity = '';
    });
}

/**
 * Gets the drop target element and its type based on the current mouse position
 * @param {Event} event - The drag event
 * @returns {Object} - Object containing drop target information
 */
function getDropTarget(event) {
    try {
        // Get the element under the pointer
        const elementUnderPointer = document.elementFromPoint(event.clientX, event.clientY);
        if (!elementUnderPointer) return { type: 'none' };

        // Check if we're over an equipment slot
        const equipmentSlot = elementUnderPointer.closest('.equipment-slot');
        if (equipmentSlot) {
            const slotKey = findEquipmentSlotElementKey(equipmentSlot);
            if (slotKey) {
                return {
                    type: 'equipment',
                    element: equipmentSlot,
                    slotKey: slotKey
                };
            }
        }

        // Check if we're over the inventory grid
        const gridElement = elementUnderPointer.closest('.inventory-grid');
        if (gridElement) {
            const gridRect = gridElement.getBoundingClientRect();
            const dragOffset = getDragStartOffset();
            
            // Calculate grid coordinates based on the item's top-left corner
            const itemTopLeftX = event.clientX - dragOffset.x;
            const itemTopLeftY = event.clientY - dragOffset.y;
            
            // Get grid coordinates
            const { col, row } = getGridCoordsFromPosition(
                gridRect, 
                itemTopLeftX, 
                itemTopLeftY
            );
            
            return {
                type: 'grid',
                element: gridElement,
                col: col,
                row: row
            };
        }

        // No valid drop target found
        return { type: 'none' };
        
    } catch (error) {
        console.error('Error in getDropTarget:', error);
        return { type: 'none' };
    }
}

/**
 * Helper to find the specific slot key from an equipment slot element
 * @param {HTMLElement} slotElement - The slot element
 * @returns {string|null} - The slot key or null if not found
 */
function findEquipmentSlotElementKey(slotElement) {
    if (!slotElement) return null;
    
    try {
        // First check for explicit data attributes
        if (slotElement.dataset.slotKey) {
            return slotElement.dataset.slotKey;
        }
        
        // Check for slot type and handle special cases
        const slotType = slotElement.dataset.slotType;
        if (slotType) {
            // Handle ring slots
            if (slotType === 'Ring') {
                return slotElement.classList.contains('ring1') ? 'Ring1' : 'Ring2';
            }
            // Handle weapon slots
            if (slotType === 'Weapon') {
                return slotElement.classList.contains('weapon1') ? 'Weapon1' : 'Weapon2';
            }
            return slotType;
        }
        
        // Handle flask slots
        if (slotElement.classList.contains('flask')) {
            const flaskSlotsContainer = slotElement.closest('.flask-slots');
            if (!flaskSlotsContainer) return null;
            
            // Get all flask slots and find the index of the current one
            const flasks = Array.from(flaskSlotsContainer.querySelectorAll('.equipment-slot.flask'));
            const index = flasks.indexOf(slotElement);
            return index !== -1 ? `Flask${index + 1}` : null;
        }
        
        // Try to find a parent with a slot-key attribute
        const parentWithKey = slotElement.closest('[data-slot-key]');
        if (parentWithKey) {
            return parentWithKey.dataset.slotKey;
        }
        
        return null;
        
    } catch (error) {
        console.error('Error in findEquipmentSlotElementKey:', error);
        return null;
    }
}