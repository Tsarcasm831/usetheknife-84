export function initGeoLocation(map) {
  const homeLat = 40.153654, homeLng = -105.109248;
  updateGeolocation(homeLat, homeLng);
  L.marker([homeLat, homeLng])
    .addTo(map)
    .bindPopup(`
      <b>Home</b><br>
      Coordinates: ${homeLat.toFixed(6)}, ${homeLng.toFixed(6)}<br>
      <button id="home-details-btn" class="sidebar-button" onclick="window.openHomeBase()">Home Base Command Center</button>
    `)
    .openPopup();
}

window.openHomeBase = function () {
  fetch('/cache-assets', { method: 'POST' }).catch(console.error);
  if (window.openIframeModal) {
    window.openIframeModal('/home/index.html');
  }
};

export function updateGeolocation(lat, lng) {
  const el = document.getElementById("geolocation-info");
  if (el) el.textContent = `Geolocation: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

