function openCamera(lat, lng) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target.result;
        img.style.maxWidth = "100%";
        img.style.height = "auto";

        L.popup()
          .setLatLng([lat, lng])
          .setContent(`
            <img src="${event.target.result}" style="max-width: 100%; height: auto;">
            <button class="camera-btn" onclick="openCamera(${lat}, ${lng})">📷 Retake Photo</button>
          `)
          .openOn(window.mapInstance);

        const streetViewPanel = document.getElementById("street-view-panel");
        const existingImage = document.getElementById("captured-image");
        if (existingImage) {
          existingImage.src = event.target.result;
        } else {
          const newImage = document.createElement("img");
          newImage.id = "captured-image";
          newImage.src = event.target.result;
          streetViewPanel.appendChild(newImage);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

export { openCamera };
window.openCamera = openCamera;