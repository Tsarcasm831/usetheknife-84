// bus.js
import * as THREE from 'three';
import { loadModel } from './world/modelLoader.js';

/**
 * Creates a simple bus object and adds it to the scene.
 * @param {THREE.Scene} scene - The scene to add the bus to.
 * @param {object} busConfig - Configuration object for the bus.
 * @returns {THREE.Group} - The bus group object.
 */
export function createBus(scene, busConfig) {
    console.log('createBus config:', busConfig);
    const busGroup = new THREE.Group();
    busGroup.name = "BusGroup";
    busGroup.userData = { collidable: true };

    // Determine model URL
    const defaultUrl = 'assets/static/bus.glb';
    const modelUrl = busConfig.modelPath || defaultUrl;
    console.log('Loading bus model from:', modelUrl);
    // Load GLB model for bus using cached loader
    loadModel(modelUrl)
        .then(gltf => {
            const model = gltf.scene.clone();
            model.name = "BusModel";
            // Apply base scale and enlarge X by 20%
            const baseX = busConfig.scale?.x ?? 1;
            const baseY = busConfig.scale?.y ?? 1;
            const baseZ = busConfig.scale?.z ?? 1;
            model.scale.set(baseX * 1.2, baseY, baseZ);
            // Enable shadows and collision on meshes
            model.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.userData = { collidable: true };
                }
            });
            busGroup.add(model);
        })
        .catch(error => console.error("Failed to load bus model:", error));

    // Position and rotate whole group
    busGroup.position.set(busConfig.position.x, busConfig.position.y || 0, busConfig.position.z);
    if (busConfig.rotationY !== undefined) {
        busGroup.rotation.y = busConfig.rotationY;
    }
    scene.add(busGroup);
    return busGroup;
}