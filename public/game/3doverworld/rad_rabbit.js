import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { spawnKilrathi } from './kilrathi.js';
import { makeBright } from './glb_lighting.js';

/**
 * Spawns a set of rad rabbits in the provided scene.
 * The rad rabbit is loaded from '/radrabbit_textured_mesh.glb' (using the cached URL if available).
 *
 * @param {THREE.Scene} scene - The scene to add the rad rabbits to.
 * @param {number} [count=4] - The number of rad rabbits to spawn.
 * @param {number} [areaRadius=20] - The radius within which to randomly spawn the rad rabbits (in world units).
 * @param {THREE.Vector3} [centerPosition=new THREE.Vector3(0, 0, 0)] - The central position for the spawn area.
 */
export function spawnRadRabbit(scene, count = 4, areaRadius = 20, centerPosition = new THREE.Vector3(0, 0, 0)) {
  const loader = new GLTFLoader();
  const radRabbitUrl = window.GLTFAssetURLs['/radrabbit_textured_mesh.glb'] || '/radrabbit_textured_mesh.glb';

  for (let i = 0; i < count; i++) {
    // Generate random polar coordinates for spawn within a circle.
    const angle = Math.random() * Math.PI * 2;
    const randomOffset = Math.random() * areaRadius;
    // Calculate the base random position.
    let x = centerPosition.x + Math.cos(angle) * randomOffset;
    let z = centerPosition.z + Math.sin(angle) * randomOffset;
    // Add an additional offset to move the rabbit 5 ft away from the center.
    x += Math.cos(angle) * 5;
    z += Math.sin(angle) * 5;
    
    loader.load(
      radRabbitUrl,
      (gltf) => {
        const radRabbit = gltf.scene;
        // Set the rad rabbit position: move it up by 0.5 ft and to the calculated x/z.
        radRabbit.position.set(x, 0.5, z);
        // Optionally randomize rotation.
        radRabbit.rotation.y = Math.random() * Math.PI * 2;
        // Scale the model appropriately; adjust scale if needed.
        const scale = 1 + Math.random() * 0.5;
        radRabbit.scale.set(scale, scale, scale);
        // Make the rabbit bright
        makeBright(radRabbit, scene);
        // Enable shadows for visual quality.
        radRabbit.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        scene.add(radRabbit);

        // Spawn a kilrathi near the rad rabbit (only once for the first rad rabbit spawned).
        if (!window.kilrathiNearRadRabbitSpawned) {
          window.kilrathiNearRadRabbitSpawned = true;
          // Offset the kilrathi position a bit relative to the rad rabbit.
          const offset = new THREE.Vector3(2, 0, 0);
          spawnKilrathi(scene, radRabbit.position.clone().add(offset), 1);
        }
      },
      undefined,
      (error) => {
        console.error('Error loading rad rabbit GLB:', error);
      }
    );
  }
}