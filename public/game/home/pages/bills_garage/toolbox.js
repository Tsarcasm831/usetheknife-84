import * as THREE from 'three';

export function setupToolbox(world) {
    createToolbox(world);
}

function createToolbox(world) {
    const { scene, colliders } = world;

    const toolboxGroup = new THREE.Group(); // Group for easier positioning
    const toolboxBodyMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.35, metalness: 0.75 }); // Slightly adjusted
    const toolboxLatchMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.2, metalness: 0.9 });
    const toolboxHandleMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.4, metalness: 0.6 });

    // Main Box
    const mainBox = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.4), toolboxBodyMat);
    mainBox.position.y = -0.05; // Slightly lower part of the box
    mainBox.castShadow = true;
    mainBox.receiveShadow = true;
    toolboxGroup.add(mainBox);

    // Lid
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.1, 0.42), toolboxBodyMat); // Slightly larger lid
    lid.position.y = 0.15; // Position lid on top
    lid.castShadow = true;
    lid.receiveShadow = true;
    toolboxGroup.add(lid);

    // Handle Base
    const handleBaseGeo = new THREE.BoxGeometry(0.2, 0.04, 0.04);
    const handleBase1 = new THREE.Mesh(handleBaseGeo, toolboxHandleMat);
    handleBase1.position.set(-0.15, 0.22, 0); // Y adjusted for lid height
    lid.add(handleBase1); // Attach to lid
    const handleBase2 = handleBase1.clone();
    handleBase2.position.x = 0.15;
    lid.add(handleBase2);

    // Handle Grip
    const handleGripGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.28, 12); // Slightly shorter to fit bases
    const handleGrip = new THREE.Mesh(handleGripGeo, toolboxHandleMat);
    handleGrip.rotation.z = Math.PI / 2;
    handleGrip.position.y = 0.04; // Relative to handle bases
    handleBase1.add(handleGrip); // Attach to one base, visually spans between them

    // Latches
    const latchGeo = new THREE.BoxGeometry(0.05, 0.08, 0.03);
    const latch1 = new THREE.Mesh(latchGeo, toolboxLatchMat);
    latch1.position.set(-0.2, 0.1, 0.21); // Position on the front edge between lid/base
    latch1.castShadow = true;
    toolboxGroup.add(latch1);
    const latch2 = latch1.clone();
    latch2.position.x = 0.2;
    toolboxGroup.add(latch2);

    // Reposition against back wall
    const wallLen = 20; // From environmentSetup
    toolboxGroup.position.set(-2.5, mainBox.geometry.parameters.height / 2, -wallLen / 2 + 0.25); // Position Y based on half height, Z near back wall
    toolboxGroup.castShadow = true; // Group doesn't cast, but ensures children do if needed
    toolboxGroup.receiveShadow = true;
    scene.add(toolboxGroup);
    colliders.push(new THREE.Box3().setFromObject(toolboxGroup));
}