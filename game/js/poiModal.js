// Handles the Point of Interest (POI) Modal functionality

let placingPOI = false;
let poiLatLng = { lat: null, lng: null };
let poiAddress = "";
let mapInstance; // To store the map reference

const flagIcon = L.icon({
    iconUrl: "/icons/flag-cursor.png", 
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

function enablePOIMode() {
    if (!mapInstance) return;
    placingPOI = true;
    const placePoiBtn = document.getElementById("add-pin-btn");
    if (placePoiBtn) placePoiBtn.textContent = "Cancel POI";
    mapInstance.getContainer().classList.add("place-poi-cursor");
    mapInstance.once("click", onMapClick);
}

function disablePOIMode() {
    placingPOI = false;
    const placePoiBtn = document.getElementById("add-pin-btn");
    if (placePoiBtn) placePoiBtn.textContent = "Place POI";
    if (mapInstance) mapInstance.getContainer().classList.remove("place-poi-cursor");
}

function onMapClick(e) {
    disablePOIMode();
    poiLatLng = e.latlng;
    const poiModal = document.getElementById("poi-modal");
    const poiAddressEl = document.getElementById("poi-address");
    const poiCoordinatesEl = document.getElementById("poi-coordinates");
    const poiTitleInput = document.getElementById("poi-title");
    const poiDescInput = document.getElementById("poi-description");

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => {
            poiAddress = data.display_name || "Address not found";
            if (poiAddressEl) poiAddressEl.textContent = `Address: ${poiAddress}`;
            if (poiCoordinatesEl) poiCoordinatesEl.textContent = `Coordinates: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
            if (poiTitleInput) poiTitleInput.value = "";
            if (poiDescInput) poiDescInput.value = "";
            if (poiModal) poiModal.classList.add("active");
        })
        .catch(err => {
            console.error("Error reverse geocoding for POI:", err);
            poiAddress = "Address lookup failed";
            if (poiAddressEl) poiAddressEl.textContent = `Address: ${poiAddress}`;
            if (poiCoordinatesEl) poiCoordinatesEl.textContent = `Coordinates: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
            if (poiModal) poiModal.classList.add("active");
        });
}

export function initPoiModal(map) {
    mapInstance = map; 

    const placePoiBtn = document.getElementById("add-pin-btn");
    const poiModal = document.getElementById("poi-modal");
    const cancelPoiBtn = document.getElementById("cancel-poi-btn");
    const savePoiBtn = document.getElementById("save-poi-btn");
    const poiTitleInput = document.getElementById("poi-title");
    const poiDescInput = document.getElementById("poi-description");

    if (placePoiBtn) {
        placePoiBtn.addEventListener("click", () => placingPOI ? disablePOIMode() : enablePOIMode());
    }

    if (cancelPoiBtn && poiModal) {
        cancelPoiBtn.addEventListener("click", () => {
            poiModal.classList.remove("active");
            disablePOIMode();
        });
    }
    
    if (savePoiBtn && poiModal && poiTitleInput && poiDescInput && mapInstance) {
        savePoiBtn.addEventListener("click", () => {
            const title = poiTitleInput.value.trim() || "POI";
            const desc = poiDescInput.value.trim();
            const marker = L.marker([poiLatLng.lat, poiLatLng.lng], { icon: flagIcon }).addTo(mapInstance);
            const popupContent = `<b>${title}</b><br>${desc ? desc + "<br>" : ""}<small>${poiAddress}<br>(${poiLatLng.lat.toFixed(6)}, ${poiLatLng.lng.toFixed(6)})</small>`;
            marker.bindPopup(popupContent);
            poiModal.classList.remove("active");
        });
    }

    // Close modal if user clicks outside of the modal content
    if (poiModal) {
        window.addEventListener('click', (event) => {
            if (event.target === poiModal) {
                poiModal.classList.remove("active");
                if (placingPOI) { 
                    disablePOIMode();
                }
            }
        });
        const closePoiModalButton = document.getElementById('close-poi-modal');
        if(closePoiModalButton) {
            closePoiModalButton.addEventListener('click', () => {
                poiModal.classList.remove('active');
                if (placingPOI) {
                    disablePOIMode();
                }
            });
        }
    }
}