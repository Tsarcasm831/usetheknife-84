// Drag and Drop Utilities for the Prepare Event Modal
import * as teamManager from '../../teamManager.js';
import * as loadoutManager from '../../loadoutManager.js';

// Generic drag and drop handlers
export function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const targetSlot = event.target.closest('.team-slot, .weapon-slot, .armor-slot, .item-slot');
    if (targetSlot && !targetSlot.classList.contains('locked')) {
        targetSlot.classList.add('drag-over');
    }
}

export function handleDragLeave(event) {
    const targetSlot = event.target.closest('.team-slot, .weapon-slot, .armor-slot, .item-slot');
    if (targetSlot) {
        targetSlot.classList.remove('drag-over');
    }
}

// Team-specific drop handlers
export function handleDropOnTeamSlot(event) {
    event.preventDefault();
    const dataString = event.dataTransfer.getData('application/json');
    if (!dataString) return;

    try {
        const data = JSON.parse(dataString);
        const slotElement = event.target.closest('.team-slot');
        if (data.type === 'unit' && slotElement) {
            slotElement.classList.remove('drag-over');
            const slotIndex = parseInt(slotElement.dataset.slotIndex);
            teamManager.assignUnitToSlot(slotIndex, data.id);
            // teamManager's assignUnitToSlot now calls notifyLoadoutManagerRefresh,
            // which calls loadoutManager.refreshLoadoutDisplay()
        }
    } catch (e) {
        console.error("Error processing drop data on team slot:", e, dataString);
    }
}

// Equipment-specific drop handlers
export function handleDropOnEquipmentSlot(event) {
    event.preventDefault();
    const dataString = event.dataTransfer.getData('application/json');
    if (!dataString) return;

    try {
        const data = JSON.parse(dataString);
        const slotElement = event.target.closest('.weapon-slot, .armor-slot, .item-slot');
        
        if (slotElement && !slotElement.classList.contains('locked')) {
            slotElement.classList.remove('drag-over');
            const teamMemberIndex = parseInt(slotElement.dataset.teamMemberIndex);
            
            if (data.type === 'weapon' && slotElement.classList.contains('weapon-slot')) {
                const weaponData = loadoutManager.getWeaponById(data.id);
                if (weaponData) {
                    teamManager.assignEquipmentToUnit(teamMemberIndex, 'equippedWeapon', weaponData);
                    loadoutManager.refreshLoadoutDisplay();
                }
            }
            // Add similar blocks for 'armor' and 'item' if data.type and slotElement.classList match
            // else if (data.type === 'armor' && slotElement.classList.contains('armor-slot')) { ... }
            // else if (data.type === 'item' && slotElement.classList.contains('item-slot')) { ... }
        }
    } catch (e) {
        console.error("Error processing drop data on equipment slot:", e, dataString);
    }
}

// Remove handlers
export function handleRemoveUnit(event) {
    const slotIndex = parseInt(event.target.dataset.slotIndex);
    teamManager.removeUnitFromSlot(slotIndex);
    // teamManager's removeUnitFromSlot now calls notifyLoadoutManagerRefresh
}

export function handleRemoveEquipment(event) {
    const teamMemberIndex = parseInt(event.target.dataset.slotIndex); // slotIndex on button is teamMemberIndex
    const equipmentType = event.target.dataset.equipmentType; // e.g., 'weapon'

    if (equipmentType === 'weapon') {
        teamManager.removeEquipmentFromUnit(teamMemberIndex, 'equippedWeapon');
    }
    // Add similar for armor, item1
    loadoutManager.refreshLoadoutDisplay();
}

// Main setup function to add all drag & drop handlers
export function setupDragDropHandlers(modalElement) {
    // Setup team slots drag & drop
    modalElement.querySelectorAll('.team-slot').forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('drop', handleDropOnTeamSlot);
    });
    
    // Delegated event listeners for dynamically added/updated team elements
    modalElement.querySelector('#active-team-slots')?.addEventListener('click', function(event) {
        if (event.target.classList.contains('team-slot-remove-btn')) {
            handleRemoveUnit(event);
        }
    });

    // Setup equipment slots drag & drop (delegated to parent)
    const loadoutTabContent = modalElement.querySelector('#tab2-content');
    if (loadoutTabContent) {
        loadoutTabContent.addEventListener('dragover', function(event) {
            const targetSlot = event.target.closest('.weapon-slot, .armor-slot, .item-slot');
            if (targetSlot) handleDragOver(event);
        });
        
        loadoutTabContent.addEventListener('dragleave', function(event) {
            const targetSlot = event.target.closest('.weapon-slot, .armor-slot, .item-slot');
            if (targetSlot) handleDragLeave(event);
        });
        
        loadoutTabContent.addEventListener('drop', function(event) {
            const targetSlot = event.target.closest('.weapon-slot, .armor-slot, .item-slot');
            if (targetSlot) handleDropOnEquipmentSlot(event);
        });
        
        loadoutTabContent.addEventListener('click', function(event) {
            if (event.target.classList.contains('remove-equipment-btn')) {
                handleRemoveEquipment(event);
            }
        });
    }
}