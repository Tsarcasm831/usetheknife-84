import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

/**
 * Flashlight class creates a bright spotlight attached to the player's camera.
 * The light automatically toggles based on whether the flashlight slot (slot 5, index 4)
 * is active in the hotbar.
 */
export class Flashlight {
  /**
   * @param {THREE.Camera} camera - The player's camera.
   */
  constructor(camera) {
    this.camera = camera;
    // Create a spotlight with high intensity and a narrow beam.
    this.light = new THREE.SpotLight(0xffffff, 3, 100, Math.PI / 8, 0.5, 2);
    this.light.castShadow = true;
    // Offset the light so it appears to emanate from the front of the camera.
    this.light.position.set(0, -0.5, 1);
    // Ensure the light target is in front of the camera.
    this.camera.add(this.light);
    // Initially off.
    this.isOn = false;
    this.light.visible = false;
  }

  /**
   * Checks the active hotbar slot and toggles the flashlight accordingly.
   * Assumes that hotbar slot 5 (index 4) holds the flashlight.
   */
  update() {
    if (window.hotbar && typeof window.hotbar.activeSlotIndex === 'number') {
      if (window.hotbar.activeSlotIndex === 4) {
        if (!this.isOn) {
          this.turnOn();
        }
      } else if (this.isOn) {
        this.turnOff();
      }
    }
  }

  turnOn() {
    this.light.visible = true;
    this.isOn = true;
  }

  turnOff() {
    this.light.visible = false;
    this.isOn = false;
  }
}

// Initialize the flashlight once the game and hotbar are ready.
function initFlashlight() {
  if (window.game && window.game.camera && window.hotbar) {
    // Create a global flashlight instance attached to the player's camera.
    window.flashlightInstance = new Flashlight(window.game.camera);
    
    // Start an update loop to check for hotbar changes.
    (function updateLoop() {
      window.flashlightInstance.update();
      requestAnimationFrame(updateLoop);
    })();
  } else {
    // Retry initialization shortly if prerequisites are not available.
    setTimeout(initFlashlight, 100);
  }
}

initFlashlight();