import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

/**
 * Aura creates a semi-transparent colored halo around a target object (typically the player).
 * The aura is invisible by default. It can be shown, hidden, or toggled.
 * Call update() each frame to have the aura follow the target's position.
 */
export class Aura {
  /**
   * @param {THREE.Object3D} target - The object the aura should follow (e.g., the player's camera).
   * @param {THREE.Scene} scene - The Three.js scene to which the aura will be added.
   * @param {Object} options - Optional settings for the aura.
   * @param {number} options.color - The hexadecimal color of the aura. Default is green (0x00ff00).
   * @param {number} options.radius - The radius of the aura sphere. Default is 3.
   * @param {number} options.opacity - The opacity of the aura. Default is 0.5.
   */
  constructor(target, scene, options = {}) {
    this.target = target;
    this.scene = scene;
    this.color = options.color || 0x00ff00;
    this.radius = options.radius || 3;
    this.opacity = options.opacity !== undefined ? options.opacity : 0.5;
    this.createAura();
  }

  createAura() {
    // Use a sphere geometry to represent the aura.
    const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: this.opacity,
      depthWrite: false, // Prevent writing to depth buffer for a glowing effect.
      side: THREE.DoubleSide
    });
    this.auraMesh = new THREE.Mesh(geometry, material);
    // The aura is invisible by default.
    this.auraMesh.visible = false;
    // Position the aura at the target's location.
    this.auraMesh.position.copy(this.target.position);
    this.scene.add(this.auraMesh);
  }

  // Makes the aura visible.
  show() {
    this.auraMesh.visible = true;
  }

  // Hides the aura.
  hide() {
    this.auraMesh.visible = false;
  }

  // Toggles the aura's visibility.
  toggleVisibility() {
    this.auraMesh.visible = !this.auraMesh.visible;
  }

  // Update the aura's position to follow the target. Call this every frame.
  update() {
    this.auraMesh.position.copy(this.target.position);
  }
}

// Example usage:
// If you wish to automatically instantiate and toggle the aura with a key (e.g., "O"),
// you can add the following code once your game instance is created and available globally.
// 
// window.addEventListener('keydown', (event) => {
//   if (event.code === 'KeyO' && window.game && window.auraInstance) {
//     window.auraInstance.toggleVisibility();
//   }
// });
//
// In your main game logic, after creating your Game instance (which has camera and scene),
// you could add:
// window.auraInstance = new Aura(window.game.camera, window.game.scene);