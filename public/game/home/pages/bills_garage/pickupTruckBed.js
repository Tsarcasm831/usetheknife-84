import * as THREE from 'three';

// --- Truck Bed Creation ---

export function createTruckBed(dims, materials) {
    const bedGroup = new THREE.Group();
    // Position group base at bodyBaseY level for consistency
    bedGroup.position.y = dims.bodyBaseY;

    const bedFloorY = 0; // Relative Y position within the group
    const gapDepth = 0.006;
    const gapThickness = 0.008;
    const gapMaterial = materials.gapMat;

    // Bed Floor with Ribs
    const bedFloorGeo = new THREE.BoxGeometry(dims.bedLength, 0.05, dims.bedWidth);
    const bedFloor = new THREE.Mesh(bedFloorGeo, materials.bodyMat);
    bedFloor.position.y = bedFloorY; // Position floor at base of group
    bedFloor.castShadow = true;
    bedFloor.receiveShadow = true;
    bedGroup.add(bedFloor);

    // Ribs on the floor (thinner)
    const ribHeight = 0.015; // Thinner ribs
    const ribWidth = 0.025; // Wider ribs
    const numRibs = 10; // Fewer, wider ribs
    const ribGeo = new THREE.BoxGeometry(dims.bedLength * 0.98, ribHeight, ribWidth);
    const ribMat = materials.bodyMat.clone();
    ribMat.color.multiplyScalar(0.80); // Darker ribs
    ribMat.metalness *= 0.7; // Less metallic ribs
    ribMat.roughness *= 1.2; // Rougher

    for (let i = 0; i < numRibs; i++) {
        const rib = new THREE.Mesh(ribGeo, ribMat);
        rib.position.y = bedFloorY + 0.025 + ribHeight / 2; // Position on top of floor
        rib.position.z = -dims.bedWidth / 2 + dims.bedWidth * (i + 0.5) / numRibs;
        rib.castShadow = true;
        // rib.receiveShadow = true; // Ribs might not receive much shadow inside bed
        bedGroup.add(rib);
    }

    const bedSideGeo = new THREE.BoxGeometry(dims.bedLength, dims.bedHeight, 0.05);
    const bedSideLeft = new THREE.Mesh(bedSideGeo, materials.bodyMat);
    // Position relative to group base Y
    bedSideLeft.position.set(0, bedFloorY + dims.bedHeight / 2, -dims.bedWidth / 2 + 0.025);
    bedSideLeft.castShadow = true;
    bedSideLeft.receiveShadow = true;
    bedGroup.add(bedSideLeft);

    const bedSideRight = bedSideLeft.clone();
    bedSideRight.position.z = dims.bedWidth / 2 - 0.025;
    bedGroup.add(bedSideRight);

    // Add top rail to bed sides
    const railGeo = new THREE.BoxGeometry(dims.bedLength, 0.04, 0.07);
    const railMat = materials.bodyMat.clone(); // Could use chrome or black plastic
    railMat.color.set(0x222222);
    railMat.metalness = 0.1;
    railMat.roughness = 0.7;

    const railLeft = new THREE.Mesh(railGeo, railMat);
     // Position relative to group base Y
    railLeft.position.set(0, bedFloorY + dims.bedHeight + 0.02, -dims.bedWidth / 2 + 0.035);
    railLeft.castShadow = true;
    bedGroup.add(railLeft);

    const railRight = railLeft.clone();
    railRight.position.z = dims.bedWidth / 2 - 0.035;
    bedGroup.add(railRight);

    // --- Tailgate ---
    const tailgateWidth = dims.bedWidth - 0.1; // Slightly narrower than bed outer width
    const bedBackGeo = new THREE.BoxGeometry(0.05, dims.bedHeight, tailgateWidth); // Tailgate Panel
    const bedBack = new THREE.Mesh(bedBackGeo, materials.bodyMat);
    const tailgateX = -dims.bedLength / 2 + 0.025;
    const tailgateY = bedFloorY + dims.bedHeight / 2; // Relative to group base Y
    bedBack.position.set(tailgateX, tailgateY, 0);
    bedBack.castShadow = true;
    bedBack.receiveShadow = true;
    bedGroup.add(bedBack);

    // Add top rail to tailgate
    const tailgateRailGeo = new THREE.BoxGeometry(0.07, 0.04, tailgateWidth); // Match tailgate width
    const tailgateRail = new THREE.Mesh(tailgateRailGeo, railMat); // Use same rail material
    tailgateRail.position.set(tailgateX, tailgateY + dims.bedHeight/2 + 0.02, 0);
    tailgateRail.castShadow = true;
    bedGroup.add(tailgateRail);

    // --- Tailgate Gaps ---
    // Vertical gaps (using tubes for potentially better corner joins)
    const sideGapLength = dims.bedHeight;
    const sideGapCurve = new THREE.LineCurve3(
        new THREE.Vector3(tailgateX, bedFloorY, tailgateWidth/2 + gapDepth),
        new THREE.Vector3(tailgateX, bedFloorY + sideGapLength, tailgateWidth/2 + gapDepth)
    );
    const sideGapGeo = new THREE.TubeGeometry(sideGapCurve, 1, gapThickness/2, 4, false);
    const tailgateGapR = new THREE.Mesh(sideGapGeo, gapMaterial);
    bedGroup.add(tailgateGapR);

    const tailgateGapL = new THREE.Mesh(sideGapGeo, gapMaterial);
    tailgateGapL.scale.z = -1; // Flip for left side
    bedGroup.add(tailgateGapL);

    // Bottom gap
    const bottomGapCurve = new THREE.LineCurve3(
         new THREE.Vector3(tailgateX, bedFloorY, -tailgateWidth/2),
         new THREE.Vector3(tailgateX, bedFloorY, tailgateWidth/2)
    );
    const bottomGapGeo = new THREE.TubeGeometry(bottomGapCurve, 1, gapThickness/2, 4, false);
    const tailgateGapBottom = new THREE.Mesh(bottomGapGeo, gapMaterial);
    tailgateGapBottom.position.y += gapDepth; // Offset slightly
    bedGroup.add(tailgateGapBottom);

    // Tailgate Handle (recessed look)
    const handleRecessGeo = new THREE.BoxGeometry(0.02, 0.06, 0.22); // Slightly larger recess
    const handleRecessMat = materials.bodyMat.clone();
    handleRecessMat.color.multiplyScalar(0.6); // Darker recess
    const handleRecess = new THREE.Mesh(handleRecessGeo, handleRecessMat);
    handleRecess.position.set(tailgateX + 0.025, bedFloorY + dims.bedHeight * 0.8, 0);
    bedGroup.add(handleRecess); // Add to bed group directly

    const tailgateHandleGeo = new THREE.BoxGeometry(0.015, 0.05, 0.2); // The actual handle part slightly thicker
    const tailgateHandle = new THREE.Mesh(tailgateHandleGeo, materials.chromeMat);
    tailgateHandle.position.set(handleRecess.position.x + 0.01, handleRecess.position.y, 0); // Position inside recess
    tailgateHandle.castShadow = true;
    bedGroup.add(tailgateHandle); // Add to bed group

    return bedGroup;
}