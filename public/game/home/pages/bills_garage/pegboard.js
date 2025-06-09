import * as THREE from 'three';

export function setupPegboard(world) {
    createPegboard(world);
}

function createPegboard(world) {
    const { scene, colliders } = world;
    const wallLen = 20, wallTh = 0.2;

    // Function to create cork texture
    function createCorkCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Base cork color
        ctx.fillStyle = '#D2B48C'; // Tan
        ctx.fillRect(0, 0, width, height);

        // Add darker speckles
        for (let i = 0; i < width * height * 0.5; i++) { // Adjust density
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 1.5 + 0.5; // Small speckles
            const darkness = Math.random() * 0.3 + 0.2; // Vary darkness
            ctx.fillStyle = `rgba(80, 40, 10, ${darkness})`; // Dark brown speckles
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        return canvas;
    }

    // --- Pegboard Panel ---
    const corkCanvas = createCorkCanvas(256, 256);
    const corkTexture = new THREE.CanvasTexture(corkCanvas);
    corkTexture.wrapS = THREE.RepeatWrapping;
    corkTexture.wrapT = THREE.RepeatWrapping;
    corkTexture.repeat.set(3, 2); // Adjust repeat as needed

    const pegboardMat = new THREE.MeshStandardMaterial({
        map: corkTexture,
        color: 0xD2B48C, // Base color still useful
        roughness: 0.85,
        metalness: 0.0
    });
    const pegboardWidth = 1.5;
    const pegboardHeight = 1.0;
    const pegboardDepth = 0.03; // Slightly thicker corkboard
    const pegboard = new THREE.Mesh(new THREE.BoxGeometry(pegboardWidth, pegboardHeight, pegboardDepth), pegboardMat);
    // Positioned on the right wall
    pegboard.position.set(wallLen / 2 - wallTh / 2 - pegboardDepth / 2 - 0.01, 1.8, -2); // Adjusted X position slightly outwards
    pegboard.rotation.y = -Math.PI / 2;
    pegboard.receiveShadow = true;
    scene.add(pegboard);
    // Assign name for easier lookup later
    pegboard.name = "PegboardPanel"; // Changed name for clarity

    // --- Add Pinned Note ---
    const noteGeo = new THREE.PlaneGeometry(0.2, 0.15);
    const noteMat = new THREE.MeshBasicMaterial({ color: 0xffffaa, side: THREE.DoubleSide });
    const note = new THREE.Mesh(noteGeo, noteMat);
    note.position.set(0.4, -0.3, pegboardDepth / 2 + 0.005); // Position on the surface
    note.rotation.z = Math.PI / 16; // Slight tilt
    pegboard.add(note);

    // --- Add Thumbtack ---
    const tackHeadGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.005, 8);
    const tackHeadMat = new THREE.MeshStandardMaterial({color: 0xff0000, roughness: 0.4, metalness: 0.1});
    const tackHead = new THREE.Mesh(tackHeadGeo, tackHeadMat);
    tackHead.rotation.x = Math.PI/2;
    tackHead.position.set(-0.08, 0.05, 0.003); // Relative to note corner
    note.add(tackHead); // Add tack to the note

    // Collider only for the main board, not every hole
    colliders.push(new THREE.Box3().setFromObject(pegboard));
}
