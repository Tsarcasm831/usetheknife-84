// Launch Tab functionality
// getCurrentEventDetails can be imported from modalCore
import { getCurrentEventDetails, getModalElement } from '../core/modalCore.js';
import { startEvent } from '../../eventFinder.js';

export async function initLaunchTab(tabElement) {
    if (!tabElement) return;

    // Initialize the launch tab HTML content
    tabElement.innerHTML = `
        <h3>Launch Confirmation</h3>
        <button class="sidebar-button launch-mission-btn" style="background-color: green; border-color: lightgreen;">Launch Mission</button>
    `;

    // Setup launch button listener
    const launchButton = tabElement.querySelector('.launch-mission-btn');
    if (launchButton) {
        launchButton.addEventListener('click', handleLaunchMission);
    }
}

function handleLaunchMission() {
    // Get event details
    const eventDetails = getCurrentEventDetails();
    if (!eventDetails) {
        alert('Error: Missing event details. Cannot launch mission.');
        return;
    }

    // Validation logic would go here
    // For example, check if team is assembled, loadouts are complete, etc.

    // For now, just show a confirmation
    const confirmLaunch = confirm(`Are you sure you want to launch the mission to ${eventDetails.eventTitle}?`);
    
    if (confirmLaunch) {
        startEvent(eventDetails.eventId, eventDetails.eventTitle, eventDetails.eventAddress, eventDetails.eventLat, eventDetails.eventLng);
        const modal = getModalElement();
        if (modal) modal.classList.remove('active');
    }
}