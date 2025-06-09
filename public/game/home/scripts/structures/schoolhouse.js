import * as THREE from 'three';
import { loadModel } from '../world/modelLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

/**
 * Loads and places the schoolhouse GLB model based on configuration.
 * @param {THREE.Scene} scene - Scene to add the schoolhouse to.
 * @param {object} schoolConfig - Config with position {x,y,z} and optional name.
 * @returns {Promise<THREE.Object3D|null>} - Promise resolving to the schoolhouse model.
 */
export async function createSchoolhouse(scene, schoolConfig) {
    if (!schoolConfig || !schoolConfig.position) {
        console.error('Schoolhouse config is incomplete:', schoolConfig);
        return null;
    }
    try {
        const gltf = await loadModel('/assets/static/Schoolhouse.glb');
        const schoolModel = SkeletonUtils.clone(gltf.scene);
        schoolModel.position.set(
            schoolConfig.position.x,
            (schoolConfig.position.y || 0) - 1,  // Move schoolhouse down by 1m
            schoolConfig.position.z
        );
        schoolModel.rotation.y = -Math.PI / 2; // Rotate 90 degrees clockwise around Y axis
        schoolModel.name = schoolConfig.name || 'Schoolhouse';
        schoolModel.userData = { collidable: true };
        schoolModel.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(schoolModel);
        console.log(`${schoolModel.name} loaded and placed at:`, schoolConfig.position);
        return schoolModel;
    } catch (error) {
        console.error('Error loading Schoolhouse GLB:', error);
        return null;
    }
}