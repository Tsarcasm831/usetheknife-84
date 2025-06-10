import * as THREE from 'three';
import { createLoader } from '../loaderFactory.js';

/**
 * Creates a simple sixth house object and adds it to the scene.
 * (Essentially a copy of other house scripts, using a different config key)
 * @param {THREE.Scene} scene - The scene to add the house to.
 * @param {object} houseConfig - Configuration object for this specific house (house6).
 */
export function createHouse6(scene, houseConfig) {
    const { position, scale, rotationY } = houseConfig;
    const group = new THREE.Group();
    group.name = 'House6Group';
    group.position.set(position.x, 0, position.z);
    if (scale) group.scale.set(scale.x, scale.y, scale.z);
    if (rotationY) group.rotation.y = rotationY;
    const loader = createLoader();
    loader.load(
        '/assets/static/cartoon_house.glb',
        gltf => {
            const obj = gltf.scene;
            obj.name = 'House6Model';
            obj.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
            // Scale 3x and align bottom to ground
            obj.scale.multiplyScalar(3);
            const bbox = new THREE.Box3().setFromObject(obj);
            obj.position.y = -bbox.min.y;
            group.add(obj);
        },
        undefined,
        err => console.error('Error loading House6 model', err)
    );
    scene.add(group);
    return group;
}