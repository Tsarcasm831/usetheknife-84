import * as THREE from 'three';

/**
 * Creates a simple warehouse object with loading bays and adds it to the scene.
 * Doors are oriented to face West (-X).
 * @param {THREE.Scene} scene - The scene to add the warehouse to.
 * @param {object} warehouseConfig - Configuration object for the warehouse.
 * @returns {THREE.Group} - The warehouse group object.
 */
export function createWarehouse(scene, warehouseConfig) {
    const warehouseGroup = new THREE.Group();
    warehouseGroup.name = "WarehouseGroup";
    warehouseGroup.userData = { collidable: true }; // Mark the entire group as collidable

    const { size, colors, position } = warehouseConfig;

    // --- Main Building Body ---
    const baseMaterial = new THREE.MeshPhongMaterial({ color: colors.base });
    const baseGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = size.y / 2; // Sit on the ground
    baseMesh.name = "WarehouseBase";
    baseMesh.userData = { collidable: true };
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    warehouseGroup.add(baseMesh);

    // --- Simple Flat Roof ---
    const roofHeight = 0.3;
    const roofOverhang = 0.2;
    const roofMaterial = new THREE.MeshPhongMaterial({ color: colors.roof });
    const roofGeometry = new THREE.BoxGeometry(
        size.x + roofOverhang,
        roofHeight,
        size.z + roofOverhang
    );
    const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
    roofMesh.position.y = size.y + roofHeight / 2; // Position on top of the base
    roofMesh.name = "WarehouseRoof";
    roofMesh.userData = { collidable: true };
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    warehouseGroup.add(roofMesh);

    // --- Loading Bay Doors (Positioned on the West [-X] face) ---
    const numDoors = warehouseConfig.numLoadingBays || 3;
    const doorHeight = size.y * 0.6; // Height of the doors
    const doorThickness = 0.1; // Thickness of the door object (along X-axis relative to warehouse)

    // Calculate spacing and width along the Z-axis (depth of the West face)
    const usableDepthFraction = 0.8; // Use 80% of the wall depth for doors
    const totalUsableDepth = size.z * usableDepthFraction;
    const totalSpacingZ = size.z - totalUsableDepth;
    const spacingZ = totalSpacingZ / (numDoors + 1); // Space between doors and wall edges along Z
    const doorSpanZ = totalUsableDepth / numDoors; // Width of each door (along Z-axis relative to warehouse)

    const doorMaterial = new THREE.MeshPhongMaterial({ color: colors.door });
    // Geometry dimensions: Width (runs along X -> thickness), Height (runs along Y), Depth (runs along Z -> span)
    const doorGeometry = new THREE.BoxGeometry(doorThickness, doorHeight, doorSpanZ);

    // Coordinate of the warehouse's West face surface (local coordinates)
    const westFaceX = -size.x / 2;

    for (let i = 0; i < numDoors; i++) {
        const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);

        // Calculate the center Z position for this door along the West face's span
        // Start from the south edge (-size.z / 2), add initial spacing, then add previous doors and spacings
        const doorCenterZ = -size.z / 2 + spacingZ * (i + 1) + doorSpanZ * i + doorSpanZ / 2;

        // Position the door geometry
        doorMesh.position.set(
            westFaceX - doorThickness / 2, // Position slightly outside (West of) the West face
            doorHeight / 2,              // Position relative to ground (align bottom with y=0)
            doorCenterZ                  // Position along the warehouse's Z-axis (North-South)
        );
        doorMesh.name = `LoadingBayDoor_${i}`;
        doorMesh.castShadow = true;
        // Doors themselves might not need collision if base mesh handles it
        doorMesh.userData = { collidable: false };
        warehouseGroup.add(doorMesh);
    }

    // Position the entire warehouse group
    warehouseGroup.position.set(position.x, 0, position.z);

    scene.add(warehouseGroup);
    console.log("Warehouse created/updated at:", position, "with size:", size, "and doors facing West (-X).");

    return warehouseGroup;
}