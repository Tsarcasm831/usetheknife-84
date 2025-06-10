import * as THREE from 'three';

/**
 * Creates a simple watchtower object and adds it to the scene.
 * @param {THREE.Scene} scene - The scene to add the watchtower to.
 * @param {object} towerConfig - Configuration object for the watchtower (size, colors, position).
 * @returns {THREE.Group} - The watchtower group object.
 */
export function createWatchtower(scene, towerConfig) {
    const towerGroup = new THREE.Group();
    towerGroup.name = "WatchtowerGroup";
    towerGroup.userData = { collidable: true }; // Mark the entire group as potentially collidable

    const baseWidth = towerConfig.size.x;
    const baseDepth = towerConfig.size.z;
    const baseHeight = towerConfig.size.y;
    const platformHeight = towerConfig.platformHeight;
    const platformOverhang = towerConfig.platformOverhang;

    // --- Base ---
    const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: towerConfig.colors.base });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = baseHeight / 2; // Sit on the ground
    baseMesh.name = "WatchtowerBase";
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    baseMesh.userData = { collidable: true }; // Individual part collidable
    towerGroup.add(baseMesh);

    // --- Platform ---
    const platformWidth = baseWidth + platformOverhang * 2;
    const platformDepth = baseDepth + platformOverhang * 2;
    const platformGeometry = new THREE.BoxGeometry(platformWidth, platformHeight, platformDepth);
    const platformMaterial = new THREE.MeshPhongMaterial({ color: towerConfig.colors.platform });
    const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);
    platformMesh.position.y = baseHeight + platformHeight / 2; // Position on top of the base
    platformMesh.name = "WatchtowerPlatform";
    platformMesh.castShadow = true;
    platformMesh.receiveShadow = true;
    platformMesh.userData = { collidable: true }; // Platform is also collidable
    towerGroup.add(platformMesh);

    // --- Positioning ---
    towerGroup.position.set(towerConfig.position.x, 0, towerConfig.position.z);

    scene.add(towerGroup);
    console.log("Watchtower created at:", towerConfig.position);

    return towerGroup;
}