// js/loadoutManager.js

let availableWeapons = [];
let getActiveTeamFn = () => [null, null, null]; // Function to get active team from teamManager

let domElements = {
    loadoutTabContent: null,
    selectedSoldiersLoadoutsContainer: null,
    availableWeaponsList: null
};

function transformWeaponNameForImagePath(weaponName, categoryKey) {
    let imageName = weaponName.toLowerCase();
    // Specific known transformations based on existing assets
    if (imageName.includes("exterminator (p)")) imageName = "exterminator_p";
    else if (imageName.includes("obliterator (r)")) imageName = "obliterator_r";
    else if (imageName.includes("tpb pistol")) imageName = "tpb_pistol"; // from particle_beam
    else if (imageName.includes("frc 10 pistol")) imageName = "frc_10_pistol"; // from plutonium_fuel_rod

    // General transformations
    imageName = imageName.replace(/\(p\)$/g, '_p').replace(/\(r\)$/g, '_r'); // Handle (P) and (R)
    imageName = imageName.replace(/\./g, ''); // Remove periods: .50 cal -> 50_cal
    imageName = imageName.replace(/\//g, '_'); // Replace slashes: pistol/rev -> pistol_rev
    imageName = imageName.replace(/\s+/g, '_'); // Replace spaces with underscores

    // Handle "cal" to "caliber" if it's a common pattern in your assets and JSON differs
    // Example: if "50_cal_pistol" from JSON needs to become "50_caliber_pistol" for image
    if (imageName.includes('_cal_')) {
        imageName = imageName.replace(/_cal_/g, '_caliber_');
    }
    
    // Specific fix for .22 long rifle (JSON: .22 long rifle -> asset: 22_long_rifle.png)
    // The .replace(/\./g, '') above handles the leading dot.

    return `${imageName}.png`;
}

export function initLoadoutManager(elements, activeTeamGetter) {
    domElements = { ...domElements, ...elements };
    getActiveTeamFn = activeTeamGetter;
    fetchAndPopulateAvailableWeapons();
}

async function fetchAndPopulateAvailableWeapons() {
    try {
        const response = await fetch('/json/equipment/weapons.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch weapons.json: ${response.status}`);
        }
        const data = await response.json();
        availableWeapons = [];
        if (data.weapons) {
            for (const categoryKey in data.weapons) {
                data.weapons[categoryKey].forEach(weapon => {
                    const imageName = transformWeaponNameForImagePath(weapon.name, categoryKey);
                    availableWeapons.push({
                        ...weapon,
                        id: `weapon_${categoryKey}_${weapon.name.replace(/[^a-zA-Z0-9]/g, '_')}`, // Unique ID
                        category: categoryKey,
                        imagePath: `/assets/equipment/weapons/${categoryKey}/${imageName}`
                    });
                });
            }
        }
        renderAvailableWeaponsList();
    } catch (error) {
        console.error("Error fetching available weapons:", error);
        availableWeapons = [];
        if (domElements.availableWeaponsList) {
            domElements.availableWeaponsList.innerHTML = '<p style="color:red;">Error loading weapons.</p>';
        }
    }
}

function renderAvailableWeaponsList() {
    if (!domElements.availableWeaponsList) return;
    domElements.availableWeaponsList.innerHTML = '';

    availableWeapons.forEach(weapon => {
        const weaponItem = document.createElement('div');
        weaponItem.className = 'weapon-item-draggable';
        weaponItem.draggable = true;
        weaponItem.dataset.weaponId = weapon.id;

        weaponItem.innerHTML = `
            <img src="${weapon.imagePath}" alt="${weapon.name}" onerror="this.style.display='none'; this.nextElementSibling.querySelector('strong').textContent += ' (Img Fail)';">
            <div class="weapon-item-info">
                <strong>${weapon.name}</strong>
                <span>Dmg: ${weapon.std_dmg || 'N/A'}, Range: ${weapon.range_yd || weapon.range || 'N/A'}</span>
            </div>
        `;
        weaponItem.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('application/json', JSON.stringify({ type: 'weapon', id: weapon.id }));
            event.dataTransfer.effectAllowed = 'move';
        });
        domElements.availableWeaponsList.appendChild(weaponItem);
    });
}

export function refreshLoadoutDisplay() {
    if (!domElements.loadoutTabContent || !domElements.selectedSoldiersLoadoutsContainer) {
        // If called before tab is active, ensure container exists or defer.
        // For now, we assume this is called when tab is active and elements exist.
        if (document.getElementById('tab2-content') && document.getElementById('tab2-content').classList.contains('active')) {
             // If the tab is active, ensure DOM elements are correctly re-queried if needed
            domElements.loadoutTabContent = document.getElementById('tab2-content');
            domElements.selectedSoldiersLoadoutsContainer = document.getElementById('selected-soldiers-loadouts');
            domElements.availableWeaponsList = document.getElementById('available-weapons-list');
        } else {
            return; // Don't render if tab is not active / elements not ready
        }
    }
    
    const activeTeam = getActiveTeamFn();
    domElements.selectedSoldiersLoadoutsContainer.innerHTML = '';

    activeTeam.forEach((unit, index) => {
        if (unit) {
            const soldierCard = document.createElement('div');
            soldierCard.className = 'soldier-loadout-card';
            soldierCard.dataset.teamMemberIndex = index;

            const weapon = unit.equippedWeapon;
            let weaponSlotHTML = `<div class="weapon-slot" data-slot-type="weapon" data-team-member-index="${index}">Weapon Slot</div>`;
            if (weapon) {
                weaponSlotHTML = `
                    <div class="weapon-slot equipped" data-slot-type="weapon" data-team-member-index="${index}">
                        <img src="${weapon.imagePath}" alt="${weapon.name}" onerror="this.style.display='none'; this.parentElement.innerHTML += '<br>(Img Fail)';">
                        <span>${weapon.name}</span>
                        <button class="remove-equipment-btn" data-equipment-type="weapon" data-slot-index="${index}">&times;</button>
                    </div>
                `;
            }

            soldierCard.innerHTML = `
                <div class="soldier-info">
                    <img src="${unit.imagePath}" alt="${unit.name}" class="soldier-loadout-image" onerror="this.style.display='none';">
                    <h4>${unit.name} (${unit.version})</h4>
                </div>
                <div class="loadout-slots">
                    ${weaponSlotHTML}
                    <div class="armor-slot" data-slot-type="armor" data-team-member-index="${index}">Armor Slot</div>
                    <div class="item-slot" data-slot-type="item1" data-team-member-index="${index}">Item Slot</div>
                    <div class="item-slot locked" data-slot-type="item2" data-team-member-index="${index}">Item 2: Locked</div>
                </div>
            `;
            domElements.selectedSoldiersLoadoutsContainer.appendChild(soldierCard);

            // Attach drag/drop listeners dynamically after HTML is set
            // This is now handled by prepareEventModal.js, which owns the drop listeners
        } else {
            const emptySlotCard = document.createElement('div');
            emptySlotCard.className = 'soldier-loadout-card placeholder';
            emptySlotCard.innerHTML = `<p>Team Slot ${index + 1} Empty</p>`;
            domElements.selectedSoldiersLoadoutsContainer.appendChild(emptySlotCard);
        }
    });
     // Ensure weapon list is also rendered if not already
    if (domElements.availableWeaponsList && domElements.availableWeaponsList.children.length === 0) {
        renderAvailableWeaponsList();
    }
}

export function getWeaponById(weaponId) {
    return availableWeapons.find(w => w.id === weaponId) || null;
}

// Note: Actual assignment logic (modifying activeTeam) will be in teamManager.js
// This module focuses on displaying loadouts and available equipment.
// assignWeaponToUnit and removeWeaponFromUnit were moved to teamManager to centralize activeTeam modification.
