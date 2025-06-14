import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { makeBright } from './glb_lighting.js';

/**
 * Spawns a Dengar Charger Royal in the provided scene.
 * The dengar charger royal is loaded from '/dengar_charger_royal_textured_mesh.glb'
 * (using the cached URL if available via download.js).
 *
 * @param {THREE.Scene} scene - The scene to add the dengar charger royal to.
 * @param {THREE.Vector3} [position=new THREE.Vector3(0, 0, 0)] - The position to place the dengar charger royal.
 * @param {number} [scaleFactor=1] - Optional uniform scaling factor for the model.
 * @returns {Promise<THREE.Object3D>} - A promise that resolves with the loaded dengar charger royal object.
 */
export function spawnDengarChargerRoyal(scene, position = new THREE.Vector3(0, 0, 0), scaleFactor = 1) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const chargerUrl = window.GLTFAssetURLs['/dengar_charger_royal_textured_mesh.glb'] || '/dengar_charger_royal_textured_mesh.glb';
    
    loader.load(
      chargerUrl,
      (gltf) => {
        const chargerRoyal = gltf.scene;
        // Set position with Y offset of 1 unit like the car
        position.y = 1;
        chargerRoyal.position.copy(position);
        // Use fixed scale of 2 like the car
        chargerRoyal.scale.set(2, 2, 2);
        // Apply a random rotation around the Y-axis for variety
        chargerRoyal.rotation.y = Math.random() * Math.PI * 2;
        
        // Make the model bright
        makeBright(chargerRoyal, scene);
        
        // Enable shadows for all meshes contained in the model.
        chargerRoyal.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        // Add to scene.
        scene.add(chargerRoyal);
        resolve(chargerRoyal);
      },
      undefined,
      (error) => {
        console.error('Error loading dengar charger royal GLB:', error);
        reject(error);
      }
    );
  });
}