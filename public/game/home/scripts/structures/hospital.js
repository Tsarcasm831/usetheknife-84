import * as THREE from 'three';
// Bypass global skip filter: use raw loader with fetch+parse
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/DRACOLoader.js';

/**
 * Creates a simple hospital object and adds it to the scene.
 * @param {THREE.Scene} scene - The scene to add the hospital to.
 * @param {object} hospitalConfig - Configuration object for the hospital.
 */
export function createHospital(scene, hospitalConfig) {
    // setup raw GLTF loader
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/');
    loader.setDRACOLoader(draco);
    const hospitalGroup = new THREE.Group();
    hospitalGroup.name = "HospitalGroup";

    // Load the hospital GLB asset via fetch + parse (bypass skip filter)
    fetch(hospitalConfig.glbPath)
        .then(res => res.arrayBuffer())
        .then(data => loader.parse(data, '', (gltf) => {
            if (!gltf || !gltf.scene) {
                console.warn('createHospital: parse yielded no scene');
                return;
            }
            const model = gltf.scene;
            model.name = 'HospitalModel';
            // Apply scale and rotation from config if present
            if (hospitalConfig.scale) {
                model.scale.set(hospitalConfig.scale.x, hospitalConfig.scale.y, hospitalConfig.scale.z);
            }
            if (hospitalConfig.rotationY !== undefined) {
                model.rotation.y = hospitalConfig.rotationY;
            }
            // Adjust so model's bottom sits on y=0 plane
            const bbox = new THREE.Box3().setFromObject(model);
            const yOffset = -bbox.min.y;
            model.position.y = yOffset - 0.2;
            model.position.x = 0;
            model.position.z = 0; // Local to group
            hospitalGroup.add(model);
        }));

    // Position the entire hospital group from config
    hospitalGroup.position.set(hospitalConfig.position.x, 0, hospitalConfig.position.z);

    scene.add(hospitalGroup);
    return hospitalGroup;
}