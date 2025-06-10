import * as THREE from 'three';
import { loadModel, updateCharacter } from './world/modelLoader.js';

/**
 * Loads all animation GLBs for PrometheanRobot and attaches them as actions.
 * @param {THREE.Scene} scene
 * @param {Object} animPaths - Map of animation type to GLB path
 * @param {function(number):void} [onProgress]
 * @returns {Promise<THREE.Object3D>}
 */
export async function createPrometheanRobot(scene, animPaths, onProgress) {
    const loader = { load: loadModel };
    const actions = {};
    let baseObj = null;
    for (const [anim, path] of Object.entries(animPaths)) {
        try {
            const gltf = await loader.load(path, onProgress);
            if (!baseObj) {
                baseObj = gltf.scene;
                baseObj.name = 'PrometheanRobot';
                scene.add(baseObj);
            }
            if (gltf.animations && gltf.animations.length > 0) {
                actions[anim] = gltf.animations[0];
            }
        } catch (e) {
            console.warn(`PrometheanRobot: Failed to load animation ${anim} from ${path}`);
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
 * Updates the PrometheanRobot's animation state.
 * @param {THREE.Object3D} obj
 * @param {number} deltaTime
 */
export function updatePrometheanRobot(obj, deltaTime) {
    updateCharacter(obj, deltaTime);
}
