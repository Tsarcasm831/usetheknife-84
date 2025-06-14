import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { makeBright } from './glb_lighting.js';

/**
 * Spawns a Kilrathi in the given scene.
 * Uses the GLB asset '/kilrathi_textured_mesh.glb' downloaded via download.js.
 *
 * @param {THREE.Scene} scene - The Three.js scene where the Kilrathi will be added.
 * @param {THREE.Vector3} [position=new THREE.Vector3(0, 0, 0)] - Position to spawn the Kilrathi.
 * @param {number} [scaleFactor=1] - Uniform scale factor for the Kilrathi model. (Increased to improve visibility)
 */
export function spawnKilrathi(scene, position = new THREE.Vector3(0, 0, 0), scaleFactor = 1) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const kilrathiUrl = window.GLTFAssetURLs['/kilrathi_textured_mesh.glb'] || '/kilrathi_textured_mesh.glb';

    loader.load(
      kilrathiUrl,
      (gltf) => {
        const kilrathi = gltf.scene;
        position.y = 1;  // Raise it by 1 unit
        kilrathi.position.copy(position);
        kilrathi.scale.set(2, 2, 2);
        kilrathi.rotation.y = Math.random() * Math.PI * 2;

        // Enable shadows for realistic rendering.
        kilrathi.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Make the kilrathi bright
        makeBright(kilrathi, scene);

        scene.add(kilrathi);
        console.log("Kilrathi spawned successfully at", position);
        resolve(kilrathi);
      },
      (progress) => {
        if (progress.lengthComputable) {
          const percentComplete = (progress.loaded / progress.total) * 100;
          console.log(`Loading Kilrathi model: ${Math.round(percentComplete)}%`);
        }
      },
      (error) => {
        console.error("Error loading Kilrathi GLB:", error);
        reject(error);
      }
    );
  });
}