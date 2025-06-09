import * as THREE from 'three';
import { loadModel, updateCharacter } from './world/modelLoader.js';

/**
 * Creates the Xris model and adds it to the scene.
 * @param {THREE.Scene} scene
 * @param {string} modelPath - URL to the GLB file.
 * @param {function(number):void} [onProgress]
 * @returns {Promise<THREE.Object3D>}
 */
/**
 * Loads all animation GLBs for Xris and attaches them as actions.
 * @param {THREE.Scene} scene
 * @param {Object} animPaths - Map of animation type to GLB path
 * @param {function(number):void} [onProgress]
 * @returns {Promise<THREE.Object3D>}
 */
export async function createXris(scene, animPaths, onProgress) {
    const loader = { load: loadModel };
    const actions = {};
    let baseObj = null;
    for (const [anim, path] of Object.entries(animPaths)) {
        try {
            const gltf = await loader.load(path, onProgress);
            if (!baseObj) {
                baseObj = gltf.scene;
                baseObj.name = 'Xris';
                scene.add(baseObj);
            }
            if (gltf.animations && gltf.animations.length > 0) {
                actions[anim] = gltf.animations[0];
            }
        } catch (e) {
            console.warn(`Xris: Failed to load animation ${anim} from ${path}`);
        }
    }
    if (baseObj) {
        baseObj.userData.actions = actions;
        baseObj.userData.mixer = actions.idle ? new THREE.AnimationMixer(baseObj) : null;
        if (actions.idle && baseObj.userData.mixer) {
            const idleAction = baseObj.userData.mixer.clipAction(actions.idle);
            idleAction.play();
            baseObj.userData.currentAction = idleAction;
        }
    }
    return baseObj;
}


/**
 * Update stub for Xris.
 * @param {THREE.Object3D} obj
 * @param {number} deltaTime
 */
export function updateXris(obj, deltaTime) {
    updateCharacter(obj, deltaTime);
}
