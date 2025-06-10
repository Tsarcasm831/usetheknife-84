import * as THREE from 'three';
import { createLoader } from '../loaderFactory.js';

/**
 * Creates a simple house object and adds it to the scene.
 * @param {THREE.Scene} scene - The scene to add the house to.
 * @param {object} houseConfig - Configuration object for the house.
 */
export function createHouse(scene, houseConfig) {
    const { position, scale, rotationY } = houseConfig;
    const group = new THREE.Group();
    group.name = 'HouseGroup';
    group.position.set(position.x, 0, position.z);
    if (scale) group.scale.set(scale.x, scale.y, scale.z);
    if (rotationY) group.rotation.y = rotationY;
    const loader = createLoader();
    loader.load(
        '/assets/static/Medieval_House.glb',
        gltf => {
            const obj = gltf.scene;
            obj.name = 'HouseModel';
            obj.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
            // Align bottom to ground
            const bbox = new THREE.Box3().setFromObject(obj);
            obj.position.y = -bbox.min.y;
            group.add(obj);
        },
        undefined,
        err => console.error('Error loading house model', err)
    );
    scene.add(group);
    return group;
}