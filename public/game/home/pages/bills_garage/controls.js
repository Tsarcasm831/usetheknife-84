import * as THREE from 'three';
import { PointerLockControls } from 'three/controls/PointerLockControls.js';

export function setupControls(world) {
    const { camera, scene } = world;
    // Corrected constructor call
    const controls = new PointerLockControls(camera, document.body);

    const instructions = document.getElementById('instructions');

    // Add listeners to enable pointer lock on click
    instructions.addEventListener('click', () => {
        controls.lock();
    });

    controls.addEventListener('lock', () => {
        instructions.style.display = 'none';
        world.isPaused = false; // Unpause game when controls locked
    });

    controls.addEventListener('unlock', () => {
        instructions.style.display = 'flex'; // Changed to flex to re-center
        world.isPaused = true; // Pause game when controls unlocked (e.g., Esc pressed)
        // Reset movement keys on unlock to prevent unwanted sliding
        world.moveForward = false;
        world.moveBackward = false;
        world.moveLeft = false;
        world.moveRight = false;
    });

    scene.add(controls.getObject()); // Add the camera controller to the scene

    // Keydown/keyup event listeners
    const onKeyDown = (event) => {
        // Prevent movement handling if controls aren't locked
        if (!controls.isLocked) return;

        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                world.moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                world.moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                world.moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                world.moveRight = true;
                break;
        }
    };

    const onKeyUp = (event) => {
        // Key up events should always register to stop movement
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                world.moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                world.moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                world.moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                world.moveRight = false;
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return controls;
}

// --- Movement and Collision Logic ---

const movementSpeed = 5.0; // units per second
const damping = -10.0; // deceleration factor

// Helper function to check collision
function checkCollision(world) {
    const { playerCollider, colliders, controls } = world;
    if (!controls) return false; // Guard against checks before controls are initialized

    // Update playerCollider position based on camera position
    const currentPosition = controls.getObject().position;
    playerCollider.center.copy(currentPosition);
    playerCollider.center.y -= (world.playerHeight / 2);

    for (let i = 0; i < colliders.length; i++) {
        const collider = colliders[i];
        if (playerCollider.intersectsBox(collider)) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}

// Updated movement logic
export function updateMovement(world, delta) {
    const { velocity, direction, controls, camera } = world;

    // Apply damping (friction/air resistance)
    velocity.x += velocity.x * damping * delta;
    velocity.z += velocity.z * damping * delta;

    // Calculate movement direction based on input
    direction.z = Number(world.moveForward) - Number(world.moveBackward);
    direction.x = Number(world.moveRight) - Number(world.moveLeft); 
    direction.normalize(); 

    // Calculate velocity change based on direction and speed
    if (world.moveForward || world.moveBackward) velocity.z -= direction.z * movementSpeed * delta * 5; 
    if (world.moveLeft || world.moveRight) velocity.x -= direction.x * movementSpeed * delta * 5; 

    // Store previous position for collision rollback
    const prevPosition = controls.getObject().position.clone();

    // Apply movement based on camera direction
    controls.moveRight(-velocity.x * delta); 
    controls.moveForward(-velocity.z * delta); 

    // --- Collision Detection and Response ---
    if (checkCollision(world)) {
        // If collision, revert position and zero out velocity component causing collision
        controls.getObject().position.copy(prevPosition);

        // Optional: Try to slide along the wall (more complex)
        velocity.x = 0;
        velocity.z = 0;
    }

    // Keep player on the ground (adjust for height)
    controls.getObject().position.y = world.playerHeight;
}