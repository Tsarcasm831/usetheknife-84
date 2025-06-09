import * as THREE from 'three';
import { createLoader } from '../loaderFactory.js';
import { checkCollision, createObjectBoundingBox } from './collision.js'; // Import collision functions

// Reusable THREE objects to avoid allocations in the loop
const tempBox = new THREE.Box3();
const sizeVec = new THREE.Vector3();
const nextPosition = new THREE.Vector3();
const direction = new THREE.Vector3(); // Used for wander direction
const fleeDirection = new THREE.Vector3(); // Used for flee direction
const targetQuaternion = new THREE.Quaternion(); // Used for rotation
const modelForward = new THREE.Vector3(0, 0, 1); // Model's forward along +Z
const yAxis = new THREE.Vector3(0, 1, 0); // Define Y axis for rotation

// Helper to pick a random wander target within world bounds
function pickWanderTarget(currentPosition, maxDistance, worldBounds) {
    const target = new THREE.Vector3();
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * maxDistance;

    target.x = currentPosition.x + Math.cos(angle) * distance;
    target.z = currentPosition.z + Math.sin(angle) * distance;

    // Clamp target within world bounds
    target.x = Math.max(worldBounds.minX, Math.min(worldBounds.maxX, target.x));
    target.z = Math.max(worldBounds.minZ, Math.min(worldBounds.maxZ, target.z));

    // Keep Y position consistent (usually ground level + offset)
    target.y = currentPosition.y;

    return target;
}

export function createRadChicken(scene, spawnConfig, worldConfig, gridConfig) {
    const loader = createLoader();

    return new Promise((resolve, reject) => {
        loader.load(
            spawnConfig.modelPath,
            (gltf) => {
                const chicken = gltf.scene;
                chicken.position.set(spawnConfig.position.x, spawnConfig.position.y, spawnConfig.position.z);
                chicken.scale.set(spawnConfig.scale.x, spawnConfig.scale.y, spawnConfig.scale.z);
                chicken.name = "RadChicken"; // Give it a name for debugging

                // Setup animation mixer and actions
                const mixer = new THREE.AnimationMixer(chicken);
                const actions = {};
                // Idle from initial model
                if (gltf.animations && gltf.animations.length > 0) {
                    actions.idle = mixer.clipAction(gltf.animations[0]);
                    actions.idle.play();
                }
                // Walking animation
                if (spawnConfig.walkingModelPath) {
                    loader.load(spawnConfig.walkingModelPath, (gltfWalk) => {
                        if (gltfWalk.animations && gltfWalk.animations.length > 0) {
                            actions.walk = mixer.clipAction(gltfWalk.animations[0]);
                        }
                    });
                }
                // Alert animation
                if (spawnConfig.alertModelPath) {
                    loader.load(spawnConfig.alertModelPath, (gltfAlert) => {
                        if (gltfAlert.animations && gltfAlert.animations.length > 0) {
                            actions.alert = mixer.clipAction(gltfAlert.animations[0]);
                        }
                    });
                }

                let calculatedSize = { x: 0.5, y: 0.5, z: 0.5 }; // Default size

                // --- Calculate and store bounding box size on load ---
                try {
                    chicken.updateMatrixWorld(true); // Ensure matrices are updated
                    tempBox.setFromObject(chicken, true); // Calculate AABB
                    if (!tempBox.isEmpty()) {
                        tempBox.getSize(sizeVec);
                        calculatedSize = { x: sizeVec.x, y: sizeVec.y, z: sizeVec.z };
                        // Ensure size components are not zero or negative
                        calculatedSize.x = Math.max(0.1, calculatedSize.x);
                        calculatedSize.y = Math.max(0.1, calculatedSize.y);
                        calculatedSize.z = Math.max(0.1, calculatedSize.z);
                    } else {
                        console.warn("Could not calculate RadChicken bounding box on load, using default size.");
                    }
                } catch (e) {
                    console.error("Error calculating RadChicken bounding box:", e);
                    // Keep default size
                }

                // Enable shadows for all meshes within the loaded model
                chicken.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = false; // Chickens probably don't receive shadows onto themselves much
                    }
                });

                // --- Initialize AI state ---
                const totalWorldSizeX = worldConfig.chunkSize.x * worldConfig.numChunks.x;
                const totalWorldSizeZ = worldConfig.chunkSize.z * worldConfig.numChunks.z;
                const worldBounds = {
                    minX: -totalWorldSizeX / 2, maxX: totalWorldSizeX / 2,
                    minZ: -totalWorldSizeZ / 2, maxZ: totalWorldSizeZ / 2
                };

                const divisions = gridConfig?.divisions || 50; // Fallback
                const chunkSizeX = worldConfig?.chunkSize?.x || 72; // Use new default or fallback
                const chunkSizeZ = worldConfig?.chunkSize?.z || 72; // Use new default or fallback
                const cellSizeX = chunkSizeX / divisions;
                const cellSizeZ = chunkSizeZ / divisions;
                const gridCellSize = Math.max(cellSizeX, cellSizeZ); // Use largest cell dimension
                const fleeDistanceWorld = gridCellSize * spawnConfig.fleeDistanceGridCells;

                // Clamp wander and wait parameters for responsiveness
                spawnConfig.wanderTargetDistance = Math.min(spawnConfig.wanderTargetDistance, 10);
                spawnConfig.minWanderWaitTime = 0.2;
                spawnConfig.maxWanderWaitTime = 0.6;

                // Store essential data in userData for access in the update loop
                chicken.userData = {
                    collidable: spawnConfig.collidable,
                    isRadChicken: true,
                    boundingBoxSize: calculatedSize, // Store calculated or default size
                    state: 'wandering',              // Initial state
                    wanderTarget: pickWanderTarget(chicken.position, spawnConfig.wanderTargetDistance, worldBounds),
                    wanderWaitTimer: Math.random() * (spawnConfig.maxWanderWaitTime - spawnConfig.minWanderWaitTime) + spawnConfig.minWanderWaitTime,
                    worldBounds: worldBounds,        // Store world boundaries
                    config: spawnConfig,             // Store its own configuration
                    fleeDistanceSq: fleeDistanceWorld * fleeDistanceWorld, // Squared distance for efficiency
                    turnSpeed: spawnConfig.turnSpeed || 0.15, // Use config value or default
                    // Animation data
                    mixer: mixer,
                    actions: actions,
                    currentAction: actions.idle,
                    waiting: false
                };
                // --- End AI state init ---

                scene.add(chicken);
                resolve(chicken); // Resolve the promise with the loaded chicken object
            },
            undefined, // Progress callback (optional)
            (error) => {
                console.error(`Error loading GLB: ${spawnConfig.modelPath}`, error);
                reject(error); // Reject the promise on error
            }
        );
    });
}

/**
 * Updates the chicken's state, position, rotation, and handles collisions.
 * @param {THREE.Object3D} chicken - The chicken object.
 * @param {THREE.Object3D} player - The player object.
 * @param {number} deltaTime - Time since last frame in seconds.
 * @param {Array<THREE.Object3D>} allCollidables - ALL collidable objects in the scene.
 * @param {THREE.Scene} scene - The scene object.
 */
export function updateRadChicken(chicken, player, deltaTime, allCollidables, scene) {
    // --- Guard Clauses ---
    if (!chicken || !player || !chicken.userData || !chicken.userData.config) {
        return;
    }
    if (deltaTime <= 0) return; // Avoid division by zero or weird behavior with zero/negative delta

    const data = chicken.userData;
    const config = data.config;
    const currentPos = chicken.position;
    const playerPos = player.position;
    const turnSpeed = data.turnSpeed; // Get turn speed from userData

    // advance animations
    if (data.mixer) data.mixer.update(deltaTime);

    // --- State Determination ---
    const distanceSqToPlayer = currentPos.distanceToSquared(playerPos);

    if (distanceSqToPlayer < data.fleeDistanceSq) {
        if (data.state !== 'fleeing') {
            data.state = 'fleeing';
        }
    } else {
        if (data.state === 'fleeing') {
            data.state = 'wandering';
            data.wanderTarget = pickWanderTarget(currentPos, config.wanderTargetDistance, data.worldBounds);
            data.wanderWaitTimer = config.minWanderWaitTime;
        }
    }

    // --- Movement Calculation ---
    let speed = config.speed;
    let moveVec = direction.set(0, 0, 0); 

    if (data.state === 'fleeing') {
        speed *= config.fleeSpeedMultiplier; 

        fleeDirection.subVectors(currentPos, playerPos);
        fleeDirection.y = 0; 

        if (fleeDirection.lengthSq() > 1e-6) { 
            fleeDirection.normalize();
            moveVec.copy(fleeDirection);
        } else {
            const randomAngle = Math.random() * Math.PI * 2;
            moveVec.set(Math.cos(randomAngle), 0, Math.sin(randomAngle)).normalize();
        }

    } else { 
        // Wandering with pause at target
        const distSq = currentPos.distanceToSquared(data.wanderTarget);
        const thresholdSq = config.arrivalThreshold * config.arrivalThreshold;
        if (distSq < thresholdSq) {
            // initiate wait
            if (!data.waiting) {
                data.waiting = true;
                data.wanderWaitTimer = Math.random() * (config.maxWanderWaitTime - config.minWanderWaitTime) + config.minWanderWaitTime;
            }
            data.wanderWaitTimer -= deltaTime;
            moveVec.set(0, 0, 0);
            // pick new target after wait
            if (data.wanderWaitTimer <= 0) {
                data.waiting = false;
                data.wanderTarget = pickWanderTarget(currentPos, config.wanderTargetDistance, data.worldBounds);
                data.wanderWaitTimer = Math.random() * (config.maxWanderWaitTime - config.minWanderWaitTime) + config.minWanderWaitTime;
            }
        } else {
            data.waiting = false;
            direction.subVectors(data.wanderTarget, currentPos);
            direction.y = 0;
            if (direction.lengthSq() > 1e-6) {
                direction.normalize();
                moveVec.copy(direction);
            } else {
                moveVec.set(0, 0, 0);
            }
        }
    }

    // --- Animation state switch ---
    if (data.actions) {
        const moving = moveVec.lengthSq() > 1e-7;
        console.log(`RadChicken moving=${moving} state=${data.state}`);
        let actionName = 'idle';
        if (moving) actionName = 'walk';
        else if (data.state === 'wandering' && !moving) actionName = 'alert';
        const newAction = data.actions[actionName];
        if (newAction && data.currentAction !== newAction) {
            console.log(`RadChicken switching to ${actionName}`);
            data.currentAction && data.currentAction.fadeOut(0.2);
            newAction.reset().fadeIn(0.2).play();
            data.currentAction = newAction;
        }
    }

    // --- Apply Movement and Collision Check ---
    const moveAmount = speed * deltaTime;
    const actualMoveX = moveVec.x * moveAmount;
    const actualMoveZ = moveVec.z * moveAmount;

    if (moveVec.lengthSq() < 1e-7) { 
        currentPos.y = config.yOffset;
        chicken.updateMatrixWorld(); 
        return;
    }

    const chickenCollidables = allCollidables.filter(obj => !obj.getObjectById(chicken.id)); 

    const originalPosition = currentPos.clone(); 
    nextPosition.copy(currentPos); 

    nextPosition.x += actualMoveX;
    let chickenBoxX = createObjectBoundingBox(chicken, nextPosition); 
    if (!checkCollision(chickenBoxX, chickenCollidables, scene)) {
        currentPos.x = nextPosition.x;
    } else {
        nextPosition.x = originalPosition.x;
    }

    nextPosition.z += actualMoveZ;
    let chickenBoxZ = createObjectBoundingBox(chicken, nextPosition); 
    if (!checkCollision(chickenBoxZ, chickenCollidables, scene)) {
        currentPos.z = nextPosition.z;
    } else {
    }

    currentPos.x = Math.max(data.worldBounds.minX, Math.min(data.worldBounds.maxX, currentPos.x));
    currentPos.z = Math.max(data.worldBounds.minZ, Math.min(data.worldBounds.maxZ, currentPos.z));

    currentPos.y = config.yOffset;

    const finalMove = direction.subVectors(currentPos, originalPosition);
    finalMove.y = 0; 

    if (finalMove.lengthSq() > 1e-8) { 
        finalMove.normalize();

        if (modelForward.dot(finalMove) > -0.9999) { 
            targetQuaternion.setFromUnitVectors(modelForward, finalMove);
        } else {
            targetQuaternion.setFromAxisAngle(yAxis, Math.PI);
        }

        chicken.quaternion.slerp(targetQuaternion, turnSpeed); 
    }

    chicken.updateMatrixWorld();
}