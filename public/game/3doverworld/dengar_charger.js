import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { makeBright } from './glb_lighting.js';

/**
 * Spawns a Dengar Charger in the provided scene.
 * The dengar charger is loaded from '/dengar_charger_textured_mesh.glb' (using the cached URL if available).
 *
 * @param {THREE.Scene} scene - The scene to add the dengar charger to.
 * @param {THREE.Vector3} [position=new THREE.Vector3(0, 0, 0)] - The position to place the dengar charger.
 * @param {number} [scaleFactor=1] - Optional scaling factor for the dengar charger. Default is 1.
 * @returns {Promise<THREE.Object3D>} - A promise that resolves with the loaded dengar charger object.
 */
export function spawnDengarCharger(scene, position = new THREE.Vector3(0, 0, 0), scaleFactor = 1) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const dengarChargerUrl = window.GLTFAssetURLs['/dengar_charger_textured_mesh.glb'] || '/dengar_charger_textured_mesh.glb';
    loader.load(
      dengarChargerUrl,
      (gltf) => {
        const dengarCharger = gltf.scene;
        // Set the Dengar Charger position with Y offset of 1 unit like the car
        position.y = 1;
        dengarCharger.position.copy(position);
        // Use fixed scale of 2 like the car
        dengarCharger.scale.set(2, 2, 2);
        // Apply a random Y-axis rotation for variety
        dengarCharger.rotation.y = Math.random() * Math.PI * 2;
        
        // Make the model bright
        makeBright(dengarCharger, scene);
        
        // Enable shadows for visual quality.
        dengarCharger.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        // Add the dengar charger to the scene.
        scene.add(dengarCharger);
        resolve(dengarCharger);
      },
      undefined,
      (error) => {
        console.error('Error loading dengar charger GLB:', error);
        reject(error);
      }
    );
  });
}