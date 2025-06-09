import * as THREE from 'three';
import { scene } from './scene.js';

// --- Materials ---
const WOOD_MATERIAL_MEDIUM = new THREE.MeshStandardMaterial({ color: 0x614b3a, roughness: 0.8, metalness: 0.2 });
const WOOD_MATERIAL_LIGHT = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7, metalness: 0.2 });
const BAR_MATERIAL_TOP = new THREE.MeshStandardMaterial({ color: 0x774628, roughness: 0.7, metalness: 0.3 });

// --- Main Export Function ---
/**
 * Creates the bar counter, stools, and shelves.
 */
export function createBarArea() {
    const barPosition = new THREE.Vector3(-3, 0, -4); // Base position for the bar area
    const barWidth = 6;
    const barDepth = 1;
    const barHeight = 1.2;

    _createBarCounter(barPosition, barWidth, barDepth, barHeight);
    _createBarStools(barPosition, barWidth, barHeight);
    _createBarShelves(barPosition, barWidth);
}

// --- Internal Helper Functions ---

function _createBarCounter(position, width, depth, height) {
    const counterGroup = new THREE.Group();
    counterGroup.position.copy(position);

    // Bar counter main body
    const barGeometry = new THREE.BoxGeometry(width, height, depth);
    const bar = new THREE.Mesh(barGeometry, BAR_MATERIAL_TOP);
    bar.position.y = height / 2; // Center the geometry
    bar.castShadow = true;
    bar.receiveShadow = true;
    bar.userData.collidable = true;
    counterGroup.add(bar);

    // Bar front panel (slightly different material/look)
    const barFrontGeometry = new THREE.BoxGeometry(width, height, 0.2);
    const barFront = new THREE.Mesh(barFrontGeometry, WOOD_MATERIAL_MEDIUM);
    barFront.position.y = height / 2;
    barFront.position.z = depth / 2 + 0.1; // Position in front of main counter
    barFront.castShadow = true;
    barFront.receiveShadow = true;
    barFront.userData.collidable = true; // Make front collidable too
    counterGroup.add(barFront);

    scene.add(counterGroup);
}

function _createBarStools(barPosition, barWidth, barHeight) {
    const stoolPositions = [-1.5, 0, 1.5]; // Relative X offsets from bar center
    stoolPositions.forEach(offsetX => {
        const stool = _createStoolMesh();
        stool.position.set(
            barPosition.x + offsetX,
            0,
            barPosition.z + 1.2 // Position in front of the bar
        );
        scene.add(stool);
    });
}

function _createStoolMesh() {
    const stoolGroup = new THREE.Group();
    const seatRadius = 0.4;
    const seatHeight = 0.1;
    const legHeight = 0.7;
    const legRadius = 0.3;

    // Stool Seat (Optimization: Reduce segments slightly)
    const seatGeometry = new THREE.CylinderGeometry(seatRadius, seatRadius, seatHeight, 6); // Reduced from 8
    const seat = new THREE.Mesh(seatGeometry, WOOD_MATERIAL_LIGHT); // Use light wood for seat
    seat.position.y = legHeight + seatHeight / 2; // Position seat on top of leg
    seat.castShadow = true;
    seat.receiveShadow = true;
    stoolGroup.add(seat);

    // Stool Leg (main cylinder) (Optimization: Reduce segments slightly)
    const legGeometry = new THREE.CylinderGeometry(legRadius, legRadius, legHeight, 6); // Reduced from 8
    const leg = new THREE.Mesh(legGeometry, WOOD_MATERIAL_MEDIUM); // Medium wood for leg
    leg.position.y = legHeight / 2;
    leg.castShadow = true;
    leg.receiveShadow = true;
    leg.userData.collidable = true; // The leg is the main collision part
    stoolGroup.add(leg);

    return stoolGroup;
}

function _createBarShelves(barPosition, barWidth) {
    const shelfDepth = 0.8;
    const shelfThickness = 0.1;
    const shelfOffsetY = 1.5;
    const shelfSpacingY = 1.0;
    const shelfPosZ = -1.5; // Relative Z offset behind the bar counter

    for (let i = 0; i < 3; i++) {
        const shelfGeometry = new THREE.BoxGeometry(barWidth - 1, shelfThickness, shelfDepth); // Slightly narrower than bar
        const shelf = new THREE.Mesh(shelfGeometry, WOOD_MATERIAL_MEDIUM);
        shelf.position.set(
            barPosition.x, // Center X with bar
            shelfOffsetY + i * shelfSpacingY,
            barPosition.z + shelfPosZ
        );
        shelf.castShadow = true; // Shelf itself can cast shadow
        shelf.receiveShadow = true;
        scene.add(shelf);
        _addBottlesToShelf(shelf);
    }
}

function _addBottlesToShelf(shelf) {
    const bottleCount = 8;
    const shelfWidth = shelf.geometry.parameters.width;
    const shelfY = shelf.position.y;
    const shelfZ = shelf.position.z;
    const bottleBaseY = shelfY + shelf.geometry.parameters.height / 2;
    const bottleRadius = 0.1; // Declare bottleRadius here, accessible to the whole function

    const colors = [0x794044, 0x1f3a3d, 0x2d4a25, 0x4a3c1e, 0x5e3023];

    // Optimization: Create geometries and materials outside the loop
    const bottleGeometries = [];
    const bottleMaterials = [];
    for (let j = 0; j < bottleCount; j++) {
         const bottleHeight = 0.4 + Math.random() * 0.3;
         // Optimization: Reduce segments
         bottleGeometries.push(new THREE.CylinderGeometry(bottleRadius, bottleRadius, bottleHeight, 6)); // Reduced from 8
    }
    colors.forEach(color => {
        bottleMaterials.push(new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.2,
            metalness: 0.8, // Shiny glass
            transparent: true,
            opacity: 0.8
        }));
    });


    for (let j = 0; j < bottleCount; j++) {
        const bottleGeometry = bottleGeometries[j % bottleGeometries.length]; // Reuse geometries cyclically if needed (though here it's 1:1)
        const bottleMaterial = bottleMaterials[Math.floor(Math.random() * bottleMaterials.length)]; // Random material

        const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
        const bottleHeight = bottleGeometry.parameters.height; // Get height from geometry
        bottle.position.set(
            shelf.position.x - shelfWidth / 2 + bottleRadius + j * (shelfWidth / bottleCount), // Use bottleRadius defined above
            bottleBaseY + bottleHeight / 2,
            shelfZ + (Math.random() - 0.5) * 0.4 // Slight Z variation
        );
        // Optimization: Bottles likely don't need to cast shadows
        bottle.castShadow = false;
        bottle.receiveShadow = true; // They should receive shadows
        scene.add(bottle);
    }
}