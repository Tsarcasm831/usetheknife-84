// Team Tab functionality
import * as teamManager from '../../teamManager.js';
// loadoutManager is not directly used here; its refresh is handled by a callback via modalCore

export async function initTeamTab(tabElement) {
    if (!tabElement) return;

    // Initialize the team tab HTML content
    tabElement.innerHTML = `
        <div class="team-configuration-container">
            <div class="available-units-panel">
                <h3>Available Units (FDG)</h3>
                <div id="available-units-list" class="units-list scrollable-list"></div>
            </div>
            <div class="active-team-panel">
                <h3>Active Team (Max 3)</h3>
                <div id="active-team-slots" class="team-slots">
                    <div class="team-slot" data-slot-index="0">Slot 1</div>
                    <div class="team-slot" data-slot-index="1">Slot 2</div>
                    <div class="team-slot" data-slot-index="2">Slot 3</div>
                </div>
            </div>
            <div class="team-stats-panel">
                <h3>Team Stats</h3>
                <div id="team-stats-display">
                    <p>Team Coherence: <span id="team-coherence-value">N/A</span></p>
                    <p>Total Health: <span id="team-total-health">N/A</span></p>
                    <p>Average Move: <span id="team-avg-move">N/A</span></p>
                </div>
            </div>
        </div>
    `;

    // Setup team manager
    teamManager.initTeamManager(
        {
            availableUnitsList: tabElement.querySelector('#available-units-list'),
            activeTeamSlotsContainer: tabElement.querySelector('#active-team-slots'),
            teamCoherenceValue: tabElement.querySelector('#team-coherence-value'),
            teamTotalHealth: tabElement.querySelector('#team-total-health'),
            teamAvgMove: tabElement.querySelector('#team-avg-move')
        },
        () => {
            // Callback to refresh loadout manager when team changes
            const loadoutTabContent = document.querySelector('#tab2-content');
            if (loadoutTabContent && loadoutTabContent.classList.contains('active')) {
                const loadoutManager = require('../../loadoutManager.js');
                loadoutManager.refreshLoadoutDisplay();
            }
        }
    );
}