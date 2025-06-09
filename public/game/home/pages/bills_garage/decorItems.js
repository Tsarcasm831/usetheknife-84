import * as THREE from 'three';

// Note: Making this async to simulate potential texture loading
export async function setupDecorItems(world) {
    const { scene } = world;
    const wallLen = 20;
    const wallHt = 4;
    const wallTh = 0.2;

    // --- Simple Poster ---
    const posterGeo = new THREE.PlaneGeometry(0.8, 1.1);

    // Create a placeholder canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#444';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GARAGE', 64, 50);
    ctx.fillText('POSTER', 64, 75);
    const posterTexture = new THREE.CanvasTexture(canvas);

    const posterMat = new THREE.MeshStandardMaterial({
        map: posterTexture,
        color: 0xffffff,
        roughness: 0.9,
        metalness: 0.0,
        side: THREE.DoubleSide
     });
    const poster = new THREE.Mesh(posterGeo, posterMat);

    // Position on the left wall
    poster.position.set(-wallLen / 2 + wallTh / 2 + 0.01, 2.0, 1.5); // X (wall), Y (height), Z (along wall)
    poster.rotation.y = Math.PI / 2; // Rotate to face inwards

    poster.castShadow = true; // Minimal shadow impact but possible
    scene.add(poster);

    // Simulate async operation (like texture loading)
    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
}