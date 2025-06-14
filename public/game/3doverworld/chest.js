import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { ContainerInventory } from './container_inventory.js';

/**
 * The Chest class spawns a chest in the 3D scene.
 * When the player is within interaction range, a floating button appears.
 * Clicking the button will open the chest's container inventory.
 */
export class Chest {
  /**
   * @param {THREE.Scene} scene - The Three.js scene to add the chest to.
   * @param {THREE.Camera} player - The player's camera used for interaction and proximity checking.
   * @param {THREE.Vector3} [position=new THREE.Vector3(0, 0, 0)] - The desired position for the chest.
   */
  constructor(scene, player, position = new THREE.Vector3(0, 0, 0)) {
    this.scene = scene;
    this.player = player;
    this.position = position;
    this.isOpen = false;
    // Initialize the container inventory with some default items
    this.containerInventory = new ContainerInventory("Chest Inventory", [
      { name: "Gold Coins" },
      { name: "Health Potion" },
      { name: "Magic Scroll" }
    ]);
    this.loadChest();
    this.createFloatingButton();
  }

  async loadChest() {
    // Wait for assets to be downloaded and cached
    if (window.GLTFAssetsReady) {
      await window.GLTFAssetsReady;
    }

    const loader = new GLTFLoader();
    // Use the object URL if available; otherwise fallback to the local path.
    const chestUrl = window.GLTFAssetURLs['/chest_textured_mesh.glb'] || '/chest_textured_mesh.glb';
    loader.load(
      chestUrl,
      (gltf) => {
        this.chestModel = gltf.scene;
        this.chestModel.position.copy(this.position);
        // Lower the chest by 1.5ft as per user instruction.
        this.chestModel.position.y -= 1.5;
        this.chestModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        this.scene.add(this.chestModel);
        // Register the chest with the game's collision manager instead
        if (window.game && window.game.collisionManager) {
          window.game.collisionManager.register(this.chestModel);
        }
      },
      undefined,
      (error) => {
        console.error('Error loading chest GLB:', error);
      }
    );
  }

  createFloatingButton() {
    this.floatingButton = document.createElement('button');
    this.floatingButton.textContent = 'Click to open (E)';
    Object.assign(this.floatingButton.style, {
      position: 'fixed',
      padding: '8px 12px',
      fontFamily: 'sans-serif',
      fontSize: '14px',
      cursor: 'pointer',
      border: 'none',
      borderRadius: '4px',
      background: '#28a745',
      color: '#fff',
      zIndex: '1003',
      display: 'none',
      transform: 'translate(-50%, -150%)', // position above the chest marker
      whiteSpace: 'nowrap'
    });
    // Add event listener with stopPropagation and preventDefault to ensure the click registers
    this.floatingButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.openPopup();
    });
    document.body.appendChild(this.floatingButton);

    // Add E key listener for opening the chest
    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyE' && !event.repeat) {
        // Only open if the button is visible (player is in range) and chest isn't already open
        if (this.floatingButton.style.display === 'block' && !this.isOpen) {
          this.openPopup();
        }
      }
    });
  }

  openPopup() {
    if (!this.isOpen) {
      // Release pointer lock to allow mouse interaction with inventory
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      // Disable controls temporarily
      if (window.game && window.game.controls) {
        window.game.controls.enabled = false;
      }
      this.containerInventory.open();
      this.isOpen = true;
      // Hide the floating button when the inventory is open.
      this.floatingButton.style.display = 'none';
    }
  }

  closePopup() {
    if (this.isOpen && this.containerInventory) {
      this.containerInventory.close();
      this.isOpen = false;
      // Re-enable controls and request pointer lock
      if (window.game && window.game.controls) {
        window.game.controls.enabled = true;
        // Request pointer lock again
        document.body.requestPointerLock();
      }
    }
  }

  /**
   * Call this method every frame from the game loop.
   * It checks the player's proximity to the chest and updates the floating button.
   */
  update() {
    if (!this.chestModel) return;
    
    // If the container inventory exists but is no longer visible, update the chest state.
    if (this.containerInventory && !this.containerInventory.isVisible) {
      this.isOpen = false;
    }
    
    // Get chest world position.
    const chestPos = new THREE.Vector3();
    this.chestModel.getWorldPosition(chestPos);
    // Calculate distance between chest and player.
    const distance = chestPos.distanceTo(this.player.position);
    // Define interaction threshold.
    const interactionDistance = 3;

    if (distance <= interactionDistance && !this.isOpen) {
      // Project the chest position to screen coordinates.
      const pos = chestPos.clone();
      pos.project(this.player);
      const x = (pos.x + 1) / 2 * window.innerWidth;
      const y = (-pos.y + 1) / 2 * window.innerHeight;
      // Position the floating button.
      this.floatingButton.style.left = `${x}px`;
      this.floatingButton.style.top = `${y}px`;
      this.floatingButton.style.display = 'block';
    } else {
      this.floatingButton.style.display = 'none';
    }
  }
}

new Chest(window.game ? window.game.scene : new THREE.Scene(), window.game ? window.game.camera : null, new THREE.Vector3(0, 0, 0));