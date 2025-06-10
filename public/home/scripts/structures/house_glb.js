import * as THREE from 'three';
import { loadModel } from '../world/modelLoader.js';
// Import SkeletonUtils using the namespace style
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

/**
 * Loads and places a house GLB model based on configuration.
 * @param {THREE.Scene} scene - The scene to add the house model to.
 * @param {object} houseConfig - Configuration object for the GLB house.
 *   Expected properties: glbPath, position, scale, rotationY, size (for bounding box), collidable.
 * @returns {Promise<THREE.Object3D | null>} A promise resolving with the placed house model or null on error.
 */
export async function createHouseGLB(scene, houseConfig) {
    if (!houseConfig || !houseConfig.glbPath || !houseConfig.position || !houseConfig.scale || !houseConfig.size) {
        console.error("House GLB config is incomplete:", houseConfig);
        return null;
    }

    try {
        const gltf = await loadModel(houseConfig.glbPath);
        // Clone the scene for this instance using SkeletonUtils
        const houseModel = SkeletonUtils.clone(gltf.scene);

        // Shrink model by 2x
        const [sx, sy, sz] = [houseConfig.scale.x * 0.5, houseConfig.scale.y * 0.5, houseConfig.scale.z * 0.5];
        houseModel.scale.set(sx, sy, sz);

        // Apply rotation before computing bounding box
        if (houseConfig.rotationY) {
            houseModel.rotation.y = houseConfig.rotationY;
        }

        // Align bottom on ground and apply y-offset
        houseModel.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(houseModel);
        const minY = bbox.min.y;
        // Use vertical offset from config.position.y to raise/lower
        const yOffset = houseConfig.position.y || 0;
        houseModel.position.set(houseConfig.position.x, -minY + yOffset, houseConfig.position.z);

        houseModel.name = houseConfig.name || "HouseGLB"; // Use config name or default

        // Set userData for collision/exclusion using config size
        houseModel.userData = {
            collidable: houseConfig.collidable,
            boundingBoxSize: houseConfig.size // Use config size for grass exclusion etc.
        };

        // Ensure shadows are cast/received (modelLoader should handle this, but double-check)
        houseModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(houseModel);
        console.log(`${houseModel.name} loaded and placed at:`, houseConfig.position);
        return houseModel;

    } catch (error) {
        console.error(`Error loading or placing House GLB (${houseConfig.glbPath}):`, error);
        return null;
    }
}