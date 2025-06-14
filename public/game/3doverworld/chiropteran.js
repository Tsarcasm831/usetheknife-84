import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { makeBright } from './glb_lighting.js';

/**
 * Spawns a Chiropteran in the provided scene.
 * The chiropteran is loaded from '/chiropteran_textured_mesh.glb' (using cached URL if available).
 *
 * @param {THREE.Scene} scene - The scene to add the chiropteran to.
 * @param {THREE.Vector3} [position=new THREE.Vector3(0, 0, 0)] - The position to place the chiropteran.
 * @param {number} [scaleFactor=1] - Optional scaling factor for the chiropteran. Default is 1.
 * @returns {Promise<THREE.Object3D>} - A promise that resolves with the loaded chiropteran object.
 */
export function spawnChiropteran(scene, position = new THREE.Vector3(0, 0, 0), scaleFactor = 1) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const chiropteranUrl = window.GLTFAssetURLs['/chiropteran_textured_mesh.glb'] || '/chiropteran_textured_mesh.glb';
    
    loader.load(
      chiropteranUrl,
      (gltf) => {
        const chiropteran = gltf.scene;
        // Set the chiropteran position with a Y offset of 1 unit like the car
        position.y = 1;  // Raise it by 1 unit like the car
        chiropteran.position.copy(position);
        // Use a fixed scale of 2 like the car
        chiropteran.scale.set(2, 2, 2);
        // Apply a random Y-axis rotation for variety
        chiropteran.rotation.y = Math.random() * Math.PI * 2;
        
        // Make the chiropteran bright
        makeBright(chiropteran, scene);
        
        // Enable shadows for each mesh in the model.
        chiropteran.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        // Add the chiropteran to the scene.
        scene.add(chiropteran);
        resolve(chiropteran);
      },
      undefined,
      (error) => {
        console.error('Error loading Chiropteran GLB:', error);
        reject(error);
      }
    );
  });
}