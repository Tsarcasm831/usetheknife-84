import * as THREE from 'three';
import { loadModel } from '../world/modelLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

/**
 * Loads and places the Laboratory Tower GLB model based on configuration.
 * @param {THREE.Scene} scene - Scene to add the laboratory tower to.
 * @param {object} officeConfig - Config with position {x,y,z} and optional name, rotationY.
 * @returns {Promise<THREE.Object3D|null>} - Promise resolving to the placed model.
 */
export async function createScienceOffice(scene, officeConfig) {
    if (!officeConfig || !officeConfig.position) {
        console.error('Science Office config is incomplete:', officeConfig);
        return null;
    }
    try {
        const gltf = await loadModel('/assets/static/Laboratory_Tower.glb');
        const officeModel = SkeletonUtils.clone(gltf.scene);
        officeModel.position.set(
            officeConfig.position.x,
            officeConfig.position.y || 0,
            officeConfig.position.z
        );
        if (officeConfig.rotationY) {
            officeModel.rotation.y = officeConfig.rotationY;
        }
        officeModel.name = officeConfig.name || 'ScienceOffice';
        officeModel.userData = { collidable: true };
        officeModel.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(officeModel);
        console.log(`${officeModel.name} loaded and placed at:`, officeConfig.position);
        return officeModel;
    } catch (error) {
        console.error('Error loading Science Office GLB:', error);
        return null;
    }
}