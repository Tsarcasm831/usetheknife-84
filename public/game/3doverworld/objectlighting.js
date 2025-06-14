// objectlighting.js
// This module provides a function to make any spawned object(s) appear "full bright"
// irrespective of ambient lighting or time-of-day settings. It converts all mesh materials
// to a MeshBasicMaterial that is immune to scene lighting, ensuring maximum brightness from all sides.

import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

/**
 * Recursively traverses an object's hierarchy and converts all mesh materials to full bright.
 * This ensures that the object appears fully illuminated irrespective of the scene lighting.
 *
 * @param {THREE.Object3D} object - The root object to convert.
 */
export function applyFullBright(object) {
  // Add ambient light to the object to ensure uniform brightness
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  object.add(ambientLight);

  // Add point lights around the object for maximum brightness from all angles
  const positions = [
    [1, 1, 1], [-1, 1, 1], [1, -1, 1], [-1, -1, 1],
    [1, 1, -1], [-1, 1, -1], [1, -1, -1], [-1, -1, -1]
  ];

  positions.forEach(([x, y, z]) => {
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(x, y, z);
    object.add(pointLight);
  });

  object.traverse((child) => {
    if (child.isMesh) {
      // Handle materials that are arrays or a single material.
      if (Array.isArray(child.material)) {
        child.material = child.material.map((mat) => convertToFullBright(mat));
      } else if (child.material) {
        child.material = convertToFullBright(child.material);
      }
    }
  });
}

/**
 * Converts a given material to a MeshBasicMaterial that ignores scene lighting.
 * It ensures maximum brightness by using a white base color, including the original texture if available,
 * and enabling double sided rendering so the object is fully lit from all angles.
 *
 * @param {THREE.Material} material - The original material.
 * @returns {THREE.Material} A new MeshBasicMaterial with maximum brightness.
 */
function convertToFullBright(material) {
  const params = {
    color: new THREE.Color(0xffffff),
    map: material.map || null,
    transparent: material.transparent || false,
    opacity: material.opacity !== undefined ? material.opacity : 1,
    alphaMap: material.alphaMap || null,
    side: THREE.DoubleSide,
    emissive: new THREE.Color(0x404040), // Add slight emissive glow
    emissiveIntensity: 0.3
  };
  
  // Use MeshStandardMaterial for better light interaction
  const fullBrightMaterial = new THREE.MeshStandardMaterial(params);
  fullBrightMaterial.roughness = 0.5;  // Lower roughness for more shine
  fullBrightMaterial.metalness = 0.3;  // Add slight metallic quality
  fullBrightMaterial.needsUpdate = true;
  return fullBrightMaterial;
}