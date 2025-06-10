import * as THREE from 'three';
import { loadModel } from './world/modelLoader.js';
import config from '../config.js';
import { checkCollision, createObjectBoundingBox } from './world/collision.js';

/**
 * Creates the Ranger model and adds it to the scene.
 * @param {THREE.Scene} scene
 * @param {string} modelPath - URL to the GLB file.
 * @param {function(number):void} [onProgress]
 * @returns {Promise<THREE.Object3D>}
 */
/**
 * Loads all animation GLBs for Ranger and attaches them as actions.
 * @param {THREE.Scene} scene
 * @param {Object} animPaths - Map of animation type to GLB path
 * @param {function(number):void} [onProgress]
 * @returns {Promise<THREE.Object3D>}
 */
export async function createRanger(scene, animPaths, onProgress) {
    const loader = { load: loadModel };
    const actions = {};
    let baseObj = null;
    for (const [anim, path] of Object.entries(animPaths)) {
        try {
            const gltf = await loader.load(path, onProgress);
            if (!baseObj) {
                baseObj = gltf.scene;
                baseObj.name = 'Ranger';
                scene.add(baseObj);
            }
            if (gltf.animations && gltf.animations.length > 0) {
                actions[anim] = gltf.animations[0];
            }
        } catch (e) {
            console.warn(`Ranger: Failed to load animation ${anim} from ${path}`);
        }
    }
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
        // == AI state init ==
        const totalX = config.world.chunkSize.x * config.world.numChunks.x;
        const totalZ = config.world.chunkSize.z * config.world.numChunks.z;
        const worldBounds = { minX: -totalX/2, maxX: totalX/2, minZ: -totalZ/2, maxZ: totalZ/2 };
        const aiConfig = {
            speed: 1.5,
            wanderDistance: 10,   // shorter roam radius
            minWait: 0.2,          // shorter idle wait
            maxWait: 0.6,          // shorter idle wait max
            arrivalThreshold: 0.3, // tighter arrival
            turnSpeed: 0.1,
            idleScanRadius: 3,
            scanSamples: 12
        };
        // Calculate current grid position
        const gridX = Math.floor((baseObj.position.x - worldBounds.minX) / config.world.chunkSize.x);
        const gridZ = Math.floor((baseObj.position.z - worldBounds.minZ) / config.world.chunkSize.z);
        
        Object.assign(baseObj.userData, {
            state: 'wandering',
            wanderTarget: pickWanderTarget(baseObj.position, aiConfig.wanderDistance, worldBounds),
            wanderWaitTimer: 0,
            aiConfig,
            worldBounds,
            gridSize: { x: config.world.chunkSize.x, z: config.world.chunkSize.z },
            currentGrid: { x: gridX, z: gridZ },  // Add current grid position
            nearbyStatics: [],  // Initialize empty array for nearby static objects
            bounceTimer: 0,
            bounceDirection: new THREE.Vector3(),
            // --- Brain Extension ---
            memory: {
                sensory: [],
                shortTerm: [],
                midTerm: [],
                longTerm: [],
                external: []
            },
            emotion: {
                trust: 0.5,
                fear: 0.2,
                aggression: 0.1
            },
            currentThought: null,
            thoughtExpireTime: 0
        });
        console.log('Ranger spawned with target', baseObj.userData.wanderTarget);
    }
    return baseObj;
}

// Helper: pick a random point within bounds
function pickWanderTarget(currentPosition, maxDistance, worldBounds) {
    const target = new THREE.Vector3();
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * maxDistance;
    target.x = THREE.MathUtils.clamp(currentPosition.x + Math.cos(angle) * dist, worldBounds.minX, worldBounds.maxX);
    target.z = THREE.MathUtils.clamp(currentPosition.z + Math.sin(angle) * dist, worldBounds.minZ, worldBounds.maxZ);
    target.y = currentPosition.y;
    return target;
}

// Helper: scan nearby free spots
function scanFreeSpots(obj, radius, collidableObjects, scene, samples=12) {
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

// Helper: choose a grid wander target
function chooseGridWanderTarget(obj, data) {
    const gridSize = data.gridSize;
    const worldBounds = data.worldBounds;
    const currentGrid = data.currentGrid;
    const nearbyStatics = data.nearbyStatics;
    const targetGrid = {
        x: currentGrid.x + Math.floor(Math.random() * 3) - 1,
        z: currentGrid.z + Math.floor(Math.random() * 3) - 1
    };
    const targetX = worldBounds.minX + targetGrid.x * gridSize.x;
    const targetZ = worldBounds.minZ + targetGrid.z * gridSize.z;
    const target = new THREE.Vector3(targetX, obj.position.y, targetZ);
    return target;
}

/**
 * Update stub for Ranger.
 * @param {THREE.Object3D} obj
 * @param {number} deltaTime
 * @param {Array<THREE.Object3D>} collidableObjects
 * @param {THREE.Scene} scene
 */
// --- Memory Decay Utility ---
function decayMemory(memoryArray) {
    const now = performance.now();
    return memoryArray.filter(m => !m.expiresIn || (now - m.createdAt) < m.expiresIn);
}

// --- Sensory Recording Example ---
function recordSight(obj, what, location) {
    if (!obj.userData.memory) return;
    obj.userData.memory.sensory.push({
        type: 'sight',
        what,
        location: location ? [location.x, location.y, location.z] : [obj.position.x, obj.position.y, obj.position.z],
        time: performance.now()
    });
}

// --- Short-Term Memory Recording ---
function recordShortTerm(obj, what, detail, duration = 5000) {
    if (!obj.userData.memory) return;
    obj.userData.memory.shortTerm.push({
        what,
        detail,
        expiresIn: duration,
        createdAt: performance.now()
    });
}

// --- Thought Update Utility ---
function updateThoughts(obj) {
    const data = obj.userData;
    const now = performance.now();
    // Expire current thought
    if (data.currentThought && now > data.thoughtExpireTime) {
        data.currentThought = null;
    }
    // Assign a new thought based on memory/emotion/state/random
    if (!data.currentThought) {
        if (data.emotion && data.emotion.fear > 0.7) {
            data.currentThought = "I need to run!";
        } else if (data.memory && data.memory.shortTerm.some(m => m.what === 'helped')) {
            data.currentThought = "Maybe I can trust them...";
        } else if (data.state === 'wandering' && Math.random() < 0.01) {
            data.currentThought = "Same junk, different day.";
        }
        if (data.currentThought) {
            data.thoughtExpireTime = now + 3000; // 3 seconds
        }
    }
}

// --- Memory → Emotion Engine ---
function processEmotions(obj) {
    const mem = obj.userData.memory;
    const emo = obj.userData.emotion;
    if (!mem || !emo) return;
    for (const m of mem.shortTerm) {
        if (m.what === 'helped') emo.trust += 0.01;
        if (m.what === 'attacked') {
            emo.trust -= 0.02;
            emo.fear += 0.01;
        }
    }
    // Clamp values
    emo.trust = THREE.MathUtils.clamp(emo.trust, 0, 1);
    emo.fear = THREE.MathUtils.clamp(emo.fear, 0, 1);
}

export function updateRanger(obj, deltaTime, collidableObjects, scene) {
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
        current?.fadeOut(0.2);
        nextAction?.reset().fadeIn(0.2).play();
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
