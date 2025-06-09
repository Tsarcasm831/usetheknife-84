import * as THREE from 'three';

// --- Truck Hood Creation ---

export function createTruckHood(dims, materials) {
    const hoodGroup = new THREE.Group(); // Group to hold hood and details
    hoodGroup.position.y = dims.bodyBaseY; // Position group vertically

    // --- Main Hood Panel ---
    const hoodShape = new THREE.Shape();
    const backWidth = dims.cabWidth / 2 * 0.9;
    const frontWidth = backWidth * 0.95;
    const hoodHeight = dims.cabHeight * 0.85; // Used for extrusion depth

    // Add slight curve to front edge
    const frontCurveAmount = frontWidth * 0.1;
    hoodShape.moveTo(-frontWidth, 0);
    hoodShape.quadraticCurveTo(0, -frontCurveAmount, frontWidth, 0); // Curved front edge
    hoodShape.lineTo(backWidth, dims.hoodLength);
    hoodShape.lineTo(-backWidth, dims.hoodLength);
    hoodShape.closePath();

    const hoodExtrudeSettings = {
        steps: 1,
        depth: hoodHeight, // Extrusion depth is height
        bevelEnabled: true,
        bevelThickness: 0.012, // Slightly thinner bevel
        bevelSize: 0.008,
        bevelOffset: 0,
        bevelSegments: 2
    };
    const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, hoodExtrudeSettings);
    hoodGeo.computeVertexNormals();

    // Hood bulge/ridge
    const positions = hoodGeo.attributes.position;
    const centerLineZ = dims.hoodLength * 0.5;
    const bulgeAmount = 0.035; // Slightly less prominent bulge
    const bulgeWidthFactor = 0.35;
    const bulgeLengthFactor = 0.65;

    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i); // Local X (width)
        const z = positions.getZ(i); // Local Z (length)
        const y = positions.getY(i); // Local Y (height/extrusion depth)

        // Apply bulge only to the top surface (maximum Y value after extrusion)
        if (Math.abs(y - hoodHeight) < 0.01) {
            const widthFalloff = THREE.MathUtils.smoothstep(Math.abs(x) / (backWidth * bulgeWidthFactor), 0, 1);
            const lengthFalloff = THREE.MathUtils.smoothstep(Math.abs(z - centerLineZ) / (dims.hoodLength * bulgeLengthFactor * 0.5), 0, 1);
            const factor = widthFalloff * lengthFalloff;
            positions.setY(i, y + bulgeAmount * factor); // Add bulge
        }
    }
    hoodGeo.attributes.position.needsUpdate = true;
    hoodGeo.computeVertexNormals(); // Recompute normals after bulge

    const hood = new THREE.Mesh(hoodGeo, materials.bodyMat);
    hood.rotation.x = Math.PI / 2; // Rotate to lay flat

    // Position hood so its back edge aligns with cab front X, and its top surface is roughly correct
    hood.position.y = dims.cabHeight / 2 * 1.05; // Adjust vertical alignment slightly
    hood.position.z = -dims.hoodLength; // Shift forward by its length so back edge is at origin

    hood.castShadow = true;
    hood.receiveShadow = true;
    hoodGroup.add(hood);

    // --- Panel Gaps ---
    const gapDepth = 0.007;
    const gapThickness = 0.009;
    const gapMaterial = materials.gapMat;

    // Side Gaps (adjusted paths for rotated/positioned hood)
    const sideGapPathL = new THREE.LineCurve3(
        new THREE.Vector3(-backWidth - gapDepth, hood.position.y - hoodHeight / 2, 0), // Back bottom (relative Z=0)
        new THREE.Vector3(-frontWidth - gapDepth - frontCurveAmount*0.1, hood.position.y + hoodHeight / 2, -dims.hoodLength) // Front top (relative Z=-length)
    );
    const sideGapPathR = new THREE.LineCurve3(
        new THREE.Vector3(backWidth + gapDepth, hood.position.y - hoodHeight / 2, 0), // Back bottom
        new THREE.Vector3(frontWidth + gapDepth + frontCurveAmount*0.1, hood.position.y + hoodHeight / 2, -dims.hoodLength) // Front top
    );
    const sideGapGeoL = new THREE.TubeGeometry(sideGapPathL, 1, gapThickness / 2, 4, false);
    const leftGap = new THREE.Mesh(sideGapGeoL, gapMaterial);
    hoodGroup.add(leftGap);

    const sideGapGeoR = new THREE.TubeGeometry(sideGapPathR, 1, gapThickness / 2, 4, false);
    const rightGap = new THREE.Mesh(sideGapGeoR, gapMaterial);
    hoodGroup.add(rightGap);

    // Back Gap (adjusted path)
    const backGapPath = new THREE.LineCurve3(
        new THREE.Vector3(-backWidth, hood.position.y + hoodHeight / 2 + gapDepth, 0 - gapThickness / 2), // Adjusted Z
        new THREE.Vector3(backWidth, hood.position.y + hoodHeight / 2 + gapDepth, 0 - gapThickness / 2)  // Adjusted Z
    );
    const backGapGeo = new THREE.TubeGeometry(backGapPath, 1, gapThickness / 2, 4, false);
    const backGap = new THREE.Mesh(backGapGeo, gapMaterial);
    hoodGroup.add(backGap);

    // --- Wiper Fluid Nozzles (Small Detail) ---
    const nozzleGeo = new THREE.BoxGeometry(0.015, 0.01, 0.03);
    const nozzleMat = materials.plasticTrimMat; // Use trim material
    const nozzle1 = new THREE.Mesh(nozzleGeo, nozzleMat);
    // Position near the back edge of the hood (relative Z near 0), on top surface
    nozzle1.position.set(-dims.cabWidth * 0.15, hood.position.y + hoodHeight / 2 + 0.005, -0.05);
    hoodGroup.add(nozzle1);
    const nozzle2 = nozzle1.clone();
    nozzle2.position.x = dims.cabWidth * 0.15;
    hoodGroup.add(nozzle2);

    return hoodGroup; // Return the group
}