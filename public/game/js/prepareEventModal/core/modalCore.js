// Modal Core functionality
import * as teamManager from '../../teamManager.js';
import * as loadoutManager from '../../loadoutManager.js';
import { setupDragDropHandlers } from '../utils/dragDrop.js';
import { initTeamTab } from '../tabs/teamTab.js';
import { initLoadoutTab } from '../tabs/loadoutTab.js';
import { initBriefingTab } from '../tabs/briefingTab.js';
import { initIntelTab } from '../tabs/intelTab.js';
import { initMapTab } from '../tabs/mapTab.js';
import { initSupportTab } from '../tabs/supportTab.js';
import { initLaunchTab } from '../tabs/launchTab.js';

let currentEventDetails = null;
let modalElement = null; // Store modal element reference

export async function initPrepareEventModal() {
    const modalsRoot = document.getElementById('modals-root');
    if (!modalsRoot) {
        console.error("Modals root not found for Prepare Event Modal.");
        return;
    }

    modalElement = document.getElementById('prepare-event-modal');
    if (!modalElement) {
        modalElement = document.createElement('div');
        modalElement.id = 'prepare-event-modal';
        modalsRoot.appendChild(modalElement);
    }

    modalElement.innerHTML = `
        <div class="prepare-event-modal-content">
            <div class="prepare-event-modal-header">
                <h2 id="prepare-event-title">Prepare for Event</h2>
                <div class="prepare-event-tabs">
                    <button class="prepare-tab-btn active" data-tab="tab1">Team</button>
                    <button class="prepare-tab-btn" data-tab="tab2">Loadout</button>
                    <button class="prepare-tab-btn" data-tab="tab3">Briefing</button>
                    <button class="prepare-tab-btn" data-tab="tab4">Intel</button>
                    <button class="prepare-tab-btn" data-tab="tab5">Map</button>
                    <button class="prepare-tab-btn" data-tab="tab6">Support</button>
                    <button class="prepare-tab-btn" data-tab="tab7">Launch</button>
                </div>
                <span class="prepare-event-modal-close-btn" id="close-prepare-event-modal">&times;</span>
            </div>
            <div class="prepare-event-modal-body">
                <div id="tab1-content" class="prepare-tab-content active">
                    <!-- Team Tab Content will be initialized by initTeamTab -->
                </div>
                <div id="tab2-content" class="prepare-tab-content">
                    <!-- Loadout Tab Content will be initialized by initLoadoutTab -->
                </div>
                <div id="tab3-content" class="prepare-tab-content">
                    <!-- Briefing Tab Content will be initialized by initBriefingTab -->
                </div>
                <div id="tab4-content" class="prepare-tab-content">
                    <!-- Intel Tab Content will be initialized by initIntelTab -->
                </div>
                <div id="tab5-content" class="prepare-tab-content">
                    <!-- Map Tab Content will be initialized by initMapTab -->
                </div>
                <div id="tab6-content" class="prepare-tab-content">
                    <!-- Support Tab Content will be initialized by initSupportTab -->
                </div>
                <div id="tab7-content" class="prepare-tab-content">
                    <!-- Launch Tab Content will be initialized by initLaunchTab -->
                </div>
            </div>
        </div>
    `;

    const closeBtn = modalElement.querySelector('#close-prepare-event-modal');
    const tabs = modalElement.querySelectorAll('.prepare-tab-btn');
    const tabContents = modalElement.querySelectorAll('.prepare-tab-content');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => modalElement.classList.remove('active'));
    }

    // Initialize tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const targetTabContentId = tab.dataset.tab + '-content';
            let activeTabContentElement = null;

            tabContents.forEach(currentTabContent => {
                const isActive = currentTabContent.id === targetTabContentId;
                currentTabContent.classList.toggle('active', isActive);
                if (isActive) {
                    activeTabContentElement = currentTabContent;
                }
            });
            
            const tabIndex = parseInt(tab.dataset.tab.replace('tab', ''));
            activateTab(tabIndex, activeTabContentElement);
        });
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modalElement) modalElement.classList.remove('active');
    });

    // Initialize all tabs with their respective content loaders
    // These init functions will populate the innerHTML of their tabElement
    await Promise.all([
        initTeamTab(modalElement.querySelector('#tab1-content')),
        initLoadoutTab(modalElement.querySelector('#tab2-content')),
        initBriefingTab(modalElement.querySelector('#tab3-content')),
        initIntelTab(modalElement.querySelector('#tab4-content')),
        initMapTab(modalElement.querySelector('#tab5-content')),
        initSupportTab(modalElement.querySelector('#tab6-content')),
        initLaunchTab(modalElement.querySelector('#tab7-content'))
    ]);

    setupDragDropHandlers(modalElement);
}

function activateTab(tabIndex, tabElement) {
    if (!tabElement || !tabElement.classList.contains('active')) return;
    
    switch (tabIndex) {
        case 1: // Team Tab
            teamManager.fetchAndPopulateAvailableUnits(); // Refresh available units if tab becomes active
            break;
        case 2: // Loadout Tab
            loadoutManager.refreshLoadoutDisplay(); // Refresh loadouts based on current team
            break;
        // Tab 3 (Briefing), 4 (Intel), 5 (Map), 6 (Support), 7 (Launch) 
        // content is largely static or updated when modal opens/event changes,
        // or their init functions already set up any necessary dynamic behaviors.
    }
}

export function openPrepareEventModal(eventId, eventTitle, eventAddress, eventLat, eventLng) {
    if (!modalElement) { 
        initPrepareEventModal().then(() => openModalLogic(eventId, eventTitle, eventAddress, eventLat, eventLng));
    } else {
        openModalLogic(eventId, eventTitle, eventAddress, eventLat, eventLng);
    }
}

function openModalLogic(eventId, eventTitle, eventAddress, eventLat, eventLng) {
    currentEventDetails = { eventId, eventTitle, eventAddress, eventLat, eventLng };
    
    const modalTitleElement = modalElement.querySelector('#prepare-event-title');
    if (modalTitleElement) modalTitleElement.textContent = `Prepare: ${eventTitle}`;
    
    // Update tabs that depend on currentEventDetails
    updateBriefingTabWithEventDetails();
    updateIntelTabWithEventDetails(); 
    updateMapTabWithEventDetails();

    teamManager.resetTeam();
    
    const tabs = modalElement.querySelectorAll('.prepare-tab-btn');
    const tabContents = modalElement.querySelectorAll('.prepare-tab-content');
    
    tabs.forEach((tab, index) => tab.classList.toggle('active', index === 0));
    tabContents.forEach((content, index) => content.classList.toggle('active', index === 0));
    
    const firstTabContent = tabContents[0];
    if (firstTabContent && firstTabContent.classList.contains('active')) {
        activateTab(1, firstTabContent); // Ensure first tab (Team) content is refreshed
    }
    
    modalElement.classList.add('active');
}

function updateBriefingTabWithEventDetails() {
    if (!currentEventDetails || !modalElement) return;
    const tabContent = modalElement.querySelector('#tab3-content');
    if(!tabContent) return;

    const { eventId, eventTitle, eventAddress, eventLat, eventLng } = currentEventDetails;
    
    const briefingEventTitle = tabContent.querySelector('#briefing-event-title');
    const briefingEventIdSpan = tabContent.querySelector('#briefing-eventId');
    const briefingEventAddressSpan = tabContent.querySelector('#briefing-eventAddress');
    const briefingEventCoordsSpan = tabContent.querySelector('#briefing-eventCoords');

    if (briefingEventTitle) briefingEventTitle.textContent = eventTitle;
    if (briefingEventIdSpan) briefingEventIdSpan.textContent = eventId;
    if (briefingEventAddressSpan) briefingEventAddressSpan.textContent = eventAddress;
    if (briefingEventCoordsSpan) {
        briefingEventCoordsSpan.textContent = (eventLat && eventLng) ? `${eventLat.toFixed(6)}, ${eventLng.toFixed(6)}` : 'N/A';
    }
    
    const briefingTacticalOverview = tabContent.querySelector('#briefing-tactical-overview');
    if (briefingTacticalOverview) briefingTacticalOverview.textContent = `Investigate disturbance at ${eventAddress}. Potential hostile contact. Proceed with caution.`;
    
    const briefingPotentialThreats = tabContent.querySelector('#briefing-potential-threats');
    if (briefingPotentialThreats) briefingPotentialThreats.textContent = `Threat level unknown. Primary concern is securing the area and gathering intel. Secondary: Identify hostile forces.`;

    const briefingTerrainType = tabContent.querySelector('#briefing-terrain-type');
    if(briefingTerrainType) briefingTerrainType.textContent = "Urban/Industrial Mix";
    
    const briefingVisibility = tabContent.querySelector('#briefing-visibility');
    if(briefingVisibility) briefingVisibility.textContent = eventLat > 30 ? "Daylight - Good" : "Night - Poor";
    
    const briefingCover = tabContent.querySelector('#briefing-cover');
    if(briefingCover) briefingCover.textContent = "Moderate to Abundant (rubble, vehicles)";
    
    const briefingAreaNotes = tabContent.querySelector('#briefing-area-notes');
    if(briefingAreaNotes) briefingAreaNotes.textContent = "Be aware of potential sniper positions in taller structures. Ground may be unstable in certain sectors.";

    const areaMapImg = tabContent.querySelector('#briefing-area-map-img');
    if (areaMapImg) areaMapImg.src = "/area_map_placeholder.png"; 
    
    const planDiagramImg = tabContent.querySelector('#briefing-plan-diagram-img');
    if (planDiagramImg) planDiagramImg.src = "/plan_diagram_placeholder.png";
}

function updateIntelTabWithEventDetails() {
    if (!modalElement) return;
    const tabContent = modalElement.querySelector('#tab4-content');
    if (!tabContent) return;

    const snapshotImg = tabContent.querySelector('#subgrid-snapshot-img');
    const snapshotContainerP = tabContent.querySelector('#subgrid-snapshot-container p');
    const importSnapshotBtnIntel = tabContent.querySelector('#import-subgrid-snapshot-btn');
    
    if (snapshotImg) snapshotImg.style.display = 'none';
    if (snapshotContainerP) {
        snapshotContainerP.style.display = 'block';
        snapshotContainerP.textContent = "Click button above to import map snapshot. Requires a subgrid cell to be selected on the main map.";
    }
    if (importSnapshotBtnIntel) {
        importSnapshotBtnIntel.textContent = "Import Subgrid Snapshot";
        importSnapshotBtnIntel.disabled = false;
    }
}

function updateMapTabWithEventDetails() {
    if (!modalElement) return;
    const tabContent = modalElement.querySelector('#tab5-content');
    if (!tabContent) return;

    const mapTabAreaMapImg = tabContent.querySelector('#map-tab-area-map-img');
    if (mapTabAreaMapImg) {
        mapTabAreaMapImg.src = "/area_map_placeholder.png";
    }
}

export function getCurrentEventDetails() {
    return currentEventDetails;
}

export function getModalElement() {
    return modalElement;
}