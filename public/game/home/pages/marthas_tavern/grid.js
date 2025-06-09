import * as THREE from 'three';
import { scene } from './scene.js';

let gridHelper;
let labelGroup; // Group to hold the text labels
const gridSize = 20; // Size of the grid
const gridDivisions = 20; // Number of divisions
const gridCellSize = gridSize / gridDivisions;

/**
 * Snaps a world position to the center of the nearest grid cell.
 * @param {THREE.Vector3 | {x: number, y: number, z: number}} position The position to snap.
 * @returns {{x: number, y: number, z: number}} The snapped position.
 */
export function snapToGridCenter(position) {
    // Calculate the grid cell indices based on world coordinates
    // Assuming grid origin (0,0 index) is at world coordinates (-gridSize/2, z)
    const halfGridSize = gridSize / 2;
    const gridXIndex = Math.floor((position.x + halfGridSize) / gridCellSize);
    const gridZIndex = Math.floor((position.z + halfGridSize) / gridCellSize);

    // Calculate the world coordinates of the center of that cell
    const snappedX = -halfGridSize + gridXIndex * gridCellSize + gridCellSize / 2;
    const snappedZ = -halfGridSize + gridZIndex * gridCellSize + gridCellSize / 2;

    // Return the snapped coordinates, keeping the original Y
    return { x: snappedX, y: position.y, z: snappedZ };
}

/**
 * Creates the grid helper and coordinate labels, adding them to the scene, initially hidden.
 */
export function createGrid() {
    // Create the visual grid lines
    gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x888888, 0x444444);
    gridHelper.position.y = 0.01; // Slightly above the floor to avoid z-fighting
    gridHelper.visible = false; // Start hidden
    scene.add(gridHelper);

    // Create a group for the labels
    labelGroup = new THREE.Group();
    labelGroup.visible = false; // Start hidden

    const halfGridSize = gridSize / 2;
    const labelOffset = gridCellSize / 2; // Offset to center the label in the cell

    // Create labels for each cell
    for (let i = 0; i < gridDivisions; i++) {
        for (let j = 0; j < gridDivisions; j++) {
            // Calculate world coordinates for the cell center
            const x = -halfGridSize + i * gridCellSize + labelOffset;
            const z = -halfGridSize + j * gridCellSize + labelOffset;

            // Calculate grid coordinates (adjusting origin if needed, here 0,0 is bottom-left)
            const gridX = i;
            const gridZ = j;
            const labelText = `${gridX},${gridZ}`;

            const label = createTextLabel(labelText, { x: x, y: 0.02, z: z }); // Position slightly above grid lines
            labelGroup.add(label);
        }
    }

    scene.add(labelGroup);
    console.log("Grid helper and coordinate labels created.");
}

/**
 * Creates a text label as a Sprite.
 * @param {string} text The text content of the label.
 * @param {object} position {x, y, z} world position.
 * @param {number} [fontSize=16] Font size in pixels.
 * @param {string} [color='white'] Text color.
 * @returns {THREE.Sprite} The created text sprite.
 */
function createTextLabel(text, position, fontSize = 16, color = 'white') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const font = `${fontSize}px Arial`;
    context.font = font;

    // Measure text width for canvas size
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    const canvasWidth = THREE.MathUtils.ceilPowerOfTwo(textWidth); // Use power of 2 for potential texture optimization
    const canvasHeight = THREE.MathUtils.ceilPowerOfTwo(fontSize * 1.5); // Add some padding

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Re-apply font settings after resizing
    context.font = font;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvasWidth / 2, canvasHeight / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true, // Make background transparent
        depthTest: false // Render on top of other objects slightly
    });

    const sprite = new THREE.Sprite(material);

    // Scale the sprite based on canvas dimensions to maintain aspect ratio and approximate size
    // Adjust scaling factor as needed for visual size
    const scaleFactor = 0.005;
    sprite.scale.set(canvasWidth * scaleFactor, canvasHeight * scaleFactor, 1);

    sprite.position.set(position.x, position.y, position.z);

    return sprite;
}

/**
 * Toggles the visibility of the grid helper and its labels.
 */
export function toggleGrid() {
    if (gridHelper && labelGroup) {
        gridHelper.visible = !gridHelper.visible;
        labelGroup.visible = !labelGroup.visible;
        console.log(`Grid visibility toggled: ${gridHelper.visible}`);
    } else {
        console.warn("Grid helper or labels not initialized yet.");
    }
}