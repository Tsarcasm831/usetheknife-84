// grid.js
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import config from '../../config.js'; // Import config to access grid/label settings

/**
 * Creates a visual grid helper slightly above the ground plane, covering the entire world.
 * @param {THREE.Scene} scene - The scene to add the grid to.
 * @param {number} totalSize - The total size of the grid (width and depth, usually max dimension).
 * @param {number} totalDivisions - The total number of divisions across the grid (usually max dimension).
 * @param {THREE.ColorRepresentation} colorCenterLine - The color of the center lines (X and Z axes).
 * @param {THREE.ColorRepresentation} colorGrid - The color of the regular grid lines.
 * @param {number} yOffset - The vertical offset to position the grid slightly above the ground.
 */
export function createGrid(scene, totalSize, totalDivisions, colorCenterLine, colorGrid, yOffset = 0.02) {
    const gridHelper = new THREE.GridHelper(totalSize, totalDivisions, colorCenterLine, colorGrid);
    gridHelper.position.y = yOffset; // Position slightly above y=0
    gridHelper.name = "DebugGrid";
    // Visibility is set in setupGridAndLabels
    // gridHelper.visible = false; // Start hidden
    scene.add(gridHelper);
    return gridHelper;
}

/**
 * Converts grid indices to world coordinates (center of a cell).
 * @param {number} ix - Grid X index.
 * @param {number} iz - Grid Z index.
 * @returns {{x:number,z:number}}
 */
export function getWorldCoordsFromGrid(ix, iz) {
    const { chunkSize, numChunks } = config.world;
    const divisionsPerChunk = config.grid.divisions;
    const totalSizeX = chunkSize.x * numChunks.x;
    const totalSizeZ = chunkSize.z * numChunks.z;
    const cellSizeX = chunkSize.x / divisionsPerChunk;
    const cellSizeZ = chunkSize.z / divisionsPerChunk;
    const halfTotalSizeX = totalSizeX / 2;
    const halfTotalSizeZ = totalSizeZ / 2;
    const x = -halfTotalSizeX + (ix + 0.5) * cellSizeX;
    const z = -halfTotalSizeZ + (iz + 0.5) * cellSizeZ;
    return { x, z };
}

/**
 * Creates 3D text labels for each cell of the entire world grid.
 * Loads the font asynchronously. Reads world configuration directly from config.
 * @param {THREE.Scene} scene - The scene to add the labels to.
 * @returns {Promise<THREE.Group | null>} A promise that resolves with the group containing all labels, or null if disabled/error.
 */
export function createGridLabels(scene) {
    return new Promise((resolve, reject) => {
         // Check if grid labels are enabled in the config
        if (!config.gridLabels?.enabled) {
            console.log("Grid labels are disabled in config.");
            resolve(null); // Resolve with null if labels are disabled
            return;
        }

        // Get necessary config values with checks
        const worldConfig = config.world;
        const gridConfig = config.grid;
        const labelConfig = config.gridLabels;
        const fontUrl = config.helvetikerFontUrl; // Use the global font URL

        if (!worldConfig?.chunkSize?.x || !worldConfig?.chunkSize?.z || !worldConfig?.numChunks?.x || !worldConfig?.numChunks?.z ||
            !gridConfig?.divisions || gridConfig.divisions <= 0 ||
            !fontUrl || // Check the global font URL
            !labelConfig?.fontSize || !labelConfig?.fontHeight || typeof labelConfig?.color === 'undefined' || typeof labelConfig?.yOffset === 'undefined')
        {
             console.error("Invalid configuration for grid labels. Check world, grid, gridLabels sections, and helvetikerFontUrl in config.js");
             reject(new Error("Invalid configuration for grid labels."));
             return;
        }

        const { chunkSize, numChunks } = worldConfig;
        const divisionsPerChunk = gridConfig.divisions;

        // Calculate total grid size and divisions from config
        const totalSizeX = chunkSize.x * numChunks.x;
        const totalSizeZ = chunkSize.z * numChunks.z;
        const totalDivisionsX = divisionsPerChunk * numChunks.x;
        const totalDivisionsZ = divisionsPerChunk * numChunks.z;

        // Calculate cell size based on one chunk
        const cellSizeX = chunkSize.x / divisionsPerChunk;
        const cellSizeZ = chunkSize.z / divisionsPerChunk;

        const halfTotalSizeX = totalSizeX / 2;
        const halfTotalSizeZ = totalSizeZ / 2;

        console.log(`Creating grid labels: Cells=${totalDivisionsX}x${totalDivisionsZ}, CellSize=${cellSizeX.toFixed(2)}x${cellSizeZ.toFixed(2)}`);

        const loader = new FontLoader();
        // Prepend origin for absolute font URLs
        const fullFontUrl = fontUrl.startsWith('/') ? `${window.location.origin}${fontUrl}` : fontUrl;
        loader.load(fullFontUrl, (font) => { // Load using computed full font URL
            console.log("Font loaded successfully for grid labels.");
            const labelsGroup = new THREE.Group();
            labelsGroup.name = "GridLabelsGroup";
            const material = new THREE.MeshBasicMaterial({ color: labelConfig.color, side: THREE.DoubleSide });

            // Iterate over the entire world grid
            for (let ix = 0; ix < totalDivisionsX; ix++) {
                for (let iz = 0; iz < totalDivisionsZ; iz++) {
                    // Calculate the center of the world grid cell
                    const cellCenterX = -halfTotalSizeX + (ix + 0.5) * cellSizeX;
                    const cellCenterZ = -halfTotalSizeZ + (iz + 0.5) * cellSizeZ;
                    const labelText = `(${ix},${iz})`; // Using world grid indices

                    const textGeometry = new TextGeometry(labelText, {
                        font: font,
                        size: labelConfig.fontSize,
                        height: labelConfig.fontHeight,
                        curveSegments: 2, // Keep low for performance
                    });

                    // Center the text geometry horizontally and vertically
                    textGeometry.computeBoundingBox();
                    if (textGeometry.boundingBox) { // Add check for boundingBox
                        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
                        const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y; // This is height in the text's local XY plane
                        textGeometry.translate(-textWidth / 2, -textHeight / 2, 0); // Center alignment
                    } else {
                        console.warn(`Could not compute bounding box for text: ${labelText}`);
                    }

                    const textMesh = new THREE.Mesh(textGeometry, material);

                    // Position and rotate the text
                    // Place slightly above ground using labelConfig yOffset
                    textMesh.position.set(cellCenterX, labelConfig.yOffset, cellCenterZ);
                    textMesh.rotation.x = -Math.PI / 2; // Rotate to lay flat on the XZ plane

                    labelsGroup.add(textMesh);
                }
            }

            // Visibility is handled by the caller (setupGridAndLabels in worldSetup.js)
            // labelsGroup.visible = false; // Start hidden, same as grid
            scene.add(labelsGroup);
            console.log(`Created ${totalDivisionsX * totalDivisionsZ} grid labels covering the whole world.`);
            resolve(labelsGroup); // Resolve the promise with the group

        }, undefined, (error) => {
            console.error('Error loading font for grid labels:', error);
            reject(error); // Reject the promise on error
        });
    });
}