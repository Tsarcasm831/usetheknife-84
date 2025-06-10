import * as THREE from 'three';
import { loadModel } from './world/modelLoader.js';
import { checkCollision, createObjectBoundingBox } from './world/collision.js';

// Temp objects
const tempVec = new THREE.Vector3();
const targetQuat = new THREE.Quaternion();
// Forward axis aligned with world Z+ for NPC facing
const forward = new THREE.Vector3(0, 0, 1);
const yAxis = new THREE.Vector3(0, 1, 0);

/**
 * Creates the Tal'Ehn NPC and its patrol points.
 */
export async function createTalEhn(scene, spawnConfig, worldConfig, gridConfig) {
    // Debug: ensure both idle and walk paths are present
    console.log('[TalEhn Loader] idle model:', spawnConfig.modelPath, 'walk model:', spawnConfig.walkModelPath);
    
    try {
        // Load both models in parallel
        const [idleGltf, walkGltf] = await Promise.all([
            loadModel(spawnConfig.modelPath),
            loadModel(spawnConfig.walkModelPath)
        ]);
        
        if (!idleGltf || !walkGltf) {
            throw new Error('Failed to load one or more TalEhn models');
        }
        
        // Create the Tal'Ehn object
        const obj = idleGltf.scene;
        // Compute cell sizes
        const divisions = gridConfig.divisions;
        const cellSizeX = worldConfig.chunkSize.x / divisions;
        const cellSizeZ = worldConfig.chunkSize.z / divisions;
        
        // Position the object
        if (spawnConfig.position) {
            obj.position.set(
                spawnConfig.position.x,
                spawnConfig.position.y + spawnConfig.yOffset,
                spawnConfig.position.z
            );
        } else {
            const sx = (spawnConfig.gridPosition.x - divisions/2) * cellSizeX;
            const sz = (spawnConfig.gridPosition.z - divisions/2) * cellSizeZ;
            obj.position.set(sx, spawnConfig.yOffset, sz);
        }
        
        obj.scale.set(spawnConfig.scale.x, spawnConfig.scale.y, spawnConfig.scale.z);
        obj.name = "TalEhn";
        
        // Combine animations
        const animations = [
            ...(idleGltf.animations || []),
            ...(walkGltf.animations || [])
        ];
        
        const mixer = new THREE.AnimationMixer(obj);
        const idleClip = animations.find(c => /Idle/i.test(c.name));
        const walkClip = animations.find(c => /Walk/i.test(c.name));
        const idleAction = idleClip ? mixer.clipAction(idleClip) : null;
        const walkAction = walkClip ? mixer.clipAction(walkClip) : null;
        
        if (idleAction) idleAction.play();
        
        // Build patrol points
        const patrolPoints = spawnConfig.patrolGridPoints.map(p => {
            const dx = (p.x - (spawnConfig.gridPosition.x||0)) * cellSizeX;
            const dz = (p.z - (spawnConfig.gridPosition.z||0)) * cellSizeZ;
            return new THREE.Vector3(
                obj.position.x + dx,
                spawnConfig.yOffset,
                obj.position.z + dz
            );
        });
        
        obj.userData = {
            collidable: spawnConfig.collidable,
            state: 'patrolling',
            patrolPoints,
            targetIndex: 1,
            speed: spawnConfig.speed,
            turnSpeed: spawnConfig.turnSpeed,
            mixer, 
            idleAction, 
            walkAction,
            isWalking: false
        };
        
        obj.traverse(n => {
            if (n.isMesh) {
                n.castShadow = true;
                n.receiveShadow = false;
            }
        });
        
        scene.add(obj);
        return obj;

    } catch (error) {
        console.error('Error loading TalEhn:', error);
        throw error;
    }
}

/**
 * Updates Tal'Ehn movement along its patrol path.
 */
export function updateTalEhn(obj, deltaTime, allCollidables, scene) {
    if (!obj || deltaTime <= 0 || !obj.userData) return;
    // update animations
    const data = obj.userData;
    if (data.mixer) data.mixer.update(deltaTime);
    // If paused (e.g., dialogue open), halt movement and animations
    if (data.paused) {
        // Reset walking flag so animation can restart after pause
        data.isWalking = false;
        if (data.walkAction) data.walkAction.stop();
        if (data.idleAction) data.idleAction.reset().play();
        return;
    }
    // Direction to current target
    const target = data.patrolPoints[data.targetIndex];
    tempVec.subVectors(target, obj.position);
    tempVec.y = 0;
    const dist = tempVec.length();
    const moveStep = data.speed * deltaTime;
    // Arrival: clamp when next movement step overshoots
    if (dist <= moveStep) {
        obj.position.copy(target);
        obj.updateMatrixWorld();
        data.targetIndex = 1 - data.targetIndex;
        return;
    }
    // play walk or idle animation
    const moving = tempVec.lengthSq() > 1e-6;
    if (moving && data.walkAction) {
        if (!data.isWalking) {
            data.isWalking = true;
            data.walkAction.reset().play();
            if (data.idleAction) data.idleAction.stop();
        }
    } else if (!moving && data.isWalking) {
        data.isWalking = false;
        if (data.idleAction) data.idleAction.reset().play();
        data.walkAction.stop && data.walkAction.stop();
    }
    tempVec.normalize();
    // Rotate toward direction
    if (forward.dot(tempVec) > -0.9999) {
        targetQuat.setFromUnitVectors(forward, tempVec);
    } else {
        targetQuat.setFromAxisAngle(yAxis, Math.PI);
    }
    obj.quaternion.slerp(targetQuat, data.turnSpeed);
    // Attempt movement
    const nextPos = obj.position.clone().add(tempVec.clone().multiplyScalar(moveStep));
    // Skip collision and always move
    obj.position.copy(nextPos);
    obj.updateMatrixWorld();
}
