import { loadModel } from '../world/modelLoader.js';
import * as THREE from 'three';

/**
 * Creates a simple club building object.
 * @param {THREE.Scene} scene - The scene to add the club to.
 * @param {object} clubConfig - Configuration object for the club.
 * @returns {THREE.Group} - The loaded club model.
 */
export function createClub(scene, clubConfig) {
    const { position, scale } = clubConfig;
    const group = new THREE.Group();
    group.name = 'ClubGroup';
    // Position based on config
    group.position.set(position.x, -0.05, position.z);
    if (scale) group.scale.set(scale.x, scale.y, scale.z);
    // Rotate club 90° clockwise around Y axis
    group.rotation.y = -Math.PI / 2;
    loadModel('/assets/static/diamonds.glb')
        .then(gltf => {
            const obj = gltf.scene;
            obj.name = 'ClubModel';
            obj.traverse(n => {
                if (n.isMesh) {
                    n.castShadow = true;
                    n.receiveShadow = true;
                    if (n.material) {
                        n.material.depthWrite = true;
                        n.material.depthTest = true;
                        n.material.transparent = false;
                        n.material.side = THREE.DoubleSide;
                    }
                }
            });
            group.add(obj);
        })
        .catch(err => console.error('Error loading club model', err));
    scene.add(group);
    return group;
}