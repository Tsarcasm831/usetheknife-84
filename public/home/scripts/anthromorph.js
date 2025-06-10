import * as THREE from 'three';
import { loadModel } from './world/modelLoader.js';
import config from '../config.js';
import { checkCollision, createObjectBoundingBox } from './world/collision.js';

const tempVec = new THREE.Vector3();
const targetQuat = new THREE.Quaternion();
const forward = new THREE.Vector3(0, 0, 1);
const yAxis = new THREE.Vector3(0, 1, 0);

/**
 * Loads all animation GLBs for Anthromorph and attaches them as actions.
 * @param {THREE.Scene} scene
 * @param {Object} animPaths - Map of animation type to GLB path
 * @param {function(number):void} [onProgress]
 * @returns {Promise<THREE.Object3D>}
 */
export async function createAnthromorph(scene, animPaths, onProgress) {
    const loader = { load: loadModel };
    const actions = {};
    let baseObj = null;
    for (const [anim, path] of Object.entries(animPaths)) {
        try {
            const gltf = await loader.load(path, onProgress);
            if (!baseObj) {
                baseObj = gltf.scene;
                baseObj.name = 'Anthromorph';
                scene.add(baseObj);
            }
            if (gltf.animations && gltf.animations.length > 0) {
                actions[anim] = gltf.animations[0];
            }
        } catch (e) {
            console.warn(`Anthromorph: Failed to load animation ${anim} from ${path}`);
        }
    }
    if (baseObj) {
        baseObj.userData.actions = actions;
        // Setup mixer and animation actions
        const mixer = actions.idle ? new THREE.AnimationMixer(baseObj) : null;
        baseObj.userData.mixer = mixer;
        let idleAction = null, walkAction = null;
        if (mixer) {
            if (actions.idle) {
                idleAction = mixer.clipAction(actions.idle);
                idleAction.play();
                baseObj.userData.currentAction = idleAction;
                baseObj.userData.idleAction = idleAction;
            }
            if (actions.walk) {
                walkAction = mixer.clipAction(actions.walk);
                baseObj.userData.walkAction = walkAction;
            }
        }
        // Patrol configuration based on desired grid coords
        const { grid, world } = config;
        const fullDivX = grid.divisions * world.numChunks.x;
        const fullDivZ = grid.divisions * world.numChunks.z;
        const cellSizeX = world.chunkSize.x / grid.divisions;
        const cellSizeZ = world.chunkSize.z / grid.divisions;
        // User wants patrol between (85,95) and (85,65)
        const gridPoints = [ { x: 85, z: 95 }, { x: 85, z: 65 } ];
        const patrolPoints = gridPoints.map(p => new THREE.Vector3(
            (p.x - fullDivX / 2) * cellSizeX,
            baseObj.position.y,
            (p.z - fullDivZ / 2) * cellSizeZ
        ));
        // Initialize position and patrol progress
        baseObj.userData.patrolPoints = patrolPoints;
        baseObj.userData.speed = 1.0;
        baseObj.userData.turnSpeed = 0.1;
        // Linear progress tracker (0 to 1) and direction (1 forward, -1 backward)
        baseObj.userData.progress = 0;
        baseObj.userData.direction = 1;
        // Pre-calculate segment length for interpolation
        baseObj.userData.segmentLength = patrolPoints[0].distanceTo(patrolPoints[1]);
        // Start at first point
        baseObj.position.copy(patrolPoints[0]);
        // Enable collision with player
        baseObj.userData.collidable = true;
        // Pre-calculate bounding box size for collision
        const tempBox = new THREE.Box3().setFromObject(baseObj, true);
        const sizeVec = new THREE.Vector3();
        tempBox.getSize(sizeVec);
        baseObj.userData.boundingBoxSize = { x: sizeVec.x, y: sizeVec.y, z: sizeVec.z };
    }
    return baseObj;
}

// Patrol behavior similar to Tal'Ehn
export function updateAnthromorph(obj, deltaTime, collidables, scene) {
    if (!obj || deltaTime <= 0 || !obj.userData) return;
    const data = obj.userData;
    if (data.mixer) data.mixer.update(deltaTime);
    // Determine target
    const start = data.patrolPoints[0];
    const end = data.patrolPoints[1];
    let segmentVec = new THREE.Vector3().subVectors(end, start);
    segmentVec.multiplyScalar(data.direction); // Ensure facing matches movement direction
    const progress = data.progress + (data.direction * data.speed * deltaTime / data.segmentLength);
    data.progress = progress;
    if (progress >= 1) {
        data.progress = 1;
        data.direction = -1;
    } else if (progress <= 0) {
        data.progress = 0;
        data.direction = 1;
    }
    const interpolatedPos = new THREE.Vector3().lerpVectors(start, end, data.progress);
    obj.position.copy(interpolatedPos);
    obj.updateMatrixWorld();
    // Handle animations
    const moving = data.progress > 0 && data.progress < 1;
    if (moving && data.walkAction) {
        if (!data.isWalking) {
            data.isWalking = true;
            data.walkAction.reset().play();
            if (data.idleAction) data.idleAction.stop();
        }
    } else if (!moving && data.isWalking) {
        data.isWalking = false;
        if (data.idleAction) data.idleAction.reset().play();
        if (data.walkAction.stop) data.walkAction.stop();
    }
    // Rotate toward movement
    segmentVec.normalize();
    if (forward.dot(segmentVec) > -0.9999) {
        targetQuat.setFromUnitVectors(forward, segmentVec);
    } else {
        targetQuat.setFromAxisAngle(yAxis, Math.PI);
    }
    obj.quaternion.slerp(targetQuat, data.turnSpeed);
    // Align vertical position to road height
    const halfHeight = obj.userData.boundingBoxSize.y / 2;
    const roadHeight = config.road.thickness / 2 + 0.01;
    obj.position.y = roadHeight + halfHeight;
}
