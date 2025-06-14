import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { makeBright } from './glb_lighting.js';  // Adjust the path if necessary

export class CreativeMode {
  constructor() {
    this.isVisible = false;
    this.overlay = this.createOverlay();
    document.body.appendChild(this.overlay);
    this.addEventListeners();
  }

  createOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "creativeModeOverlay";
    Object.assign(overlay.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "rgba(0, 0, 0, 0.8)",
      color: "#fff",
      fontFamily: "sans-serif",
      padding: "20px",
      border: "2px solid #fff",
      borderRadius: "5px",
      zIndex: 1000,
      display: "none",
      maxWidth: "90%",
      maxHeight: "90%",
      overflowY: "auto"
    });
    // Initial placeholder content; it will be updated when the overlay is shown.
    overlay.innerHTML = `
      <h2>GLB Assets</h2>
      <ul id="assetList">
        <li>Loading asset list...</li>
      </ul>
      <p>Press the backtick key (\`) to close.</p>
    `;
    return overlay;
  }

  updateOverlayContent() {
    const assetListContainer = document.getElementById("assetList");
    if (!assetListContainer) return;

    const allAssets = Object.keys(window.GLTFAssetURLs || {});
    if (allAssets.length > 0) {
      assetListContainer.innerHTML = allAssets
        .sort()
        .map(asset => `
          <li style="list-style:none; display:inline-block; margin:6px;">
            <button class="creative-mode-button" data-asset="${asset}" style="padding:8px 12px; background:#4CAF50; border:none; border-radius:4px; color:#fff; cursor:pointer;">
              ${this.formatAssetName(asset)}
            </button>
          </li>
        `)
        .join("");

      // Add click event listeners to each button.
      assetListContainer.querySelectorAll('.creative-mode-button').forEach(button => {
        button.addEventListener('click', () => {
          const assetKey = button.getAttribute('data-asset');
          this.spawnAsset(assetKey);
        });
      });
    } else {
      assetListContainer.innerHTML = `<li>No assets found.</li>`;
    }
  }

  addEventListeners() {
    window.addEventListener("keydown", (event) => {
      // Toggle the overlay when the Backquote key is pressed.
      if (event.code === "Backquote") {
        this.toggleOverlay();
        event.preventDefault();
      }
    });
  }

  toggleOverlay() {
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.updateOverlayContent();
      this.overlay.style.display = "block";
    } else {
      this.overlay.style.display = "none";
    }
  }

  /**
   * Formats an asset key (filename) into a more human-readable name.
   *
   * @param {string} asset - The asset key (e.g. "/kilrathi_textured_mesh.glb").
   * @returns {string} The formatted name.
   */
  formatAssetName(asset) {
    let name = asset.startsWith("/") ? asset.slice(1) : asset;
    name = name.replace(/_textured_mesh\.glb$/i, "");
    name = name.replace(/\.glb$/i, "");
    name = name.replace(/_/g, " ");
    return name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Loads and spawns the GLB asset in front of the player, then applies proper lighting.
   *
   * @param {string} assetKey - The key for the asset in window.GLTFAssetURLs.
   */
  spawnAsset(assetKey) {
    const loader = new GLTFLoader();
    const url = window.GLTFAssetURLs[assetKey] || assetKey;
    loader.load(url, (gltf) => {
      const asset = gltf.scene;
      
      // Spawn the asset 5 units in front of the camera, if available.
      if (window.game && window.game.camera) {
        const spawnPosition = window.game.camera.position.clone();
        const forward = new THREE.Vector3();
        window.game.camera.getWorldDirection(forward);
        spawnPosition.add(forward.multiplyScalar(5));
        asset.position.copy(spawnPosition);
      }
      
      // Add the asset to the scene if available.
      if (window.game && window.game.scene) {
        window.game.scene.add(asset);
        // Apply proper lighting/material adjustments to the asset.
        makeBright(asset, window.game.scene);
      }
      console.log(`Spawned asset from ${assetKey}`);
    }, undefined, (error) => {
      console.error("Error spawning asset:", error);
    });
  }
}

new CreativeMode();
