import * as THREE from 'three';
import { loadModel } from '../world/modelLoader.js';

/**
 * Creates a simple hospital object and adds it to the scene.
 * @param {THREE.Scene} scene - The scene to add the hospital to.
 * @param {object} hospitalConfig - Configuration object for the hospital.
 */
export async function createHospital(scene, hospitalConfig) {
    const hospitalGroup = new THREE.Group();
    hospitalGroup.name = 'HospitalGroup';

    try {
        const gltf = await loadModel(hospitalConfig.glbPath);
        if (!gltf || !gltf.scene) {
            console.warn('createHospital: loaded asset has no scene');
        } else {
            const model = gltf.scene;
            model.name = 'HospitalModel';
            if (hospitalConfig.scale) {
                model.scale.set(
                    hospitalConfig.scale.x,
                    hospitalConfig.scale.y,
                    hospitalConfig.scale.z
                );
            }
            if (hospitalConfig.rotationY !== undefined) {
                model.rotation.y = hospitalConfig.rotationY;
            }
            const bbox = new THREE.Box3().setFromObject(model);
            const yOffset = -bbox.min.y;
            model.position.set(0, yOffset - 0.2, 0);
            hospitalGroup.add(model);
        }
    } catch (err) {
        console.error('Error loading hospital model:', err);
    }

    hospitalGroup.position.set(
        hospitalConfig.position.x,
        0,
        hospitalConfig.position.z
    );

    scene.add(hospitalGroup);
    return hospitalGroup;
}