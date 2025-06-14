import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';

/**
 * Creates an optimized bright material based on the original material.
 * @param {THREE.Material} originalMaterial - The original material.
 * @returns {THREE.MeshStandardMaterial} - The new bright material.
 */
function createBrightMaterial(originalMaterial) {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: originalMaterial.map,
    normalMap: originalMaterial.normalMap,
    transparent: originalMaterial.transparent,
    opacity: originalMaterial.opacity,
    alphaMap: originalMaterial.alphaMap,
    emissive: 0x404040,
    emissiveIntensity: 0.2,
    roughness: 0.8,
    metalness: 0.0,
    side: THREE.DoubleSide
  });
}

/**
 * Spawns trees in the given scene.
 * Ensures trees do not spawn within 5ft of the player.
 * 
 * PERFORMANCE IMPROVEMENT: Instead of loading the GLTF file repeatedly, load it once then clone it.
 *
 * @param {THREE.Scene} scene - The scene to add trees to.
 * @param {number} count - Number of trees to spawn.
 * @param {THREE.Vector3} playerPosition - The player's position (default (0,0,0)).
 * @returns {Array} Array of tree objects with { mesh, health } properties.
 */
export function spawnTrees(scene, count = 50, playerPosition = new THREE.Vector3(0, 0, 0)) {
  const trees = [];
  const loader = new GLTFLoader();
  const treeUrl = window.GLTFAssetURLs['/dead_tree_textured_mesh.glb'] || '/dead_tree_textured_mesh.glb';

  // Add an ambient light for the trees.
  const treeLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(treeLight);

  loader.load(
    treeUrl,
    (gltf) => {
      const baseTree = gltf.scene;
      for (let i = 0; i < count; i++) {
        const tree = baseTree.clone(true);
        let validPosition = false;
        let x, z;
        let attempts = 0;
        const range = 50;
        while (!validPosition && attempts < 100) {
          x = (Math.random() - 0.5) * range * 2;
          z = (Math.random() - 0.5) * range * 2;
          if (Math.hypot(x - playerPosition.x, z - playerPosition.z) >= 5) {
            validPosition = true;
          }
          attempts++;
        }
        tree.position.set(x, 3, z);
        tree.rotation.y = Math.random() * Math.PI * 2;
        const scale = (2 + Math.random()) * 1.4;
        tree.scale.set(scale, scale, scale);
        tree.rotation.x = (Math.random() - 0.5) * 0.2;
        tree.rotation.z = (Math.random() - 0.5) * 0.2;

        tree.traverse((child) => {
          if (child.isMesh) {
            child.material = createBrightMaterial(child.material);
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const treeObject = { mesh: tree, health: 100 };
        trees.push(treeObject);
        scene.add(tree);
        if (window.collisionManager) {
          window.collisionManager.register(tree);
        }
      }
      console.log(`Successfully spawned ${count} trees`);
    },
    undefined,
    (error) => {
      console.error('Error loading tree:', error);
    }
  );

  return trees;
}