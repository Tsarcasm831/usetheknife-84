import * as THREE from 'three';

/**
 * Creates a simple storage building object with doors facing south.
 * @param {THREE.Scene} scene - The scene to add the building to.
 * @param {object} storageConfig - Configuration object for the storage building.
 * @returns {THREE.Group} - The storage building group object.
 */
export function createStorageBuilding(scene, storageConfig) {
    const buildingGroup = new THREE.Group();
    buildingGroup.name = "StorageBuildingGroup";
    buildingGroup.userData = { collidable: true }; // Mark the entire group as collidable

    const { size, colors, position, numDoors } = storageConfig;

    // --- Materials ---
    const baseMaterial = new THREE.MeshPhongMaterial({ color: colors.base });
    const roofMaterial = new THREE.MeshPhongMaterial({ color: colors.roof });
    const doorMaterial = new THREE.MeshPhongMaterial({ color: colors.door });

    // --- Main Building Body ---
    const baseGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = size.y / 2; // Sit on the ground
    baseMesh.name = "StorageBase";
    baseMesh.userData = { collidable: true };
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    buildingGroup.add(baseMesh);

    // --- Simple Flat Roof ---
    const roofHeight = 0.2;
    const roofOverhang = 0.1;
    const roofGeometry = new THREE.BoxGeometry(
        size.x + roofOverhang,
        roofHeight,
        size.z + roofOverhang
    );
    const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
    roofMesh.position.y = size.y + roofHeight / 2; // Position on top of the base
    roofMesh.name = "StorageRoof";
    roofMesh.userData = { collidable: true };
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    buildingGroup.add(roofMesh);

    // --- Doors (Positioned on the South [+Z] face) ---
    const doorCount = numDoors || 2;
    const doorHeight = size.y * 0.7; // Height of the doors
    const doorThickness = 0.1; // Thickness of the door object (along Z-axis relative to building)

    // Calculate spacing and width along the X-axis (width of the South face)
    const usableWidthFraction = 0.8; // Use 80% of the wall width for doors
    const totalUsableWidth = size.x * usableWidthFraction;
    const totalSpacingX = size.x - totalUsableWidth;
    const spacingX = totalSpacingX / (doorCount + 1); // Space between doors and wall edges along X
    const doorSpanX = totalUsableWidth / doorCount; // Width of each door (along X-axis relative to building)

    // Geometry dimensions: Width (runs along X -> span), Height (runs along Y), Depth (runs along Z -> thickness)
    const doorGeometry = new THREE.BoxGeometry(doorSpanX, doorHeight, doorThickness);

    // Coordinate of the building's South face surface (local coordinates)
    const southFaceZ = size.z / 2;

    for (let i = 0; i < doorCount; i++) {
        const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);

        // Calculate the center X position for this door along the South face's span
        // Start from the west edge (-size.x / 2), add initial spacing, then add previous doors and spacings
        const doorCenterX = -size.x / 2 + spacingX * (i + 1) + doorSpanX * i + doorSpanX / 2;

        // Position the door geometry
        doorMesh.position.set(
            doorCenterX,                  // Position along the building's X-axis (West-East)
            doorHeight / 2,               // Position relative to ground (align bottom with y=0)
            southFaceZ + doorThickness / 2 // Position slightly outside (South of) the South face
        );
        doorMesh.name = `StorageDoor_${i}`;
        doorMesh.castShadow = true;
        // Doors themselves might not need collision if base mesh handles it
        doorMesh.userData = { collidable: false };
        buildingGroup.add(doorMesh);
    }

    // Position the entire building group
    buildingGroup.position.set(position.x, 0, position.z);
    if (storageConfig.rotationY) {
        buildingGroup.rotation.y = storageConfig.rotationY;
    }

    scene.add(buildingGroup);
    console.log("Storage Building created at:", position);

    return buildingGroup;
}