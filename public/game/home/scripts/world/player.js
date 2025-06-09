import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { loadModel } from './modelLoader.js'; // Use shared loader for status tracking
import { checkCollision, createPlayerBoundingBox } from './collision.js';
import { getMovementVector, keys } from '../../controls.js';
import config from '../../config.js'; // Import config

/**
 * Creates the player object.
 * @param {THREE.Scene} scene - The scene to add the player to.
 * @param {object} config - The main configuration object.
 * @param {object} totalWorldSize - Calculated total size {x, z} of the world.
 * @returns {THREE.Group} The player group object.
 */
export async function createPlayer(scene, config, totalWorldSize) {
    const playerConfig = config.player;
    const playerSize = playerConfig.size; // Use config size for collision box
    const playerGroup = new THREE.Group(); // Use a group to hold the model and manage position/rotation

    // Initial spawn position: use config override if provided
    const roadHeight = config.road.thickness / 2 + 0.01;
    if (playerConfig.position) {
        // Absolute world position override
        playerGroup.position.set(
            playerConfig.position.x,
            roadHeight + playerSize.y / 2,
            playerConfig.position.z
        );
    } else if (playerConfig.gridPosition) {
        // Grid index to world position
        const divisions = config.grid.divisions;
        const chunkSizeX = config.world.chunkSize.x;
        const chunkSizeZ = config.world.chunkSize.z;
        const fullDivX = divisions * config.world.numChunks.x;
        const fullDivZ = divisions * config.world.numChunks.z;
        const cellSizeX = chunkSizeX / divisions;
        const cellSizeZ = chunkSizeZ / divisions;
        const worldX = (playerConfig.gridPosition.x - fullDivX / 2) * cellSizeX;
        const worldZ = (playerConfig.gridPosition.z - fullDivZ / 2) * cellSizeZ;
        playerGroup.position.set(worldX, roadHeight + playerSize.y / 2, worldZ);
    } else {
        // Default: centered on X, slightly south on Z
        playerGroup.position.set(
            0,
            roadHeight + playerSize.y / 2,
            totalWorldSize.z * 0.1
        );
    }
    playerGroup.name = "Player";
    playerGroup.userData = {
        // Store size directly on userData for easier access in collision checks if needed elsewhere
        size: playerSize,
        // Store world boundaries calculated from total size
        mixer: null, // Animation mixer
        animations: {}, // Store animations by name (e.g., 'idle', 'walk')
        activeAction: null, // Currently playing animation action
        // Add a small buffer based on player size to prevent clipping through edges
        boundaries: {
            minX: -totalWorldSize.x / 2 + playerSize.x / 2,
            maxX: totalWorldSize.x / 2 - playerSize.x / 2,
            minZ: -totalWorldSize.z / 2 + playerSize.z / 2,
            maxZ: totalWorldSize.z / 2 - playerSize.z / 2,
        },
        isUnderground: false, // Initialize underground flag
    };
    scene.add(playerGroup);

    try {
        // --- Load the main model (Idle) ---
        const gltf = await loadModel(playerConfig.idleGltfPath);
        const model = gltf.scene;
        model.scale.setScalar(playerConfig.modelScale);
        model.position.y = playerConfig.modelYOffset; // Apply offset
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true; // Model can receive shadows
            }
        });
        playerGroup.add(model); // Add model to the group

        // --- Setup Animation Mixer ---
        const mixer = new THREE.AnimationMixer(model);
        playerGroup.userData.mixer = mixer;

        // Store the idle animation from the loaded GLTF
        if (gltf.animations.length > 0) {
            const idleAction = mixer.clipAction(gltf.animations[0]);
            playerGroup.userData.animations['idle'] = idleAction;
            playerGroup.userData.activeAction = idleAction; // Start with idle
            idleAction.play();
        } else {
            console.warn(`GLTF ${playerConfig.idleGltfPath} contains no animations.`);
        }

        // --- Load other animations (Walk, Run) ---
        // Assume Walk is index 0 in its file, Run is index 0 in its file
        const walkGltf = await loadModel(playerConfig.walkGltfPath);
        if(walkGltf.animations.length > 0) {
            playerGroup.userData.animations['walk'] = mixer.clipAction(walkGltf.animations[0]);
        } else {
            console.warn(`GLTF ${playerConfig.walkGltfPath} contains no animations.`);
        }

        // Load run animation
        const runGltf = await loadModel(playerConfig.runGltfPath);
        if (runGltf.animations.length > 0) {
            playerGroup.userData.animations['run'] = mixer.clipAction(runGltf.animations[0]);
        } else {
            console.warn(`GLTF ${playerConfig.runGltfPath} contains no animations.`);
        }

    } catch (error) {
        console.error("Error loading player GLTF:", error);
        // Optionally add a fallback cube if loading fails
        const fallbackGeometry = new THREE.BoxGeometry(playerSize.x, playerSize.y, playerSize.z);
        const fallbackMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Red error cube
        const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
        fallbackMesh.position.y = playerSize.y / 2; // Position based on collision size
        playerGroup.add(fallbackMesh); // Add fallback to the group
    }

    console.log("Player created at:", playerGroup.position, "World Size:", totalWorldSize);
    console.log("Player boundaries:", playerGroup.userData.boundaries);
    return playerGroup; // Return the group
}

const targetQuaternion = new THREE.Quaternion();
const modelForward = new THREE.Vector3(0, 0, 1); // Assuming model's default forward is +Z
const yAxis = new THREE.Vector3(0, 1, 0);

/**
 * Updates the player's position based on input and checks for collisions.
 * Implements slide-on-collision behavior.
 * @param {THREE.Group} player - The player group object.
 * @param {number} deltaTime - Time elapsed since the last frame.
 * @param {Array<THREE.Object3D>} collidableObjects - Array of objects player can collide with.
 * @param {THREE.Scene} scene - The scene object.
 * @param {object} config - The main configuration object (needed for player speed).
 * @param {object} totalWorldSize - Calculated total size {x, z} of the world.
 */
export function updatePlayer(player, deltaTime, collidableObjects, scene, config, totalWorldSize) {
    if (!player || !player.userData || !player.userData.boundaries) {
        // console.warn("Player or player boundaries missing, skipping update.");
        return;
    }

    const playerConfig = config.player;
    const { moveX: baseMoveX, moveZ: baseMoveZ } = getMovementVector(); // Get base movement vector
    const isRunning = keys['ShiftLeft'] || keys['ShiftRight'];
    const speedMultiplier = isRunning ? config.player.runMultiplier : 1;
    const moveX = baseMoveX * speedMultiplier;
    const moveZ = baseMoveZ * speedMultiplier;
    const playerSize = player.userData.size;
    const boundaries = player.userData.boundaries; // Use stored boundaries
    const mixer = player.userData.mixer;
    const animations = player.userData.animations;
    let activeAction = player.userData.activeAction;

    // Calculate the displacement vector based on speed and deltaTime
    const displacement = new THREE.Vector3(moveX, 0, moveZ).multiplyScalar(deltaTime);

    // Proposed new position before collision checks
    const proposedPosition = player.position.clone().add(displacement);

    // World Boundary Collision Check
    proposedPosition.x = Math.max(boundaries.minX, Math.min(boundaries.maxX, proposedPosition.x));
    proposedPosition.z = Math.max(boundaries.minZ, Math.min(boundaries.maxZ, proposedPosition.z));

    // If the position was clamped, adjust the displacement vector
    displacement.subVectors(proposedPosition, player.position);

    // If there's no significant movement after boundary checks, return
    if (displacement.lengthSq() < 1e-9) {
        player.position.copy(proposedPosition); // Ensure final clamped position is set
        if (!player.userData.isUnderground) {
            // Align vertical position to road only if not underground
            const roadHeight = config.road.thickness / 2 + 0.01;
            player.position.y = roadHeight + playerSize.y / 2;
        }
        switchAnimation('idle', player, deltaTime); // Switch to idle if not moving
        if (mixer) mixer.update(deltaTime);
        return;
    }

    // --- Object Collision Check (Slide on Collision) ---
    const playerBox = createPlayerBoundingBox(player.position, playerSize);
    const playerCollidables = collidableObjects.filter(obj => obj !== player && obj.userData?.collidable !== false);

    const currentPosition = player.position.clone(); // Store position before movement attempts

    // --- Attempt movement along X axis ---
    const posX = currentPosition.clone();
    posX.x += displacement.x;
    const playerBoxX = createPlayerBoundingBox(posX, playerSize); // BBox at potential X position
    if (!checkCollision(playerBoxX, playerCollidables, scene)) {
        player.position.x = posX.x;
    } else {
        displacement.x = 0;
    }

    // --- Attempt movement along Z axis ---
    const posZ = player.position.clone();
    posZ.z += displacement.z;
    const playerBoxZ = createPlayerBoundingBox(posZ, playerSize); // BBox at potential Z position
    if (!checkCollision(playerBoxZ, playerCollidables, scene)) {
        player.position.z = posZ.z;
    }

    // --- Final Position Adjustment ---
    // Align vertical position to road
    if (!player.userData.isUnderground) {
        const roadHeight = config.road.thickness / 2 + 0.01;
        player.position.y = roadHeight + playerSize.y / 2;
    }

    // --- Rotation ---
    const finalMove = displacement.clone(); // Use the actual displacement after collision checks
    finalMove.y = 0; // Ignore vertical change for rotation calculation
    if (finalMove.lengthSq() > 1e-8) { // Only rotate if actually moved
        finalMove.normalize();
        if (modelForward.dot(finalMove) > -0.9999) { // Check if not pointing directly opposite
            targetQuaternion.setFromUnitVectors(modelForward, finalMove);
        } else {
            // If exactly opposite, rotate 180 degrees around the Y axis
            targetQuaternion.setFromAxisAngle(yAxis, Math.PI);
        }
        player.quaternion.slerp(targetQuaternion, 0.15); // Adjust 0.15 factor for desired turn speed
        switchAnimation(isRunning ? 'run' : 'walk', player, deltaTime);
    } else {
        switchAnimation('idle', player, deltaTime); // Switch to idle if stopped after collision
    }

    // --- Update Animation Mixer ---
    if (mixer) mixer.update(deltaTime);

    // Update player's world matrix after position changes
    player.updateMatrixWorld();
}

function switchAnimation(name, player, deltaTime) {
    const { animations, mixer, activeAction: currentAction } = player.userData;
    const nextAction = animations[name];
    const crossfadeDuration = config.player.animationCrossfadeDuration;

    if (nextAction && currentAction !== nextAction) {
        nextAction.reset();
        nextAction.timeScale = config.player.animationSpeedMultiplier; // Apply speed multiplier
        nextAction.play();
        if (currentAction) currentAction.crossFadeTo(nextAction, crossfadeDuration, true);
        player.userData.activeAction = nextAction;
    }
}