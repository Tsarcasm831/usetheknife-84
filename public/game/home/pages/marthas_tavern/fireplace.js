import * as THREE from 'three';
import { scene, camera } from './scene.js';

// --- Materials ---
// Optimize: Create STONE_MATERIAL only once
const stoneTextureLoader = new THREE.TextureLoader();
const stoneTexture = stoneTextureLoader.load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/brick_diffuse.jpg');
stoneTexture.wrapS = THREE.RepeatWrapping;
stoneTexture.wrapT = THREE.RepeatWrapping;
stoneTexture.repeat.set(1.5, 1.5);
const STONE_MATERIAL_INSTANCE = new THREE.MeshStandardMaterial({
    map: stoneTexture,
    roughness: 0.85,
    metalness: 0.1,
});
// Create a metal material for the barrier
const METAL_MATERIAL_INSTANCE = new THREE.MeshStandardMaterial({
    color: 0x333333, // Dark metal
    roughness: 0.6,
    metalness: 0.9
});


// --- Main Export Function ---
/**
 * Creates the fireplace structure and particle effect.
 * @returns {function} A function to update the fire particle animation each frame.
 */
export function createFireplace() {
    const fireplaceGroup = new THREE.Group();

    // Previous snapped position was (-4.5, 0, -2.5), which corresponds to grid cell (5, 7).
    // Target grid cell: X = 5 + 8 = 13, Z = 7 - 3 = 4.
    // World coordinates for center of grid cell (13, 4):
    // Grid cell size = 1, Grid half size = 10
    // World X = -10 + 13 * 1 + 0.5 = 3.5
    // World Z = -10 + 4 * 1 + 0.5 = -5.5
    const targetWorldX = 3.5;
    const targetWorldZ = -5.5;

    fireplaceGroup.position.set(targetWorldX, 0, targetWorldZ); // Set position directly
    console.log(`Fireplace: Moved to grid cell (13, 4), world coordinates (${targetWorldX.toFixed(2)}, ${targetWorldZ.toFixed(2)})`);

    const stoneMat = STONE_MATERIAL_INSTANCE; // Use the pre-created material instance
    const metalMat = METAL_MATERIAL_INSTANCE; // Use the metal material instance

    // Dimensions
    const baseWidth = 3.2;
    const baseHeight = 0.2;
    const baseDepth = 1.5;
    const sideWidth = 0.5;
    const sideHeight = 2.2;
    const sideDepth = 1.2;
    const openingWidth = baseWidth - 2 * sideWidth;
    const lintelHeight = 0.4;
    const chimneyHeight = 1.5;
    const chimneyWidth = 2.5;
    const chimneyDepth = 1.0;

    // Fireplace base (Hearth)
    const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const base = new THREE.Mesh(baseGeometry, stoneMat);
    base.position.y = baseHeight / 2;
    base.position.z = baseDepth / 2 - (sideDepth / 2); // Align front edge
    base.castShadow = true;
    base.receiveShadow = true;
    base.userData.collidable = true;
    fireplaceGroup.add(base);

    // Fireplace sides
    const sideGeometry = new THREE.BoxGeometry(sideWidth, sideHeight, sideDepth);
    const leftSide = new THREE.Mesh(sideGeometry, stoneMat);
    leftSide.position.set(-(openingWidth / 2 + sideWidth / 2), sideHeight / 2, 0);
    leftSide.castShadow = true;
    leftSide.receiveShadow = true;
    leftSide.userData.collidable = true;
    fireplaceGroup.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeometry, stoneMat);
    rightSide.position.set(openingWidth / 2 + sideWidth / 2, sideHeight / 2, 0);
    rightSide.castShadow = true;
    rightSide.receiveShadow = true;
    rightSide.userData.collidable = true;
    fireplaceGroup.add(rightSide);

    // Fireplace back wall
    const backGeometry = new THREE.BoxGeometry(openingWidth, sideHeight, 0.2); // Thin back
    const backWall = new THREE.Mesh(backGeometry, stoneMat);
    backWall.position.set(0, sideHeight / 2, -sideDepth / 2 + 0.1); // Position behind opening
    backWall.castShadow = true; // Should cast shadow inside opening
    backWall.receiveShadow = true;
    fireplaceGroup.add(backWall);

    // Fireplace Lintel (Top piece)
    const lintelGeometry = new THREE.BoxGeometry(baseWidth, lintelHeight, sideDepth);
    const lintel = new THREE.Mesh(lintelGeometry, stoneMat);
    lintel.position.y = sideHeight; // Position on top of sides
    lintel.position.z = 0;
    lintel.castShadow = true;
    lintel.receiveShadow = true;
    lintel.userData.collidable = true;
    fireplaceGroup.add(lintel);

    // Chimney Breast
    const chimneyGeometry = new THREE.BoxGeometry(chimneyWidth, chimneyHeight, chimneyDepth);
    const chimney = new THREE.Mesh(chimneyGeometry, stoneMat);
    chimney.position.y = sideHeight + lintelHeight / 2 + chimneyHeight / 2; // Stack above lintel
    chimney.position.z = -(sideDepth / 2 - chimneyDepth / 2); // Align back with lintel/sides
    chimney.castShadow = true;
    chimney.receiveShadow = true;
    fireplaceGroup.add(chimney);

    // --- Fireplace Barrier ---
    const barrierWidth = openingWidth * 0.9; // Slightly less than opening
    const barrierHeight = 0.15;
    const barrierDepth = 0.1;
    const barrierGeometry = new THREE.BoxGeometry(barrierWidth, barrierHeight, barrierDepth);
    const barrierMesh = new THREE.Mesh(barrierGeometry, metalMat);
    // Position slightly above the hearth and slightly in front of the opening plane
    barrierMesh.position.set(
        0, // Center X
        baseHeight + barrierHeight / 2, // Sit on hearth
        sideDepth / 2 + barrierDepth / 2 // Just in front of the opening line
    );
    barrierMesh.castShadow = true;
    barrierMesh.receiveShadow = true;
    barrierMesh.userData.collidable = true; // Make it collidable
    barrierMesh.name = "Fireplace Barrier";
    fireplaceGroup.add(barrierMesh);
    // --- End Fireplace Barrier ---


    scene.add(fireplaceGroup);

    // --- Fire Effect (Particles) ---
    const fireParticles = new THREE.Group();
    const fireBaseY = baseHeight + 0.1; // Position particles slightly above the hearth
    const fireDepthZ = -sideDepth / 2 + 0.3; // Inside the opening
    const fireWidth = openingWidth * 0.8; // Constrain fire width
    const numFireParticles = 35; // Optimization: Slightly reduce particle count

    for (let i = 0; i < numFireParticles; i++) { // Use reduced count
        const particleSize = 0.08 + Math.random() * 0.04;
        // Optimization: Use PlaneGeometry which might be slightly cheaper than Sphere for small particles
        const particleGeometry = new THREE.PlaneGeometry(particleSize, particleSize);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.4 ? 0xff4500 : 0xffa500,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide // Needed for planes
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);

        particle.position.x = (Math.random() - 0.5) * fireWidth;
        particle.position.y = fireBaseY + Math.random() * 0.4;
        particle.position.z = fireDepthZ + (Math.random() - 0.5) * 0.4;

        // Make particles face the camera (simple billboard)
        particle.rotation.copy(camera.rotation);

        particle.userData = {
            speedY: 0.02 + Math.random() * 0.03,
            speedX: (Math.random() - 0.5) * 0.015,
            speedZ: (Math.random() - 0.5) * 0.01,
            life: 0.5 + Math.random() * 0.5,
            initialLife: 0 // Will be set below
        };
        particle.userData.initialLife = particle.userData.life; // Store initial life

        fireParticles.add(particle);
    }
    fireplaceGroup.add(fireParticles); // Add particles to the fireplace group

    // Update fire particles function (returned by main function)
    const fireTopY = sideHeight * 0.8; // Max height relative to fireplace base
    return function updateFire(delta) {
        const dt = delta * 60; // Time-step scaling
        fireParticles.children.forEach(particle => {
            particle.position.y += particle.userData.speedY * dt;
            particle.position.x += particle.userData.speedX * dt;
            particle.position.z += particle.userData.speedZ * dt;
            particle.userData.life -= 0.015 * dt;

            particle.material.opacity = Math.max(0, (particle.userData.life / particle.userData.initialLife) * 0.8);

             // Make particles face the camera continuously
            particle.rotation.copy(camera.rotation);

            if (particle.userData.life <= 0 || particle.position.y > fireTopY) {
                particle.position.x = (Math.random() - 0.5) * fireWidth;
                particle.position.y = fireBaseY + Math.random() * 0.3;
                particle.position.z = fireDepthZ + (Math.random() - 0.5) * 0.4;
                particle.userData.life = 0.5 + Math.random() * 0.5;
                particle.userData.initialLife = particle.userData.life;
                particle.material.opacity = 0.8;
            }
        });
    };
}