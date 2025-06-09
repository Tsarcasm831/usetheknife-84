import * as THREE from 'three';
import { scene } from './scene.js';

// --- Constants ---
const TAVERN_WIDTH = 15; // Needed for booth placement
const TAVERN_DEPTH = 12; // Needed for booth placement

// --- Materials ---
const WOOD_MATERIAL_DARK = new THREE.MeshStandardMaterial({ color: 0x513a29, roughness: 0.8, metalness: 0.2 });
const WOOD_MATERIAL_MEDIUM = new THREE.MeshStandardMaterial({ color: 0x614b3a, roughness: 0.8, metalness: 0.2 });
const WOOD_MATERIAL_LIGHT = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7, metalness: 0.2 });

// --- Main Export Function ---
/**
 * Creates dining tables, chairs, and wall booths.
 * @returns {Array<Array<{position: {x: number, y: number, z: number}, rotation: number}>>} An array containing chair data for each dining table.
 */
export function createFurniture() {
    const diningTableChairData = _createDiningTables();
    _createWallBooths();
    return diningTableChairData; // Return chair data
}

// --- Dining Tables Area ---

/**
 * Creates the dining tables and chairs.
 * @returns {Array<Array<{position: {x: number, y: number, z: number}, rotation: number}>>} An array containing chair data for each table.
 */
function _createDiningTables() {
    const tablePositions = [
        { x: 2, z: -2, id: 'table_mercenary' }, // Near mercenary
        { x: 4, z: 0,  id: 'table_bard' },      // Near bard
        { x: 0, z: 1,  id: 'table_scholar' },   // Near scholar
        { x: -2, z: 2, id: 'table_merchant' }, // Near merchant
        { x: -4, z: 0, id: 'table_rogues' }     // Near rogues
    ];

    const allChairData = [];

    tablePositions.forEach((pos) => {
        const chairData = _createTableAndChairs(pos.x, pos.z, pos.id);
        allChairData.push(chairData);
    });

    return allChairData;
}

/**
 * Creates a single table and its surrounding chairs.
 * @param {number} centerX - The X coordinate of the table center.
 * @param {number} centerZ - The Z coordinate of the table center.
 * @param {string} baseName - A base name for the table and chair objects.
 * @returns {Array<{position: {x: number, y: number, z: number}, rotation: number}>} An array of chair positions and rotations for this table.
 */
function _createTableAndChairs(centerX, centerZ, baseName) {
    const tableGroup = new THREE.Group();
    tableGroup.position.set(centerX, 0, centerZ);
    tableGroup.name = `${baseName}_group`;

    const tableRadius = 0.8;
    const tableHeight = 0.1;
    const tableLegHeight = 0.7;
    const tableLegRadius = 0.1;

    // Table Top
    const tableGeometry = new THREE.CylinderGeometry(tableRadius, tableRadius, tableHeight, 16);
    const table = new THREE.Mesh(tableGeometry, WOOD_MATERIAL_MEDIUM);
    table.position.y = tableLegHeight + tableHeight / 2;
    table.castShadow = true;
    table.receiveShadow = true;
    table.userData.collidable = true;
    table.name = `${baseName}_top`;
    tableGroup.add(table);

    // Table leg
    const legGeometry = new THREE.CylinderGeometry(tableLegRadius, tableLegRadius, tableLegHeight, 8);
    const leg = new THREE.Mesh(legGeometry, WOOD_MATERIAL_DARK); // Dark wood leg
    leg.position.y = tableLegHeight / 2;
    leg.castShadow = true;
    leg.receiveShadow = true;
    leg.userData.collidable = true; // Crucial for collision
    leg.name = `${baseName}_leg`;
    tableGroup.add(leg);

    scene.add(tableGroup);

    // Add 3 chairs around the table and collect their data
    const chairRadius = 1.2; // Distance from table center
    const numChairs = 3;
    const chairDataForTable = [];

    for (let i = 0; i < numChairs; i++) {
        const angle = (i * Math.PI * 2) / numChairs + Math.PI / 6; // Add offset for better initial angle
        const chairX = centerX + Math.cos(angle) * chairRadius;
        const chairZ = centerZ + Math.sin(angle) * chairRadius;
        const chairRotationY = -angle + Math.PI / 2; // Rotate chair to face the table (adjust offset)

        const chair = _createChairMesh(`${baseName}_chair_${i}`);
        chair.position.set(chairX, 0, chairZ);
        chair.rotation.y = chairRotationY;
        scene.add(chair);

        // Store chair position and rotation
        chairDataForTable.push({
            position: { x: chairX, y: 0, z: chairZ }, // Keep y=0 for now, NPC placement will adjust
            rotation: chairRotationY
        });
    }
    return chairDataForTable; // Return data for chairs around this specific table
}

/**
 * Creates a single chair mesh.
 * @param {string} name - The name for the chair group.
 * @returns {THREE.Group} The chair group.
 */
function _createChairMesh(name) {
    const chairGroup = new THREE.Group();
    chairGroup.name = name;

    const seatRadius = 0.25;
    const seatHeight = 0.1;
    const legHeight = 0.4;
    const legRadius = 0.05;

    // Chair seat
    const seatGeometry = new THREE.CylinderGeometry(seatRadius, seatRadius, seatHeight, 8);
    const chair = new THREE.Mesh(seatGeometry, WOOD_MATERIAL_LIGHT); // Light wood seat
    chair.position.y = legHeight + seatHeight / 2;
    chair.castShadow = true;
    chair.receiveShadow = true;
    chair.userData.collidable = true; // Seat collision
    chair.name = `${name}_seat`;
    chairGroup.add(chair);

    // Chair leg
    const chairLegGeometry = new THREE.CylinderGeometry(legRadius, legRadius, legHeight, 8);
    const chairLeg = new THREE.Mesh(chairLegGeometry, WOOD_MATERIAL_DARK); // Dark wood leg
    chairLeg.position.y = legHeight / 2;
    chairLeg.castShadow = true;
    chairLeg.receiveShadow = true;
    chairLeg.userData.collidable = true; // Leg collision
    chairLeg.name = `${name}_leg`;
    chairGroup.add(chairLeg);

    return chairGroup;
}

// --- Wall Booths ---

function _createWallBooths() {
    // Define booth positions along left and right walls
    const boothSpacingZ = 3.0;
    const boothOffsetZ = -TAVERN_DEPTH / 2 + 1.5; // Start further from back wall
    const numBoothsPerSide = 3; // Reduced number to fit spacing better

    // Left wall booths - Start loop from i = 1 to skip the first booth at Z = -4.5
    for (let i = 1; i < numBoothsPerSide; i++) { 
        const boothZ = boothOffsetZ + i * boothSpacingZ;
        _createSingleBooth(
            -TAVERN_WIDTH / 2 + 0.8, // X position near left wall
            boothZ,                  // Z position
            Math.PI / 2,             // Rotation to face inwards
            `left_booth_${i}`
        );
        console.log(`Created left booth ${i} at Z=${boothZ.toFixed(2)}`);
    }

    // Right wall booths (no change needed here)
    for (let i = 0; i < numBoothsPerSide; i++) {
        const boothZ = boothOffsetZ + i * boothSpacingZ;
        _createSingleBooth(
            TAVERN_WIDTH / 2 - 0.8, // X position near right wall
            boothZ,                 // Z position
            -Math.PI / 2,           // Rotation to face inwards
            `right_booth_${i}`
        );
        console.log(`Created right booth ${i} at Z=${boothZ.toFixed(2)}`);
    }
}

/**
 * Creates a single wall booth.
 * @param {number} centerX - The X coordinate of the booth center.
 * @param {number} centerZ - The Z coordinate of the booth center.
 * @param {number} rotationY - The Y rotation of the booth.
 * @param {string} baseName - The base name for the booth objects.
 */
function _createSingleBooth(centerX, centerZ, rotationY, baseName) {
    const boothGroup = new THREE.Group();
    boothGroup.position.set(centerX, 0, centerZ);
    boothGroup.rotation.y = rotationY;
    boothGroup.name = baseName;

    const seatWidth = 2.0;
    const seatHeight = 0.4;
    const seatDepth = 0.8;
    const backHeight = 1.2;
    const backDepth = 0.3;
    const tableWidth = 1.0;
    const tableHeight = 0.1;
    const tableDepth = 1.0;
    const tableOffsetZ = 1.1; // Distance from booth back wall to table center
    const legHeight = 0.7; // Table leg height

    // Booth seat back (relative position Z = -backDepth/2)
    const seatBackGeometry = new THREE.BoxGeometry(seatWidth, backHeight, backDepth);
    const seatBack = new THREE.Mesh(seatBackGeometry, WOOD_MATERIAL_DARK); // Dark wood back
    seatBack.position.set(0, backHeight / 2, -backDepth / 2); // Centered at back
    seatBack.castShadow = true;
    seatBack.receiveShadow = true;
    seatBack.userData.collidable = true;
    seatBack.name = `${baseName}_back`;
    boothGroup.add(seatBack);

    // Booth seat (relative position Z = seatDepth/2)
    const seatGeometry = new THREE.BoxGeometry(seatWidth, seatHeight, seatDepth);
    const seat = new THREE.Mesh(seatGeometry, WOOD_MATERIAL_LIGHT); // Light wood seat
    seat.position.set(0, seatHeight / 2, seatDepth / 2); // In front of back
    seat.castShadow = true;
    seat.receiveShadow = true;
    seat.userData.collidable = true;
    seat.name = `${baseName}_seat`;
    boothGroup.add(seat);

    // --- Booth Table (Separate Group for easier positioning relative to booth) ---
    const tableGroup = new THREE.Group();
    tableGroup.position.z = tableOffsetZ; // Position table relative to booth center

    // Booth table top
    const tableGeometry = new THREE.BoxGeometry(tableWidth, tableHeight, tableDepth);
    const table = new THREE.Mesh(tableGeometry, WOOD_MATERIAL_MEDIUM);
    table.position.y = legHeight + tableHeight/2; // Table top sits on leg
    table.castShadow = true;
    table.receiveShadow = true;
    table.userData.collidable = true;
    table.name = `${baseName}_table_top`;
    tableGroup.add(table);

    // Table leg
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, legHeight, 8);
    const leg = new THREE.Mesh(legGeometry, WOOD_MATERIAL_DARK);
    leg.position.y = legHeight / 2;
    leg.castShadow = true;
    leg.receiveShadow = true;
    leg.userData.collidable = true; // Table leg collision
    leg.name = `${baseName}_table_leg`;
    tableGroup.add(leg);

    boothGroup.add(tableGroup); // Add table group

    scene.add(boothGroup);
}