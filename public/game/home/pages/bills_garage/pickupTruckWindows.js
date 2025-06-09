import * as THREE from 'three';

// --- Truck Window Creation ---

export function createTruckWindows(dims, materials, truckGroup) {
    const windowGroup = new THREE.Group();
    truckGroup.add(windowGroup);

    // --- Existing dimensions setup ---
    const bodyBaseY = dims.bodyBaseY;
    const cabHeight = dims.cabHeight;
    const cabLength = dims.cabLength;
    const cabWidth = dims.cabWidth;
    const hoodLength = dims.hoodLength;
    const wheelbase = dims.wheelbase;
    const frameThickness = dims.frameThickness * 0.7; // Even thinner frames
    const glassOffset = 0.005; // Small offset for glass from frame edge

    const cabFrontX = wheelbase / 2 - hoodLength;
    const cabCenterX = cabFrontX - cabLength / 2;
    const cabBackX = cabFrontX - cabLength;
    const cabTopY = bodyBaseY + cabHeight;
    const cabFloorY = bodyBaseY; // Assume cab floor is near body base

    // --- Front Window (Windshield) ---
    const frontWindowHeight = cabHeight * 0.55;
    const frontWindowWidth = cabWidth * 0.85;
    const frontWindowAngle = -Math.PI / 9; // Slightly more rake
    const frontWindowGeo = new THREE.PlaneGeometry(frontWindowWidth, frontWindowHeight);
    const frontWindow = new THREE.Mesh(frontWindowGeo, materials.windowMat);
    // Adjust position to align with raked A-pillars
    const frontWindowPosX = cabFrontX + Math.sin(frontWindowAngle) * (cabHeight * 0.55 / 2) + 0.03 - frameThickness;
    const frontWindowPosY = bodyBaseY + cabHeight * 0.55 + Math.cos(frontWindowAngle) * (cabHeight * 0.55 / 2) - cabHeight*0.275;

    frontWindow.position.set(frontWindowPosX, frontWindowPosY , 0);
    frontWindow.rotation.y = Math.PI / 2;
    frontWindow.rotation.z = frontWindowAngle;
    windowGroup.add(frontWindow);

    // Add simple interior dashboard shape behind front window
    const dashGeo = new THREE.BoxGeometry(cabWidth * 0.85, 0.15, 0.35); // Slightly deeper dash
    const dashboard = new THREE.Mesh(dashGeo, materials.interiorMat);
    // Position relative to cab front, angled like window, lower down
    dashboard.position.set(cabFrontX - 0.15, bodyBaseY + cabHeight * 0.2, 0);
    dashboard.rotation.z = frontWindowAngle * 0.8; // Slightly less angle than window
    truckGroup.add(dashboard); // Add directly to truck, not window group

    // --- A-Pillars --- (Using thinner frameThickness)
    const aPillarGeo = new THREE.BoxGeometry(0.1, cabHeight * 0.65, frameThickness * 1.5); // Slightly thicker pillar
    const aPillarLeft = new THREE.Mesh(aPillarGeo, materials.bodyMat);
    aPillarLeft.position.set(cabFrontX + 0.05, bodyBaseY + cabHeight * 0.5, -cabWidth / 2 * 0.9);
    aPillarLeft.rotation.z = frontWindowAngle;
    aPillarLeft.castShadow = true;
    truckGroup.add(aPillarLeft);
    const aPillarRight = aPillarLeft.clone();
    aPillarRight.position.z = cabWidth / 2 * 0.9;
    truckGroup.add(aPillarRight);

    // --- Side Windows ---
    const sideWindowHeight = cabHeight * 0.50;
    const sideWindowLength = cabLength * 0.7;
    const sideWindowGeo = new THREE.PlaneGeometry(sideWindowLength, sideWindowHeight);

    const sideWindowLeft = new THREE.Mesh(sideWindowGeo, materials.windowMat);
    sideWindowLeft.position.set(cabCenterX, bodyBaseY + cabHeight * 0.55, -cabWidth / 2 * 0.95 + 0.02);
    windowGroup.add(sideWindowLeft);

    // Side Window Frame (simplified - removed as A/B pillars cover edges)

    // --- B-Pillar (Between side and rear window area) ---
    const bPillarGeo = new THREE.BoxGeometry(0.06, cabHeight * 0.65, frameThickness * 1.5); // Thinner B-pillar
    const bPillarLeft = new THREE.Mesh(bPillarGeo, materials.bodyMat);
    bPillarLeft.position.set(cabBackX + 0.05, bodyBaseY + cabHeight * 0.5, -cabWidth / 2 * 0.92); // Position at back of cab side
    bPillarLeft.castShadow = true;
    truckGroup.add(bPillarLeft);

    const bPillarRight = bPillarLeft.clone();
    bPillarRight.position.z = cabWidth / 2 * 0.92;
    truckGroup.add(bPillarRight);

    // --- Rear Window ---
    const rearWindowHeight = cabHeight * 0.45;
    const rearWindowWidth = cabWidth * 0.8;
    const rearWindowGeo = new THREE.PlaneGeometry(rearWindowWidth, rearWindowHeight);
    const rearWindow = new THREE.Mesh(rearWindowGeo, materials.windowMat);
    rearWindow.position.set(cabBackX + 0.03, bodyBaseY + cabHeight * 0.55, 0);
    rearWindow.rotation.y = -Math.PI / 2;
    windowGroup.add(rearWindow);

    // --- Add simple seat shapes visible through windows ---
    const seatHeight = cabHeight * 0.6;
    const seatWidth = cabWidth * 0.35;
    const seatDepth = 0.4;
    const seatGeo = new THREE.BoxGeometry(seatDepth, seatHeight, seatWidth);

    const seatLeft = new THREE.Mesh(seatGeo, materials.interiorMat);
    seatLeft.position.set(cabCenterX + 0.1, bodyBaseY + seatHeight * 0.4, -cabWidth * 0.25); // Position inside cab
    truckGroup.add(seatLeft);

    const seatRight = seatLeft.clone();
    seatRight.position.z = cabWidth * 0.25;
    truckGroup.add(seatRight);
}