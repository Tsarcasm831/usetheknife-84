import * as THREE from "https://cdn.skypack.dev/three@0.132.2";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js";
import { makeBright } from './glb_lighting.js';

/**
 * Spawns several rotten logs in the provided scene.
 * The logs are generated using the downloaded GLB asset at '/rotten_log_textured_mesh.glb'
 * and are distributed randomly in a circular area.
 * 
 * @param {THREE.Scene} scene - The Three.js scene to add the logs to.
 * @param {number} count - Number of rotten logs to spawn.
 * @param {number} spread - The radius of the circular area in which logs will be scattered.
 * @param {THREE.Vector3} [centerPosition=new THREE.Vector3(0, 0, 0)] - Center position for distribution.
 * @returns {Promise<Array>} Promise resolving to an array of spawned log meshes.
 */
export function spawnRottenLogs(scene, count = 20, spread = 50, centerPosition = new THREE.Vector3(0, 0, 0)) {
  const promises = [];
  
  for (let i = 0; i < count; i++) {
    const promise = new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      const logUrl =
        window.GLTFAssetURLs["/rotten_log_textured_mesh.glb"] ||
        "/rotten_log_textured_mesh.glb";

      loader.load(
        logUrl,
        (gltf) => {
          const log = gltf.scene;

          // Generate random polar coordinates for position within a circle.
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * spread;
          const position = new THREE.Vector3(
            centerPosition.x + Math.cos(angle) * radius,
            0.5, // Raise slightly off the ground
            centerPosition.z + Math.sin(angle) * radius
          );

          log.position.copy(position);
          log.scale.set(2, 2, 2);
          log.rotation.y = Math.random() * Math.PI * 2;

          // Remove any extra tilting: log should lie horizontally without extra tilt.
          // Previously, rotation.x was set to Math.PI / 2 and a random tilt added around Z.
          // Now, we assume the GLB model has the correct orientation and simply set no additional rotation.
          log.rotation.x = 0;
          log.rotation.z = 0;

          // Make the log bright
          makeBright(log, scene);

          scene.add(log);
          resolve(log);
        },
        undefined,
        (error) => {
          console.error('Error loading Rotten Log:', error);
          reject(error);
        }
      );
    });
    
    promises.push(promise);
  }
  
  return Promise.all(promises);
}