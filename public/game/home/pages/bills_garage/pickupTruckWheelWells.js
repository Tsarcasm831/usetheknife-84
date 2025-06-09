import * as THREE from 'three';

// --- Truck Wheel Well and Fender Flare Creation ---

export function createTruckWheelWells(dims, materials) {
    const wheelWellGroup = new THREE.Group();
    const wellDepth = 0.3; // Sideways depth into body
    const wellRadius = dims.wheelRadius + 0.08; // Slightly larger radius than wheel
    const wellSegments = 24; // Smoother arc
    const wellColor = 0x1a1a1a; // Darker well

    // --- Define Fender Flare Shape ---
    const flareRadiusOuter = wellRadius + 0.06; // Outer radius of the flare
    const flareRadiusInner = wellRadius + 0.01; // Inner radius, slightly larger than well
    // const flareDepth = 0.1; // How much the flare sticks out sideways (now set by positioning)
    const flareHeight = 0.04; // Thickness of the flare

    const flareShape = new THREE.Shape();
    // Outer arc
    flareShape.absarc(0, 0, flareRadiusOuter, Math.PI, 0, false);
    // Line to inner arc top-right corner (changed to match boxier look potentially)
    flareShape.lineTo(flareRadiusInner, 0);
    // Inner arc (clockwise)
    flareShape.absarc(0, 0, flareRadiusInner, 0, Math.PI, true);
    // Line to outer arc top-left corner (closes the shape)
    flareShape.lineTo(-flareRadiusOuter, 0);

    const flareExtrudeSettings = {
        steps: 2, // More steps for smoother bevel
        depth: flareHeight,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008,
        bevelSegments: 1
    };

    const flareGeo = new THREE.ExtrudeGeometry(flareShape, flareExtrudeSettings);
    flareGeo.computeVertexNormals();
    // Rotate flare geometry to lie flat initially
    flareGeo.rotateX(Math.PI / 2);
    flareGeo.translate(0, -flareHeight / 2, 0); // Center vertically

    const flareMaterial = materials.bodyMat.clone();
    flareMaterial.color.set(0x333333); // Dark grey plastic flares
    flareMaterial.roughness = 0.6; // Slightly rougher plastic/metal flare
    flareMaterial.metalness = 0.1;

    const wellMat = new THREE.MeshStandardMaterial({
        color: wellColor,
        roughness: 0.9, // Rougher surface
        metalness: 0.0,
        side: THREE.DoubleSide // Render both sides just in case
    });

    const wellArcShape = new THREE.Shape();
    wellArcShape.moveTo(0, 0);
    wellArcShape.absarc(0, 0, wellRadius, Math.PI, 0, false); // Semi-circle
    wellArcShape.lineTo(wellRadius, 0); // Close the bottom edge for extrusion

    const wellExtrudeSettings = {
        steps: 1,
        depth: wellDepth,
        bevelEnabled: false, // No bevel inside well
    };

    const wellGeo = new THREE.ExtrudeGeometry(wellArcShape, wellExtrudeSettings);
    wellGeo.translate(0, 0, -wellDepth / 2); // Center depth
    wellGeo.computeVertexNormals();

    // --- Create Wells and Flares ---
    const frontWheelX = dims.wheelbase / 2 - dims.hoodLength * 0.5;
    const rearWheelX = dims.wheelbase / 2 - dims.hoodLength - dims.cabLength - dims.bedLength * 0.7;
    const wellY = dims.bodyBaseY + 0.01; // Base height for the bottom edge of the well opening

    // Front Right
    const wellFR = new THREE.Mesh(wellGeo, wellMat);
    wellFR.position.set(frontWheelX, wellY, dims.trackWidth / 2); // Center well at track width
    wellFR.rotation.y = -Math.PI / 2;
    wheelWellGroup.add(wellFR);
    const flareFR = new THREE.Mesh(flareGeo, flareMaterial);
    flareFR.position.set(frontWheelX, wellY, dims.trackWidth / 2 + wellDepth/2); // Position flare outside well edge
    flareFR.rotation.y = -Math.PI / 2;
    flareFR.castShadow = true;
    wheelWellGroup.add(flareFR);

    // Front Left
    const wellFL = new THREE.Mesh(wellGeo, wellMat);
    wellFL.position.set(frontWheelX, wellY, -dims.trackWidth / 2);
    wellFL.rotation.y = Math.PI / 2;
    wheelWellGroup.add(wellFL);
    const flareFL = new THREE.Mesh(flareGeo, flareMaterial);
    flareFL.position.set(frontWheelX, wellY, -dims.trackWidth / 2 - wellDepth/2);
    flareFL.rotation.y = Math.PI / 2; // Rotate flare geometry
    flareFL.castShadow = true;
    wheelWellGroup.add(flareFL);

    // Rear Right
    const wellRR = new THREE.Mesh(wellGeo, wellMat);
    wellRR.position.set(rearWheelX, wellY, dims.trackWidth / 2);
    wellRR.rotation.y = -Math.PI / 2;
    wheelWellGroup.add(wellRR);
    const flareRR = new THREE.Mesh(flareGeo, flareMaterial);
    flareRR.position.set(rearWheelX, wellY, dims.trackWidth / 2 + wellDepth/2);
    flareRR.rotation.y = -Math.PI / 2;
    flareRR.castShadow = true;
    wheelWellGroup.add(flareRR);

    // Rear Left
    const wellRL = new THREE.Mesh(wellGeo, wellMat);
    wellRL.position.set(rearWheelX, wellY, -dims.trackWidth / 2);
    wellRL.rotation.y = Math.PI / 2;
    wheelWellGroup.add(wellRL);
    const flareRL = new THREE.Mesh(flareGeo, flareMaterial);
    flareRL.position.set(rearWheelX, wellY, -dims.trackWidth / 2 - wellDepth/2);
    flareRL.rotation.y = Math.PI / 2; // Rotate flare geometry
    flareRL.castShadow = true;
    wheelWellGroup.add(flareRL);

    return wheelWellGroup;
}