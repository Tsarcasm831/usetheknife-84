import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import globalConfig from './config.js'; // Import the main config

/**
 * Creates 3D text labels for specific road segments based on configuration.
 * Loads the font asynchronously. This function now handles *generic* road labels defined in config.
 * @param {THREE.Scene} scene - The scene to add the labels to.
 * @param {object} roadConfig - General configuration for roads (thickness, segments).
 * @param {object} labelConfig - Configuration for the road labels (fontSize, fontHeight, color, yOffset). NOTE: fontUrl comes from globalConfig.
 * @returns {Promise<THREE.Group | null>} A promise that resolves with the group containing all labels, or null if no labels are defined/error.
 */
export function createRoadLabels(scene, roadConfig, labelConfig) {
    return new Promise((resolve, reject) => {
        // Check if there are any segments with labels defined in the main road config
        const segmentsWithLabels = roadConfig.segments.filter(seg => seg.label);
        if (segmentsWithLabels.length === 0) {
            console.log("No generic road labels defined in config.road.segments.");
            resolve(null); // Resolve with null if no labels are needed
            return;
        }
        // Use the globally defined font URL
        const fontUrl = globalConfig.helvetikerFontUrl;
        if (!labelConfig || !fontUrl) {
             console.error("Road label configuration or global fontUrl missing.");
             reject(new Error("Road label configuration or global fontUrl missing."));
             return;
        }

        const loader = new FontLoader();
        loader.load(fontUrl, (font) => { // Load using the global font URL
            console.log("Font loaded successfully for generic road labels.");
            const labelsGroup = new THREE.Group();
            labelsGroup.name = "GenericRoadLabelsGroup";
            const material = new THREE.MeshBasicMaterial({ color: labelConfig.color, side: THREE.DoubleSide });

            segmentsWithLabels.forEach(segment => {
                const labelText = segment.label;
                const textGeometry = new TextGeometry(labelText, {
                    font: font,
                    size: labelConfig.fontSize, // Use general font size
                    height: labelConfig.fontHeight,
                    curveSegments: 2, // Keep low for performance
                });

                // Center the text geometry horizontally
                textGeometry.computeBoundingBox();
                if (textGeometry.boundingBox) {
                    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
                    textGeometry.translate(-textWidth / 2, 0, 0); // Center alignment horizontally
                } else {
                    console.warn(`Could not compute bounding box for road label text: ${labelText}`);
                }

                const textMesh = new THREE.Mesh(textGeometry, material);

                // Position and rotate the text
                // Place it slightly above the road surface
                const yPos = (roadConfig.thickness / 2) + labelConfig.yOffset + 0.01;
                textMesh.position.set(segment.position.x, yPos, segment.position.z);

                // Rotate to lay flat on the XZ plane, aligned with the road direction
                textMesh.rotation.x = -Math.PI / 2;

                // Always rotate 90 degrees around Y to align text along the road
                textMesh.rotation.y = Math.PI / 2;

                labelsGroup.add(textMesh);
            });

            scene.add(labelsGroup);
            console.log(`Created ${segmentsWithLabels.length} generic road labels.`);
            resolve(labelsGroup); // Resolve the promise with the group

        }, undefined, (error) => {
            console.error('Error loading font for generic road labels:', error);
            reject(error); // Reject the promise on error
        });
    });
}