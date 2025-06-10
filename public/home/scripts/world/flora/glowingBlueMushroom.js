import config from '../../../config.js';
import { loadModel } from '../modelLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

/**
 * Creates and places a GLB-based Glowing Blue Mushroom at a specified grid location.
 * @param {THREE.Scene} scene - The scene to add the mushroom to.
 * @param {number} [gridX=77] - Grid X coordinate.
 * @param {number} [gridZ=96] - Grid Z coordinate.
 * @returns {Promise<THREE.Group>} The created mushroom group.
 */
export function createGlowingBlueMushroom(scene, gridX = 77, gridZ = 96) {
    const { chunkSize, numChunks } = config.world;
    const divisions = config.grid.divisions;
    const cellSizeX = chunkSize.x / divisions;
    const cellSizeZ = chunkSize.z / divisions;
    const halfTotalX = (chunkSize.x * numChunks.x) / 2;
    const halfTotalZ = (chunkSize.z * numChunks.z) / 2;
    const posX = -halfTotalX + (gridX + 0.5) * cellSizeX;
    const posZ = -halfTotalZ + (gridZ + 0.5) * cellSizeZ;

    return loadModel('/assets/static/flora/A_glowing_blue_mushro_0502172403_refine.glb')
        .then(gltf => {
            const mushroom = SkeletonUtils.clone(gltf.scene);
            mushroom.name = 'GlowingBlueMushroom';
            mushroom.scale.multiplyScalar(1.3);
            mushroom.position.set(posX, -0.05, posZ);
            mushroom.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            scene.add(mushroom);
            return mushroom;
        })
        .catch(err => console.error('Failed to load glowing blue mushroom GLB:', err));
}
