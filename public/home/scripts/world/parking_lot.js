import * as THREE from 'three';

/**
 * Creates a simple parking lot object with marked spaces and adds it to the scene.
 * Spaces are defined by config parameters `spaceWidth` and `spaceDepth`.
 * @param {THREE.Scene} scene - The scene to add the parking lot to.
 * @param {object} lotConfig - Configuration object for the parking lot.
 */
export function createParkingLot(scene, lotConfig) {
    const parkingLotGroup = new THREE.Group();
    parkingLotGroup.name = "ParkingLotGroup";

    // --- Base ---
    const baseThickness = lotConfig.baseThickness || 0.05; // Use config or default
    const baseGeometry = new THREE.BoxGeometry(lotConfig.size.x, baseThickness, lotConfig.size.z);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: lotConfig.colors.base });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    // Position slightly above the ground (y=0)
    baseMesh.position.y = baseThickness / 2 + 0.01;
    baseMesh.name = "ParkingLotBase";
    baseMesh.userData = { collidable: false }; // Not an obstacle
    baseMesh.castShadow = false;
    baseMesh.receiveShadow = true;
    parkingLotGroup.add(baseMesh);

    // --- Parking Lines ---
    const lineThickness = lotConfig.lineThickness || 0.02; // Use config or default
    const lineWidth = lotConfig.lineWidth || 0.1; // Use config or default
    const lineMaterial = new THREE.MeshBasicMaterial({
        color: lotConfig.colors.lines,
        side: THREE.DoubleSide // Visible from both sides
    });

    // Determine layout based on configuration
    const numSpacesX = Math.max(1, Math.floor(lotConfig.size.x / lotConfig.spaceWidth));
    const numSpacesZ = Math.max(1, Math.floor(lotConfig.size.z / lotConfig.spaceDepth));
    const actualSpaceWidth = lotConfig.size.x / numSpacesX; // Divide total width by number of spaces
    const actualSpaceDepth = lotConfig.size.z / numSpacesZ; // Divide total depth by number of spaces
    // const lineLengthZ = lotConfig.lineLengthZ || actualSpaceDepth; // Length of vertical lines (OLD)

    console.log(`Parking Lot: Spaces ${numSpacesX}x${numSpacesZ}, Space Size ${actualSpaceWidth.toFixed(2)}x${actualSpaceDepth.toFixed(2)}`);

    // Vertical lines separating spaces along X (drawing numSpacesX - 1 lines)
    // These lines should span the entire depth of the lot.
    for (let i = 1; i < numSpacesX; i++) {
        const lineXPos = -lotConfig.size.x / 2 + i * actualSpaceWidth;
        // Use full lot depth for vertical lines
        const lineGeometry = new THREE.BoxGeometry(lineWidth, lineThickness, lotConfig.size.z);
        const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
        lineMesh.position.set(
            lineXPos,
            baseThickness + lineThickness / 2 + 0.01, // Slightly above base
            0 // Centered along Z axis of the lot base
        );
        lineMesh.name = `ParkingLine_V_${i}`;
        parkingLotGroup.add(lineMesh);
    }

    // Horizontal lines separating spaces along Z (drawing numSpacesZ - 1 lines)
    // These lines should span the entire width of the lot.
    for (let j = 1; j < numSpacesZ; j++) {
        const lineZPos = -lotConfig.size.z / 2 + j * actualSpaceDepth;
        const lineGeometry = new THREE.BoxGeometry(lotConfig.size.x, lineThickness, lineWidth); // Use lineWidth for depth
        const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
        lineMesh.position.set(
            0, // Centered along X axis
            baseThickness + lineThickness / 2 + 0.01, // Slightly above base
            lineZPos
        );
        lineMesh.name = `ParkingLine_H_${j}`;
        parkingLotGroup.add(lineMesh);
    }

    // Position the entire parking lot group
    parkingLotGroup.position.set(lotConfig.position.x, 0, lotConfig.position.z);

    scene.add(parkingLotGroup);
    console.log("Parking Lot created/updated at:", lotConfig.position, "Size:", lotConfig.size);

    return parkingLotGroup; // Return the group
}