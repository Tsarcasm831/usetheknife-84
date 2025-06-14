import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { makeBright } from './glb_lighting.js';

/**
 * Spawns a cottage 20 ft away from the player's current position.
 * Uses the GLB asset at '/cottage_textured_mesh.glb' downloaded in download.js.
 * @param {THREE.Scene} scene - The Three.js scene to add the cottage to.
 * @param {THREE.Camera} camera - The player's camera.
 */
export async function spawnCottage(scene, camera) {
  // Wait for assets to be downloaded and cached
  if (window.GLTFAssetsReady) {
    await window.GLTFAssetsReady;
  }

  const loader = new GLTFLoader();
  const cottageUrl = window.GLTFAssetURLs['/cottage_textured_mesh.glb'] || '/cottage_textured_mesh.glb';

  // Calculate spawn position: 20 ft forward from the player's current position.
  const startPosition = camera.position.clone();
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  const spawnPosition = startPosition.add(forward.multiplyScalar(20));

  loader.load(
    cottageUrl,
    (gltf) => {
      const cottage = gltf.scene;
      cottage.position.copy(spawnPosition);
      
      // Optionally adjust rotation and scale as needed.
      cottage.rotation.y = Math.random() * Math.PI * 2;
      
      // Make the cottage 3x larger.
      cottage.scale.set(3, 3, 3);
      
      // Make the cottage bright
      makeBright(cottage, scene);
      
      // Enable shadows for added realism.
      cottage.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      scene.add(cottage);
      
      // Register cottage for collision detection if available.
      if (window.collisionManager) {
        window.collisionManager.register(cottage);
      }
      
      // Track spawned cottages on the minimap.
      window.spawnedCottages = window.spawnedCottages || [];
      window.spawnedCottages.push(cottage);
    },
    undefined,
    (error) => {
      console.error('Error loading cottage GLB:', error);
    }
  );
}