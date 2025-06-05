// js/teamManager.js

let availableUnits = [];
let activeTeam = [null, null, null]; // Array to store unit data for 3 slots

let domElements = {
    availableUnitsList: null,
    activeTeamSlotsContainer: null,
    teamStatsDisplay: null,
    teamCoherenceValue: null,
    teamTotalHealth: null,
    teamAvgMove: null
};

// Forward declaration for prepareEventModal's refreshLoadoutTab
let notifyLoadoutManagerRefresh = () => {};

export function initTeamManager(elements, loadoutRefreshCallback) {
    domElements = { ...domElements, ...elements };
    notifyLoadoutManagerRefresh = loadoutRefreshCallback;
    resetTeam(); // Ensure clean state on init
    fetchAndPopulateAvailableUnits();
}

export async function fetchAndPopulateAvailableUnits() {
    try {
        const response = await fetch('/json/factions/fdg.json'); // Corrected path
        if (!response.ok) {
            throw new Error(`Failed to fetch /json/factions/fdg.json: ${response.status}`);
        }
        const data = await response.json();
        if (data.troops) {
            availableUnits = data.troops.map(troop => ({
                ...troop,
                id: `unit_${troop.name.replace(/ /g, '_')}_${troop.version}`,
                faction: 'FDG',
                imagePath: `/assets/FDG/${troop.name.replace(/ /g, '_')}_${troop.version}.png`
            }));
        }
        renderAvailableUnitsList();
    } catch (error) {
        console.error("Error fetching available units:", error);
        availableUnits = [];
        if (domElements.availableUnitsList) {
            domElements.availableUnitsList.innerHTML = '<p style="color:red;">Error loading units.</p>';
        }
    }
}

function renderAvailableUnitsList() {
    if (!domElements.availableUnitsList) return;
    domElements.availableUnitsList.innerHTML = '';

    availableUnits.forEach(unit => {
        const unitItem = document.createElement('div');
        unitItem.className = 'unit-item-draggable';
        unitItem.draggable = true;
        unitItem.dataset.unitId = unit.id; // Store full ID for getUnitById
        unitItem.innerHTML = `
            <img src="${unit.imagePath}" alt="${unit.name} ${unit.version}" onerror="this.style.display='none'; this.parentElement.querySelector('strong').textContent += ' (Img Fail)';">
            <div class="unit-item-info">
                <strong>${unit.name} (${unit.version})</strong>
                <span>H:${unit.health} M:${unit.move} R:${unit.range} Hit:${unit.chance_to_hit}%</span>
            </div>
        `;
        unitItem.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('application/json', JSON.stringify({ type: 'unit', id: unit.id }));
            event.dataTransfer.effectAllowed = 'move';
        });
        domElements.availableUnitsList.appendChild(unitItem);
    });
}

export function assignUnitToSlot(slotIndex, unitId) {
    const unitData = getUnitById(unitId);
    if (!unitData) return false;

    // Check if unit is already in another slot and remove it to prevent duplicates
    activeTeam.forEach((teamUnit, index) => {
        if (teamUnit && teamUnit.id === unitData.id && index !== slotIndex) {
            activeTeam[index] = null; // Clear from old slot
            renderTeamSlot(index, null); // Update old slot's render
        }
    });
    
    activeTeam[slotIndex] = { ...unitData, equippedWeapon: null, equippedArmor: null, equippedItem1: null, equippedItem2: null };
    renderTeamSlot(slotIndex, activeTeam[slotIndex]);
    updateTeamStatsRender();
    notifyLoadoutManagerRefresh();
    return true;
}

export function removeUnitFromSlot(slotIndex) {
    activeTeam[slotIndex] = null;
    renderTeamSlot(slotIndex, null);
    updateTeamStatsRender();
    notifyLoadoutManagerRefresh();
}

export function renderTeamSlot(slotIndex, unitData) {
    const slotElement = domElements.activeTeamSlotsContainer
        ? domElements.activeTeamSlotsContainer.querySelector(`.team-slot[data-slot-index="${slotIndex}"]`)
        : null;

    if (!slotElement) return;

    if (unitData) {
        slotElement.classList.add('occupied');
        slotElement.innerHTML = `
            <img src="${unitData.imagePath}" alt="${unitData.name}">
            <div class="unit-name">${unitData.name} (${unitData.version})</div>
            <div class="unit-details">H:${unitData.health} M:${unitData.move}</div>
            <button class="team-slot-remove-btn" data-slot-index="${slotIndex}">Remove</button>
        `;
        const removeBtn = slotElement.querySelector('.team-slot-remove-btn');
        if (removeBtn) { // Check if button exists before adding listener
             // Remove existing listener if any, to prevent multiple attachments
            const newRemoveBtn = removeBtn.cloneNode(true);
            removeBtn.parentNode.replaceChild(newRemoveBtn, removeBtn);
            newRemoveBtn.addEventListener('click', () => removeUnitFromSlot(slotIndex));
        }
    } else {
        slotElement.classList.remove('occupied');
        slotElement.innerHTML = `Slot ${parseInt(slotIndex) + 1}`;
    }
}

export function updateTeamStatsRender() {
    if (!domElements.teamCoherenceValue || !domElements.teamTotalHealth || !domElements.teamAvgMove) return;

    let totalHealth = 0;
    let totalMove = 0;
    let unitCount = 0;
    let factions = new Set();

    activeTeam.forEach(unit => {
        if (unit) {
            totalHealth += unit.health || 0;
            totalMove += unit.move || 0;
            unitCount++;
            if (unit.faction) {
                factions.add(unit.faction);
            }
        }
    });

    const avgMove = unitCount > 0 ? (totalMove / unitCount).toFixed(1) : 'N/A';
    let coherence = 'N/A';
    if (unitCount > 0) {
        if (factions.size <= 1) coherence = '100%';
        else if (factions.size === 2) coherence = '75%';
        else coherence = '50%';
    }

    domElements.teamCoherenceValue.textContent = coherence;
    domElements.teamTotalHealth.textContent = unitCount > 0 ? totalHealth : 'N/A';
    domElements.teamAvgMove.textContent = avgMove;
}

export function getActiveTeam() {
    return activeTeam;
}

export function getUnitById(unitId) {
    return availableUnits.find(u => u.id === unitId) || null;
}

export function resetTeam() {
    activeTeam = [null, null, null];
    if (domElements.activeTeamSlotsContainer) {
        const slots = domElements.activeTeamSlotsContainer.querySelectorAll('.team-slot');
        slots.forEach((slot, index) => renderTeamSlot(index, null));
    }
    updateTeamStatsRender();
    notifyLoadoutManagerRefresh(); // Notify loadout manager to clear its display too
}

export function assignEquipmentToUnit(unitSlotIndex, equipmentType, equipmentData) {
    if (activeTeam[unitSlotIndex]) {
        activeTeam[unitSlotIndex][equipmentType] = equipmentData;
        // Potentially trigger a re-render or notification if team stats depend on equipment
        // For now, loadoutManager handles its own visual updates.
        return true;
    }
    return false;
}

export function removeEquipmentFromUnit(unitSlotIndex, equipmentType) {
     if (activeTeam[unitSlotIndex]) {
        activeTeam[unitSlotIndex][equipmentType] = null;
        return true;
    }
    return false;
}

// Expose teamManager to the global scope so it can be called from popup HTML
window.teamManager = {
    initTeamManager: initTeamManager,
    assignUnitToSlot: assignUnitToSlot,
    removeUnitFromSlot: removeUnitFromSlot,
    getActiveTeam: getActiveTeam,
    getUnitById: getUnitById,
    resetTeam: resetTeam,
    assignEquipmentToUnit: assignEquipmentToUnit,
    removeEquipmentFromUnit: removeEquipmentFromUnit
};