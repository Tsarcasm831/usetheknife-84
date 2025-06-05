function initStreetView(lat, lng) {
  const streetViewService = new google.maps.StreetViewService();
  const panoramaOptions = {
    position: { lat, lng },
    pov: { heading: 0, pitch: 0 },
    showRoadLabels: false,
    addressControl: false,
    linksControl: false,
    panControl: false,
    enableCloseButton: false,
    zoomControl: false,
    fullscreenControl: false
  };

  const panorama = new google.maps.StreetViewPanorama(
    document.getElementById("street-view"),
    panoramaOptions
  );

  streetViewService.getPanorama({ location: { lat, lng }, radius: 50 }, (data, status) => {
    if (status === "OK") {
      panorama.setPosition(data.location.latLng);
    } else {
      console.error("Street View data not found for this location.");
      alert("Street View is not available for this location.");
    }
  });

  return panorama;
}

export function showStreetViewPanel(lat, lng) {
  initStreetView(lat, lng);
  const panel = document.getElementById("street-view-panel");
  if (panel) {
    panel.classList.add("open");
  }
}

export function initStreetViewPanelEvents() {
  const closeBtn = document.getElementById("close-street-view");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("street-view-panel").classList.remove("open");
    });
  }
  const repositionTop = document.getElementById("reposition-top");
  if (repositionTop) {
    repositionTop.addEventListener("click", () => {
      const panel = document.getElementById("street-view-panel");
      panel.className = "top";
    });
  }
  const repositionRight = document.getElementById("reposition-right");
  if (repositionRight) {
    repositionRight.addEventListener("click", () => {
      const panel = document.getElementById("street-view-panel");
      panel.className = "right";
    });
  }
  const repositionBottom = document.getElementById("reposition-bottom");
  if (repositionBottom) {
    repositionBottom.addEventListener("click", () => {
      const panel = document.getElementById("street-view-panel");
      panel.className = "open";
    });
  }
  const repositionLeft = document.getElementById("reposition-left");
  if (repositionLeft) {
    repositionLeft.addEventListener("click", () => {
      const panel = document.getElementById("street-view-panel");
      panel.className = "left";
    });
  }
}

// Add a global reference to ensure the function is available for HTML onclick handlers
window.showStreetViewPanel = showStreetViewPanel;