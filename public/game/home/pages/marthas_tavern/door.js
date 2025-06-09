import * as THREE from 'three';
import gsap from 'gsap';
// Howler is loaded globally via script tag in index.html
import { scene } from './scene.js';
import { addInteractable } from './characters.js';

// Access the Howl constructor from the global scope (window)
const Howl = window.Howl; // Use window.Howl

// --- Constants ---
const DOOR_WIDTH = 2.8;
const DOOR_HEIGHT = 3.5;
const DOOR_THICKNESS = 0.15;
const TAVERN_DEPTH = 12;
const WALL_HEIGHT = 4;
const HINGE_OFFSET_X = DOOR_WIDTH / 2 - 0.05;

// --- Materials ---
const DOOR_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0x6b4423, // Slightly lighter base color for better texture visibility
    roughness: 0.8,
    metalness: 0.1,
    map: new THREE.TextureLoader().load('/assets/static/textures/dark_oak_basecolor.png')
});
DOOR_MATERIAL.map.repeat.set(0.5, 1);
DOOR_MATERIAL.map.wrapS = THREE.RepeatWrapping;
DOOR_MATERIAL.map.wrapT = THREE.RepeatWrapping;

const FRAME_MATERIAL = new THREE.MeshStandardMaterial({ color: 0x332619 });
const METAL_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0x444444, // Dark grey metal
    roughness: 0.6,
    metalness: 0.9
});

// --- State ---
let isDoorOpen = false;
let isAnimating = false;

// --- Sound ---
let doorOpenSound, doorCloseSound;
// Check if Howl is available globally before using it
if (Howl) {
    try {
        doorOpenSound = new Howl({
            src: ['./door_open.mp3'],
            volume: 0.7
        });
        doorCloseSound = new Howl({
            src: ['./door_close.mp3'],
            volume: 0.7
        });
    } catch (e) {
        console.error("Error initializing door sounds with Howl:", e);
        doorOpenSound = null; // Ensure sounds are null if init fails
        doorCloseSound = null;
    }
} else {
    console.warn("Howl constructor not found globally (window.Howl). Door sounds disabled.");
    doorOpenSound = null;
    doorCloseSound = null;
}

/**
 * Creates the tavern door, frame, hardware, and sets up interaction.
 */
export function createDoor() {
    const doorGroup = new THREE.Group();

    // --- Door Mesh ---
    const doorGeometry = new THREE.BoxGeometry(DOOR_WIDTH, DOOR_HEIGHT, DOOR_THICKNESS);
    const doorMesh = new THREE.Mesh(doorGeometry, DOOR_MATERIAL);
    doorMesh.castShadow = true;
    doorMesh.receiveShadow = true;
    doorMesh.userData.collidable = true; // Start closed and collidable
    doorMesh.name = "Tavern Door Mesh";
    doorMesh.position.x = -HINGE_OFFSET_X; // Position relative to hinge
    doorGroup.add(doorMesh);

    // --- Door Hardware (Hinges and Handle) ---
    _createDoorHardware(doorMesh); // Add hardware relative to the door mesh

    // --- Position the Group (Hinge Point) ---
    // Adjust hinge X position slightly towards the edge based on new group center logic
    doorGroup.position.set(DOOR_WIDTH / 2, DOOR_HEIGHT / 2, TAVERN_DEPTH / 2);
    doorGroup.userData.id = 'tavern_door';
    doorGroup.userData.name = 'Tavern Door';
    doorGroup.name = 'Tavern Door'; // Set group name for lookup
    doorGroup.userData.interact = toggleDoor;
    doorGroup.userData.collidable = false; // Group itself isn't collidable

    scene.add(doorGroup);
    addInteractable(doorGroup); // Make hinge area interactable

    // --- Door Frame ---
    _createDoorFrame();

    console.log("Tavern door created with hardware and interaction added.");
}

/**
 * Creates hinges and a handle for the door.
 * @param {THREE.Mesh} doorMesh - The mesh of the door itself.
 */
function _createDoorHardware(doorMesh) {
    const hingeHeight = 0.4;
    const hingeWidth = 0.1;
    const hingeThickness = 0.05;
    const handleRadius = 0.08;
    const handleLength = 0.3;

    // Hinges (position relative to doorMesh origin which is offset from group center)
    const hingeGeometry = new THREE.BoxGeometry(hingeWidth, hingeHeight, hingeThickness);

    const topHinge = new THREE.Mesh(hingeGeometry, METAL_MATERIAL);
    // Position hinge relative to door mesh center, near the edge that aligns with the group's origin
    topHinge.position.set(DOOR_WIDTH / 2 - hingeWidth / 2, DOOR_HEIGHT / 2 - hingeHeight * 0.7, DOOR_THICKNESS / 2 + hingeThickness / 2);
    doorMesh.add(topHinge); // Add to doorMesh so it moves with the door

    const bottomHinge = new THREE.Mesh(hingeGeometry, METAL_MATERIAL);
    bottomHinge.position.set(DOOR_WIDTH / 2 - hingeWidth / 2, -DOOR_HEIGHT / 2 + hingeHeight * 0.7, DOOR_THICKNESS / 2 + hingeThickness / 2);
    doorMesh.add(bottomHinge); // Add to doorMesh

    // Handle (position relative to doorMesh origin, on the opposite side of hinges)
    const handleGeometry = new THREE.CylinderGeometry(handleRadius, handleRadius, handleLength, 8);
    const handle = new THREE.Mesh(handleGeometry, METAL_MATERIAL);
    handle.rotation.z = Math.PI / 2; // Rotate to be horizontal
    // Position handle relative to door mesh center, near the non-hinge edge
    handle.position.set(-DOOR_WIDTH / 2 + handleLength / 2 + 0.2, 0, DOOR_THICKNESS / 2 + handleRadius);
    doorMesh.add(handle); // Add to doorMesh
}

/**
 * Creates the visual frame around the doorway.
 */
function _createDoorFrame() {
    const frameThickness = 0.2;
    const frameDepth = 0.3;
    const doorwayWidth = 3; // From building.js

    // Top frame piece
    const topFrameGeo = new THREE.BoxGeometry(doorwayWidth + frameThickness * 2, frameThickness, frameDepth);
    const topFrame = new THREE.Mesh(topFrameGeo, FRAME_MATERIAL);
    topFrame.position.set(0, WALL_HEIGHT, TAVERN_DEPTH / 2);
    topFrame.receiveShadow = true;
    scene.add(topFrame);

    // Left frame piece
    const sideFrameGeo = new THREE.BoxGeometry(frameThickness, WALL_HEIGHT, frameDepth);
    const leftFrame = new THREE.Mesh(sideFrameGeo, FRAME_MATERIAL);
    leftFrame.position.set(-doorwayWidth / 2 - frameThickness / 2, WALL_HEIGHT / 2, TAVERN_DEPTH / 2);
    leftFrame.receiveShadow = true;
    leftFrame.userData.collidable = true; // Frame parts are collidable
    scene.add(leftFrame);

    // Right frame piece
    const rightFrame = new THREE.Mesh(sideFrameGeo, FRAME_MATERIAL);
    rightFrame.position.set(doorwayWidth / 2 + frameThickness / 2, WALL_HEIGHT / 2, TAVERN_DEPTH / 2);
    rightFrame.receiveShadow = true;
    rightFrame.userData.collidable = true; // Frame parts are collidable
    scene.add(rightFrame);
}

/**
 * Toggles the door open or closed with an animation and sound.
 */
function toggleDoor() {
    if (isAnimating) return;

    // Check if sounds were initialized successfully
    const soundsReady = doorOpenSound && doorCloseSound;
    if (!soundsReady) {
        console.warn("Door sounds not ready, visual toggle only.");
    }

    isAnimating = true;
    const doorGroup = scene.getObjectByName('Tavern Door'); // Use the correct name set during creation
    if (!doorGroup) {
        console.error("Door group ('Tavern Door') not found! Unable to toggle door.");
        isAnimating = false;
        return;
    }

    const targetRotationY = isDoorOpen ? 0 : -Math.PI / 2 * 0.9; // Swing inwards
    const doorMesh = doorGroup.getObjectByName("Tavern Door Mesh");

    // Play sound if available
    if (soundsReady) {
        if (isDoorOpen) {
            doorCloseSound.play();
        } else {
            doorOpenSound.play();
        }
    }

    gsap.to(doorGroup.rotation, {
        y: targetRotationY,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
            isDoorOpen = !isDoorOpen;
            if (doorMesh) {
                // Collidable when closed, not when open
                doorMesh.userData.collidable = !isDoorOpen;
            } else {
                console.warn("Could not find door mesh ('Tavern Door Mesh') inside group to toggle collision.");
            }
            isAnimating = false;
        }
    });
}