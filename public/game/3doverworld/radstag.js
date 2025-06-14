import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { makeBright } from './glb_lighting.js';

/**
 * Spawns a radstag in the provided scene.
 * The radstag is loaded from '/rad_stag_textured_mesh.glb' (using cached URL if available).
 *
 * @param {THREE.Scene} scene - The scene to add the radstag to.
 * @param {THREE.Vector3} [position=new THREE.Vector3(0, 0, 0)] - The position to place the radstag.
 * @param {number} scaleFactor - Optional scaling factor for the radstag. Default is 1.
 * @returns {Promise<THREE.Object3D>} - A promise that resolves with the loaded radstag object.
 */
export function spawnRadstag(scene, position = new THREE.Vector3(0, 0, 0), scaleFactor = 1) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const radstagUrl = window.GLTFAssetURLs['/rad_stag_textured_mesh.glb'] || '/rad_stag_textured_mesh.glb';
    
    loader.load(
      radstagUrl,
      (gltf) => {
        const radstag = gltf.scene;
        position.y = 1;  // Raise it by 1 unit
        radstag.position.copy(position);
        radstag.scale.set(scaleFactor, scaleFactor, scaleFactor);
        radstag.rotation.y = Math.random() * Math.PI * 2;
        
        // Make the radstag bright
        makeBright(radstag, scene);
        
        // Enable shadows for added visual quality.
        radstag.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        // Add the radstag to the scene.
        scene.add(radstag);
        resolve(radstag);
      },
      undefined,
      (error) => {
        console.error('Error loading rad stag GLB:', error);
        reject(error);
      }
    );
  });
}