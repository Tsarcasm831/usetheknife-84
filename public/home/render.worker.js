// render.worker.js
// Entry point for running Three.js scene rendering in a Web Worker using OffscreenCanvas

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let renderer, scene, camera, animationFrameId;

self.onmessage = function(e) {
  const { type, canvas, width, height, sceneConfig } = e.data;
  if (type === 'init') {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(width, height, false);
    // Rebuild scene from serialized JSON
    const loader = new THREE.ObjectLoader();
    scene = loader.parse(sceneConfig);
    // Setup camera separately (if not in scene JSON)
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);
    // TODO: handle lights background if needed
    renderLoop();
  } else if (type === 'resize') {
    renderer.setSize(width, height, false); // skip style update
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  } else if (type === 'updateScene') {
    // Apply full scene update via JSON
    const loader = new THREE.ObjectLoader();
    scene = loader.parse(sceneConfig);
  }
};

function renderLoop() {
  renderer.render(scene, camera);
  animationFrameId = self.requestAnimationFrame(renderLoop);
}

self.onclose = function() {
  if (animationFrameId) self.cancelAnimationFrame(animationFrameId);
};
