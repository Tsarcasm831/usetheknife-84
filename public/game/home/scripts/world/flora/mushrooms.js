import config from '../../../config.js';
import { loadModel } from '../modelLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

/**
 * Creates and places a GLB-based Mushrooms group at a specified grid location.
 * @param {THREE.Scene} scene - The scene to add the mushrooms to.
 * @param {number} [gridX=77] - Grid X coordinate.
 * @param {number} [gridZ=96] - Grid Z coordinate.
 * @returns {Promise<THREE.Group>} The created mushrooms group.
 */
export function createMushrooms(scene, gridX = 77, gridZ = 96) {
    const { chunkSize, numChunks } = config.world;
    const divisions = config.grid.divisions;
    const cellSizeX = chunkSize.x / divisions;
    const cellSizeZ = chunkSize.z / divisions;
    const halfTotalX = (chunkSize.x * numChunks.x) / 2;
    const halfTotalZ = (chunkSize.z * numChunks.z) / 2;
    const posX = -halfTotalX + (gridX + 0.5) * cellSizeX;
    const posZ = -halfTotalZ + (gridZ + 0.5) * cellSizeZ;

    return loadModel('/assets/static/flora/mushrooms.glb')
        .then(gltf => {
            const group = SkeletonUtils.clone(gltf.scene);
            group.name = 'Mushrooms';
            group.scale.multiplyScalar(1.3);
            group.position.set(posX, -0.05, posZ);
            group.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            scene.add(group);
            return group;
        })
        .catch(err => console.error('Failed to load mushrooms.glb:', err));
}
