// waila.js
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

class Waila {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    // The crosshair is assumed to be the center of the screen.
    this.mouse = new THREE.Vector2(0, 0);
    this.ui = document.createElement("div");
    this.ui.id = "wailaUI";
    Object.assign(this.ui.style, {
      position: "fixed",
      bottom: "60px",  // Positioned above the credits message
      right: "20px",
      padding: "8px 12px",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      color: "#fff",
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      border: "none",
      borderRadius: "4px",
      zIndex: "100",
      pointerEvents: "none",
      maxWidth: "300px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    });
    this.ui.textContent = "Looking at: Nothing";
    document.body.appendChild(this.ui);

    // Throttling: update roughly every 200ms.
    this.lastUpdate = performance.now();
    this.update();
  }

  update() {
    requestAnimationFrame(() => this.update());
    const now = performance.now();
    if (now - this.lastUpdate < 200) {
      return;
    }
    this.lastUpdate = now;

    const camera = window.game && window.game.camera;
    const scene = window.game && window.game.scene;
    if (!camera || !scene) return;

    this.raycaster.setFromCamera(this.mouse, camera);
    const intersects = this.raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      let assetKey = "";

      // Check for the asset key in the object’s userData.
      if (intersection.object.userData) {
        assetKey =
          intersection.object.userData.assetKey ||
          intersection.object.userData.filename ||
          intersection.object.userData.waila ||
          "";
      }
      if (!assetKey && intersection.object.parent && intersection.object.parent.userData) {
        assetKey =
          intersection.object.parent.userData.assetKey ||
          intersection.object.parent.userData.filename ||
          intersection.object.parent.userData.waila ||
          "";
      }
      // Fallback: use the object (or parent) name.
      if (!assetKey) {
        assetKey = intersection.object.name ||
                   (intersection.object.parent && intersection.object.parent.name) ||
                   "Unknown";
      }

      // Format the asset name for a cleaner display.
      const formattedName = this.formatAssetName(assetKey);
      this.ui.textContent = "Looking at: " + formattedName;
    } else {
      this.ui.textContent = "Looking at: Nothing";
    }
  }

  /**
   * Formats a GLB asset filename (or key) into a more human-friendly name.
   *
   * Example:
   *   "/axe_iron_textured_mesh.glb"  →  "Axe Iron"
   *
   * @param {string} asset - The asset key or filename.
   * @returns {string} The formatted asset name.
   */
  formatAssetName(asset) {
    let name = asset;
    if (typeof name !== "string") return "Unknown";
    // Remove a leading slash if present.
    if (name.startsWith("/")) {
      name = name.slice(1);
    }
    // Remove specific suffixes.
    name = name.replace(/_textured_mesh\.glb$/i, "");
    name = name.replace(/\.glb$/i, "");
    // Replace underscores with spaces.
    name = name.replace(/_/g, " ");
    // Capitalize the first letter of each word.
    return name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}

new Waila();
export { Waila };
