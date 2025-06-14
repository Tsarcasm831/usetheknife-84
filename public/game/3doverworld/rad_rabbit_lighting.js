import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

/**
 * Recursively applies full bright lighting to rad rabbit objects,
 * ensuring the rad rabbit is illuminated uniformly regardless of ambient lighting or time-of-day.
 *
 * @param {THREE.Object3D} radRabbit - The rad rabbit object loaded from the GLB asset.
 */
export function illuminateRadRabbit(radRabbit) {
  radRabbit.traverse((child) => {
    if (child.isMesh) {
      // Preserve the existing texture map if available.
      const originalMap = child.material.map ? child.material.map : null;
      child.material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: originalMap,
        transparent: child.material.transparent,
        opacity: child.material.opacity !== undefined ? child.material.opacity : 1,
        side: THREE.DoubleSide
      });
      child.material.needsUpdate = true;
    }
  });
}