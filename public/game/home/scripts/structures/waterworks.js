import * as THREE from 'three';

/**
 * Creates a functional-looking water plant building with tanks and pipes.
 * @param {THREE.Scene} scene - The scene to add the building to.
 * @param {object} buildingConfig - Configuration object for the water plant building.
 *   Expected properties: size {x, y, z}, position {x, z}, colors {base, roof, pipe, tank, door}
 */
export function createWaterPlantBuilding(scene, buildingConfig) {
    const buildingGroup = new THREE.Group();
    buildingGroup.name = "WaterPlantBuildingGroup";
    buildingGroup.userData = { collidable: true }; // Mark the entire group as potentially collidable

    // --- Materials ---
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: buildingConfig.colors.base || 0xA0A0A0, // Default light grey concrete
        roughness: 0.8,
        metalness: 0.1
    });

    const roofMaterial = new THREE.MeshStandardMaterial({
        color: buildingConfig.colors.roof || 0x606060, // Default darker grey
        roughness: 0.7,
        metalness: 0.2
    });

    const pipeMaterial = new THREE.MeshStandardMaterial({
        color: buildingConfig.colors.pipe || 0x708090, // Default slate grey/blue
        roughness: 0.3,
        metalness: 0.9
    });

    const tankMaterial = new THREE.MeshStandardMaterial({
        color: buildingConfig.colors.tank || 0xB0C4DE, // Default light steel blue
        roughness: 0.2,
        metalness: 0.85
    });

    const doorMaterial = new THREE.MeshStandardMaterial({
        color: buildingConfig.colors.door || 0x505050, // Default dark metal
        metalness: 0.8,
        roughness: 0.4
    });

    // --- Main Building Structure ---
    const mainWidth = buildingConfig.size.x;
    const mainHeight = buildingConfig.size.y;
    const mainDepth = buildingConfig.size.z;

    // Main Block
    const baseGeometry = new THREE.BoxGeometry(mainWidth, mainHeight, mainDepth);
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = mainHeight / 2;
    baseMesh.name = "WaterPlantBase";
    baseMesh.userData = { collidable: true };
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    buildingGroup.add(baseMesh);

    // --- Roof ---
    const roofHeight = 0.3;
    const roofGeometry = new THREE.BoxGeometry(mainWidth * 1.02, roofHeight, mainDepth * 1.02);
    const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
    roofMesh.position.y = mainHeight + roofHeight / 2;
    roofMesh.name = "WaterPlantRoof";
    roofMesh.userData = { collidable: true }; // Roof can be landed on
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    buildingGroup.add(roofMesh);

    // --- Storage Tanks ---
    const numTanks = 2;
    const tankRadius = mainWidth * 0.15;
    const tankHeight = mainHeight * 0.8;
    const tankSpacing = tankRadius * 2.5;

    for (let i = 0; i < numTanks; i++) {
        const tankGeometry = new THREE.CylinderGeometry(tankRadius, tankRadius, tankHeight, 32);
        const tankMesh = new THREE.Mesh(tankGeometry, tankMaterial);
        const tankX = -mainWidth / 2 - tankRadius * 1.2; // Position tanks to the left
        const tankZ = -mainDepth / 2 + tankRadius + i * tankSpacing;

        tankMesh.position.set(tankX, tankHeight / 2, tankZ);
        tankMesh.name = `WaterTank${i + 1}`;
        tankMesh.userData = { collidable: true };
        tankMesh.castShadow = true;
        tankMesh.receiveShadow = true;
        buildingGroup.add(tankMesh);

        // Tank Top Cap (optional detail)
        const tankCapGeo = new THREE.CylinderGeometry(tankRadius * 1.05, tankRadius * 1.05, 0.2, 32);
        const tankCapMesh = new THREE.Mesh(tankCapGeo, roofMaterial); // Use roof material for cap
        tankCapMesh.position.set(tankX, tankHeight + 0.1, tankZ);
        tankCapMesh.castShadow = true;
        buildingGroup.add(tankCapMesh);
    }

    // --- Pipes ---
    const pipeRadius = 0.2;
    const pipeSegments = 12;

    // Pipe 1: Horizontal along the back
    const pipe1Length = mainWidth * 0.9;
    const pipe1Geo = new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipe1Length, pipeSegments);
    const pipe1Mesh = new THREE.Mesh(pipe1Geo, pipeMaterial);
    pipe1Mesh.rotation.z = Math.PI / 2;
    pipe1Mesh.position.set(0, mainHeight * 0.7, -mainDepth / 2 - pipeRadius);
    pipe1Mesh.name = "PipeHorizontalBack";
    pipe1Mesh.userData = { collidable: false }; // Pipes might be too small/complex for collision
    pipe1Mesh.castShadow = true;
    buildingGroup.add(pipe1Mesh);

    // Pipe 2: Vertical connector from horizontal pipe down
    const pipe2Height = mainHeight * 0.7;
    const pipe2Geo = new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipe2Height, pipeSegments);
    const pipe2Mesh = new THREE.Mesh(pipe2Geo, pipeMaterial);
    pipe2Mesh.position.set(mainWidth * 0.4, pipe2Height / 2, -mainDepth / 2 - pipeRadius);
    pipe2Mesh.name = "PipeVerticalBackRight";
    pipe2Mesh.userData = { collidable: false };
    pipe2Mesh.castShadow = true;
    buildingGroup.add(pipe2Mesh);

    // Pipe 3: Connecting Tank 1 to Building
    if (numTanks > 0) {
        const tank1Pos = new THREE.Vector3(-mainWidth / 2 - tankRadius * 1.2, mainHeight * 0.3, -mainDepth / 2 + tankRadius);
        const buildingConnectPos = new THREE.Vector3(-mainWidth / 2 + pipeRadius, mainHeight * 0.3, -mainDepth / 2 + tankRadius);
        const pipe3Length = tank1Pos.distanceTo(buildingConnectPos);

        const pipe3Geo = new THREE.CylinderGeometry(pipeRadius * 0.8, pipeRadius * 0.8, pipe3Length, pipeSegments);
        const pipe3Mesh = new THREE.Mesh(pipe3Geo, pipeMaterial);

        // Position halfway between points and rotate
        // Use a stable lookAt approach for cylinders: create a target object
        const target = new THREE.Object3D();
        target.position.copy(buildingConnectPos);

        pipe3Mesh.position.copy(tank1Pos).add(buildingConnectPos).multiplyScalar(0.5);
        pipe3Mesh.up.set(0, 0, 1); // Orient 'up' along Z before lookAt for Y-axis alignment
        pipe3Mesh.lookAt(target.position);
        pipe3Mesh.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2); // Rotate 90 deg around local X to align cylinder axis

        pipe3Mesh.name = "PipeTank1Connector";
        pipe3Mesh.userData = { collidable: false };
        pipe3Mesh.castShadow = true;
        buildingGroup.add(pipe3Mesh);
    }

    // Pipe 4: Another pipe detail on the side
    const pipe4Height = mainHeight * 0.5;
    const pipe4Geo = new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipe4Height, pipeSegments);
    const pipe4Mesh = new THREE.Mesh(pipe4Geo, pipeMaterial);
    pipe4Mesh.position.set(mainWidth / 2 + pipeRadius, pipe4Height / 2, mainDepth * 0.2);
    pipe4Mesh.name = "PipeVerticalSide";
    pipe4Mesh.userData = { collidable: false };
    pipe4Mesh.castShadow = true;
    buildingGroup.add(pipe4Mesh);

    // --- Industrial Door ---\
    const doorHeight = 2.2;
    const doorWidth = 1.5;
    const doorDepth = 0.15;
    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
    const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);

    // Position door on the front face (positive Z)
    doorMesh.position.set(
        0, // Centered horizontally
        doorHeight / 2, // Bottom rests on ground (y=0)
        mainDepth / 2 + doorDepth / 2 - 0.01 // Position on the front face
    );
    doorMesh.name = "IndustrialDoor";
    doorMesh.userData = { collidable: false }; // Let base handle collision
    doorMesh.castShadow = true;
    buildingGroup.add(doorMesh);

    // Position the entire building group
    buildingGroup.position.set(buildingConfig.position.x, 0, buildingConfig.position.z);
    if (buildingConfig.rotationY) {
        buildingGroup.rotation.y = buildingConfig.rotationY;
    }

    scene.add(buildingGroup);
    console.log("Water Plant created at:", buildingConfig.position);

    return buildingGroup; // Return the group
}