import * as THREE from 'three';
import { setupScene, setupLights } from './sceneSetup.js';
import { setupBaseEnvironment } from './environmentSetup.js';
import { setupFurniture } from './furnitureSetup.js';
import { setupTools } from './toolsSetup.js';
import { setupVehicles } from './vehicleSetup.js';
import { setupControls, updateMovement } from './controls.js';

// Global state object (alternative to passing everything)
const world = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    colliders: [],
    playerCollider: null,
    playerHeight: 1.6,
    playerRadius: 0.3, // Radius for collision sphere
    velocity: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    prevTime: performance.now(),
};

// Make init async because setupTools is now async
async function init() {
    // Basic Scene Setup
    const { scene, camera, renderer } = setupScene(world.playerHeight);
    world.scene = scene;
    world.camera = camera;
    world.renderer = renderer;

    // Player Collider Sphere
    // Position will be updated in movement logic relative to camera
    world.playerCollider = new THREE.Sphere(new THREE.Vector3(), world.playerRadius);

    // Controls - Pass the world object
    world.controls = setupControls(world);

    // Lighting
    setupLights(world.scene);

    // Environment (Walls, Floor, Ceiling, Door)
    setupBaseEnvironment(world);

    // Furniture
    setupFurniture(world);

    // Tools - Await this as it might load textures asynchronously
    await setupTools(world);

    // Vehicles
    setupVehicles(world); // Pass world object

    // Resize handler
    window.addEventListener('resize', onWindowResize);

    // Interaction: Return to Far Haven when at garage door and pressing F
    window.addEventListener('keydown', event => {
        if (event.code === 'KeyF') {
            if (world.controls && world.controls.isLocked) {
                const doorMesh = world.scene.getObjectByName('garageDoor');
                if (doorMesh) {
                    const doorBox = new THREE.Box3().setFromObject(doorMesh);
                    if (world.playerCollider.intersectsBox(doorBox)) {
                        if (window.confirm('Do you want to return to Far Haven?')) {
                            // Notify parent to exit garage view instead of reloading
                            window.parent.postMessage('exitGarage', '*');
                        }
                    }
                }
            }
        }
    });
}

// Call the async init function
init().then(() => {
    console.log("Scene initialized.");
    animate(); // Start animation loop after initialization
}).catch(error => {
    console.error("Initialization failed:", error);
    // Display error message to user if needed
});


function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - world.prevTime) / 1000;
    world.prevTime = time;

    // Only process movement if controls are locked
    if (world.controls && world.controls.isLocked) { // Check if controls exist
        // Call updateMovement imported from controls.js
        updateMovement(world, delta);
    }

    if (world.renderer && world.scene && world.camera) { // Check if core components exist
        world.renderer.render(world.scene, world.camera);
    }
}

function onWindowResize() {
    if (world.camera && world.renderer) { // Check if camera/renderer exist
        world.camera.aspect = window.innerWidth / window.innerHeight;
        world.camera.updateProjectionMatrix();
        world.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}