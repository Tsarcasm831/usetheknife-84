import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { makeBright } from './glb_lighting.js';

/**
 * Spawns a H_I_V_E_Drone_texture.glb drone into the scene.
 * Mimics the behavior of chiropteran.js.
 *
 * @param {THREE.Scene} scene - The Three.js scene in which to spawn the drone.
 * @param {THREE.Vector3} [position=new THREE.Vector3(0, 0, 0)] - The world position for the drone.
 * @param {number} [scaleFactor=1] - An optional uniform scaling factor.
 * @returns {Promise<THREE.Object3D>} - A promise that resolves with the spawned drone object.
 */
export function spawnDrone(scene, position = new THREE.Vector3(0, 0, 0), scaleFactor = 1) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const droneUrl = window.GLTFAssetURLs['/H_I_V_E_Drone_texture.glb'] || '/H_I_V_E_Drone_texture.glb';

    loader.load(
      droneUrl,
      (gltf) => {
        const drone = gltf.scene;
        // Raise slightly above ground level.
        position.y = 1;
        drone.position.copy(position);
        // Apply a random rotation for variety.
        drone.rotation.y = Math.random() * Math.PI * 2;
        // Scale drone (using a similar base scale as other assets).
        drone.scale.set(2 * scaleFactor, 2 * scaleFactor, 2 * scaleFactor);
        
        // Enable shadows on every mesh.
        drone.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Adjust material for bright appearance.
        makeBright(drone, scene);

        scene.add(drone);
        resolve(drone);
      },
      undefined,
      (error) => {
        console.error("Error loading drone GLB:", error);
        reject(error);
      }
    );
  });
}