import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { createLoader } from '../loaderFactory.js';

/**
 * Creates a technologically imposing, angular, black department building.
 * @param {THREE.Scene} scene - The scene to add the building to.
 * @param {object} buildingConfig - Configuration object for the department building.
 */
export function createDepartmentBuilding(scene, buildingConfig) {
    const buildingGroup = new THREE.Group();
    const loader = createLoader();
    loader.load(
        buildingConfig.modelPath || 'assets/static/fdg_building.glb',
        gltf => {
            const model = gltf.scene;
            model.name = "DepartmentBuildingModel";
            model.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.userData.collidable = true;
                }
            });
            buildingGroup.add(model);
        },
        undefined,
        error => console.error('Error loading department building model:', error)
    );
    buildingGroup.name = "DepartmentBuildingGroup";
    buildingGroup.position.set(buildingConfig.position.x, 0, buildingConfig.position.z);
    // Apply config size as actual scale
    if (buildingConfig.size) buildingGroup.scale.set(buildingConfig.size.x, buildingConfig.size.y, buildingConfig.size.z);
    // Apply config rotation
    if (buildingConfig.rotationY) buildingGroup.rotation.y = buildingConfig.rotationY;
    scene.add(buildingGroup);
    return buildingGroup;
}