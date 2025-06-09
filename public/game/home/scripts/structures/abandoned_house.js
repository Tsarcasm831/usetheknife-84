import * as THREE from 'three';

/**
 * Creates a simple abandoned house (shack) object.
 * @param {THREE.Scene} scene - The scene to add the shack to.
 * @param {object} houseConfig - Configuration object for the abandoned house.
 * @returns {THREE.Group} - The abandoned house group object.
 */
export function createAbandonedHouse(scene, houseConfig) {
    const houseGroup = new THREE.Group();
    houseGroup.name = "AbandonedHouseGroup";
    houseGroup.userData = { collidable: true }; // Mark the entire group as collidable

    const { size, colors, position } = houseConfig;

    // --- Materials ---
    // Use dull, weathered colors
    const baseMaterial = new THREE.MeshStandardMaterial({ color: colors.base, roughness: 0.8, metalness: 0.1 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: colors.roof, roughness: 0.9, metalness: 0.0 });

    // --- Base Shack Body ---
    const baseGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = size.y / 2; // Sit on the ground
    baseMesh.name = "AbandonedHouseBase";
    baseMesh.userData = { collidable: true };
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    houseGroup.add(baseMesh);

    // --- Simple, slightly broken-looking roof ---
    // Use a slightly slanted, uneven roof (e.g., two boxes at slight, different angles)
    const roofHeight = size.y * 0.3; // Lower roof
    const roofOverhang = 0.1;
    const roofLength = size.x + roofOverhang * 2;
    const roofWidth = (size.z / 2) + roofOverhang;
    const roofThickness = 0.1;

    const roofSideGeo = new THREE.BoxGeometry(roofLength, roofThickness, roofWidth * 1.1); // Slightly wider than half

    // Side 1 (slightly steeper)
    const roofSide1 = new THREE.Mesh(roofSideGeo, roofMaterial);
    const slantAngle1 = Math.PI / 8; // ~22.5 deg
    roofSide1.position.set(0, size.y + roofHeight / 2.5, roofWidth / 2.2);
    roofSide1.rotation.x = slantAngle1;
    roofSide1.name = "AbandonedRoof_Side1";
    roofSide1.userData = { collidable: true };
    roofSide1.castShadow = true;
    roofSide1.receiveShadow = true;
    houseGroup.add(roofSide1);

    // Side 2 (shallower, slightly lower)
    const roofSide2 = new THREE.Mesh(roofSideGeo, roofMaterial);
    const slantAngle2 = -Math.PI / 12; // ~-15 deg
    roofSide2.position.set(0, size.y + roofHeight / 3.5, -roofWidth / 2.4);
    roofSide2.rotation.x = slantAngle2;
    roofSide2.name = "AbandonedRoof_Side2";
    roofSide2.userData = { collidable: true };
    roofSide2.castShadow = true;
    roofSide2.receiveShadow = true;
    houseGroup.add(roofSide2);

    // --- Simple Door Opening (optional - just visual) ---
    // Could add a darker rectangle or even subtract geometry if performance allows

    // Position the entire group
    houseGroup.position.set(position.x, 0, position.z);
    if (houseConfig.rotationY) {
        houseGroup.rotation.y = houseConfig.rotationY;
    }

    scene.add(houseGroup);
    console.log("Abandoned House created at:", position);

    return houseGroup;
}