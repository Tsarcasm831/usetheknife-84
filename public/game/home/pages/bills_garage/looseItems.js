// Placeholder: Loose items like gears, cans, rags etc.
import * as THREE from 'three';

export function setupLooseItems(world) {
    const { scene, colliders } = world;

    // --- Example: Gear on the floor ---
    const gearMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.7, roughness: 0.5 });
    const gearRadius = 0.1;
    const gearThickness = 0.03;
    const numTeeth = 12;
    const gearShape = new THREE.Shape();
    const toothDepth = 0.02;
    const innerRadius = gearRadius - toothDepth;

    for (let i = 0; i < numTeeth; i++) {
        const angle = (i / numTeeth) * Math.PI * 2;
        const nextAngle = ((i + 1) / numTeeth) * Math.PI * 2;
        const midAngle = (angle + nextAngle) / 2;

        // Outer point
        gearShape.lineTo(Math.cos(angle) * gearRadius, Math.sin(angle) * gearRadius);
        // Tooth top midpoint
        gearShape.lineTo(Math.cos(angle + (nextAngle - angle) / 4) * gearRadius, Math.sin(angle + (nextAngle - angle) / 4) * gearRadius);
         gearShape.lineTo(Math.cos(midAngle) * innerRadius, Math.sin(midAngle) * innerRadius); // Inner point
         // Tooth bottom midpoint
        gearShape.lineTo(Math.cos(midAngle + (nextAngle - midAngle)/2) * gearRadius, Math.sin(midAngle + (nextAngle-midAngle)/2) * gearRadius);
    }
    gearShape.closePath();

    // Add a central hole
     const holePath = new THREE.Path();
     holePath.absarc(0, 0, gearRadius * 0.3, 0, Math.PI * 2, false);
     gearShape.holes.push(holePath);


    const extrudeSettings = { depth: gearThickness, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 1 };
    const gearGeo = new THREE.ExtrudeGeometry(gearShape, extrudeSettings);
    const gear = new THREE.Mesh(gearGeo, gearMat);

    gear.rotation.x = -Math.PI / 2; // Lay flat
    gear.rotation.z = Math.random() * Math.PI * 2; // Random rotation
    gear.position.set(1.5, gearThickness / 2, -2.0); // Position on floor
    gear.castShadow = true;
    gear.receiveShadow = true;
    scene.add(gear);
    // colliders.push(new THREE.Box3().setFromObject(gear)); // Collider if needed

     // --- Example: Rag on workbench ---
    const ragMat = new THREE.MeshStandardMaterial({ color: 0xbbbbdd, roughness: 0.9 });
    // Use a plane and modify vertices slightly for a crumpled look
    const ragGeo = new THREE.PlaneGeometry(0.3, 0.25, 5, 4);
    const pos = ragGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        pos.setZ(i, Math.random() * 0.03 - 0.015); // Random Z offset
         pos.setY(i, pos.getY(i) + Math.random() * 0.02); // Random Y offset
    }
    ragGeo.computeVertexNormals();
    const rag = new THREE.Mesh(ragGeo, ragMat);
    rag.position.set(-3.8, 0.95 + 0.01, -4.3); // Position on workbench
    rag.rotation.x = -Math.PI / 2.2; // Angle it
    rag.rotation.z = Math.PI / 5;
    rag.castShadow = true;
    rag.receiveShadow = true;
    scene.add(rag);
}