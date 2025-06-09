import * as THREE from 'three';
import { createLoader } from '../loaderFactory.js';

/**
 * Creates a simple second house object and adds it to the scene.
 * (Essentially a copy of createHouse, using a different config key)
 * @param {THREE.Scene} scene - The scene to add the house to.
 * @param {object} houseConfig - Configuration object for this specific house (house2).
 */
export function createHouse2(scene, houseConfig) {
    const { position, scale, rotationY } = houseConfig;
    const group = new THREE.Group();
    group.name = 'House2Group';
    group.position.set(position.x, 0, position.z);
    if (scale) group.scale.set(scale.x, scale.y, scale.z);
    if (rotationY) group.rotation.y = rotationY;
    const loader = createLoader();
    loader.load(
        '/assets/static/american_house/american_house_0417204824_refine.glb',
        gltf => {
            const obj = gltf.scene;
            obj.name = 'House2Model';
            obj.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
            // Align bottom to ground
            const bbox = new THREE.Box3().setFromObject(obj);
            obj.position.y = -bbox.min.y;
            group.add(obj);
        },
        undefined,
        err => console.error('Error loading House2 model', err)
    );
    scene.add(group);
    return group;
}