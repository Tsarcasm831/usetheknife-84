import * as THREE from 'three';

// --- Truck Wheel Creation ---
export function createTruckWheels(dims, materials, truckGroup) {
    // --- Segmented Wheel Parameters ---
    const numSegments = 12; // Number of segments around the wheel
    const segmentAngle = (Math.PI * 2) / numSegments;
    const segmentDepth = dims.wheelWidth; // Wheel width is the depth of the segments
    const segmentInnerRadius = dims.wheelRadius * 0.6; // Radius to the inner edge of segments
    const segmentOuterRadius = dims.wheelRadius; // Radius to the outer edge
    const segmentThickness = (segmentOuterRadius - segmentInnerRadius) * 1.2; // Thickness of each segment block (slightly overlapping)
    const segmentLength = segmentOuterRadius * segmentAngle * 0.9; // Length along the circumference (slightly gapped)

    // --- Create Segment Geometry (reused for all segments) ---
    // Use a BoxGeometry as the base for each segment
    const segmentGeo = new THREE.BoxGeometry(segmentLength, segmentThickness, segmentDepth);
    // We will position and rotate instances of this geometry

    // --- Define Wheel Positions ---
    const frontWheelX = dims.wheelbase / 2 - dims.hoodLength * 0.5;
    const rearWheelX = dims.wheelbase / 2 - dims.hoodLength - dims.cabLength - dims.bedLength * 0.7;
    const wheelY = dims.groundClearance + dims.wheelRadius;
    const wheelPositions = [
        new THREE.Vector3(frontWheelX, wheelY, dims.trackWidth / 2), // Front Right Center
        new THREE.Vector3(frontWheelX, wheelY, -dims.trackWidth / 2),// Front Left Center
        new THREE.Vector3(rearWheelX, wheelY, dims.trackWidth / 2),  // Rear Right Center
        new THREE.Vector3(rearWheelX, wheelY, -dims.trackWidth / 2) // Rear Left Center
    ];

    wheelPositions.forEach((pos, index) => {
        const wheelGroup = new THREE.Group();

        // --- Create and Position Segments ---
        for (let i = 0; i < numSegments; i++) {
            const angle = i * segmentAngle;
            const segmentMesh = new THREE.Mesh(segmentGeo, materials.wheelMat); // Use standard wheel material

            // Calculate position: Average radius between inner and outer edge
            const currentRadius = (segmentInnerRadius + segmentOuterRadius) / 2;
            const xPos = Math.cos(angle) * currentRadius;
            const yPos = Math.sin(angle) * currentRadius;

            segmentMesh.position.set(xPos, yPos, 0); // Position in the XY plane first

            // Rotate segment to align with the tangent of the circle
            segmentMesh.rotation.z = angle + Math.PI / 2; // Rotate around Z axis

            segmentMesh.castShadow = true;
            segmentMesh.receiveShadow = true;
            wheelGroup.add(segmentMesh);
        }

        // --- Optional: Add a simple central cylinder/hub ---
        const hubGeo = new THREE.CylinderGeometry(segmentInnerRadius * 0.8, segmentInnerRadius * 0.7, segmentDepth * 1.1, 16);
        const hubMesh = new THREE.Mesh(hubGeo, materials.axleMat); // Use axle material
        hubMesh.rotation.x = Math.PI / 2; // Align hub cylinder axis with local Z
        wheelGroup.add(hubMesh);

        // Position the entire wheel group AT THE CALCULATED CENTER POINT
        wheelGroup.position.copy(pos);

        truckGroup.add(wheelGroup);
    });

    // --- Add Axles / Suspension ---
    const axleRadius = 0.06;
    const axleLength = dims.trackWidth; // Make axle length match trackWidth better
    const axleY = dims.bodyBaseY - dims.wheelRadius * 0.5; // Position below body base

    // Rear Axle (Solid)
    const rearAxleGeo = new THREE.CylinderGeometry(axleRadius, axleRadius, axleLength, 12);
    const rearAxle = new THREE.Mesh(rearAxleGeo, materials.axleMat);
    rearAxle.rotation.z = Math.PI / 2; // Align cylinder length along X axis (left-right)
    rearAxle.position.set(rearWheelX, axleY, 0); // Center X at rear wheel position, Y below body
    rearAxle.castShadow = true;
    truckGroup.add(rearAxle);

    // Rear Differential (Still a Simplified Box)
    const diffGeo = new THREE.BoxGeometry(0.25, 0.25, 0.2);
    const diff = new THREE.Mesh(diffGeo, materials.axleMat);
    diff.position.set(rearWheelX, axleY, 0); // Same position as axle center
    diff.castShadow = true;
    truckGroup.add(diff);

    // Front Suspension (Simplified - Control Arms, no solid axle)
    const controlArmGeo = new THREE.BoxGeometry(0.4, 0.05, 0.05); // Length, Thickness, Thickness
    const armTargetXOffset = 0.3; // How far towards center X arms should point/attach conceptually

    // Front Right Control Arms
    const ctrlArmFR1 = new THREE.Mesh(controlArmGeo, materials.axleMat);
    // Start near wheel X/Y, slightly offset Z towards center from wheel Z
    ctrlArmFR1.position.set(frontWheelX - 0.1, axleY + 0.05, dims.trackWidth * 0.35);
    // Point towards an implied attachment point further forward and centered Z
    ctrlArmFR1.lookAt(new THREE.Vector3(frontWheelX + armTargetXOffset, axleY + 0.05, 0));
    ctrlArmFR1.castShadow = true;
    truckGroup.add(ctrlArmFR1);

    const ctrlArmFR2 = new THREE.Mesh(controlArmGeo, materials.axleMat);
    // Second arm, different start pos, same target concept
    ctrlArmFR2.position.set(frontWheelX + 0.1, axleY - 0.05, dims.trackWidth * 0.3);
    ctrlArmFR2.lookAt(new THREE.Vector3(frontWheelX + armTargetXOffset + 0.1, axleY - 0.05, 0));
    ctrlArmFR2.castShadow = true;
    truckGroup.add(ctrlArmFR2);

    // Front Left Control Arms
    const ctrlArmFL1 = new THREE.Mesh(controlArmGeo, materials.axleMat);
    ctrlArmFL1.position.set(frontWheelX - 0.1, axleY + 0.05, -dims.trackWidth * 0.35); // Negative Z
    ctrlArmFL1.lookAt(new THREE.Vector3(frontWheelX + armTargetXOffset, axleY + 0.05, 0)); // Look towards center Z
    ctrlArmFL1.castShadow = true;
    truckGroup.add(ctrlArmFL1);

    const ctrlArmFL2 = new THREE.Mesh(controlArmGeo, materials.axleMat);
    ctrlArmFL2.position.set(frontWheelX + 0.1, axleY - 0.05, -dims.trackWidth * 0.3); // Negative Z
    ctrlArmFL2.lookAt(new THREE.Vector3(frontWheelX + armTargetXOffset + 0.1, axleY - 0.05, 0)); // Look towards center Z
    ctrlArmFL2.castShadow = true;
    truckGroup.add(ctrlArmFL2);
}