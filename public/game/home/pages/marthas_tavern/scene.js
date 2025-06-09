import * as THREE from 'three';
import { setupCollision, checkCollision } from './collision.js'; // Import collision functions
import { createGrid, toggleGrid } from './grid.js'; // Import grid functions

// Custom smooth look variables removed, replaced with direct mouse look
const mouseSensitivity = 0.002; // Adjust for desired sensitivity

// Scene, camera, and renderer objects
export let scene, camera, renderer;
export let clock = new THREE.Clock();
// Keep isMovementEnabled internal to this module
let isMovementEnabled = false; // Start disabled

// Core rendering variables
let lanterns = [];
let updateFireFn = () => {}; // Initialize with an empty function
let ambientLight = null; // Make ambient light accessible
let originalAmbientIntensity = 4.0; // Store original intensity
let devBrightIntensity = originalAmbientIntensity * 2; // Intensity for devBright mode
let isDevBright = false; // State tracker for devBright mode

// add custom movement state
const movementSpeed = 2;
const movement = { forward: false, backward: false, left: false, right: false };
// Temporary vector for movement calculation
const moveDirection = new THREE.Vector3();
const cameraDirection = new THREE.Vector3(); // To store camera forward direction
const rightDirection = new THREE.Vector3(); // To store camera right direction

export function initScene() {
    // Create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.05);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.7, 5); // Set initial position at the entrance
    camera.rotation.order = 'YXZ'; // Crucial for FPS-style controls

    // Create renderer
    // Optimization: Disable antialiasing for potential performance gain
    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Keep this, important for sharpness
    renderer.shadowMap.enabled = true;
    // Optimization: Use PCFShadowMap instead of PCFSoftShadowMap (less soft, but faster)
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // Replace deprecated property
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    document.getElementById('scene-container').appendChild(renderer.domElement);

    // --- Pointer Lock and Mouse Look Setup ---
    renderer.domElement.addEventListener('click', () => {
        // Request pointer lock only if movement is enabled (game started, no UI open)
        if (isMovementEnabled) {
            renderer.domElement.requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', handlePointerLockChange, false);
    document.addEventListener('mousemove', handleMouseMove, false);
    // --- End Pointer Lock Setup ---


    // set up our own WASD + interaction key handling
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Remove the old mousemove listener based on absolute position
    // document.addEventListener('mousemove', event => { ... });

    // Setup lighting
    setupLighting();

    // Create the debug grid
    createGrid(); // Add this line

    // Enable movement once game starts and listen for UI events
    window.addEventListener('game-started', () => {
        isMovementEnabled = true;
        // Optionally prompt user to click to enable look
        // Consider adding a small UI element for this
    });
    window.addEventListener('enable-movement', () => {
        isMovementEnabled = true;
        // Re-lock pointer if desired and possible
        // if (document.pointerLockElement !== renderer.domElement) {
        //    console.log("Attempting to re-lock pointer");
        //    // Maybe show a prompt "Click to look"
        // }
        console.log("Movement enabled");
    });
    window.addEventListener('disable-movement', () => {
        isMovementEnabled = false;
        // Unlock pointer when UI opens
        if (document.pointerLockElement === renderer.domElement) {
            document.exitPointerLock();
        }
        console.log("Movement disabled");
    });

    return scene; // Return the created scene object
}

function handlePointerLockChange() {
    if (document.pointerLockElement === renderer.domElement) {
        console.log('Pointer Lock Active');
        // Can potentially re-enable movement here if it was disabled by lock loss
        // isMovementEnabled = true; // Be careful with state management
    } else {
        console.log('Pointer Lock Inactive');
        // Disable movement/looking if lock is lost unexpectedly?
        // Or just allow it, user needs to click back in.
        // Current setup: movement disabled by UI events, not directly by lock loss.
    }
}

function handleMouseMove(event) {
    // Only rotate camera if pointer is locked and movement is generally allowed
    if (document.pointerLockElement !== renderer.domElement || !isMovementEnabled) {
        return;
    }

    const yaw = -event.movementX * mouseSensitivity;
    const pitch = -event.movementY * mouseSensitivity;

    // Update camera rotation
    camera.rotation.y += yaw;
    camera.rotation.x += pitch;

    // Clamp pitch rotation to prevent flipping
    const maxPitch = Math.PI / 2 - 0.01; // Slightly less than 90 degrees
    camera.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, camera.rotation.x));
}

function setupLighting() {
    // Ambient light - Assign to module variable
    // originalAmbientIntensity is already updated
    ambientLight = new THREE.AmbientLight(0x402010, originalAmbientIntensity); // Use current default intensity
    scene.add(ambientLight);

    // Fireplace light (Keep shadow casting)
    const fireplaceLight = new THREE.PointLight(0xff6633, 1, 10);
    fireplaceLight.position.set(3.5, 1, -5.5); // Update to match fireplace position
    fireplaceLight.castShadow = true;
    // Optimization: Slightly reduce shadow map size for point lights
    fireplaceLight.shadow.mapSize.width = 256; // Reduced from 512
    fireplaceLight.shadow.mapSize.height = 256; // Reduced from 512
    fireplaceLight.shadow.bias = -0.005; // Adjust bias if shadow acne appears
    scene.add(fireplaceLight);


    // Add lanterns
    lanterns = createLanterns();
}

function createLanterns() {
    // Optimization: Reduce number of shadow casting lanterns
    // Let's have only the central one and the one near the fireplace cast shadows
    const lanternPositions = [
        // Center of the room - Shadow Caster
        { x: 0, y: 2.5, z: 0, intensity: 0.8, castShadow: true },
        // Near fireplace - Shadow Caster (match fireplace X/Z plane approx)
        { x: 3.5, y: 2, z: -3, intensity: 0.6, castShadow: true },
        // Far corner - No Shadow
        { x: 3, y: 2, z: -3, intensity: 0.6, castShadow: false },
        // Right side - No Shadow
        { x: 4, y: 2, z: 1, intensity: 0.6, castShadow: false },
        // Left side - No Shadow
        { x: -4, y: 2, z: 2, intensity: 0.6, castShadow: false },
        // Back wall - No Shadow
        { x: 0, y: 2, z: -4, intensity: 0.6, castShadow: false }
    ];

    return lanternPositions.map(pos => createLanternLight(pos.x, pos.y, pos.z, pos.intensity, pos.castShadow));
}

function createLanternLight(x, y, z, intensity = 0.7, castShadow = false) { // Added castShadow param
    const light = new THREE.PointLight(0xffcc77, intensity, 5);
    light.position.set(x, y, z);
    light.castShadow = castShadow; // Set based on parameter

    if (castShadow) {
        // Optimization: Use smaller shadow maps for less important lights
        light.shadow.mapSize.width = 256; // Reduced from 512
        light.shadow.mapSize.height = 256; // Reduced from 512
        light.shadow.bias = -0.005; // Adjust bias if shadow acne appears
    }

    scene.add(light);

    // Add flicker effect (kept simple)
    light.userData.baseIntensity = intensity; // Store base intensity
    // Flicker logic moved to animate loop for consistency

    return light;
}

function onKeyDown(event) {
    const k = event.key.toLowerCase();
    // Only handle movement keys if movement is enabled
    if (isMovementEnabled) {
        if (k === 'w') movement.forward = true;
        if (k === 's') movement.backward = true;
        if (k === 'a') movement.left = true;
        if (k === 'd') movement.right = true;
    }
    // Interaction keys should work regardless of movement state
    if (k === 'f') window.dispatchEvent(new CustomEvent('interaction-key-pressed'));

    // Dev bright toggle
    if (k === 'y') {
        isDevBright = !isDevBright;
        ambientLight.intensity = isDevBright ? devBrightIntensity : originalAmbientIntensity;
        console.log(`DevBright toggled: ${isDevBright}, Intensity: ${ambientLight.intensity}`);
    }

    // Grid toggle
    if (k === 'g') {
        toggleGrid(); // Call the toggle function
    }

    if (event.key === 'Escape') {
        // If pointer is locked, exit pointer lock first. Otherwise, trigger escape action.
        if (document.pointerLockElement === renderer.domElement) {
            document.exitPointerLock();
        } else {
             window.dispatchEvent(new CustomEvent('escape-key-pressed'));
        }
    }
}

function onKeyUp(event) {
    const k = event.key.toLowerCase();
    // Always allow key up events to register to prevent stuck keys
    // if movement is disabled while a key is held down.
    if (k === 'w') movement.forward = false;
    if (k === 's') movement.backward = false;
    if (k === 'a') movement.left = false;
    if (k === 'd') movement.right = false;
}

export function setFireUpdateFunction(updateFn) {
    updateFireFn = updateFn;
}

// Optimization: Define constants outside animate loop
const MAX_PITCH = Math.PI / 2 - 0.01;

export function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const timeStep = Math.min(delta, 0.1); // Clamp delta to prevent large jumps

    // movement
    if (isMovementEnabled) {
        const step = movementSpeed * timeStep; // Use timeStep
        // Reset move direction vector
        moveDirection.set(0, 0, 0);

        // Apply movement based on camera direction
        cameraDirection.set(0, 0, -1).applyQuaternion(camera.quaternion);
        rightDirection.set(1, 0, 0).applyQuaternion(camera.quaternion);
        cameraDirection.y = 0; // Keep movement horizontal
        cameraDirection.normalize();
        rightDirection.y = 0; // Keep movement horizontal
        rightDirection.normalize();

        if (movement.forward)  moveDirection.add(cameraDirection);
        if (movement.backward) moveDirection.addScaledVector(cameraDirection, -1);
        if (movement.left)     moveDirection.addScaledVector(rightDirection, -1); // Move opposite to right vector
        if (movement.right)    moveDirection.add(rightDirection);  // Move along right vector

        // Normalize the moveDirection vector if it has magnitude (prevents faster diagonal movement)
        if (moveDirection.lengthSq() > 0) {
            moveDirection.normalize();

            // Check collision *before* applying movement
            const collisionDetected = checkCollision(camera.position, moveDirection);

            if (!collisionDetected) {
                // Apply movement if no collision in the intended direction
                camera.position.addScaledVector(moveDirection, step);
            } else {
                // Optional: Add sliding logic here if desired
                // For now, just stop movement if collision detected
            }
        }

    } else {
        // Reset movement state when UI is active or pointer lock lost
        movement.forward = false;
        movement.backward = false;
        movement.left = false;
        movement.right = false;
    }

    // fire particles, interaction checks, lantern flicker...
    updateFireFn(delta); // Call the fire update function (safe even if it's the default empty one)

    // Dispatch animation frame event for other modules (like interaction check)
    window.dispatchEvent(new CustomEvent('animation-frame', { detail: { delta } }));

    // Update lantern flicker based on base intensity
    lanterns.forEach(light => {
        const baseIntensity = light.userData.baseIntensity || 0.7;
        const flickerAmount = baseIntensity * 0.3; // Max flicker deviation
        light.intensity = baseIntensity - flickerAmount / 2 + Math.random() * flickerAmount;
        light.intensity = Math.max(baseIntensity * 0.5, Math.min(light.intensity, baseIntensity * 1.2)); // Clamp intensity
    });

    renderer.render(scene, camera);
}