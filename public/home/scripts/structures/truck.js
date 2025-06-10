import * as THREE from 'three';
import { loadModel } from '../world/modelLoader.js';

/**
 * Creates a simple truck object (cab and trailer bed) and adds it to the scene.
 * @param {THREE.Scene} scene - The scene to add the truck to.
 * @param {object} truckConfig - Configuration object for the truck (size, colors, position).
 * @returns {THREE.Group} - The truck group object.
 */
export async function createTruck(scene, truckConfig) {
    // Load GLB model and position
    const gltf = await loadModel('/assets/static/bills_truck.glb');
    const truck = gltf.scene;
    truck.name = "TruckGroup";
    truck.userData = { collidable: true };
    const { x, z } = truckConfig.position;
    truck.position.set(x, 0, z);
    if (truckConfig.rotationY) truck.rotation.y = truckConfig.rotationY;
    scene.add(truck);
    console.log("Truck model loaded at:", truckConfig.position);
    return truck;
}