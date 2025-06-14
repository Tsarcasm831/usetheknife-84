import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

let globalLight = null;
let directionalLight = null;

/**
 * Makes a GLB model visible with proper lighting from all angles.
 * Uses shared lighting and optimized materials for better performance.
 * @param {THREE.Object3D} model - The loaded GLB model to modify
 * @param {THREE.Scene} scene - The scene the model belongs to
 */
export function makeBright(model, scene) {
    // Create global lights if they don't exist yet
    if (!globalLight && scene) {
        // Add ambient light for base illumination
        globalLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(globalLight);
        
        // Add directional light for shadows and depth
        directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
    }

    // Only traverse the specific model, not the entire scene
    model.traverse((child) => {
        if (child.isMesh && !child.userData.isGround) {  // Skip ground mesh
            // Create an optimized material that respects lighting
            const material = new THREE.MeshStandardMaterial({
                map: child.material.map,
                transparent: child.material.transparent,
                opacity: child.material.opacity,
                alphaMap: child.material.alphaMap,
                side: THREE.DoubleSide,
                metalness: 0.0,
                roughness: 0.8
            });

            // Store the original material for reference
            child.userData.originalMaterial = child.material;
            
            // Apply the new material
            child.material = material;
            
            // Enable shadows
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
}
