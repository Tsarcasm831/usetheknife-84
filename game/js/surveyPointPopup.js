// Handles the "Add Survey Point" Popup Module

function hidePopup() {
    const popup = document.getElementById("popup-module");
    if (popup) {
        popup.classList.remove("active");
    }
}

export function showPopup(lat, lng, address) {
    const popupModule = document.getElementById("popup-module");
    const geocodedAddressEl = document.getElementById("geocoded-address");
    const coordinatesEl = document.getElementById("coordinates");
    const pointTypeSelectInPopup = popupModule ? popupModule.querySelector("#point-type-select-popup") : null;
    const pointTypeSelectInSidebar = document.querySelector("#right-sidebar #point-type-select");

    if (popupModule && geocodedAddressEl && coordinatesEl) {
        geocodedAddressEl.textContent = `Address: ${address}`;
        coordinatesEl.textContent = `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        if (pointTypeSelectInPopup && pointTypeSelectInSidebar) {
            pointTypeSelectInPopup.value = pointTypeSelectInSidebar.value;
        }

        popupModule.classList.add("active");
    } else {
        console.error("Survey Point Popup module or its child elements not found.");
    }
}

export function initSurveyPointPopup() {
    const postPointBtn = document.getElementById("post-point-btn");
    if (postPointBtn) {
        postPointBtn.addEventListener("click", () => {
            hidePopup();
            const rightSidebar = document.getElementById("right-sidebar");
            if (rightSidebar) {
                rightSidebar.classList.add("open");
            }
        });
    }
    // Expose showPopup to window for legacy compatibility (e.g. inline onclick in markerWithAddress.js)
    window.showPopup = showPopup;
}