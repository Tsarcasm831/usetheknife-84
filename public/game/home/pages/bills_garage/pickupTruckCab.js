import * as THREE from 'three';

// --- Truck Cab Creation ---

export function createTruckCab(dims, materials) {
    const cabGroup = new THREE.Group(); // Group for cab and details
    // No need to position group Y here, do it in setup based on center

    // --- Main Cab Shape ---
    const cabGeo = new THREE.BoxGeometry(dims.cabLength, dims.cabHeight, dims.cabWidth, 4, 4, 4); // Add segments for deformation
    const pos = cabGeo.attributes.position;
    const halfH = dims.cabHeight / 2;
    const halfL = dims.cabLength / 2;
    const halfW = dims.cabWidth / 2;

    // Taper amounts
    const taperFrontTopZ = 0.90;
    const taperBackTopZ = 0.95;
    const taperFrontBottomZ = 0.98;
    const taperBackBottomZ = 1.0;

    // Rake amounts
    const frontRakeFactor = 0.30;
    const backRakeFactor = 0.08;

    // Roof curve amount
    const roofCurveAmount = 0.03;

    // --- Deform Geometry ---
    for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);
        const originalY = y; // Store original Y for roof curve calc

        // --- Z Tapering (Width) ---
        const isTop = Math.abs(y - halfH) < 0.01;
        const isBottom = Math.abs(y + halfH) < 0.01;
        const frontFactor = (x + halfL) / dims.cabLength; // 0 at back, 1 at front

        let targetTaper = 1.0;
        if (isTop) {
            targetTaper = THREE.MathUtils.lerp(taperBackTopZ, taperFrontTopZ, frontFactor);
        } else if (isBottom) {
            targetTaper = THREE.MathUtils.lerp(taperBackBottomZ, taperFrontBottomZ, frontFactor);
        } else {
            const verticalFactor = (y + halfH) / dims.cabHeight;
            const bottomTaper = THREE.MathUtils.lerp(taperBackBottomZ, taperFrontBottomZ, frontFactor);
            const topTaper = THREE.MathUtils.lerp(taperBackTopZ, taperFrontTopZ, frontFactor);
            targetTaper = THREE.MathUtils.lerp(bottomTaper, topTaper, verticalFactor);
        }
        pos.setZ(i, Math.sign(z) * halfW * targetTaper);
        z = pos.getZ(i); // Update z after tapering for roof curve calc

        // --- X Raking (Length/Angle) ---
        const isFrontFace = Math.abs(x - halfL) < 0.01;
        const isBackFace = Math.abs(x + halfL) < 0.01;
        if (y > -halfH * 0.5) {
             const heightFactor = (y + halfH * 0.5) / (halfH * 1.5);
             if (isFrontFace) {
                 pos.setX(i, x - heightFactor * halfL * frontRakeFactor);
             } else if (isBackFace) {
                 pos.setX(i, x + heightFactor * halfL * backRakeFactor);
             }
        }
        x = pos.getX(i); // Update x after raking

        // --- Y Roof Curve ---
        if (Math.abs(y - halfH) < 0.01) {
             // Apply curve based on x and z position relative to center
             const curveFactorX = 1.0 - Math.pow(Math.abs(x) / (halfL * (1-frontRakeFactor*0.5)), 2); // Stronger curve near middle X
             const curveFactorZ = 1.0 - Math.pow(Math.abs(z) / (halfW * taperFrontTopZ * 0.9), 2); // Stronger curve near middle Z
             y = y + roofCurveAmount * Math.max(0, curveFactorX) * Math.max(0, curveFactorZ);
             pos.setY(i, y);
        }
    }
    cabGeo.attributes.position.needsUpdate = true;
    cabGeo.computeVertexNormals();

    const cab = new THREE.Mesh(cabGeo, materials.bodyMat);
    // Position mesh centered within the group (group will be positioned)
    cab.position.y = 0; // Center the box vertically within the group
    cab.castShadow = true;
    cab.receiveShadow = true;
    cabGroup.add(cab);

    // --- Door Seam Lines ---
    const gapDepth = 0.006;
    const gapThickness = 0.008;
    const gapMaterial = materials.gapMat;
    const doorHeight = dims.cabHeight * 0.88; // Adjusted height slightly
    const doorBottomYRel = - halfH * 0.9; // Relative Y bottom (lower)
    const doorTopYRel = doorBottomYRel + doorHeight; // Relative Y top

    // Function to get deformed coordinates for seams
    const getDeformedPoint = (xLocal, yLocal, zSign) => {
        const vec = new THREE.Vector3(xLocal, yLocal, halfW * zSign); // Start with basic coords

        // Apply taper (approximate)
        const frontFactor = (vec.x + halfL) / dims.cabLength;
        const verticalFactor = (vec.y + halfH) / dims.cabHeight;
        const bottomTaper = THREE.MathUtils.lerp(taperBackBottomZ, taperFrontBottomZ, frontFactor);
        const topTaper = THREE.MathUtils.lerp(taperBackTopZ, taperFrontTopZ, frontFactor);
        const targetTaper = THREE.MathUtils.lerp(bottomTaper, topTaper, verticalFactor);
        vec.z = halfW * targetTaper * zSign;

        // Apply rake (approximate)
        if (vec.y > -halfH * 0.5) {
            const heightFactor = (vec.y + halfH * 0.5) / (halfH * 1.5);
            if (Math.abs(vec.x - halfL) < 0.01) vec.x -= heightFactor * halfL * frontRakeFactor;
            if (Math.abs(vec.x + halfL) < 0.01) vec.x += heightFactor * halfL * backRakeFactor;
        }

        // Apply roof curve (approximate for top edge)
        if (Math.abs(vec.y - halfH) < 0.01) {
             const curveFactorX = 1.0 - Math.pow(Math.abs(vec.x) / (halfL * (1-frontRakeFactor*0.5)), 2);
             const curveFactorZ = 1.0 - Math.pow(Math.abs(vec.z) / (halfW * taperFrontTopZ*0.9), 2);
             vec.y += roofCurveAmount * Math.max(0, curveFactorX) * Math.max(0, curveFactorZ);
        }

        return vec;
    }

    // Vertical seam (front) - Use deformed points
    const frontSeamX = halfL * 0.6;
    const frontSeamPathR = new THREE.LineCurve3(
        getDeformedPoint(frontSeamX, doorBottomYRel, 1).add(new THREE.Vector3(0, 0, gapDepth)), // Offset for gap
        getDeformedPoint(frontSeamX, doorTopYRel, 1).add(new THREE.Vector3(0, 0, gapDepth))
    );
    const frontSeamGeo = new THREE.TubeGeometry(frontSeamPathR, 1, gapThickness/2, 4, false);
    const vGapFrontR = new THREE.Mesh(frontSeamGeo, gapMaterial);
    cab.add(vGapFrontR); // Add directly to cab mesh local space

    const frontSeamPathL = new THREE.LineCurve3(
        getDeformedPoint(frontSeamX, doorBottomYRel, -1).add(new THREE.Vector3(0, 0, -gapDepth)),
        getDeformedPoint(frontSeamX, doorTopYRel, -1).add(new THREE.Vector3(0, 0, -gapDepth))
    );
    const frontSeamGeoL = new THREE.TubeGeometry(frontSeamPathL, 1, gapThickness/2, 4, false);
    const vGapFrontL = new THREE.Mesh(frontSeamGeoL, gapMaterial);
    cab.add(vGapFrontL);

    // Vertical seam (rear) - Use deformed points
    const rearSeamX = -halfL * 0.6;
    const rearSeamPathR = new THREE.LineCurve3(
        getDeformedPoint(rearSeamX, doorBottomYRel, 1).add(new THREE.Vector3(0, 0, gapDepth)),
        getDeformedPoint(rearSeamX, doorTopYRel, 1).add(new THREE.Vector3(0, 0, gapDepth))
    );
    const rearSeamGeoR = new THREE.TubeGeometry(rearSeamPathR, 1, gapThickness/2, 4, false);
    const vGapRearR = new THREE.Mesh(rearSeamGeoR, gapMaterial);
    cab.add(vGapRearR);

    const rearSeamPathL = new THREE.LineCurve3(
        getDeformedPoint(rearSeamX, doorBottomYRel, -1).add(new THREE.Vector3(0, 0, -gapDepth)),
        getDeformedPoint(rearSeamX, doorTopYRel, -1).add(new THREE.Vector3(0, 0, -gapDepth))
    );
    const rearSeamGeoL = new THREE.TubeGeometry(rearSeamPathL, 1, gapThickness/2, 4, false);
    const vGapRearL = new THREE.Mesh(rearSeamGeoL, gapMaterial);
    cab.add(vGapRearL);

    // Horizontal seam (top) - Use deformed points
    const topSeamPathR = new THREE.LineCurve3(
        getDeformedPoint(rearSeamX, doorTopYRel, 1).add(new THREE.Vector3(0, 0, gapDepth)),
        getDeformedPoint(frontSeamX, doorTopYRel, 1).add(new THREE.Vector3(0, 0, gapDepth))
    );
    const topSeamGeoR = new THREE.TubeGeometry(topSeamPathR, 1, gapThickness/2, 4, false);
    const hGapTopR = new THREE.Mesh(topSeamGeoR, gapMaterial);
    cab.add(hGapTopR);

    const topSeamPathL = new THREE.LineCurve3(
        getDeformedPoint(rearSeamX, doorTopYRel, -1).add(new THREE.Vector3(0, 0, -gapDepth)),
        getDeformedPoint(frontSeamX, doorTopYRel, -1).add(new THREE.Vector3(0, 0, -gapDepth))
    );
    const topSeamGeoL = new THREE.TubeGeometry(topSeamPathL, 1, gapThickness/2, 4, false);
    const hGapTopL = new THREE.Mesh(topSeamGeoL, gapMaterial);
    cab.add(hGapTopL);

    // Horizontal seam (bottom) - Use deformed points
    const bottomSeamPathR = new THREE.LineCurve3(
        getDeformedPoint(rearSeamX, doorBottomYRel, 1).add(new THREE.Vector3(0, 0, gapDepth)),
        getDeformedPoint(frontSeamX, doorBottomYRel, 1).add(new THREE.Vector3(0, 0, gapDepth))
    );
    const bottomSeamGeoR = new THREE.TubeGeometry(bottomSeamPathR, 1, gapThickness/2, 4, false);
    const hGapBottomR = new THREE.Mesh(bottomSeamGeoR, gapMaterial);
    cab.add(hGapBottomR);

    const bottomSeamPathL = new THREE.LineCurve3(
        getDeformedPoint(rearSeamX, doorBottomYRel, -1).add(new THREE.Vector3(0, 0, -gapDepth)),
        getDeformedPoint(frontSeamX, doorBottomYRel, -1).add(new THREE.Vector3(0, 0, -gapDepth))
    );
    const bottomSeamGeoL = new THREE.TubeGeometry(bottomSeamPathL, 1, gapThickness/2, 4, false);
    const hGapBottomL = new THREE.Mesh(bottomSeamGeoL, gapMaterial);
    cab.add(hGapBottomL);

    return cabGroup; // Return the group
}