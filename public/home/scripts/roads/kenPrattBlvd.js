import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { createRoadSegment } from './road.js'; // Reuse the road segment creator
import globalConfig from '../../config.js'; // Import the main config

/**
 * Creates the "Ken Pratt Blvd." road segment and its label.
 * @param {THREE.Scene} scene - The scene to add the road and label to.
 * @param {object} blvdConfig - Configuration for Ken Pratt Blvd. (position, size, colors, label, etc.)
 * @param {object} roadConfig - General road config (needed for thickness).
 * @param {object} labelConfig - General label config (needed for fontHeight, yOffset). Font URL from global config.
 */
export function createKenPrattBlvd(scene, blvdConfig, roadConfig, labelConfig) {
    // 1. Create the road segment
    const segmentConfig = {
        position: blvdConfig.position,
        size: blvdConfig.size,
        swapUV: true, // Swap texture axes for E/W road
        // E/W road, no rotation needed unless specified
        // rotationY can be added if needed
    };
    const generalRoadConfig = {
        thickness: roadConfig.thickness, // Use general thickness
        color: blvdConfig.colors.road // Use specific color
    };
    const roadMesh = createRoadSegment(scene, generalRoadConfig, segmentConfig);
    roadMesh.name = "RoadSegment_KenPrattBlvd"; // Specific name

    // 2. Create the label
    const loader = new FontLoader();
    const fontUrl = globalConfig.helvetikerFontUrl; // Use global font URL
    if (!fontUrl) {
        console.error(`Font URL missing in global config for ${blvdConfig.label} label.`);
        return roadMesh; // Return mesh, but don't attempt loading label
    }

    loader.load(fontUrl, (font) => {
        const labelText = blvdConfig.label;
        const textGeometry = new TextGeometry(labelText, {
            font: font,
            size: blvdConfig.labelFontSize, // Use specific font size
            height: labelConfig.fontHeight,
            curveSegments: 2,
        });

        // Center the text geometry horizontally
        textGeometry.computeBoundingBox();
        if (textGeometry.boundingBox) {
            const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
            textGeometry.translate(-textWidth / 2, 0, 0); // Center alignment horizontally
        }

        const material = new THREE.MeshBasicMaterial({ color: blvdConfig.colors.label, side: THREE.DoubleSide });
        const textMesh = new THREE.Mesh(textGeometry, material);

        // Position and rotate the text
        const yPos = (roadConfig.thickness / 2) + labelConfig.yOffset + 0.01; // Slightly above road
        textMesh.position.set(segmentConfig.position.x, yPos, segmentConfig.position.z);

        // Rotate to lay flat on the XZ plane
        textMesh.rotation.x = -Math.PI / 2;

        // E/W road: Text geometry runs along its local X, which should align with the world X.
        // No additional Y rotation is needed. The previous Math.PI / 2 rotation made it vertical relative to the road.
        textMesh.rotation.y = 0; // Align with E/W direction

        scene.add(textMesh);
        console.log(`Created label for ${labelText}`);

    }, undefined, (error) => {
        console.error(`Error loading font for ${blvdConfig.label} label:`, error);
    });

    // Return the road mesh if needed, label is added asynchronously
    return roadMesh;
}