import * as THREE from 'three'; // Import THREE for MathUtils
import config from './config.js';

// Object to store the state of keyboard keys
export const keys = {};
let targetCameraRotationIndex = 0; // 0: 0deg, 1: 45deg, 2: 90deg ... 7: 315deg
let currentCameraAngleRad = 0; // The current interpolated angle
const rotationStep = Math.PI / 4; // 45 degrees in radians
let qPressed = false;
let ePressed = false;
let cKeyPressed = false; // Track C key state for toggle
let currentZoomLevel = 1.0; // Initial zoom level (1.0 = default distance)

/**
 * Updates the state of a key when pressed down.
 * @param {KeyboardEvent} event - The keydown event object.
 */
function onKeyDown(event) {
    keys[event.code] = true;

    // Update target rotation index on Q/E press
    if (event.code === 'KeyQ' && !qPressed) {
        targetCameraRotationIndex = (targetCameraRotationIndex + 1) % 8; // Cycle through 8 positions (0-7)
        qPressed = true;
        // console.log("Target Angle Index:", targetCameraRotationIndex);
    }
    if (event.code === 'KeyE' && !ePressed) {
        targetCameraRotationIndex = (targetCameraRotationIndex - 1 + 8) % 8; // Cycle backwards
        ePressed = true;
        // console.log("Target Angle Index:", targetCameraRotationIndex);
    }

    // Handle compass toggle (set flag here, logic in main loop)
    if (event.code === 'KeyC' && !cKeyPressed) {
        cKeyPressed = true;
    }

    // Note: Grid toggle logic is now handled in main.js's animate loop
    // using the exported 'keys' object.
}

/**
 * Updates the state of a key when released.
 * @param {KeyboardEvent} event - The keyup event object.
 */
function onKeyUp(event) {
    keys[event.code] = false;

    // Reset rotation flags on key up
    if (event.code === 'KeyQ') {
        qPressed = false;
    }
    if (event.code === 'KeyE') {
        ePressed = false;
    }
    // Reset compass toggle flag on key up
    if (event.code === 'KeyC') {
        cKeyPressed = false;
    }
}

/**
 * Handles mouse wheel events for zooming.
 * @param {WheelEvent} event - The wheel event object.
 */
function onMouseWheel(event) {
    event.preventDefault(); // Prevent default page scrolling

    // Adjust zoom level based on scroll direction
    // deltaY is positive for scrolling down/out, negative for scrolling up/in
    const zoomChange = -event.deltaY * config.camera.zoomSpeed * 0.01; // Adjust multiplier for sensitivity
    currentZoomLevel += zoomChange;

    // Clamp the zoom level between min and max values
    currentZoomLevel = Math.max(config.camera.minZoom, Math.min(config.camera.maxZoom, currentZoomLevel));

    // console.log("Zoom Level:", currentZoomLevel.toFixed(2)); // Optional: Log zoom level
}

/**
 * Smoothly updates the current camera angle towards the target angle.
 * @param {number} deltaTime - Time elapsed since the last frame.
 */
export function updateCameraRotation(deltaTime) {
    let targetAngle = targetCameraRotationIndex * rotationStep;

    // Normalize angles to be within [0, 2*PI) for consistent wrapping calculation
    targetAngle = (targetAngle + Math.PI * 2) % (Math.PI * 2);
    currentCameraAngleRad = (currentCameraAngleRad + Math.PI * 2) % (Math.PI * 2);

    let diff = targetAngle - currentCameraAngleRad;

    // Choose the shortest path to rotate (-PI to PI)
    if (diff > Math.PI) {
        diff -= Math.PI * 2; // Wrap around counter-clockwise
    } else if (diff < -Math.PI) {
        diff += Math.PI * 2; // Wrap around clockwise
    }

    const maxStep = config.camera.rotationSpeed * deltaTime; // Max rotation in this frame

    // Move towards the target, but don't overshoot
    const step = Math.sign(diff) * Math.min(Math.abs(diff), maxStep);

    // Apply the step if the difference is significant
    const threshold = 1e-4; // Small threshold to stop jittering when close
    if (Math.abs(diff) > threshold) {
        currentCameraAngleRad += step;
        // Re-normalize after adding step
        currentCameraAngleRad = (currentCameraAngleRad + Math.PI * 2) % (Math.PI * 2);
    } else if (Math.abs(diff) > 0) {
        // Snap to target if very close
        currentCameraAngleRad = targetAngle;
    }
    // If diff is exactly 0, do nothing
}

/**
 * Initializes the keyboard and mouse controls by adding event listeners.
 */
export function initControls() {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('wheel', onMouseWheel, { passive: false }); // Use passive: false to allow preventDefault
    console.log("Controls initialized (keyboard and mouse wheel).");
}

/**
 * Gets the current smoothed camera rotation angle in radians.
 * @returns {number} - The current camera angle.
 */
export function getCurrentCameraAngleRad() {
    return currentCameraAngleRad;
}

/**
 * Gets the current camera zoom level.
 * @returns {number} - The current zoom level multiplier.
 */
export function getCurrentZoomLevel() {
    return currentZoomLevel;
}

/**
 * Checks if the compass toggle key ('C') was just pressed (one-shot).
 * @returns {boolean} True if the 'C' key was pressed in this frame.
 */
export function isCompassTogglePressed() {
    const pressed = cKeyPressed;
    // Reset the flag immediately after checking if it was pressed down
    if (cKeyPressed) {
         cKeyPressed = false; // Reset for next frame
         return true;
    }
    return false;
}

/**
 * Calculates the movement vector based on current key states and camera rotation.
 * @returns { {moveX: number, moveZ: number} } - The calculated movement components relative to the world.
 */
export function getMovementVector() {
    // Player speed in units per second (defined in config)
    const speed = config.player.speed;

    // Base directions (relative to default camera view - diagonal)
    const directionW = { x: -1, z: -1 }; // Away from camera (NW)
    const directionS = { x: 1, z: 1 };   // Towards camera (SE)
    const directionA = { x: -1, z: 1 };  // Left of camera view (SW)
    const directionD = { x: 1, z: -1 };  // Right of camera view (NE)

    let combinedX = 0;
    let combinedZ = 0;

    if (keys['KeyW'] || keys['ArrowUp']) {
        combinedX += directionW.x;
        combinedZ += directionW.z;
    }
    if (keys['KeyS'] || keys['ArrowDown']) {
        combinedX += directionS.x;
        combinedZ += directionS.z;
    }
    if (keys['KeyA'] || keys['ArrowLeft']) {
        combinedX += directionA.x;
        combinedZ += directionA.z;
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
        combinedX += directionD.x;
        combinedZ += directionD.z;
    }

    // If no input, return zero vector
    if (combinedX === 0 && combinedZ === 0) {
        return { moveX: 0, moveZ: 0 };
    }

    // Normalize the combined direction vector (relative to default view)
    const combinedLength = Math.sqrt(combinedX * combinedX + combinedZ * combinedZ);
    if (combinedLength > 1e-6) {
        combinedX /= combinedLength;
        combinedZ /= combinedLength;
    } else {
         return { moveX: 0, moveZ: 0 }; // Should not happen if input was detected
    }

    // Rotate the normalized direction vector by the current camera angle
    const angle = getCurrentCameraAngleRad(); // Smoothed angle
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    // Rotation formula: x' = x*cos - z*sin, z' = x*sin + z*cos
    let rotatedX = combinedX * cosAngle - combinedZ * sinAngle;
    let rotatedZ = combinedX * sinAngle + combinedZ * cosAngle;

    // Apply speed to get the movement vector per second.
    let moveX = rotatedX * speed;
    let moveZ = rotatedZ * speed;

    // Return the final movement vector (units per second)
    return { moveX, moveZ };
}