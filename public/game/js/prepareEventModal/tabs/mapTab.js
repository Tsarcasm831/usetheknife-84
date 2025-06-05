// Map Tab functionality
import { getCurrentEventDetails } from '../core/modalCore.js';

export async function initMapTab(tabElement) {
    if (!tabElement) return;

    // Initialize the map tab HTML content
    tabElement.innerHTML = `
        <h3>Tactical Map</h3>
        <div class="map-tab-container" style="display: flex; flex-direction: column; align-items: center; gap: 15px; padding-top: 10px;">
            <p style="text-align: center; width: 80%; max-width: 700px;">Detailed view of the operational area. Use this map for tactical planning and situational awareness during the event.</p>
            <div class="map-image-container" style="width: 80%; max-width: 700px; border: 1px solid #555; padding: 5px; background-color: #222; border-radius: 5px;">
                <img id="map-tab-area-map-img" src="/area_map_placeholder.png" alt="Area Map" style="width: 100%; height: auto; border-radius: 4px;">
            </div>
            <div class="map-details" style="width: 80%; max-width: 700px; background-color: #252525; padding:10px; border-radius:5px; border: 1px solid #4a4a4a;">
                <h4 style="color: #f0ad4e; margin-top:0; margin-bottom:10px; border-bottom: 1px solid #555; padding-bottom:5px;">Map Legend & Controls (Future Enhancements)</h4>
                <ul style="list-style: none; padding-left: 0; margin:0; font-size: 0.9em; color: #ddd;">
                    <li style="margin-bottom: 5px;">- Friendly Units: <span style="color: #3B82F6;">Blue Icons</span></li>
                    <li style="margin-bottom: 5px;">- Hostile Contacts (Known): <span style="color: #EF4444;">Red Icons</span></li>
                    <li style="margin-bottom: 5px;">- Objectives: <span style="color: #F59E0B;">Yellow Stars</span></li>
                    <li style="margin-bottom: 5px;">- Extraction Zone: <span style="color: #10B981;">Green Circle</span></li>
                </ul>
                <p style="font-size: 0.85em; color: #aaa; margin-top: 10px;"><em>Future updates will include interactive features: zoom, pan, drawing tools, and layer toggles (satellite, topographic, threat overlays).</em></p>
            </div>
        </div>
    `;

    // Update map with current event details if available
    const eventDetails = getCurrentEventDetails();
    if (eventDetails) {
        updateMapWithEventDetails(tabElement, eventDetails);
    }
}

// Helper function to update map tab with event details
function updateMapWithEventDetails(tabElement, eventDetails) {
    // In the future, this could load a specific map based on event coordinates
    const mapTabAreaMapImg = tabElement.querySelector('#map-tab-area-map-img');
    if (mapTabAreaMapImg) {
        mapTabAreaMapImg.src = "/area_map_placeholder.png";
        // Could be updated to `/maps/${eventDetails.eventId}.png` if specific maps exist
    }
}