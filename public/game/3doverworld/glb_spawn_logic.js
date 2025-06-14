// This module contains utilities to compute valid spawn positions for GLB objects
// ensuring they do not overlap or spawn too close to each other in the world.
// It uses bounding spheres to approximate the object sizes and checks the distance
// between the candidate spawn position and already-spawned objects.

import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

/**
 * Checks whether a candidate position is valid (not overlapping) with objects in the scene.
 * 
 * @param {THREE.Vector3} candidatePos - The candidate position for a new object.
 * @param {Array<{ position: THREE.Vector3, radius: number }>} existingObjects - Array of objects with their spawn position and radius.
 * @param {number} minDistance - Additional clearance distance required between objects.
 * @returns {boolean} - Returns true if the candidate position is valid.
 */
export function isValidSpawnPosition(candidatePos, existingObjects, minDistance = 1) {
  for (const obj of existingObjects) {
    const distance = candidatePos.distanceTo(obj.position);
    // Ensure that the distance between centers is larger than the sum of their radii plus clearance.
    if (distance < (obj.radius + minDistance)) {
      return false;
    }
  }
  return true;
}

/**
 * Finds a valid spawn position inside a given area based on a center and radius.
 * This function attempts the given number of maximum attempts to compute a valid point.
 * 
 * @param {THREE.Vector3} centerPosition - The center of the spawn area.
 * @param {number} areaRadius - The maximum distance from the center to try spawning.
 * @param {Array<{ position: THREE.Vector3, radius: number }>} existingObjects - Array of already spawned objects with their positions and approximate radii.
 * @param {number} objectRadius - The approximate radius of the new object.
 * @param {number} clearance - Additional clearance distance to ensure non-overlap.
 * @param {number} maxAttempts - Maximum number of attempts to find a valid position.
 * @returns {THREE.Vector3|null} - A valid spawn position or null if no valid position found.
 */
export function getValidSpawnPosition(centerPosition, areaRadius, existingObjects, objectRadius, clearance = 1, maxAttempts = 100) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    // Generate a random point within a circle in the XZ plane.
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * areaRadius;
    const x = centerPosition.x + Math.cos(angle) * distance;
    const z = centerPosition.z + Math.sin(angle) * distance;
    // For Y, we assume ground level (can be adjusted if needed)
    const candidatePos = new THREE.Vector3(x, centerPosition.y, z);
    if (isValidSpawnPosition(candidatePos, existingObjects, objectRadius + clearance)) {
      return candidatePos;
    }
    attempt++;
  }
  // If no valid position found, return null.
  return null;
}

/**
 * Registers a spawned object into the tracking list.
 * 
 * @param {THREE.Vector3} position - The position where the object was spawned.
 * @param {number} objectRadius - The approximate radius of the object.
 * @param {Array<{ position: THREE.Vector3, radius: number }>} trackingList - The list tracking spawned objects.
 */
export function registerSpawnedObject(position, objectRadius, trackingList) {
  trackingList.push({ position: position.clone(), radius: objectRadius });
}

// Example usage:
//
// import { getValidSpawnPosition, registerSpawnedObject } from './glb_spawn_logic.js';
// import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
//
// const existingSpawns = [];
// const center = new THREE.Vector3(0,0,0);
// const newSpawnRadius = 1.5; // approximate radius of new object
// const validPos = getValidSpawnPosition(center, 20, existingSpawns, newSpawnRadius, 1);
// if (validPos) {
//   // Spawn your object at validPos.
//   registerSpawnedObject(validPos, newSpawnRadius, existingSpawns);
// } else {
//   console.warn("No valid spawn position found after maximum attempts.");
// }