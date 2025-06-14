import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';

/**
 * Spawns a building in the provided scene.
 * @param {THREE.Scene} scene - The Three.js scene to add the building to.
 * @param {THREE.Vector3} [position=new THREE.Vector3(0, 0, 0)] - The position to place the building.
 */
export function spawnBuilding(scene, position = new THREE.Vector3(0, 0, 0)) {
  const loader = new GLTFLoader();
  // Use the object URL if available; otherwise fallback to the local path.
  const buildingUrl = window.GLTFAssetURLs['/building_textured_mesh.glb'] || '/building_textured_mesh.glb';

  loader.load(
    buildingUrl,
    (gltf) => {
      const building = gltf.scene;
      building.position.copy(position);
      // Scale the building appropriately. Adjust the scale as needed.
      building.scale.set(4, 4, 4);
      // Apply a random rotation for variety.
      building.rotation.y = Math.random() * Math.PI * 2;

      // Enable shadows for each mesh in the building.
      building.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(building);
      // If a collision manager exists globally, register the building.
      if (window.collisionManager) {
        window.collisionManager.register(building);
      }
    },
    undefined,
    (error) => {
      console.error('Error loading the building GLB:', error);
    }
  );
}