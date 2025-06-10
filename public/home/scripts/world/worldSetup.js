// worldSetup.js
import * as THREE from 'three';
import { createGrid, createGridLabels } from './grid.js'; // Import grid functions
import config from '../../config.js'; // Import config directly for grid/label params

// Create texture loader instance outside functions to reuse it
const textureLoader = new THREE.TextureLoader();

/**
 * Sets up the ambient and directional lights for the scene.
 * @param {THREE.Scene} scene - The scene object.
 * @param {object} config - The main configuration object.
 * @param {object} totalWorldSize - Calculated total size {x, z} of the world.
 * @param {number} ambientIntensity - Intensity of the ambient light.
 * @param {number} directionalIntensity - Intensity of the directional light.
 */
export function setupLights(scene, config, totalWorldSize, ambientIntensity, directionalIntensity) {
    // Use the tweakable values passed in
    const ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, directionalIntensity); // Use passed intensity
    // Position light relative to world size for better coverage
    directionalLight.position.set(totalWorldSize.x * 0.3, 80, totalWorldSize.z * 0.3);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048; // Consider 4096 for larger worlds if needed
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 250; // Increased far plane for larger world

    // Adjust shadow camera bounds based on the total world size and potential wall thickness
    const shadowMargin = 10; // Add some margin around the world bounds
    directionalLight.shadow.camera.left = -totalWorldSize.x / 2 - shadowMargin;
    directionalLight.shadow.camera.right = totalWorldSize.x / 2 + shadowMargin;
    directionalLight.shadow.camera.top = totalWorldSize.z / 2 + shadowMargin;
    directionalLight.shadow.camera.bottom = -totalWorldSize.z / 2 - shadowMargin;
    directionalLight.shadow.camera.updateProjectionMatrix(); // Important! Apply changes
    scene.add(directionalLight);

    // Optional: Visualize the shadow camera's frustum
    // const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // scene.add(shadowHelper);

    console.log("Lights setup complete. Shadow camera bounds updated for world size:", totalWorldSize, "Intensities:", ambientIntensity, directionalIntensity);
}

/**
 * Creates the ground plane chunks based on the world configuration.
 * Applies a texture to the ground.
 * @param {THREE.Scene} scene - The scene object.
 * @param {object} config - The main configuration object.
 */
export function createGroundChunks(scene, config) {
    const { chunkSize, numChunks, groundTextureUrl, groundTextureRepeat } = config.world;
    if (!chunkSize || !numChunks || !groundTextureUrl || !groundTextureRepeat) {
        console.error("Invalid world config for creating textured ground chunks. Check chunkSize, numChunks, groundTextureUrl, and groundTextureRepeat.");
        return;
    }

    // Load the ground texture
    const groundTexture = textureLoader.load(groundTextureUrl);
    groundTexture.wrapS = THREE.RepeatWrapping; // Repeat horizontally
    groundTexture.wrapT = THREE.RepeatWrapping; // Repeat vertically
    groundTexture.repeat.set(groundTextureRepeat.x, groundTextureRepeat.z); // Set repetition per chunk

    // Geometry is now based on the potentially larger chunkSize from config
    const groundGeometry = new THREE.BoxGeometry(chunkSize.x, chunkSize.y, chunkSize.z);
    // Create material using the texture
    const groundMaterial = new THREE.MeshPhongMaterial({ map: groundTexture });

    // Calculate starting offsets based on number of chunks
    const chunkOffsetXStart = -(numChunks.x - 1) / 2;
    const chunkOffsetZStart = -(numChunks.z - 1) / 2;

    console.log(`Creating textured ground with chunk size: ${chunkSize.x}x${chunkSize.z} and texture repeat ${groundTextureRepeat.x}x${groundTextureRepeat.z}`);
    for (let i = 0; i < numChunks.x; i++) {
        for (let j = 0; j < numChunks.z; j++) {
            const chunkX = chunkOffsetXStart + i;
            const chunkZ = chunkOffsetZStart + j;
            // Use the same material instance as the texture settings are the same for all chunks
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.position.set(
                chunkX * chunkSize.x,
                -chunkSize.y / 2, // Position slightly below y=0
                chunkZ * chunkSize.z
            );
            ground.receiveShadow = true;
            ground.name = `GroundChunk_${i}_${j}`;
            scene.add(ground);
        }
    }
    console.log(`Created ${numChunks.x * numChunks.z} textured ground chunks.`);

    // Create underground ground beneath central town chunk if configured
    if (config.world.undergroundDepth > 0) {
        const depth = config.world.undergroundDepth;
        // Calculate center chunk offsets
        const centerI = Math.floor(numChunks.x / 2);
        const centerJ = Math.floor(numChunks.z / 2);
        const centerX = (chunkOffsetXStart + centerI) * chunkSize.x;
        const centerZ = (chunkOffsetZStart + centerJ) * chunkSize.z;
        const undergroundY = -chunkSize.y / 2 - depth;
        const underground = new THREE.Mesh(groundGeometry, groundMaterial);
        underground.position.set(centerX, undergroundY, centerZ);
        underground.receiveShadow = false; // Disable shadows from overworld on underground ground
        underground.name = `UndergroundChunk_${centerI}_${centerJ}`;
        scene.add(underground);
        console.log(`Created underground ground at chunk ${centerI},${centerJ} at depth ${depth}`);
    }
}

/**
 * Creates the grid helper and its labels based on configuration.
 * @param {THREE.Scene} scene - The scene object.
 * @param {object} totalWorldSize - The calculated total size {x, z} of the world.
 * @returns {Promise<{gridHelper: THREE.GridHelper, gridLabelsGroup: THREE.Group | null}>}
 *          A promise resolving with the created grid helper and labels group.
 */
export function setupGridAndLabels(scene, totalWorldSize) {
    // Calculate total divisions based on config
    const divisionsPerChunk = config.grid.divisions;
    const totalGridDivisionsX = divisionsPerChunk * config.world.numChunks.x;
    const totalGridDivisionsZ = divisionsPerChunk * config.world.numChunks.z;

    const maxGridSize = Math.max(totalWorldSize.x, totalWorldSize.z);
    const maxGridDivisions = Math.max(totalGridDivisionsX, totalGridDivisionsZ);

    // --- Grid Helper ---
    const gridHelper = createGrid(
        scene,
        maxGridSize,
        maxGridDivisions,
        config.grid.colorCenterLine,
        config.grid.colorGrid,
        config.grid.yOffset
    );
    gridHelper.position.set(0, config.grid.yOffset, 0); // Center grid at world origin
    gridHelper.visible = false; // Start hidden

    // --- Grid Labels (Async) ---
    return createGridLabels(scene) // Uses config internally now
        .then(group => {
            let gridLabelsGroup = null;
            if (group) {
                gridLabelsGroup = group;
                gridLabelsGroup.position.set(0, 0, 0); // Position relative to world origin
                gridLabelsGroup.visible = gridHelper.visible; // Match visibility
            }
            return { gridHelper, gridLabelsGroup }; // Resolve with both
        }).catch(error => {
            console.error("Failed to initialize grid labels:", error);
            return { gridHelper, gridLabelsGroup: null }; // Resolve with helper only on error
        });
}