// Manages the Home location modal

export function initHomeModal() {
    // The modal structure is now expected to be in index.html
    const homeModal = document.getElementById('home-modal');
    const closeHomeModalBtn = document.getElementById('close-home-modal');

    if (!homeModal || !closeHomeModalBtn) {
        console.error("Home modal elements not found. Ensure #home-modal and #close-home-modal exist in index.html.");
        return;
    }

    closeHomeModalBtn.addEventListener('click', () => {
        homeModal.classList.remove('active');
    });

    window.addEventListener('click', (event) => {
        if (event.target === homeModal) {
            homeModal.classList.remove('active');
        }
    });

    // Add listeners for home-action-btn if needed
    const actionButtons = homeModal.querySelectorAll('.home-action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            console.log(`Home action clicked: ${e.target.textContent}`);
            // Implement specific actions here or call other functions
        });
    });
}

// This function can be called from elsewhere (e.g., map marker popup) to open the modal
export function openHomeModal() {
    const homeModal = document.getElementById('home-modal');
    if (homeModal) {
        homeModal.classList.add('active');
    } else {
        console.error('Home modal not found. Make sure initHomeModal was called and modal exists in HTML.');
    }
}

// Expose openHomeModal globally if it's called via inline HTML onclick attributes.
// If it's only called from JS modules, this isn't strictly necessary.
window.openHomeModal = openHomeModal;