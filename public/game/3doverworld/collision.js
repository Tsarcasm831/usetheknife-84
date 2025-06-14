import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

/**
 * CollisionManager handles collision detection between the player and collidable objects.
 * It uses simple bounding boxes for objects and a bounding sphere for the player.
 * 
 * Updated: Collision boxes are reduced to 60% of their original size (40% smaller).
 */
export class CollisionManager {
  /**
   * @param {THREE.Camera} player - The player's camera which represents the player.
   * @param {THREE.Scene} scene - The Three.js scene containing collidable objects.
   * @param {number} [radius=1] - The collision radius for the player.
   */
  constructor(player, scene, radius = 1) {
    this.player = player;
    this.scene = scene;
    this.radius = radius;
    this.collidables = [];
    // Store the player's last safe position.
    this.previousPosition = new THREE.Vector3().copy(player.position);
    // Scale factor for collision boxes: 0.6 means the box will be 60% of its original size
    this.collisionScale = 0.6;
  }

  /**
   * Registers an object as collidable.
   * @param {THREE.Object3D} object - The loaded GLB object to register for collision.
   */
  register(object) {
    // We add the object to the collidables list.
    this.collidables.push({ object });
  }

  /**
   * Updates collision detection. Should be called each frame.
   * If a collision is detected within the shrunken bounding box, the player's position is reverted.
   */
  update() {
    const playerSphere = new THREE.Sphere(this.player.position, this.radius);
    
    for (const item of this.collidables) {
      // Calculate the original bounding box of the object.
      const originalBox = new THREE.Box3().setFromObject(item.object);
      const center = new THREE.Vector3();
      originalBox.getCenter(center);
      const size = new THREE.Vector3();
      originalBox.getSize(size);

      // Reduce the size by the collision scale factor (40% smaller means 60% of original).
      size.multiplyScalar(this.collisionScale);

      // Construct a new bounding box with reduced dimensions centered on the original center.
      const shrunkBox = new THREE.Box3(
        center.clone().sub(size.clone().multiplyScalar(0.5)),
        center.clone().add(size.clone().multiplyScalar(0.5))
      );

      // Check for collision between the player's sphere and the shrunk collision box.
      if (shrunkBox.intersectsSphere(playerSphere)) {
        // Collision detected: revert to previous safe position.
        this.player.position.copy(this.previousPosition);
        break;
      }
    }
    
    // Update the previous safe position.
    this.previousPosition.copy(this.player.position);
  }
}