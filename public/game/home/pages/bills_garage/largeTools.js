// Placeholder: Large tools like air hose, leaning tools
import * as THREE from 'three';

export function setupLargeTools(world) {
    const { scene, colliders } = world;
    const wallLen = 20;

    // --- Example: Simple Air Compressor ---
    const compressorGroup = new THREE.Group();
    const tankMat = new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.4, metalness: 0.6 });
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6, metalness: 0.4 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });

    // Tank
    const tankGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16);
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.rotation.z = Math.PI / 2; // Lay horizontally
    compressorGroup.add(tank);

    // Motor housing (simplified box)
    const motorGeo = new THREE.BoxGeometry(0.25, 0.2, 0.2);
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.y = 0.2; // Position on top of tank
    compressorGroup.add(motor);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 12);
    const wheel1 = new THREE.Mesh(wheelGeo, wheelMat);
    wheel1.rotation.x = Math.PI / 2;
    wheel1.position.set(0.2, -0.2, 0.1);
    compressorGroup.add(wheel1);
    const wheel2 = wheel1.clone();
    wheel2.position.z = -0.1;
    compressorGroup.add(wheel2);

    // Position compressor
    compressorGroup.position.set(wallLen / 2 - 1.0, 0.2, 1.0); // Near right wall corner
    compressorGroup.rotation.y = -Math.PI / 6;

    compressorGroup.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    scene.add(compressorGroup);
    colliders.push(new THREE.Box3().setFromObject(compressorGroup));

    // --- Example: Leaning Broom ---
    const broomGroup = new THREE.Group();
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xaaaa88, roughness: 0.8 });
    const bristlesMat = new THREE.MeshStandardMaterial({ color: 0xccaa66, roughness: 0.9 });

    const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.2, 8);
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = 0.6; // Center handle vertically
    broomGroup.add(handle);

    const bristlesGeo = new THREE.BoxGeometry(0.2, 0.15, 0.08);
    const bristles = new THREE.Mesh(bristlesGeo, bristlesMat);
    bristles.position.y = 0.075; // Position at bottom of handle
    broomGroup.add(bristles);

    // Position and lean against wall
    broomGroup.position.set(-wallLen / 2 + 0.5, 0, 3.0); // Near left wall
    broomGroup.rotation.z = -Math.PI / 15; // Lean Z
    broomGroup.rotation.y = Math.PI / 4; // Rotate Y

    broomGroup.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
        }
    });
    scene.add(broomGroup);
    // Collider for a thin leaning object might be overly complex/unnecessary
    // colliders.push(new THREE.Box3().setFromObject(broomGroup));
}