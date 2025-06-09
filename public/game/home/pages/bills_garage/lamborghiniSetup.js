import * as THREE from 'three';

export function createLamborghini(world) {
    const { scene, colliders } = world;

    const lamb = new THREE.Group();
    const lambBodyMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.1, metalness: 0.9, envMapIntensity: 0.7 });
    const lambWheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6, metalness: 0.3 });
    const lambWindowMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.05, metalness: 0.95, transparent: true, opacity: 0.6, envMapIntensity: 0.8 });

    const lambBodyGeo = new THREE.BoxGeometry(2.2, 0.4, 1.0);
    const lambBodyMesh = new THREE.Mesh(lambBodyGeo, lambBodyMat);
    lambBodyMesh.position.y = 0.35; // Base height
    lambBodyMesh.castShadow = true;
    lambBodyMesh.receiveShadow = true;
    lamb.add(lambBodyMesh);

    const cockpitGeo = new THREE.BoxGeometry(1.0, 0.4, 0.8);
    const cockpitMesh = new THREE.Mesh(cockpitGeo, lambWindowMat);
    cockpitMesh.position.set(-0.1, 0.7, 0); // Positioned on top of the body base
    cockpitMesh.rotation.x = Math.PI / 12;
    cockpitMesh.castShadow = true;
    cockpitMesh.receiveShadow = true;
    lamb.add(cockpitMesh);

    const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, 1.1), lambBodyMat);
    spoilerWing.position.set(-1.2, 0.7, 0); // Positioned above the rear
    spoilerWing.castShadow = true;
    spoilerWing.receiveShadow = true;
    lamb.add(spoilerWing);
    const spoilerSupport1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.05), lambBodyMat);
    spoilerSupport1.position.set(-1.15, 0.6, 0.3); // Below the wing, connected to body (implicitly)
    spoilerSupport1.castShadow = true;
    lamb.add(spoilerSupport1);
    const spoilerSupport2 = spoilerSupport1.clone();
    spoilerSupport2.position.z = -0.3;
    lamb.add(spoilerSupport2);

    const wheelGeomLamb = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 20);
    const hubcapMatLamb = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.95, roughness: 0.2 });
    const hubcapGeomLamb = new THREE.CylinderGeometry(0.12, 0.14, 0.06, 10); // Slightly smaller hubcap
    const wheelOffsetY = 0.3; // Y position for wheels (matches radius)

    for (let ix of [-0.8, 0.9]) { // X positions for front/rear wheels
      for (let iz of [-0.5 - 0.125, 0.5 + 0.125]) { // Z positions for left/right wheels (adjusted for wheel width)
            const wheelGroup = new THREE.Group();
            const tire = new THREE.Mesh(wheelGeomLamb, lambWheelMat);
            tire.rotation.x = Math.PI / 2; // Rotate cylinder to be upright
            tire.castShadow = true;
            tire.receiveShadow = true;
            wheelGroup.add(tire);

            const hubcap = new THREE.Mesh(hubcapGeomLamb, hubcapMatLamb);
            hubcap.rotation.x = Math.PI / 2;
            hubcap.position.z = (iz > 0 ? 0.125 + 0.03 : -0.125 - 0.03); // Position hubcap outwards slightly
            hubcap.castShadow = true;
            wheelGroup.add(hubcap);

            wheelGroup.position.set(ix, wheelOffsetY, iz); // Set position based on loop variables
            lamb.add(wheelGroup);
      }
    }

    // --- Final Placement ---
    lamb.position.set(4.0, 0, 0.5); // Position the whole car
    lamb.rotation.y = -Math.PI / 1.5; // Rotate it
    scene.add(lamb);

    // Update collider after adding to scene
    scene.updateMatrixWorld(); // Ensure matrices are updated
    const lambBox = new THREE.Box3().setFromObject(lamb);
    colliders.push(lambBox);
}