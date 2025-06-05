// Loadout Tab functionality
import * as loadoutManager from '../../loadoutManager.js';
import * as teamManager from '../../teamManager.js';

export async function initLoadoutTab(tabElement) {
    if (!tabElement) return;

    // Initialize the loadout tab HTML content
    tabElement.innerHTML = `
        <div class="loadout-container">
            <div id="selected-soldiers-loadouts" class="selected-soldiers-loadouts"></div>
            <div class="available-equipment-panel">
                <h3>Available Weapons</h3>
                <div id="available-weapons-list" class="equipment-list scrollable-list"></div>
                <h3>Available Armor</h3>
                <div class="equipment-list"><p>Armor system coming soon.</p></div>
                <h3>Available Items</h3>
                <div class="equipment-list"><p>Item system coming soon.</p></div>
            </div>
        </div>
    `;

    // Setup loadout manager
    loadoutManager.initLoadoutManager(
        { 
            loadoutTabContent: tabElement, 
            selectedSoldiersLoadoutsContainer: tabElement.querySelector('#selected-soldiers-loadouts'),
            availableWeaponsList: tabElement.querySelector('#available-weapons-list')
        }, 
        teamManager.getActiveTeam
    );
}