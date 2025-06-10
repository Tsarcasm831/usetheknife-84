import * as THREE from 'three';
import { loadModel } from './world/modelLoader.js';
import config from '../config.js';
import { checkCollision, createObjectBoundingBox } from './world/collision.js';

/**
 * Creates the TalEhn2 model and adds it to the scene.
 * @param {THREE.Scene} scene
 * @param {string} modelPath - URL to the GLB file.
 * @param {function(number):void} [onProgress]
 * @returns {Promise<THREE.Object3D>}
 */
/**
 * Loads all animation GLBs for TalEhn2 and attaches them as actions.
 * @param {THREE.Scene} scene
 * @param {Object} animPaths - Map of animation type to GLB path
 * @param {function(number):void} [onProgress]
 * @returns {Promise<THREE.Object3D>}
 */
export async function createTalEhn2(scene, animPaths, onProgress) {
    const loader = { load: loadModel };
    const actions = {};
    let baseObj = null;
    for (const [anim, path] of Object.entries(animPaths)) {
        try {
            const gltf = await loader.load(path, onProgress);
            if (!baseObj) {
                baseObj = gltf.scene;
                baseObj.name = 'TalEhn2';
                scene.add(baseObj);
            }
            if (gltf.animations && gltf.animations.length > 0) {
                actions[anim] = gltf.animations[0];
            }
        } catch (e) {
            console.warn(`TalEhn2: Failed to load animation ${anim} from ${path}`);
        }
    }
    if (baseObj) {
        baseObj.userData.actions = actions;
        baseObj.userData.mixer = actions.idle ? new THREE.AnimationMixer(baseObj) : null;
        if (actions.idle && baseObj.userData.mixer) {
            const idleAction = baseObj.userData.mixer.clipAction(actions.idle);
            const walkAction = actions.walk ? baseObj.userData.mixer.clipAction(actions.walk) : null;
            // Store for interaction resume logic
            baseObj.userData.idleAction = idleAction;
            baseObj.userData.walkAction = walkAction;
            idleAction.play();
            baseObj.userData.currentAction = idleAction;
        }
        // == AI state init ==
        const totalX = config.world.chunkSize.x * config.world.numChunks.x;
        const totalZ = config.world.chunkSize.z * config.world.numChunks.z;
        const worldBounds = { minX: -totalX/2, maxX: totalX/2, minZ: -totalZ/2, maxZ: totalZ/2 };
        const aiConfig = {
            speed: 1.5,
            wanderDistance: 10,    // shorter roam
            minWait: 0.2,          // shorter wait
            maxWait: 0.6,          // shorter wait max
            arrivalThreshold: 0.3, // tighter arrival
            turnSpeed: 0.1,
            idleScanRadius: 3,
            scanSamples: 12
        };
        Object.assign(baseObj.userData, { 
            state:'wandering', 
            wanderTarget:pickWanderTarget(baseObj.position, aiConfig.wanderDistance, worldBounds), 
            wanderWaitTimer:0, 
            aiConfig, 
            worldBounds, 
            gridSize:{ x:config.world.chunkSize.x, z:config.world.chunkSize.z },
            bounceTimer:0, 
            bounceDirection:new THREE.Vector3() 
        });
        console.log('TalEhn2 spawned with target', baseObj.userData.wanderTarget);
    }
    return baseObj;
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
function scanFreeSpots(obj, radius, collidableObjects, scene, samples=12) {
    const spots = [];
    const obstacles = collidableObjects.filter(o => !obj.getObjectById(o.id));
    for (let i = 0; i < samples; i++) {
        const ang = (2 * Math.PI / samples) * i;
        const cand = obj.position.clone().add(new THREE.Vector3(Math.cos(ang)*radius,0,Math.sin(ang)*radius));
        const box = createObjectBoundingBox(obj, cand);
        if (!checkCollision(box, obstacles, scene)) spots.push(cand);
    }
    return spots;
}

// Helper: choose a grid-based wander target using nearby static density
function chooseGridWanderTarget(obj, data) {
    const { currentGrid, gridSize, worldBounds, nearbyStatics } = data;
    const deltas = [-1, 0, 1];
    let minCount = Infinity, cells = [];
    deltas.forEach(dx => deltas.forEach(dz => {
        const gx = currentGrid.x + dx, gz = currentGrid.z + dz;
        if (gx < 0 || gz < 0) return;
        const x = THREE.MathUtils.clamp(worldBounds.minX + gx * gridSize.x + gridSize.x/2, worldBounds.minX, worldBounds.maxX);
        const z = THREE.MathUtils.clamp(worldBounds.minZ + gz * gridSize.z + gridSize.z/2, worldBounds.minZ, worldBounds.maxZ);
        const count = nearbyStatics.filter(o => {
            const ogx = Math.floor((o.position.x - worldBounds.minX) / gridSize.x);
            const ogz = Math.floor((o.position.z - worldBounds.minZ) / gridSize.z);
            return ogx === gx && ogz === gz;
        }).length;
        if (count < minCount) { minCount = count; cells = [{ x, z }]; }
        else if (count === minCount) cells.push({ x, z });
    }));
    if (cells.length === 0) return pickWanderTarget(obj.position, data.aiConfig.wanderDistance, data.worldBounds);
    const pick = cells[Math.floor(Math.random() * cells.length)];
    return new THREE.Vector3(pick.x, obj.position.y, pick.z);
}

export function updateTalEhn2(obj, deltaTime, collidableObjects, scene) {
    const data = obj.userData;
    // Honor pause from interaction: halt AI and animations
    if (data.paused) return;
    // Advance animations
    data.mixer.update(deltaTime);
    data.bounceTimer = data.bounceTimer || 0;
    // Bounce logic
    if (data.bounceTimer > 0) {
        const dir = data.bounceDirection.clone().normalize();
        obj.position.add(dir.multiplyScalar(data.aiConfig.speed * deltaTime));
        data.bounceTimer -= deltaTime;
        return;
    }
    const obstacles = collidableObjects.filter(o => !obj.getObjectById(o.id));
    const cfg = data.aiConfig;
    let moving = false;
    // Determine direction
    const toTarget = data.state === 'wandering'
        ? data.wanderTarget.clone().sub(obj.position).setY(0)
        : new THREE.Vector3();
    if (toTarget.lengthSq() > cfg.arrivalThreshold * cfg.arrivalThreshold) {
        toTarget.normalize();
        const original = obj.position.clone();
        const step = cfg.speed * deltaTime;
        // Full-step collision check: stop and pick new target on any collision
        const nextPos = original.clone().add(toTarget.clone().multiplyScalar(step));
        if (checkCollision(createObjectBoundingBox(obj, nextPos), obstacles, scene)) {
            console.log('TalEhn2 collision, picking new target');
            data.wanderTarget = chooseGridWanderTarget(obj, data);
            return;
        }
        obj.position.copy(nextPos);
        moving = true;
        // Rotate towards movement
        if (moving) {
            const forward = new THREE.Vector3(0, 0, 1);
            const quat = new THREE.Quaternion().setFromUnitVectors(forward, toTarget);
            obj.quaternion.slerp(quat, cfg.turnSpeed);
        }
    } else {
        // Waiting state
        data.wanderWaitTimer -= deltaTime;
        if (data.wanderWaitTimer <= 0) {
            data.state = 'wandering';
            data.wanderTarget = chooseGridWanderTarget(obj, data);
            data.wanderWaitTimer = cfg.minWait + Math.random() * (cfg.maxWait - cfg.minWait);
        }
    }
    // Animation switch
    const mix = obj.userData.mixer;
    const actions = data.actions;
    const current = data.currentAction;
    let nextAction = current;
    if (moving && actions.walk) nextAction = mix.clipAction(actions.walk);
    else if (!moving && actions.idle) nextAction = mix.clipAction(actions.idle);
    if (nextAction !== current) {
        console.log(`TalEhn2 switching from ${current._clip.name} to ${nextAction._clip.name}`);
        current.fadeOut(0.2);
        nextAction.reset().fadeIn(0.2).play();
        data.currentAction = nextAction;
    }
    // Grid awareness: compute current grid cell and nearby static objects within 3 grids
    if (data.gridSize && data.worldBounds) {
        const gs = data.gridSize;
        const wb = data.worldBounds;
        const offsetX = obj.position.x - wb.minX;
        const offsetZ = obj.position.z - wb.minZ;
        const gx = Math.floor(offsetX / gs.x);
        const gz = Math.floor(offsetZ / gs.z);
        data.currentGrid = { x: gx, z: gz };
        const rangeX = 3 * gs.x;
        const rangeZ = 3 * gs.z;
        data.nearbyStatics = collidableObjects.filter(o => {
            const dx = Math.abs(o.position.x - obj.position.x);
            const dz = Math.abs(o.position.z - obj.position.z);
            return dx <= rangeX && dz <= rangeZ;
        });
        // Optionally log for debugging
        console.log('TalEhn2 grid', data.currentGrid, 'nearby statics', data.nearbyStatics.length);
    }
}
