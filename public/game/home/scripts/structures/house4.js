import * as THREE from 'three';
import { createLoader } from '../loaderFactory.js';

/**
 * Creates a simple fourth house object and adds it to the scene.
 * (Essentially a copy of createHouse/createHouse2/createHouse3, using a different config key)
 * @param {THREE.Scene} scene - The scene to add the house to.
 * @param {object} houseConfig - Configuration object for this specific house (house4).
 */
export function createHouse4(scene, houseConfig) {
    const { position, scale, rotationY } = houseConfig;
    const group = new THREE.Group();
    group.name = 'House4Group';
    group.position.set(position.x, 0, position.z);
    if (scale) group.scale.set(scale.x, scale.y, scale.z);
    if (rotationY) group.rotation.y = rotationY;
    const loader = createLoader();
    loader.load(
        '/assets/static/Mini_house.glb',
        gltf => {
            const obj = gltf.scene;
            obj.name = 'House4Model';
            obj.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
            // Align bottom to ground
            const bbox = new THREE.Box3().setFromObject(obj);
            obj.position.y = -bbox.min.y;
            group.add(obj);
        },
        undefined,
        err => console.error('Error loading House4 model', err)
    );
    scene.add(group);
    console.log("House4 created at:", houseConfig.position);
    return group;
}