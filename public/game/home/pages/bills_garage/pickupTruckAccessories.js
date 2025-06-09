import * as THREE from 'three';

// --- Truck Accessory Creation ---

export function createTruckBumpers(dims, materials) {
    const bumperGroup = new THREE.Group();
    const bumperHeight = 0.18; // Increased height
    const bumperDepth = 0.22; // Increased depth
    const bumperWidth = dims.cabWidth * 1.1;
    const bumperCurve = 0.08; // More pronounced curve

    // Front Bumper Shape (more refined)
    const bumperShape = new THREE.Shape();
    bumperShape.moveTo(-bumperWidth / 2, -bumperDepth / 2 + bumperCurve);
    bumperShape.quadraticCurveTo(-bumperWidth / 2, -bumperDepth / 2, -bumperWidth / 2 + bumperCurve, -bumperDepth / 2);
    // Add slight indent near center
    bumperShape.lineTo(-bumperWidth * 0.2, -bumperDepth / 2);
    bumperShape.lineTo(-bumperWidth * 0.15, -bumperDepth * 0.4);
    bumperShape.lineTo(bumperWidth * 0.15, -bumperDepth * 0.4);
    bumperShape.lineTo(bumperWidth * 0.2, -bumperDepth / 2);
    bumperShape.quadraticCurveTo(bumperWidth / 2, -bumperDepth / 2, bumperWidth / 2, -bumperDepth / 2 + bumperCurve);
    bumperShape.lineTo(bumperWidth / 2, bumperDepth / 2 - bumperCurve);
    bumperShape.quadraticCurveTo(bumperWidth / 2, bumperDepth / 2, bumperWidth / 2 - bumperCurve, bumperDepth / 2);
    bumperShape.lineTo(-bumperWidth / 2 + bumperCurve, bumperDepth / 2);
    bumperShape.quadraticCurveTo(-bumperWidth / 2, bumperDepth / 2, -bumperWidth / 2, bumperDepth / 2 - bumperCurve);
    bumperShape.closePath();

    const extrudeSettings = {
        steps: 1,
        depth: bumperHeight,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 1
    };
    const bumperGeo = new THREE.ExtrudeGeometry(bumperShape, extrudeSettings);

    const frontBumper = new THREE.Mesh(bumperGeo, materials.chromeMat);
    frontBumper.position.set(dims.wheelbase / 2 + 0.1, dims.bodyBaseY - 0.1, 0);
    frontBumper.rotation.x = Math.PI / 2;
    frontBumper.castShadow = true;
    bumperGroup.add(frontBumper);

    const rearBumperGeo = new THREE.BoxGeometry(0.2, 0.15, dims.bedWidth * 1.05);
    const rearBumper = new THREE.Mesh(rearBumperGeo, materials.chromeMat);
    const bedBackX = dims.wheelbase / 2 - dims.hoodLength - dims.cabLength - dims.bedLength;
    rearBumper.position.set(bedBackX - 0.075, dims.bodyBaseY - 0.1, 0);
    rearBumper.castShadow = true;
    bumperGroup.add(rearBumper);

    return bumperGroup;
}

export function createTruckGrille(dims, materials) {
    const grilleGroup = new THREE.Group();
    const grilleHeight = dims.cabHeight * 0.4;
    const grilleWidth = dims.cabWidth * 0.7;
    const grilleDepth = 0.06;

    const frameShape = new THREE.Shape();
    frameShape.moveTo(-grilleWidth/2, -grilleHeight/2);
    frameShape.lineTo(grilleWidth/2, -grilleHeight/2);
    frameShape.lineTo(grilleWidth/2, grilleHeight/2);
    frameShape.lineTo(-grilleWidth/2, grilleHeight/2);
    frameShape.closePath();

    const hole = new THREE.Path();
    const innerWidth = grilleWidth * 0.9;
    const innerHeight = grilleHeight * 0.85;
    hole.moveTo(-innerWidth/2, -innerHeight/2);
    hole.lineTo(innerWidth/2, -innerHeight/2);
    hole.lineTo(innerWidth/2, innerHeight/2);
    hole.lineTo(-innerWidth/2, innerHeight/2);
    hole.closePath();
    frameShape.holes.push(hole);

    const extrudeSettings = { depth: grilleDepth * 0.5, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 };
    const frameGeo = new THREE.ExtrudeGeometry(frameShape, extrudeSettings);
    const frameMesh = new THREE.Mesh(frameGeo, materials.chromeMat);
    frameMesh.rotation.x = Math.PI / 2;
    grilleGroup.add(frameMesh);


    const numGrilleBars = 7;
    const grilleBarGeo = new THREE.BoxGeometry(grilleDepth * 0.6, innerHeight, 0.02);
    for (let i = 0; i < numGrilleBars; i++) {
        const bar = new THREE.Mesh(grilleBarGeo, materials.chromeMat);
        bar.position.z = -innerWidth / 2 + (i + 0.5) * (innerWidth / numGrilleBars);
        bar.position.y = grilleDepth * 0.3;
        grilleGroup.add(bar);
    }

    const emblemGeo = new THREE.CircleGeometry(0.06, 16);
    const emblemMat = new THREE.MeshStandardMaterial({ color: 0x880000, roughness: 0.3, metalness: 0.7});
    const emblem = new THREE.Mesh(emblemGeo, emblemMat);
    emblem.position.y = grilleDepth * 0.51;
    emblem.rotation.x = Math.PI / 2;
    grilleGroup.add(emblem);

    grilleGroup.position.set(dims.wheelbase / 2, dims.bodyBaseY + grilleHeight * 0.3, 0);
    grilleGroup.castShadow = true;
    return grilleGroup;
}

export function createTruckLights(dims, materials) {
    const lightGroup = new THREE.Group();

    const headlightRadius = 0.1;
    const headlightDepth = 0.08;
    const headlightBaseGeo = new THREE.CylinderGeometry(headlightRadius, headlightRadius * 0.8, headlightDepth, 12);
    const headlightLensGeo = new THREE.CylinderGeometry(headlightRadius * 1.05, headlightRadius * 0.9, headlightDepth * 0.3, 12);

    const headlightLeft = new THREE.Group();
    const hlBaseL = new THREE.Mesh(headlightBaseGeo, materials.lightMatWhite);
    const hlLensL = new THREE.Mesh(headlightLensGeo, materials.lightLensMat);
    hlLensL.position.y = headlightDepth * 0.6;
    headlightLeft.add(hlBaseL, hlLensL);
    headlightLeft.rotation.z = Math.PI / 2;
    headlightLeft.position.set(dims.wheelbase / 2 - 0.005, dims.bodyBaseY + 0.15, -dims.cabWidth * 0.35);
    headlightLeft.castShadow = true;
    lightGroup.add(headlightLeft);

    const headlightRight = headlightLeft.clone(true);
    headlightRight.position.z = dims.cabWidth * 0.35;
    lightGroup.add(headlightRight);

    const taillightWidth = 0.06;
    const taillightHeight = 0.25;
    const taillightDepth = 0.08;
    const taillightBaseGeo = new THREE.BoxGeometry(taillightDepth, taillightHeight, taillightWidth);
    const taillightLensGeo = new THREE.BoxGeometry(taillightDepth * 0.3, taillightHeight * 1.02, taillightWidth * 1.05);

    const taillightLeft = new THREE.Group();
    const tlBaseL = new THREE.Mesh(taillightBaseGeo, materials.lightMatRed);
    const tlLensL = new THREE.Mesh(taillightLensGeo, materials.lightLensMat);
    tlLensL.position.x = taillightDepth * 0.6;
    taillightLeft.add(tlBaseL, tlLensL);
    const bedBackX = dims.wheelbase / 2 - dims.hoodLength - dims.cabLength - dims.bedLength;
    taillightLeft.position.set(bedBackX + 0.01, dims.bodyBaseY + dims.bedHeight * 0.6, -dims.bedWidth / 2 + 0.04);
    taillightLeft.castShadow = true;
    lightGroup.add(taillightLeft);

    const taillightRight = taillightLeft.clone(true);
    taillightRight.position.z = dims.bedWidth / 2 - 0.04;
    lightGroup.add(taillightRight);

    return lightGroup;
}

export function createTruckMirrors(dims, materials) {
    const mirrorGroup = new THREE.Group();
    const armLength = 0.1;
    const armSize = 0.03;
    const mirrorWidth = 0.1;
    const mirrorHeight = 0.15;
    const mirrorDepth = 0.03;

    const mirrorArmGeo = new THREE.BoxGeometry(armLength, armSize, armSize);
    const mirrorGeo = new THREE.BoxGeometry(mirrorDepth, mirrorHeight, mirrorWidth);

    const mirrorLeft = new THREE.Group();
    const mlArm = new THREE.Mesh(mirrorArmGeo, materials.chromeMat);
    mlArm.position.set(-armLength / 2, 0, -armSize / 2);
    mlArm.rotation.y = -Math.PI / 6;
    const mlHousing = new THREE.Mesh(mirrorGeo, materials.chromeMat);
    mlHousing.position.set(-armLength, 0, -armSize);
    mirrorLeft.add(mlArm, mlHousing);
    mirrorLeft.position.set(dims.wheelbase / 2 - dims.hoodLength * 0.9, dims.bodyBaseY + dims.cabHeight * 0.6, -dims.cabWidth / 2 * 0.95 - 0.07);
    mirrorLeft.castShadow = true;
    mirrorGroup.add(mirrorLeft);

    const mirrorRight = new THREE.Group();
    const mrArm = new THREE.Mesh(mirrorArmGeo, materials.chromeMat);
    mrArm.position.set(-armLength / 2, 0, armSize / 2);
    mrArm.rotation.y = Math.PI / 6;
    const mrHousing = new THREE.Mesh(mirrorGeo, materials.chromeMat);
    mrHousing.position.set(-armLength, 0, armSize);
    mirrorRight.add(mrArm, mrHousing);
    mirrorRight.position.set(dims.wheelbase / 2 - dims.hoodLength * 0.9, dims.bodyBaseY + dims.cabHeight * 0.6, dims.cabWidth / 2 * 0.95 + 0.07);
    mirrorRight.castShadow = true;
    mirrorGroup.add(mirrorRight);

    return mirrorGroup;
}

export function createTruckDoorHandles(dims, materials) {
    const handleGroup = new THREE.Group();
    const handleRadius = 0.02;
    const handleLength = 0.15;
    const mountSize = 0.04;

    const handleGeo = new THREE.CylinderGeometry(handleRadius, handleRadius, handleLength, 8);
    const handleMountGeo = new THREE.BoxGeometry(mountSize, mountSize, mountSize);

    const handleLeft = new THREE.Group();
    const hlMount = new THREE.Mesh(handleMountGeo, materials.chromeMat);
    const hlGrip = new THREE.Mesh(handleGeo, materials.chromeMat);
    hlGrip.rotation.x = Math.PI / 2;
    hlGrip.position.x = mountSize / 2 + handleLength / 2;
    handleLeft.add(hlMount, hlGrip);
    handleLeft.position.set(dims.wheelbase / 2 - dims.hoodLength - dims.cabLength * 0.5, dims.bodyBaseY + dims.cabHeight * 0.4, -dims.cabWidth / 2 * 0.95 - 0.02);
    handleLeft.castShadow = true;
    handleGroup.add(handleLeft);

    const handleRight = new THREE.Group();
    const hrMount = new THREE.Mesh(handleMountGeo, materials.chromeMat);
    const hrGrip = new THREE.Mesh(handleGeo, materials.chromeMat);
    hrGrip.rotation.x = Math.PI / 2;
    hrGrip.position.x = mountSize / 2 + handleLength / 2;
    handleRight.add(hrMount, hrGrip);
    handleRight.position.set(dims.wheelbase / 2 - dims.hoodLength - dims.cabLength * 0.5, dims.bodyBaseY + dims.cabHeight * 0.4, dims.cabWidth / 2 * 0.95 + 0.02);
    handleRight.castShadow = true;
    handleGroup.add(handleRight);

    return handleGroup;
}

export function createTruckExhaust(dims, materials) {
    const exhaustGroup = new THREE.Group();

    const pipeRadius = 0.04;
    const mainPipeLength = 0.6;
    const exhaustGeo = new THREE.CylinderGeometry(pipeRadius, pipeRadius, mainPipeLength, 8);
    const exhaustPipe = new THREE.Mesh(exhaustGeo, materials.chromeMat);
    exhaustPipe.rotation.z = Math.PI / 2;
    exhaustPipe.position.x = -mainPipeLength / 2;
    exhaustGroup.add(exhaustPipe);

    const tipLength = 0.15;
    const tipAngle = -Math.PI / 6;
    const exhaustTipGeo = new THREE.CylinderGeometry(pipeRadius, pipeRadius * 0.9, tipLength, 8);
    const exhaustTip = new THREE.Mesh(exhaustTipGeo, materials.chromeMat);
    exhaustTip.position.x = -mainPipeLength;
    exhaustTip.position.y = -Math.sin(tipAngle) * tipLength / 2;
    exhaustTip.position.z = Math.cos(tipAngle) * tipLength / 2;
    exhaustTip.rotation.z = Math.PI / 2 + tipAngle;
    exhaustGroup.add(exhaustTip);

    const groupX = dims.wheelbase / 2 - dims.hoodLength - dims.cabLength - dims.bedLength * 0.5 + mainPipeLength / 2;
    const groupY = dims.bodyBaseY - 0.15;
    const groupZ = dims.bedWidth * 0.3;

    exhaustGroup.position.set(groupX, groupY, groupZ);
    exhaustGroup.castShadow = true;
    return exhaustGroup;
}

export function createTruckMudFlaps(dims, materials) {
    const mudFlapGroup = new THREE.Group();
    const flapWidth = dims.wheelWidth * 1.2;
    const flapHeight = 0.4;
    const flapThickness = 0.02;
    const flapMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

    const flapGeo = new THREE.BoxGeometry(flapThickness, flapHeight, flapWidth);

    const rearWheelX = dims.wheelbase / 2 - dims.hoodLength - dims.cabLength - dims.bedLength * 0.7;
    const flapY = dims.bodyBaseY - flapHeight / 2;

    const flapLeft = new THREE.Mesh(flapGeo, flapMat);
    flapLeft.position.set(rearWheelX - dims.wheelRadius * 0.8, flapY, -dims.trackWidth / 2 - dims.wheelWidth/2);
    flapLeft.castShadow = true;
    mudFlapGroup.add(flapLeft);

    const flapRight = flapLeft.clone();
    flapRight.position.z = dims.trackWidth / 2 + dims.wheelWidth/2;
    mudFlapGroup.add(flapRight);

    return mudFlapGroup;
}

// --- Add Antenna Function ---
export function createTruckAntenna(dims, materials) {
    const antennaGroup = new THREE.Group();
    const baseRadius = 0.02;
    const baseHeight = 0.03;
    const whipHeight = 0.6;
    const whipRadius = 0.005;

    const baseGeo = new THREE.CylinderGeometry(baseRadius, baseRadius * 0.8, baseHeight, 8);
    const base = new THREE.Mesh(baseGeo, materials.antennaMat); // Use antennaMat
    base.position.y = baseHeight / 2;
    antennaGroup.add(base);

    const whipGeo = new THREE.CylinderGeometry(whipRadius, whipRadius * 0.5, whipHeight, 6);
    const whip = new THREE.Mesh(whipGeo, materials.antennaMat);
    whip.position.y = baseHeight + whipHeight / 2;
    antennaGroup.add(whip);

    // Position on the cab roof, slightly towards the back-right
    const cabFrontX = dims.wheelbase / 2 - dims.hoodLength;
    const cabBackX = cabFrontX - dims.cabLength;
    const cabTopY = dims.bodyBaseY + dims.cabHeight;
    antennaGroup.position.set(cabBackX + dims.cabLength * 0.2, cabTopY, dims.cabWidth / 2 * 0.7);

    antennaGroup.castShadow = true; // Antenna can cast a subtle shadow
    return antennaGroup;
}

// --- Add Windshield Wipers Function ---
export function createTruckWipers(dims, materials) {
    const wipersGroup = new THREE.Group();
    const wiperArmLength = 0.35;
    const wiperArmWidth = 0.015;
    const wiperBladeLength = 0.3;
    const wiperBladeWidth = 0.02;
    const pivotSize = 0.03;

    // Wiper 1 (Driver's side)
    const wiper1 = new THREE.Group();
    const pivot1 = new THREE.Mesh(new THREE.CylinderGeometry(pivotSize / 2, pivotSize / 2, 0.02, 8), materials.wiperMat);
    pivot1.rotation.x = Math.PI / 2;
    const arm1 = new THREE.Mesh(new THREE.BoxGeometry(wiperArmWidth, wiperArmLength, wiperArmWidth), materials.wiperMat);
    arm1.position.y = wiperArmLength / 2; // Position relative to pivot
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(wiperBladeWidth, wiperBladeWidth, wiperBladeLength), materials.wiperMat);
    blade1.position.y = wiperArmLength; // Position at end of arm
    blade1.position.x = wiperBladeWidth / 2; // Offset slightly from arm center
    arm1.add(blade1); // Attach blade to arm
    wiper1.add(pivot1);
    wiper1.add(arm1);

    // Position at base of windshield, driver's side
    const frontWindowAngle = -Math.PI / 9;
    const windshieldBaseX = dims.wheelbase / 2 - dims.hoodLength - Math.sin(-frontWindowAngle) * dims.cabHeight * 0.2;
    const windshieldBaseY = dims.bodyBaseY + dims.cabHeight * 0.25 - Math.cos(frontWindowAngle) * dims.cabHeight * 0.1;
    wiper1.position.set(windshieldBaseX, windshieldBaseY, -dims.cabWidth * 0.25);
    wiper1.rotation.z = frontWindowAngle; // Align with windshield angle
    wiper1.rotation.x = -Math.PI / 10; // Slight rotation on windshield
    wiper1.castShadow = true;
    wipersGroup.add(wiper1);

    // Wiper 2 (Passenger's side) - Clone and adjust position/rotation
    const wiper2 = wiper1.clone(true);
    wiper2.position.z = dims.cabWidth * 0.25;
    wiper2.rotation.x = Math.PI / 9; // Opposite rotation
    wipersGroup.add(wiper2);

    return wipersGroup;
}

// --- Add Gas Cap Function ---
export function createGasCap(dims, materials) {
    const gasCapGroup = new THREE.Group();
    const capRadius = 0.06;
    const capThickness = 0.015;

    const capGeo = new THREE.CylinderGeometry(capRadius, capRadius, capThickness, 12);
    const gasCap = new THREE.Mesh(capGeo, materials.gasCapMat); // Use new material
    gasCap.rotation.z = Math.PI / 2; // Align flat against body panel

    // Position on the driver's side rear fender/bed side area
    const rearWheelX = dims.wheelbase / 2 - dims.hoodLength - dims.cabLength - dims.bedLength * 0.7;
    const capX = rearWheelX + dims.wheelRadius * 0.6; // Slightly ahead of rear wheel center
    const capY = dims.bodyBaseY + dims.bedHeight * 0.5; // Mid-height on bed side
    const capZ = -dims.bedWidth / 2 - 0.01; // Slightly outside the bed side panel

    gasCap.position.set(capX, capY, capZ);
    gasCap.castShadow = true;
    gasCapGroup.add(gasCap);

    return gasCapGroup;
}

// --- Add Rear Reflectors Function ---
export function createReflectors(dims, materials) {
    const reflectorGroup = new THREE.Group();
    const reflectorWidth = 0.1;
    const reflectorHeight = 0.04;
    const reflectorThickness = 0.01;

    const reflectorGeo = new THREE.BoxGeometry(reflectorThickness, reflectorHeight, reflectorWidth);
    const reflectorMat = materials.reflectorMatRed; // Use new material

    // Position on rear bumper ends
    const bedBackX = dims.wheelbase / 2 - dims.hoodLength - dims.cabLength - dims.bedLength;
    const bumperY = dims.bodyBaseY - 0.1; // Align with bumper height
    const bumperWidth = dims.bedWidth * 1.05;

    const reflectorLeft = new THREE.Mesh(reflectorGeo, reflectorMat);
    reflectorLeft.position.set(bedBackX - 0.075 - reflectorThickness / 2, bumperY, -bumperWidth / 2 + reflectorWidth / 2 + 0.02);
    reflectorLeft.castShadow = true;
    reflectorGroup.add(reflectorLeft);

    const reflectorRight = reflectorLeft.clone();
    reflectorRight.position.z = bumperWidth / 2 - reflectorWidth / 2 - 0.02;
    reflectorGroup.add(reflectorRight);

    return reflectorGroup;
}