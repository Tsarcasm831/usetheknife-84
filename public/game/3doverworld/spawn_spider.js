import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/OBJLoader.js';

export function spawnSpider(scene) {
  // Ensure that the OBJ assets are available.
  if (!window.OBJAssetData || !window.OBJAssetData.obj || !window.OBJAssetData.texture) {
    console.error('OBJ assets not fully loaded.');
    return;
  }

  // Create an OBJLoader instance and parse the preloaded OBJ data.
  const loader = new OBJLoader();
  const spider = loader.parse(window.OBJAssetData.obj);

  // Traverse the spider object to assign a material using the preloaded texture.
  spider.traverse(child => {
    if (child.isMesh) {
      const texture = new THREE.Texture(window.OBJAssetData.texture);
      texture.needsUpdate = true;
      child.material = new THREE.MeshStandardMaterial({
        map: texture
      });
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Set the spider's position (adjust coordinates as needed).
  spider.position.set(10, 0, -20);
  scene.add(spider);
  console.log('Spider spawned successfully.');

  return spider;
}