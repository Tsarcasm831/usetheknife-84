import * as THREE from 'three';
import { createLoader } from '../loaderFactory.js';

/**
 * Creates a simple tavern building object.
 * @param {THREE.Scene} scene - The scene to add the tavern to.
 * @param {object} tavernConfig - Configuration object for the tavern.
 * @returns {THREE.Group} - The tavern group object.
 */
export function createTavern(scene, tavernConfig) {
    const { position, scale, rotationY } = tavernConfig;
    const group = new THREE.Group();
    group.name = 'TavernGroup';
    // Move tavern east and lower by 1m
    group.position.set(position.x + 1, -1, position.z);
    // Scale the tavern 50% larger
    if (scale) {
        group.scale.set(scale.x * 1.5, scale.y * 1.5, scale.z * 1.5);
    } else {
        group.scale.set(1.5, 1.5, 1.5);
    }
    // Rotate the tavern 180° around Y axis
    group.rotation.y = (rotationY || 0) + Math.PI;
    const loader = createLoader();
    loader.load(
        '/assets/static/Tavern.glb',
        gltf => {
            const obj = gltf.scene;
            obj.name = 'TavernModel';
            obj.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
            group.add(obj);
        },
        undefined,
        err => console.error('Error loading tavern model', err)
    );
    scene.add(group);
    return group;
}