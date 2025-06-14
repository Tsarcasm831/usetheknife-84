import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { ContainerInventory } from './container_inventory.js';

/**
 * The BrokenCarInventory class attaches an interactive salvage inventory to a broken car.
 * When the player comes within range, a floating button appears on-screen.
 * Pressing the button or the "E" key opens a unique inventory overlay containing salvage items.
 */
export class BrokenCarInventory {
  /**
   * @param {THREE.Scene} scene - The Three.js scene.
   * @param {THREE.Camera} player - The player's camera for interaction and proximity.
   * @param {THREE.Object3D} carObject - The broken car's 3D object.
   */
  constructor(scene, player, carObject) {
    this.scene = scene;
    this.player = player;
    this.carObject = carObject;
    this.isOpen = false;
    // Initialize a unique salvage inventory for the broken car
    this.containerInventory = new ContainerInventory("Broken Car Inventory", [
      { name: "Scrap Metal" },
      { name: "Rusty Bolt" },
      { name: "Broken Glass" }
    ]);
    this.createFloatingButton();
  }

  createFloatingButton() {
    this.floatingButton = document.createElement('button');
    this.floatingButton.textContent = 'Salvage Car (E)';
    Object.assign(this.floatingButton.style, {
      position: 'fixed',
      padding: '8px 12px',
      fontFamily: 'sans-serif',
      fontSize: '14px',
      cursor: 'pointer',
      border: 'none',
      borderRadius: '4px',
      background: '#d9534f', // a distinct red tone for the car salvage option
      color: '#fff',
      zIndex: '1003',
      display: 'none',
      transform: 'translate(-50%, -150%)', // position above the car marker
      whiteSpace: 'nowrap'
    });
    this.floatingButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.openPopup();
    });
    document.body.appendChild(this.floatingButton);

    // Enable interaction via the "E" key as well.
    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyE' && !event.repeat) {
        if (this.floatingButton.style.display === 'block' && !this.isOpen) {
          this.openPopup();
        }
      }
    });
  }

  openPopup() {
    if (!this.isOpen) {
      // If pointer is locked, exit pointer lock to allow UI interaction.
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      // Temporarily disable game controls if applicable.
      if (window.game && window.game.controls) {
        window.game.controls.enabled = false;
      }
      this.containerInventory.open();
      this.isOpen = true;
      // Hide the floating button while inventory is active.
      this.floatingButton.style.display = 'none';
    }
  }

  closePopup() {
    if (this.isOpen && this.containerInventory) {
      this.containerInventory.close();
      this.isOpen = false;
      // Re-enable game controls and re-request pointer lock.
      if (window.game && window.game.controls) {
        window.game.controls.enabled = true;
        document.body.requestPointerLock();
      }
    }
  }

  /**
   * Update should be called each frame from the main game loop.
   * It checks the player's proximity to the broken car and positions the floating button.
   */
  update() {
    if (!this.carObject) return;
    // Reset open state if inventory overlay is no longer visible.
    if (this.containerInventory && !this.containerInventory.isVisible) {
      this.isOpen = false;
    }
    
    // Get the broken car's world position.
    const carPos = new THREE.Vector3();
    this.carObject.getWorldPosition(carPos);
    // Calculate distance between the car and the player's position.
    const distance = carPos.distanceTo(this.player.position);
    const interactionDistance = 3;
    
    if (distance <= interactionDistance && !this.isOpen) {
      // Project the car's position to screen coordinates.
      const pos = carPos.clone();
      pos.project(this.player);
      const x = ((pos.x + 1) / 2) * window.innerWidth;
      const y = ((-pos.y + 1) / 2) * window.innerHeight;
      // Position the floating button
      this.floatingButton.style.left = `${x}px`;
      this.floatingButton.style.top = `${y}px`;
      this.floatingButton.style.display = 'block';
    } else {
      this.floatingButton.style.display = 'none';
    }
  }
}