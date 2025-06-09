import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { createLoader } from '../loaderFactory.js';

/**
 * Creates a simple Spyder Workshop building.
 * @param {THREE.Scene} scene - The scene to add the building to.
 * @param {object} workshopConfig - Configuration object for the workshop.
 * @returns {THREE.Group} - The workshop group object.
 */
export function createSpyderWorkshop(scene, workshopConfig) {
    const workshopGroup = new THREE.Group();
    const loader = createLoader();
    loader.load(
        workshopConfig.modelPath || 'assets/static/Spyders_Workshop.glb',
        gltf => {
            const model = gltf.scene;
            model.name = "SpyderWorkshopModel";
            model.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.userData.collidable = true;
                }
            });
            workshopGroup.add(model);
        },
        undefined,
        error => console.error('Error loading spyder workshop model:', error)
    );
    workshopGroup.name = "SpyderWorkshopGroup";
    workshopGroup.position.set(workshopConfig.position.x, 0, workshopConfig.position.z);
    if (workshopConfig.rotationY) workshopGroup.rotation.y = workshopConfig.rotationY;
    scene.add(workshopGroup);
    console.log("Spyder Workshop created at:", workshopConfig.position);
    return workshopGroup;
}