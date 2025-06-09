import * as THREE from 'three';

export function setupWorkbenchTools(world) {
    createWrench(world);
    createHammer(world);
    // Add calls to other workbench tool creation functions here if needed
}

function createWrench(world) {
    const { scene, colliders } = world;
    const workbenchY = 0.95; // Top surface Y of workbench (adjust if needed)
    const toolOffset = 0.01; // Small offset above surface

    // Materials
    const toolMat = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.8, roughness: 0.45 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x991100, roughness: 0.75 }); // Example red handle

    const wrench = new THREE.Group();
    const handleLength = 0.2;
    const headSize = 0.05;

    // Handle
    const handleGeo = new THREE.BoxGeometry(0.04, 0.02, handleLength);
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.z = 0; // Center handle along its length
    wrench.add(handle);

    // Head Part 1 (Boxy base)
    const headBaseGeo = new THREE.BoxGeometry(headSize, 0.025, headSize);
    const headBase = new THREE.Mesh(headBaseGeo, toolMat);
    headBase.position.z = -handleLength / 2 - headSize / 2 + 0.01; // Position at one end of handle
    wrench.add(headBase);

    // Head Part 2 (Open Jaw) - Simplified
    const jawPartGeo = new THREE.BoxGeometry(headSize * 0.8, 0.025, headSize * 0.4);
    const jawPart1 = new THREE.Mesh(jawPartGeo, toolMat);
    jawPart1.position.set(-headSize * 0.3, 0, -headSize * 0.3); // Offset from head base center
    headBase.add(jawPart1);

    // Position and orient the wrench on the workbench
    wrench.position.set(-4.2, workbenchY + toolOffset, -4.2); // Position on the workbench
    wrench.rotation.y = Math.PI / 6; // Rotate slightly
    wrench.rotation.x = Math.PI / 2; // Lay flat

    wrench.traverse(child => { // Ensure all parts cast shadow
        if (child.isMesh) {
            child.castShadow = true;
        }
    });

    scene.add(wrench);
    // Optional: Add collider if interaction is needed
    // colliders.push(new THREE.Box3().setFromObject(wrench));
}

function createHammer(world) {
    const { scene } = world;
    const workbenchY = 0.95;
    const toolOffset = 0.01;

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.4 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 }); // Simple wood color

    const hammer = new THREE.Group();

    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.25, 8); // Tapered handle
    const handle = new THREE.Mesh(handleGeo, woodMat);
    handle.position.y = -0.125; // Position so top is at origin
    hammer.add(handle);

    // Head
    const headGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.1, 12);
    const head = new THREE.Mesh(headGeo, metalMat);
    head.rotation.z = Math.PI / 2; // Orient horizontally
    head.position.y = 0; // Position at top of handle
    hammer.add(head);

    // Claw part (simplified wedge)
    const clawShape = new THREE.Shape();
    clawShape.moveTo(0, 0.03);
    clawShape.lineTo(0.05, 0.01);
    clawShape.lineTo(0.05, -0.01);
    clawShape.lineTo(0, -0.03);
    clawShape.lineTo(0, 0.03);
    const extrudeSettings = { depth: 0.03, bevelEnabled: false };
    const clawGeo = new THREE.ExtrudeGeometry(clawShape, extrudeSettings);
    const claw = new THREE.Mesh(clawGeo, metalMat);
    claw.position.x = 0.05; // Position at one end of head cylinder
    claw.rotation.y = Math.PI/2; // Align depth with head axis
    head.add(claw); // Add to the head mesh

    // Position hammer on the workbench
    hammer.position.set(-3.7, workbenchY + 0.03, -3.9); // Position on workbench
    hammer.rotation.y = -Math.PI / 4;
    hammer.rotation.z = Math.PI / 2 + 0.1; // Lay it on its side

    hammer.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
        }
    });

    scene.add(hammer);
    // Optional: Add collider
    // colliders.push(new THREE.Box3().setFromObject(hammer));
}