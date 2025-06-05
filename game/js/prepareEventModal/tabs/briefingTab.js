// Briefing Tab functionality
import { getCurrentEventDetails } from '../core/modalCore.js';

export async function initBriefingTab(tabElement) {
    if (!tabElement) return;

    // Initialize the briefing tab HTML content
    tabElement.innerHTML = `
        <div class="briefing-grid">
            <div class="briefing-main-details">
                <h3>Mission Briefing: <span id="briefing-event-title">N/A</span></h3>
                <p><strong>Event ID:</strong> <span id="briefing-eventId">N/A</span></p>
                <p><strong>Location:</strong> <span id="briefing-eventAddress">N/A</span></p>
                <p><strong>Coordinates:</strong> <span id="briefing-eventCoords">N/A</span></p>
            </div>
    
            <div class="briefing-section briefing-overview">
                <h4>Tactical Overview</h4>
                <p id="briefing-tactical-overview">Initial reports suggest a standard patrol route has gone dark. Investigate the last known position and ascertain the situation. Hostile contact is considered probable.</p>
            </div>
    
            <div class="briefing-section briefing-objectives">
                <h4>Key Objectives</h4>
                <ul id="briefing-key-objectives">
                    <li>Reach the target coordinates.</li>
                    <li>Assess the situation and report findings.</li>
                    <li>Neutralize any immediate threats to civilian or FDG assets.</li>
                    <li>Secure any valuable intel or technology.</li>
                    <li>Ensure safe extraction of the team.</li>
                </ul>
            </div>
    
            <div class="briefing-section briefing-threats">
                <h4>Potential Threats</h4>
                <p id="briefing-potential-threats">Unknown. Could range from scavenger groups to organized mutant patrols or alien incursions. Be prepared for varied enemy types and tactics. Possible presence of fortified positions or ambushes.</p>
            </div>
            
            <div class="briefing-section briefing-area-details">
                <h4>Area Details</h4>
                <p><strong>Terrain Type:</strong> <span id="briefing-terrain-type">Urban Ruins / Highway Overpass</span></p>
                <p><strong>Visibility:</strong> <span id="briefing-visibility">Daytime - Good, pockets of shadow. Night - Poor without aids.</span></p>
                <p><strong>Cover Availability:</strong> <span id="briefing-cover">Abundant (derelict vehicles, rubble, damaged structures).</span></p>
                <p><strong>Notes:</strong> <span id="briefing-area-notes">Structural integrity of buildings is questionable. Watch for unstable ground and potential sniper positions.</span></p>
            </div>
    
            <div class="briefing-section briefing-map-image">
                <h4>Area Map</h4>
                <img id="briefing-area-map-img" src="/area_map_placeholder.png" alt="Area Map Placeholder">
            </div>
    
            <div class="briefing-section briefing-plan-image">
                <h4>Operational Plan</h4>
                <img id="briefing-plan-diagram-img" src="/plan_diagram_placeholder.png" alt="Plan Diagram Placeholder">
            </div>
        </div>
    `;

    // Update briefing with current event details if available
    const eventDetails = getCurrentEventDetails();
    if (eventDetails) {
        updateBriefingWithEventDetails(tabElement, eventDetails);
    }
}

// Helper function to update briefing tab content with event details
function updateBriefingWithEventDetails(tabElement, eventDetails) {
    const { eventId, eventTitle, eventAddress, eventLat, eventLng } = eventDetails;
    
    const briefingEventTitle = tabElement.querySelector('#briefing-event-title');
    const briefingEventIdSpan = tabElement.querySelector('#briefing-eventId');
    const briefingEventAddressSpan = tabElement.querySelector('#briefing-eventAddress');
    const briefingEventCoordsSpan = tabElement.querySelector('#briefing-eventCoords');

    if (briefingEventTitle) briefingEventTitle.textContent = eventTitle;
    if (briefingEventIdSpan) briefingEventIdSpan.textContent = eventId;
    if (briefingEventAddressSpan) briefingEventAddressSpan.textContent = eventAddress;
    if (briefingEventCoordsSpan) {
        briefingEventCoordsSpan.textContent = (eventLat && eventLng) ? 
            `${eventLat.toFixed(6)}, ${eventLng.toFixed(6)}` : 'N/A';
    }

    const briefingTacticalOverview = tabElement.querySelector('#briefing-tactical-overview');
    if (briefingTacticalOverview) {
        briefingTacticalOverview.textContent = 
            `Investigate disturbance at ${eventAddress}. Potential hostile contact. Proceed with caution.`;
    }
}