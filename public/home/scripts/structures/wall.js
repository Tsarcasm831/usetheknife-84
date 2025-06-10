import * as THREE from 'three';

// Texture loader instance
const textureLoader = new THREE.TextureLoader();
const wallTextureUrl = 'assets/images/metal_rusted.png';

/**
 * Creates four wall segments surrounding the central chunk (0,0), with a gap in the south wall.
 * Uses gap coordinates and chunk size from the config.
 * Applies a texture to the walls.
 * @param {THREE.Scene} scene - The scene to add the walls to.
 * @param {object} worldConfig - Configuration object for the world (needs chunkSize).
 * @param {object} wallConfig - Configuration object for the walls (height, thickness, gap). Color is now ignored.
 * @returns {Array<THREE.Mesh>} - An array containing the wall meshes.
 */
export function createWalls(scene, worldConfig, wallConfig) {
    const { chunkSize } = worldConfig; // Use the potentially updated chunkSize
    const chunkWidth = chunkSize.x;
    const chunkDepth = chunkSize.z;
    const halfChunkX = chunkWidth / 2;
    const halfChunkZ = chunkDepth / 2;

    const wallHeight = wallConfig.height;
    const wallThickness = wallConfig.thickness;
    // const wallColor = wallConfig.color; // Color is replaced by texture
    const gapConfig = wallConfig.gap; // Get gap config

    if (!gapConfig || typeof gapConfig.startX !== 'number' || typeof gapConfig.endX !== 'number') {
        console.error("Wall gap configuration is missing or invalid in config.js!");
        return []; // Return empty array if config is bad
    }
    if (!chunkSize || !chunkWidth || !chunkDepth) {
        console.error("Invalid worldConfig.chunkSize in createWalls!");
        return [];
    }

    console.log(`Creating textured walls based on chunk size: ${chunkWidth}x${chunkDepth}`);

    // Load the texture
    const wallTexture = textureLoader.load(wallTextureUrl);
    // Configure texture wrapping and repetition
    wallTexture.wrapS = THREE.RepeatWrapping; // Repeat horizontally
    wallTexture.wrapT = THREE.RepeatWrapping; // Repeat vertically

    // Create material with the texture
    const wallMaterial = new THREE.MeshPhongMaterial({
        map: wallTexture,
        // Optionally add other material properties like roughness, metalness if needed
    });

    const wallMeshes = [];
    const commonUserData = { collidable: true }; // Mark walls as collidable

    // Function to set texture repeat based on wall segment dimensions
    const setTextureRepeat = (geometry, mesh) => {
        if (!geometry.parameters) return; // Check if parameters exist (BoxGeometry has them)
        const width = geometry.parameters.width;
        const height = geometry.parameters.height;
        const depth = geometry.parameters.depth;

        // Determine which faces correspond to the length and height of the wall
        // This depends on the orientation (N/S vs E/W walls)

        // Example: Simple repeat based on overall dimensions (adjust as needed for better mapping)
        const repeatX = Math.max(1, Math.round(Math.max(width, depth) / 4)); // Repeat every 4 units of length
        const repeatY = Math.max(1, Math.round(height / 4)); // Repeat every 4 units of height

        // Clone the material to avoid modifying the shared texture settings directly
        // Or, modify UVs directly for more control (more complex)
        const uniqueMaterial = wallMaterial.clone();
        uniqueMaterial.map = wallTexture.clone(); // Clone texture reference too
        uniqueMaterial.map.repeat.set(repeatX, repeatY);
        // Only flag update when image data is available to avoid warnings
        if (uniqueMaterial.map.image) uniqueMaterial.map.needsUpdate = true;
        mesh.material = uniqueMaterial;

        // UV mapping adjustment might be needed here for perfect alignment if
        // BoxGeometry UVs don't map as desired by default.
        // For now, rely on repeat.
    };

    // --- North Wall (-Z edge of central chunk) ---
    const northSouthBaseGeometryWidth = chunkWidth + wallThickness;
    const northWallGeometry = new THREE.BoxGeometry(northSouthBaseGeometryWidth, wallHeight, wallThickness);
    const northWall = new THREE.Mesh(northWallGeometry, wallMaterial.clone()); // Use cloned material
    setTextureRepeat(northWallGeometry, northWall); // Set texture repeat
    northWall.position.set(0, wallHeight / 2, -halfChunkZ - wallThickness / 2);
    northWall.name = "Wall_North";
    northWall.userData = commonUserData;
    northWall.castShadow = true;
    northWall.receiveShadow = true;
    scene.add(northWall);
    wallMeshes.push(northWall);

    // --- South Wall (+Z edge of central chunk) - WITH GAP ---
    const southWallZ = halfChunkZ + wallThickness / 2;
    const totalSouthWallLength = chunkWidth + wallThickness;
    const startX = -totalSouthWallLength / 2;
    const endX = totalSouthWallLength / 2;
    const gapStartX = gapConfig.startX;
    const gapEndX = gapConfig.endX;

    // Left Segment
    const leftSegmentLength = gapStartX - startX;
    if (leftSegmentLength > 0.01) {
        const leftGeometry = new THREE.BoxGeometry(leftSegmentLength, wallHeight, wallThickness);
        const southWallLeft = new THREE.Mesh(leftGeometry, wallMaterial.clone());
        setTextureRepeat(leftGeometry, southWallLeft);
        southWallLeft.position.set(startX + leftSegmentLength / 2, wallHeight / 2, southWallZ);
        southWallLeft.name = "Wall_South_Left";
        southWallLeft.userData = commonUserData;
        southWallLeft.castShadow = true;
        southWallLeft.receiveShadow = true;
        scene.add(southWallLeft);
        wallMeshes.push(southWallLeft);
    }

    // Right Segment
    const rightSegmentLength = endX - gapEndX;
    if (rightSegmentLength > 0.01) {
        const rightGeometry = new THREE.BoxGeometry(rightSegmentLength, wallHeight, wallThickness);
        const southWallRight = new THREE.Mesh(rightGeometry, wallMaterial.clone());
        setTextureRepeat(rightGeometry, southWallRight);
        southWallRight.position.set(gapEndX + rightSegmentLength / 2, wallHeight / 2, southWallZ);
        southWallRight.name = "Wall_South_Right";
        southWallRight.userData = commonUserData;
        southWallRight.castShadow = true;
        southWallRight.receiveShadow = true;
        scene.add(southWallRight);
        wallMeshes.push(southWallRight);
    }

    // --- West Wall (-X edge of central chunk) ---
    const eastWestBaseGeometryDepth = chunkDepth + wallThickness; // Adjusted variable name for clarity
    const westWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, eastWestBaseGeometryDepth);
    const westWall = new THREE.Mesh(westWallGeometry, wallMaterial.clone());
    setTextureRepeat(westWallGeometry, westWall); // Set texture repeat (using depth here)
    westWall.position.set(-halfChunkX - wallThickness / 2, wallHeight / 2, 0);
    westWall.name = "Wall_West";
    westWall.userData = commonUserData;
    westWall.castShadow = true;
    westWall.receiveShadow = true;
    scene.add(westWall);
    wallMeshes.push(westWall);

    // --- East Wall (+X edge of central chunk) ---
    const eastWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, eastWestBaseGeometryDepth); // Reuse geometry shape if appropriate
    const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial.clone());
    setTextureRepeat(eastWallGeometry, eastWall); // Set texture repeat
    eastWall.position.set(halfChunkX + wallThickness / 2, wallHeight / 2, 0);
    eastWall.name = "Wall_East";
    eastWall.userData = commonUserData;
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    scene.add(eastWall);
    wallMeshes.push(eastWall);

    console.log(`Created textured central chunk boundary walls with south gap between X=${gapStartX} and X=${gapEndX}.`);
    return wallMeshes;
}