import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { makeBright } from './glb_lighting.js';

/**
 * Spawns a Dengar Shalrah in the provided scene.
 * The Dengar Shalrah is loaded from '/dengar_shalrah_textured_mesh.glb' (using cached URL if available).
 *
 * @param {THREE.Scene} scene - The scene to add the Dengar Shalrah to.
 * @param {THREE.Vector3} [position=new THREE.Vector3(0, 0, 0)] - The position to place the Dengar Shalrah.
 * @param {number} [scaleFactor=1] - Optional scaling factor for the Dengar Shalrah. Default is 1.
 * @returns {Promise<THREE.Object3D>} - A promise that resolves with the loaded Dengar Shalrah object.
 */
export function spawnDengarShalrah(scene, position = new THREE.Vector3(0, 0, 0), scaleFactor = 1) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const shalrahUrl = window.GLTFAssetURLs['/dengar_shalrah_textured_mesh.glb'] || '/dengar_shalrah_textured_mesh.glb';
    
    loader.load(
      shalrahUrl,
      (gltf) => {
        const shalrah = gltf.scene;
        // Set the Dengar Shalrah position with Y offset of 1 unit like the car
        position.y = 1;
        shalrah.position.copy(position);
        // Use fixed scale of 2 like the car
        shalrah.scale.set(2, 2, 2);
        // Apply a random Y-axis rotation for variety
        shalrah.rotation.y = Math.random() * Math.PI * 2;
        
        // Make the model bright
        makeBright(shalrah, scene);
        
        // Enable shadows for each mesh in the model.
        shalrah.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        // Add the Dengar Shalrah to the scene.
        scene.add(shalrah);
        resolve(shalrah);
      },
      undefined,
      (error) => {
        console.error('Error loading Dengar Shalrah GLB:', error);
        reject(error);
      }
    );
  });
}