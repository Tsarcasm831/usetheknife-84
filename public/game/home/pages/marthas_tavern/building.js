import * as THREE from 'three';
import { scene } from './scene.js';

// --- Constants ---
const TAVERN_WIDTH = 15;
const TAVERN_DEPTH = 12;
const WALL_HEIGHT = 4;
const CEILING_HEIGHT = 4;
const BEAM_OFFSET_Y = -0.2;

// --- Materials ---
const CEILING_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0x614b3a, // Medium wood color
    roughness: 0.9,
    metalness: 0.1
});
const BEAM_MATERIAL = new THREE.MeshStandardMaterial({ color: 0x3a2512 }); // Dark wood

// --- Main Export Function ---
/**
 * Creates the floor, walls, ceiling, and beams of the tavern.
 */
export function createBuildingShell() {
    _createFloorAndWalls();
    _createCeilingAndBeams();
}


// --- Internal Helper Functions ---

function _createFloorAndWalls() {
    // Floor
    const floorTexture = new THREE.TextureLoader().load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/hardwood2_diffuse.jpg');
    floorTexture.repeat.set(4, 4);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;

    const floorGeometry = new THREE.PlaneGeometry(TAVERN_WIDTH, TAVERN_DEPTH);
    const floorMaterial = new THREE.MeshStandardMaterial({
        map: floorTexture,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls
    const wallTexture = new THREE.TextureLoader().load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/brick_diffuse.jpg');
    wallTexture.repeat.set(2, 1);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;

    const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,
        roughness: 0.9,
        metalness: 0.1
    });

    // Back wall
    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(TAVERN_WIDTH, WALL_HEIGHT),
        wallMaterial
    );
    backWall.position.set(0, WALL_HEIGHT / 2, -TAVERN_DEPTH / 2);
    backWall.receiveShadow = true;
    backWall.userData.collidable = true;
    scene.add(backWall);

    // Front wall (with door gap)
    const doorWidth = 3;
    const frontWallSideWidth = (TAVERN_WIDTH - doorWidth) / 2;
    const frontWallLeft = new THREE.Mesh(
        new THREE.PlaneGeometry(frontWallSideWidth, WALL_HEIGHT),
        wallMaterial
    );
    frontWallLeft.position.set(-(doorWidth / 2 + frontWallSideWidth / 2), WALL_HEIGHT / 2, TAVERN_DEPTH / 2);
    frontWallLeft.rotation.y = Math.PI;
    frontWallLeft.receiveShadow = true;
    frontWallLeft.userData.collidable = true;
    scene.add(frontWallLeft);

    const frontWallRight = new THREE.Mesh(
        new THREE.PlaneGeometry(frontWallSideWidth, WALL_HEIGHT),
        wallMaterial
    );
    frontWallRight.position.set(doorWidth / 2 + frontWallSideWidth / 2, WALL_HEIGHT / 2, TAVERN_DEPTH / 2);
    frontWallRight.rotation.y = Math.PI;
    frontWallRight.receiveShadow = true;
    frontWallRight.userData.collidable = true;
    scene.add(frontWallRight);

    // Left wall
    const leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(TAVERN_DEPTH, WALL_HEIGHT),
        wallMaterial
    );
    leftWall.position.set(-TAVERN_WIDTH / 2, WALL_HEIGHT / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    leftWall.userData.collidable = true;
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(TAVERN_DEPTH, WALL_HEIGHT),
        wallMaterial
    );
    rightWall.position.set(TAVERN_WIDTH / 2, WALL_HEIGHT / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    rightWall.userData.collidable = true;
    scene.add(rightWall);
}

function _createCeilingAndBeams() {
    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(TAVERN_WIDTH, TAVERN_DEPTH);
    const ceiling = new THREE.Mesh(ceilingGeometry, CEILING_MATERIAL);
    ceiling.position.set(0, CEILING_HEIGHT, 0);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.receiveShadow = true;
    scene.add(ceiling);

    // Create ceiling beams
    const beamGeometry = new THREE.BoxGeometry(0.4, 0.4, TAVERN_DEPTH);
    const numBeams = 6;
    for (let i = 0; i < numBeams; i++) {
        const beam = new THREE.Mesh(beamGeometry, BEAM_MATERIAL);
        beam.position.set(
            -TAVERN_WIDTH / 2 + (TAVERN_WIDTH / (numBeams + 1)) * (i + 1),
            CEILING_HEIGHT + BEAM_OFFSET_Y,
            0
        );
        beam.castShadow = true;
        scene.add(beam);
    }
}