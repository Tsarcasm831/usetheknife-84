import config from '../../../config.js';
import { loadModel } from '../modelLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

/**
 * Creates and places a GLB-based Muta Plant 3 at a specified grid location.
 * @param {THREE.Scene} scene - The scene to add the plant to.
 * @param {number} [gridX=77] - Grid X coordinate.
 * @param {number} [gridZ=96] - Grid Z coordinate.
 * @returns {Promise<THREE.Group>} The created plant group.
 */
export function createMutaPlant3(scene, gridX = 77, gridZ = 96) {
    const { chunkSize, numChunks } = config.world;
    const divisions = config.grid.divisions;
    const cellSizeX = chunkSize.x / divisions;
    const cellSizeZ = chunkSize.z / divisions;
    const halfTotalX = (chunkSize.x * numChunks.x) / 2;
    const halfTotalZ = (chunkSize.z * numChunks.z) / 2;
    const posX = -halfTotalX + (gridX + 0.5) * cellSizeX;
    const posZ = -halfTotalZ + (gridZ + 0.5) * cellSizeZ;

    return loadModel('/assets/static/flora/muta-plant3.glb')
        .then(gltf => {
            const plant = SkeletonUtils.clone(gltf.scene);
            plant.name = 'MutaPlant3';
            plant.scale.multiplyScalar(1.3);
            plant.position.set(posX, -0.05, posZ);
            plant.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            scene.add(plant);
            return plant;
        })
        .catch(err => console.error('Failed to load muta-plant3.glb:', err));
}
