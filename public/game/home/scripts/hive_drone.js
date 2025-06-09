import * as THREE from 'three';
import { loadModel } from './world/modelLoader.js';
import config from '../config.js';
import { checkCollision, createObjectBoundingBox } from './world/collision.js';

/**
 * Loads all animation GLBs for HiveDrone and attaches them as actions.
 * @param {THREE.Scene} scene
 * @param {Object} animPaths - Map of animation type to GLB path
 * @param {function(number):void} [onProgress]
 * @returns {Promise<THREE.Object3D>}
 */
export async function createHiveDrone(scene, animPaths, onProgress) {
    const loader = { load: loadModel };
    const actions = {};
    let baseObj = null;
    for (const [anim, path] of Object.entries(animPaths)) {
        try {
            const gltf = await loader.load(path, onProgress);
            if (!baseObj) {
                baseObj = gltf.scene;
                baseObj.name = 'HiveDrone';
                scene.add(baseObj);
            }
            if (gltf.animations && gltf.animations.length > 0) {
                actions[anim] = gltf.animations[0];
            }
        } catch (e) {
            // console.warn(`HiveDrone: Failed to load animation ${anim} from ${path}`);
        }
    }
    if (baseObj) {
        baseObj.userData.actions = actions;
        // always create mixer and play initial animation (idle or walk)
        baseObj.userData.mixer = new THREE.AnimationMixer(baseObj);
        const initAnim = actions.idle || actions.walk;
        if (initAnim) {
            const initAction = baseObj.userData.mixer.clipAction(initAnim);
            initAction.play();
            baseObj.userData.currentAction = initAction;
        }
        // == AI state init ==
        const totalX = config.world.chunkSize.x * config.world.numChunks.x;
        const totalZ = config.world.chunkSize.z * config.world.numChunks.z;
        const worldBounds = { minX: -totalX/2, maxX: totalX/2, minZ: -totalZ/2, maxZ: totalZ/2 };
        const aiConfig = {
            speed: 1.5,
            wanderDistance: 10,
            minWait: 0.2,
            maxWait: 0.6,
            arrivalThreshold: 0.3,
            turnSpeed: 0.1,
            idleScanRadius: 3,
            scanSamples: 12
        };
        Object.assign(baseObj.userData, { state: 'wandering', wanderTarget: pickWanderTarget(baseObj.position, aiConfig.wanderDistance, worldBounds), wanderWaitTimer: 0, aiConfig, worldBounds, bounceTimer: 0, bounceDirection: new THREE.Vector3() });
        // console.log('HiveDrone spawned with target', baseObj.userData.wanderTarget);
    }
    return baseObj;
}

/**
 * Updates the HiveDrone's animation state.
 * @param {THREE.Object3D} obj
 * @param {number} deltaTime
 * @param {Array<THREE.Object3D>} collidableObjects
 * @param {THREE.Scene} scene
 */
export function updateHiveDrone(obj, deltaTime, collidableObjects, scene) {
    // DEBUG: ensure this function is called and track state
    // console.log('updateHiveDrone called:', obj.name, 'state:', obj.userData.state, 'pos:', obj.position);
    if (!obj.userData?.mixer) return;
    // Recalculate target if we snapped spawn position elsewhere
    const data = obj.userData;
    if (!data._aiInit) {
        data.wanderTarget = pickWanderTarget(obj.position, data.aiConfig.wanderDistance, data.worldBounds);
        data._aiInit = true;
    }
    const obstacles = collidableObjects.filter(o => !obj.getObjectById(o.id));
    data.mixer.update(deltaTime);
    const cfg = data.aiConfig;
    let moving = false;
    if (data.bounceTimer > 0) {
        const dir = data.bounceDirection.clone().normalize();
        const moveAmt = cfg.speed * deltaTime;
        obj.position.add(dir.multiplyScalar(moveAmt));
        data.bounceTimer -= deltaTime;
        return;
    }
    if (data.state === 'wandering') {
        const toTarget = data.wanderTarget.clone().sub(obj.position).setY(0);
        if (toTarget.length() < cfg.arrivalThreshold) {
            data.state = 'waiting';
            data.wanderWaitTimer = cfg.minWait + Math.random() * (cfg.maxWait - cfg.minWait);
        } else {
            toTarget.normalize();
            const step = cfg.speed * deltaTime;
            const nextPos = obj.position.clone().add(toTarget.clone().multiplyScalar(step));
            const nextBox = createObjectBoundingBox(obj, nextPos);
            if (checkCollision(nextBox, obstacles, scene)) {
                // start bounce-back and then pick new target after waiting
                data.bounceTimer = 0.5;
                data.bounceDirection = toTarget.clone().negate();
                data.state = 'waiting';
                data.wanderWaitTimer = cfg.minWait + Math.random() * (cfg.maxWait - cfg.minWait);
            } else {
                obj.position.copy(nextPos);
                moving = true;
                console.log(`HiveDrone moving=${moving}`);
                obj.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), toTarget), cfg.turnSpeed);
            }
        }
    } else if (data.state === 'waiting') {
        data.wanderWaitTimer -= deltaTime;
        if (data.wanderWaitTimer <= 0) {
            data.state = 'wandering';
            const spots = scanFreeSpots(obj, cfg.idleScanRadius, obstacles, scene, cfg.scanSamples);
            data.wanderTarget = spots.length
                ? spots[Math.floor(Math.random() * spots.length)]
                : pickWanderTarget(obj.position, cfg.wanderDistance, data.worldBounds);
            data.wanderWaitTimer = cfg.minWait + Math.random() * (cfg.maxWait - cfg.minWait);
        }
    }
    // animation switch
    const mixer = data.mixer;
    const actions = data.actions;
    const current = data.currentAction;
    let next = null;
    if (moving && actions.walk) {
        next = mixer.clipAction(actions.walk);
    } else if (!moving && actions.idle) {
        next = mixer.clipAction(actions.idle);
    }
    if (next !== current) {
        console.log(`HiveDrone switching from ${current?._clip.name} to ${next?._clip.name}`);
        if (current) current.fadeOut(0.2);
        if (next) next.reset().fadeIn(0.2).play();
        data.currentAction = next;
    }
}

// Helper: pick a random point within world bounds
function pickWanderTarget(currentPosition, maxDistance, worldBounds) {
    const target = new THREE.Vector3();
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * maxDistance;
    target.x = THREE.MathUtils.clamp(currentPosition.x + Math.cos(angle) * dist, worldBounds.minX, worldBounds.maxX);
    target.z = THREE.MathUtils.clamp(currentPosition.z + Math.sin(angle) * dist, worldBounds.minZ, worldBounds.maxZ);
    target.y = currentPosition.y;
    return target;
}

// Helper: scan around for free spots
function scanFreeSpots(obj, radius, collidableObjects, scene, samples = 12) {
    const spots = [];
    const obstacles = collidableObjects.filter(o => !obj.getObjectById(o.id));
    for (let i = 0; i < samples; i++) {
        const ang = (2 * Math.PI / samples) * i;
        const cand = obj.position.clone().add(new THREE.Vector3(Math.cos(ang) * radius, 0, Math.sin(ang) * radius));
        const box = createObjectBoundingBox(obj, cand);
        if (!checkCollision(box, obstacles, scene)) spots.push(cand);
    }
    return spots;
}
