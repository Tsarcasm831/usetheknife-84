import config from '../config.js';
import * as THREE from 'three';
import { loadModel, updateCharacter } from './world/modelLoader.js';
import { checkCollision, createObjectBoundingBox } from './world/collision.js';

// Temp vectors for AI
const direction = new THREE.Vector3();
const targetQuaternion = new THREE.Quaternion();

/**
 * Creates the AlienArmored model and adds it to the scene.
 * @param {THREE.Scene} scene
 * @param {string} modelPath - URL to the GLB file.
 * @param {function(number):void} [onProgress]
 * @returns {Promise<THREE.Object3D>}
 */
/**
 * Loads all animation GLBs for AlienArmored and attaches them as actions.
 * @param {THREE.Scene} scene
 * @param {Object} animPaths - Map of animation type to GLB path
 * @param {function(number):void} [onProgress]
 * @returns {Promise<THREE.Object3D>}
 */
export async function createAlienArmored(scene, animPaths, onProgress) {
    const loader = { load: loadModel };
    const actions = {};
    let baseObj = null;
    // Load all animations
    for (const [anim, path] of Object.entries(animPaths)) {
        try {
            const gltf = await loader.load(path, onProgress);
            if (!baseObj) {
                baseObj = gltf.scene;
                baseObj.name = 'AlienArmored';
                scene.add(baseObj);
            }
            // Store animation clip if present
            if (gltf.animations && gltf.animations.length > 0) {
                actions[anim] = gltf.animations[0];
            }
        } catch (e) {
            console.warn(`AlienArmored: Failed to load animation ${anim} from ${path}`);
        }
    }
    // Attach actions and mixer to userData
    if (baseObj) {
        baseObj.userData.actions = actions;
        baseObj.userData.mixer = actions.idle ? new THREE.AnimationMixer(baseObj) : null;
        if (actions.idle && baseObj.userData.mixer) {
            const idleAction = baseObj.userData.mixer.clipAction(actions.idle);
            const walkAction = actions.walk ? baseObj.userData.mixer.clipAction(actions.walk) : null;
            baseObj.userData.idleAction = idleAction;
            baseObj.userData.walkAction = walkAction;
            idleAction.play();
            baseObj.userData.currentAction = idleAction;
        }
        // compute world bounds from config
        const totalX = config.world.chunkSize.x * config.world.numChunks.x;
        const totalZ = config.world.chunkSize.z * config.world.numChunks.z;
        const worldBounds = { minX: -totalX/2, maxX: totalX/2, minZ: -totalZ/2, maxZ: totalZ/2 };
        // AI configuration
        const aiConfig = { 
            speed: 1.5,              // movement speed
            wanderDistance: 20,      // large roam distance
            minWait: 0.5,            // minimum idle wait (s)
            maxWait: 1.5,            // maximum idle wait (s)
            arrivalThreshold: 0.5,    // smaller threshold to finish move
            turnSpeed: 0.1,          // rotation lerp
            idleScanRadius: 3,       // local roam radius in meters
            scanSamples: 12          // number of scan directions
        };
        Object.assign(baseObj.userData, {
            state: 'wandering',
            wanderTarget: pickWanderTarget(baseObj.position, aiConfig.wanderDistance, worldBounds),
            wanderWaitTimer: 0,
            aiConfig,
            worldBounds,
            gridSize: { x: config.world.chunkSize.x, z: config.world.chunkSize.z },
            bounceTimer: 0,
            bounceDirection: new THREE.Vector3()
        });
        console.log('AlienArmored spawned with target', baseObj.userData.wanderTarget);
    }
    return baseObj;
}

// Helper to pick a wander target within world bounds
function pickWanderTarget(currentPosition, maxDistance, worldBounds) {
    const target = new THREE.Vector3();
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * maxDistance;
    target.x = currentPosition.x + Math.cos(angle) * distance;
    target.z = currentPosition.z + Math.sin(angle) * distance;
    target.y = currentPosition.y;
    target.x = Math.max(worldBounds.minX, Math.min(worldBounds.maxX, target.x));
    target.z = Math.max(worldBounds.minZ, Math.min(worldBounds.maxZ, target.z));
    return target;
}

/**
 * Scans around obj in a radius for free spots.
 * @param {THREE.Object3D} obj
 * @param {number} radius
 * @param {Array<THREE.Object3D>} collidableObjects
 * @param {THREE.Scene} scene
 * @param {number} samples
 * @returns {THREE.Vector3[]} free positions
 */
function scanFreeSpots(obj, radius, collidableObjects, scene, samples=8) {
    const spots = [];
    for (let i = 0; i < samples; i++) {
        const angle = (2 * Math.PI / samples) * i;
        const candidate = obj.position.clone().add(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
        const box = createObjectBoundingBox(obj, candidate);
        if (!checkCollision(box, collidableObjects, scene)) {
            spots.push(candidate);
        }
    }
    return spots;
}

/**
 * Update stub for AlienArmored.
 * @param {THREE.Object3D} obj
 * @param {number} deltaTime
 * @param {Array<THREE.Object3D>} collidableObjects
 * @param {THREE.Scene} scene
 */
export function updateAlienArmored(obj, deltaTime, collidableObjects, scene) {
    const data = obj.userData;
    if (data.paused) return;
    data.bounceTimer = data.bounceTimer || 0;
    if (data.mixer) data.mixer.update(deltaTime);
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
        const nextPos = original.clone().add(toTarget.clone().multiplyScalar(cfg.speed * deltaTime));
        if (checkCollision(createObjectBoundingBox(obj, nextPos), obstacles, scene)) {
            data.wanderTarget = chooseGridWanderTarget(obj, data);
            return;
        }
        obj.position.copy(nextPos);
        moving = true;
        obj.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), toTarget), cfg.turnSpeed);
    } else {
        data.wanderWaitTimer -= deltaTime;
        if (data.wanderWaitTimer <= 0) {
            data.state = 'wandering';
            data.wanderTarget = chooseGridWanderTarget(obj, data);
            data.wanderWaitTimer = cfg.minWait + Math.random() * (cfg.maxWait - cfg.minWait);
        }
    }
    // Animation switch
    const mix = data.mixer;
    const current = data.currentAction;
    const nextAction = moving && data.walkAction
        ? mix.clipAction(data.actions.walk)
        : !moving && data.idleAction
            ? mix.clipAction(data.actions.idle)
            : current;
    if (nextAction !== current) {
        current.fadeOut(0.2);
        nextAction.reset().fadeIn(0.2).play();
        data.currentAction = nextAction;
    }
    // Grid awareness
    if (data.gridSize && data.worldBounds) {
        const gs = data.gridSize, wb = data.worldBounds;
        const offsetX = obj.position.x - wb.minX;
        const offsetZ = obj.position.z - wb.minZ;
        data.currentGrid = { x: Math.floor(offsetX/gs.x), z: Math.floor(offsetZ/gs.z) };
        data.nearbyStatics = collidableObjects.filter(o => {
            const dx = Math.abs(o.position.x - obj.position.x);
            const dz = Math.abs(o.position.z - obj.position.z);
            return dx <= 3*gs.x && dz <= 3*gs.z;
        });
    }
}

// Helper: choose grid-based wander target
function chooseGridWanderTarget(obj, data) {
    if (!data.currentGrid) return pickWanderTarget(obj.position, data.aiConfig.wanderDistance, data.worldBounds);
    const { currentGrid, gridSize, worldBounds, nearbyStatics } = data;
    const deltas = [-1,0,1];
    let minCount = Infinity, cells = [];
    deltas.forEach(dx => deltas.forEach(dz => {
        const gx = currentGrid.x + dx, gz = currentGrid.z + dz;
        if (gx < 0 || gz < 0) return;
        const x = THREE.MathUtils.clamp(worldBounds.minX + gx*gridSize.x + gridSize.x/2, worldBounds.minX, worldBounds.maxX);
        const z = THREE.MathUtils.clamp(worldBounds.minZ + gz*gridSize.z + gridSize.z/2, worldBounds.minZ, worldBounds.maxZ);
        const count = nearbyStatics.filter(o => {
            const ogx = Math.floor((o.position.x - worldBounds.minX)/gridSize.x);
            const ogz = Math.floor((o.position.z - worldBounds.minZ)/gridSize.z);
            return ogx === gx && ogz === gz;
        }).length;
        if (count < minCount) { minCount = count; cells = [{x,z}]; }
        else if (count === minCount) cells.push({x,z});
    }));
    if (cells.length === 0) return pickWanderTarget(obj.position, data.aiConfig.wanderDistance, data.worldBounds);
    const pick = cells[Math.floor(Math.random()*cells.length)];
    return new THREE.Vector3(pick.x, obj.position.y, pick.z);
}
