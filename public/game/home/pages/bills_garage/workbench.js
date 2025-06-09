import * as THREE from 'three';
import { createNoiseCanvas } from './environmentSetup.js'; // Import noise helper

export function setupWorkbench(world) {
    createWorkbench(world);
}

// --- Helper Function for Wood Grain Texture ---
function createWoodGrainCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Base wood color
    ctx.fillStyle = '#ab7a4a';
    ctx.fillRect(0, 0, width, height);

    // Add darker grain lines
    ctx.lineWidth = Math.random() * 2 + 1; // Vary line width
    ctx.strokeStyle = 'rgba(60, 30, 10, 0.4)'; // Darker brown, semi-transparent

    for (let i = 0; i < 20; i++) { // Number of grain lines
        ctx.beginPath();
        const startY = Math.random() * height;
        const endY = Math.random() * height;
        const cp1x = Math.random() * width * 0.8 + width * 0.1; // Control points within bounds
        const cp1y = Math.random() * height;
        const cp2x = Math.random() * width * 0.8 + width * 0.1;
        const cp2y = Math.random() * height;

        ctx.moveTo(0, startY);
        // Use bezier curves for wavy lines
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, width, endY);
        ctx.stroke();
        ctx.lineWidth = Math.random() * 2 + 0.5; // Vary for next line
    }

    return canvas;
}


function createWorkbench(world) {
    const { scene, colliders } = world;

    // --- Workbench Top ---
    // Create a simple procedural wood grain texture
    const woodCanvas = createWoodGrainCanvas(256, 256);
    const woodTexture = new THREE.CanvasTexture(woodCanvas);
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(2, 1); // Repeat texture

    const benchTopMat = new THREE.MeshStandardMaterial({
        map: woodTexture,
        color: 0xab7a4a, // Adjusted base color
        roughness: 0.8, // Slightly rougher wood
        metalness: 0.0,
    });
    const benchTop = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 0.8), benchTopMat);
    benchTop.position.set(-3.9, 0.9, -4);
    benchTop.castShadow = true;
    benchTop.receiveShadow = true;
    scene.add(benchTop);
    colliders.push(new THREE.Box3().setFromObject(benchTop));

    // --- Workbench Legs ---
    const benchLegMat = new THREE.MeshStandardMaterial({ color: 0x505050, roughness: 0.6, metalness: 0.5 });
    const legGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    for (let ix of [-0.9, 0.9]) {
        for (let iz of [-0.3, 0.3]) {
            const leg = new THREE.Mesh(legGeo, benchLegMat);
            leg.position.set(benchTop.position.x + ix, 0.45, benchTop.position.z + iz);
            leg.castShadow = true;
            leg.receiveShadow = true;
            scene.add(leg);
            // Legs are thin, maybe omit from detailed collision or use simpler collider
        }
    }
}