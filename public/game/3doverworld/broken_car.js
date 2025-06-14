// broken_car.js
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { makeBright } from './glb_lighting.js';

/**
 * Spawns a set of broken cars around the given center.
 * Uses the GLB asset '/broken_car_two_door_textured_mesh.glb' from download.js.
 *
 * @param {THREE.Scene} scene - The Three.js scene in which to spawn the cars.
 * @param {THREE.Vector3} [centerPosition=new THREE.Vector3(0, 0, 0)] - The center around which cars are arranged.
 * @param {number} [radius=20] - The radius of the circle on which the cars are placed.
 * @param {number} [count=4] - The number of broken cars to spawn.
 */
export function spawnBrokenCars(scene, centerPosition = new THREE.Vector3(0, 0, 0), radius = 20, count = 4) {
  const loader = new GLTFLoader();
  const brokenCarUrl = window.GLTFAssetURLs['/broken_car_two_door_textured_mesh.glb'] || '/broken_car_two_door_textured_mesh.glb';

  for (let i = 0; i < count; i++) {
    // Calculate an evenly spaced angle for each car along a circle.
    const angle = (i / count) * Math.PI * 2;
    const x = centerPosition.x + radius * Math.cos(angle);
    const z = centerPosition.z + radius * Math.sin(angle);

    loader.load(
      brokenCarUrl,
      (gltf) => {
        const car = gltf.scene;

        // Apply proper lighting and optimized materials from glb_lighting.js
        makeBright(car, scene);

        // Raise the car by 1 unit (y = 1) to meet the latest instructions.
        car.position.set(x, 1, z);
        // Apply a random rotation for variety.
        car.rotation.y = Math.random() * Math.PI * 2;
        // Scale the car to an appropriate size.
        car.scale.set(2, 2, 2);

        scene.add(car);
      },
      undefined,
      (error) => {
        console.error('Error loading broken car GLB:', error);
      }
    );
  }
}
