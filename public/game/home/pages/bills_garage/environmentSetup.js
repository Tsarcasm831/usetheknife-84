import * as THREE from 'three';

export function setupBaseEnvironment(world) {
    const { scene, colliders } = world;
    // --- Adjusted Garage Dimensions ---
    const wallHt = 4, wallLen = 20, wallTh = 0.2; // Doubled length


    // --- Floor ---
    // Use the new doubled wallLen for the floor size
    const floorGeo = new THREE.PlaneGeometry(wallLen, wallLen);
    // Add a subtle noise texture effect programmatically (simple example)
    const floorCanvas = createNoiseCanvas(128, 128, 0.7, 0.85); // Darker noise
    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    // Adjust texture repeat for larger floor
    floorTexture.repeat.set(8, 8);
    const floorMat = new THREE.MeshStandardMaterial({
        map: floorTexture,
        color: 0x777777, // Base color still helps
        roughness: 0.9,
        metalness: 0.0
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // --- Oil Stains (Repositioned for larger floor) ---
    const oilStainMat = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a, // Slightly darker
        roughness: 0.6,
        transparent: true,
        opacity: 0.65, // Slightly more opaque
        depthWrite: false // Important for transparency layering
    });
    const stain1Geo = new THREE.CircleGeometry(0.5, 32);
    const stain1 = new THREE.Mesh(stain1Geo, oilStainMat);
    stain1.rotation.x = -Math.PI / 2;
    // Adjusted positions for larger area
    stain1.position.set(-4.5, 0.01, -3.0);
    stain1.receiveShadow = true;
    scene.add(stain1);

    const stain2Geo = new THREE.PlaneGeometry(0.8, 0.4); // Changed to Plane for variety
    const stain2 = new THREE.Mesh(stain2Geo, oilStainMat.clone()); // Clone material for potential variation
    stain2.material.opacity = 0.55;
    stain2.rotation.x = -Math.PI / 2;
    stain2.rotation.z = Math.PI / 4;
    // Adjusted positions for larger area
    stain2.position.set(6.0, 0.01, 2.5);
    stain2.receiveShadow = true;
    scene.add(stain2);

    // --- Walls (Using new wallLen) ---
    const wallCanvas = createNoiseCanvas(256, 256, 0.95, 0.98); // Lighter noise for walls
    const wallTexture = new THREE.CanvasTexture(wallCanvas);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    // Adjust texture repeat for larger walls
    wallTexture.repeat.set(6, 1);
    const wallMat = new THREE.MeshStandardMaterial({
        map: wallTexture,
        color: 0xc0c0b8,
        roughness: 0.95,
        metalness: 0.0
    });
    // Garage Door - Slightly improved look
    const garageDoorMat = new THREE.MeshStandardMaterial({
        color: 0x8a8a80, // Slightly lighter base
        roughness: 0.8,
        metalness: 0.15
    });
    const garageDoorGroup = new THREE.Group();
    // Use new wallLen for geometry
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(wallLen, wallHt, wallTh), garageDoorMat);
    backWall.position.set(0, wallHt / 2, -wallLen / 2); // Positioned at the back edge
    backWall.receiveShadow = true;
    backWall.castShadow = true;
    garageDoorGroup.add(backWall);
    // Mark back wall as garage door for interaction
    backWall.name = 'garageDoor';

    const segmentHeight = 0.5;
    const segmentDepth = 0.05;
    const segmentMat = new THREE.MeshStandardMaterial({ color: 0x808078, roughness: 0.75, metalness: 0.2 });
    const segmentIndentMat = new THREE.MeshStandardMaterial({ color: 0x707068, roughness: 0.8, metalness: 0.15 }); // Darker indent

    for (let y = segmentHeight / 2; y < wallHt - segmentHeight / 4; y += segmentHeight) {
        // Adjust segment width based on new wallLen
        const segment = new THREE.Mesh(new THREE.BoxGeometry(wallLen - 0.1, segmentHeight - 0.05, wallTh + segmentDepth * 0.5), segmentMat);
        segment.position.set(0, y - wallHt / 2, segmentDepth * 0.25);
        segment.castShadow = true;
        segment.receiveShadow = true;
        backWall.add(segment);

        const indent = new THREE.Mesh(new THREE.BoxGeometry(wallLen - 0.1, 0.02, wallTh + segmentDepth), segmentIndentMat);
        indent.position.set(0, y - wallHt / 2 + segmentHeight / 2 - 0.025, segmentDepth * 0.5);
        indent.castShadow = true; // Indents can cast subtle shadows
        backWall.add(indent);
    }
    // Add a simple handle (adjust position relative to new wallLen)
    const handleGeo = new THREE.BoxGeometry(0.3, 0.1, 0.08);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6, metalness: 0.3 });
    const doorHandle = new THREE.Mesh(handleGeo, handleMat);
    doorHandle.position.set(-wallLen * 0.3, -wallHt * 0.2, wallTh / 2 + 0.04); // Uses new wallLen
    doorHandle.castShadow = true;
    backWall.add(doorHandle);

    scene.add(garageDoorGroup);
    colliders.push(new THREE.Box3().setFromObject(backWall));

    // Left Wall (Uses new wallLen)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallTh, wallHt, wallLen), wallMat.clone()); // Clone material
    leftWall.position.set(-wallLen / 2, wallHt / 2, 0); // Positioned at left edge
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    scene.add(leftWall);
    colliders.push(new THREE.Box3().setFromObject(leftWall));

    // Right Wall (Uses new wallLen)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallTh, wallHt, wallLen), wallMat.clone()); // Clone material
    rightWall.position.set(wallLen / 2, wallHt / 2, 0); // Positioned at right edge
    rightWall.receiveShadow = true;
    rightWall.castShadow = true;
    scene.add(rightWall);
    colliders.push(new THREE.Box3().setFromObject(rightWall));

    // --- Window on Right Wall (Improved Frame) ---
    const windowWidth = 1.5;
    const windowHeight = 1.0;
    const windowDepth = 0.1;
    const frameThickness = 0.08; // Thicker frame
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.8, metalness: 0.1 });
    const windowGlassMat = new THREE.MeshStandardMaterial({
        color: 0xaaddff,
        roughness: 0.1,
        metalness: 0.5,
        transparent: true,
        opacity: 0.3, // Slightly more opaque
        side: THREE.DoubleSide // Render both sides
    });

    const windowFrame = new THREE.Group();
    // Create frame segments... (geometry unchanged)
    // Note: X/Y dimensions relative to the *window's* local orientation before rotation
    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(windowWidth + 2 * frameThickness, frameThickness, windowDepth), windowFrameMat);
    frameTop.position.y = windowHeight / 2 + frameThickness / 2;
    const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(windowWidth + 2 * frameThickness, frameThickness, windowDepth), windowFrameMat);
    frameBottom.position.y = -windowHeight / 2 - frameThickness / 2;
    const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, windowHeight, windowDepth), windowFrameMat); // Height matches glass now
    frameLeft.position.x = -windowWidth / 2 - frameThickness / 2;
    const frameRight = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, windowHeight, windowDepth), windowFrameMat); // Height matches glass now
    frameRight.position.x = windowWidth / 2 + frameThickness / 2;
    // Optional: Add a middle bar (mullion)
    const mullionVert = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, windowHeight, windowDepth * 0.8), windowFrameMat);
    mullionVert.position.set(0, 0, -windowDepth * 0.1);
    windowFrame.add(frameTop, frameBottom, frameLeft, frameRight, mullionVert);

    const glassPane = new THREE.Mesh(new THREE.BoxGeometry(windowWidth, windowHeight, 0.02), windowGlassMat);
    windowFrame.add(glassPane);

    // --- Position the window group (Adjusted for new wall position) ---
    // X: Place it slightly inside the right wall edge
    // Y: Desired height
    // Z: Position along the wall's length (adjusted for larger scale)
    windowFrame.position.set(wallLen / 2 - wallTh / 2 - 0.01, 2.0, 4.0); // Adjusted Z position
    // Rotate the window group to align with the Z-axis wall
    windowFrame.rotation.y = Math.PI / 2;

    windowFrame.castShadow = true;
    windowFrame.receiveShadow = true;
    scene.add(windowFrame);
    // No separate collider needed - the wall itself provides collision

    // --- Door on Left Wall (Improved Frame & Handle) ---
    const doorWidth = 1.0; // Define door width for clarity
    const doorHeight = 2.0; // Define door height
    const doorDepth = 0.05; // Define door depth
    // Increased frame thickness for better visibility
    const doorFrameWidth = 0.1; // Width of the frame planks
    const doorFrameDepth = 0.1; // Depth of the frame planks (protrusion)

    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x404040, roughness: 0.8, metalness: 0.1 });
    const doorFrameGroup = new THREE.Group();

    // Create frame parts relative to the group's origin (which will be rotated)
    // Adjusted geometries for new frame dimensions

    // Top frame piece (Length: door width + 2*frame width, Height: frame width, Depth: frame depth)
    const doorFrameTopGeo = new THREE.BoxGeometry(doorWidth + 2 * doorFrameWidth, doorFrameWidth, doorFrameDepth);
    const doorFrameTop = new THREE.Mesh(doorFrameTopGeo, doorFrameMat);
    // Position above door opening center (Y = door height/2 + frame width/2)
    doorFrameTop.position.y = doorHeight / 2 + doorFrameWidth / 2;

    // Left frame piece (Width: frame width, Height: door height + *top* frame width, Depth: frame depth)
    // Note: Height includes space for top frame piece to sit on it.
    const doorFrameSideGeo = new THREE.BoxGeometry(doorFrameWidth, doorHeight + doorFrameWidth, doorFrameDepth);
    const doorFrameLeft = new THREE.Mesh(doorFrameSideGeo, doorFrameMat);
    // Position left of door opening center (X = -door width/2 - frame width/2)
    // Adjust Y position to center the side piece (its center is at doorHeight/2 + doorFrameWidth/2)
    doorFrameLeft.position.x = -doorWidth / 2 - doorFrameWidth / 2;
    doorFrameLeft.position.y = (doorHeight + doorFrameWidth) / 2 - doorFrameWidth/2; // Align bottom with floor Y=0

    // Right frame piece
    const doorFrameRight = new THREE.Mesh(doorFrameSideGeo, doorFrameMat);
    // Position right of door opening center (X = door width/2 + frame width/2)
    doorFrameRight.position.x = doorWidth / 2 + doorFrameWidth / 2;
    doorFrameRight.position.y = (doorHeight + doorFrameWidth) / 2 - doorFrameWidth/2; // Align bottom with floor Y=0

    doorFrameGroup.add(doorFrameTop, doorFrameLeft, doorFrameRight);

    // --- Position the frame group (Adjusted for new wall position & frame depth) ---
    // X: Place slightly inside left wall edge, accounting for half frame depth
    // Y: Position the *bottom* of the frame group near Y=0 (achieved by side pieces positioning)
    // Z: Position along the wall's length
    const framePositionZ = 6.0;
    const framePositionX = -wallLen / 2 + wallTh / 2 + doorFrameDepth / 2; // Center the frame depth on the wall surface
    const framePositionY = 0; // Base of frame at Y=0

    doorFrameGroup.position.set(framePositionX, framePositionY, framePositionZ);
    // Rotate the frame group to align with the Z-axis wall
    doorFrameGroup.rotation.y = Math.PI / 2;

    doorFrameGroup.receiveShadow = true;
    doorFrameGroup.castShadow = true;
    scene.add(doorFrameGroup);

    // Create a single collider for the rotated frame group
    scene.updateMatrixWorld(); // Ensure world matrix is up-to-date
    const frameBox = new THREE.Box3().setFromObject(doorFrameGroup);
    colliders.push(frameBox);

    // --- The Door itself ---
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x7a4d2a, roughness: 0.8, metalness: 0.0 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth), doorMat);

    // Position door within the frame's location - Center the door inside the frame opening
    door.position.set(framePositionX, doorHeight/2, framePositionZ); // Use frame's X/Z, center door vertically
    // Rotate the door to match the frame
    door.rotation.copy(doorFrameGroup.rotation); // Match frame rotation

    door.castShadow = true;
    door.receiveShadow = true;
    scene.add(door);
    // Add collider AFTER positioning and rotating
    scene.updateMatrixWorld();
    colliders.push(new THREE.Box3().setFromObject(door));

    // Add a simple doorknob (relative to the door's local axes)
    const knobGeo = new THREE.SphereGeometry(0.05, 16, 8);
    const knobMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, metalness: 0.6, roughness: 0.4 });
    const doorKnob = new THREE.Mesh(knobGeo, knobMat);
    // Position relative to door center: X=towards edge, Y=vertical center, Z=outwards from door face
    doorKnob.position.set(doorWidth/2 - 0.1, 0, doorDepth/2 + 0.04);
    door.add(doorKnob); // Add to door mesh

    const knobPlateGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.02, 16);
    const knobPlate = new THREE.Mesh(knobPlateGeo, knobMat);
    // Rotate plate to be flat against door (relative to door's local Z axis)
    knobPlate.rotation.x = Math.PI / 2;
    // Position relative to door center (same X/Y as knob, slightly behind)
    knobPlate.position.set(doorWidth/2 - 0.1, 0, doorDepth/2 + 0.01); // Adjusted Z slightly
    door.add(knobPlate);

    // --- Ceiling (Uses new wallLen) ---
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, roughness: 0.95 });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(wallLen, wallLen), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = wallHt;
    ceiling.receiveShadow = true;
    scene.add(ceiling);

    // --- Ceiling Beams (Adjust position and geometry for larger ceiling) ---
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.85 }); // Darker beams
    const beamGeo = new THREE.BoxGeometry(0.2, 0.15, wallLen);
    const beam1 = new THREE.Mesh(beamGeo, beamMat);
    beam1.position.set(-wallLen / 4, wallHt - 0.075, 0);
    beam1.castShadow = true;
    beam1.receiveShadow = true;
    scene.add(beam1);
    const beam2 = new THREE.Mesh(beamGeo, beamMat);
    beam2.position.set(wallLen / 4, wallHt - 0.075, 0);
    beam2.castShadow = true;
    beam2.receiveShadow = true;
    scene.add(beam2);

    // --- Simple Wall Details ---
    // Electrical Outlet - Adjusted position slightly and corrected rotation
    const outletMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const outletBox = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.02), outletMat); // Adjusted dimensions (X=width, Y=height, Z=depth)
    outletBox.position.set(-wallLen / 2 + wallTh / 2 + 0.01, 0.5, -1.5); // On left wall
    // Rotation removed - BoxGeometry dimensions are now correct for the wall orientation
    // outletBox.rotation.y = Math.PI / 2; // Rotate to match wall -- REMOVED
    outletBox.castShadow = true;
    scene.add(outletBox);

    // Add a second outlet on the right wall
    const outletBox2 = outletBox.clone();
    outletBox2.position.set(wallLen / 2 - wallTh / 2 - 0.01, 0.8, 2.5); // Position on right wall
    // Rotation for right wall (negative Y rotation)
    outletBox2.rotation.y = Math.PI; // Flip it 180 degrees to face inwards
    scene.add(outletBox2);

    // Vent Grate
    const ventMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.6, metalness: 0.3 });
    const ventBox = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.02), ventMat);
    ventBox.position.set(2.0, wallHt - 0.2, -wallLen / 2 + wallTh / 2 + 0.01); // On back wall, high up
    ventBox.castShadow = true;
    scene.add(ventBox);
}

// --- Helper Function for Noise Texture ---
export function createNoiseCanvas(width, height, minColor, maxColor) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const value = Math.floor(minColor * 255 + Math.random() * (maxColor - minColor) * 255);
        data[i] = value;     // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
        data[i + 3] = 255;   // A
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}