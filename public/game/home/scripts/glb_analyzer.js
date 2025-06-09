// glb_analyzer.js (Collision Extractor for GLBs)

import fs from 'fs';
import path from 'path';
import { NodeIO } from '@gltf-transform/core';
import { computeBounds } from '@gltf-transform/functions';

const filePath = process.argv[2]; // path to .glb file

if (!filePath) {
    console.error("Usage: node glbanalyzer.js <path-to-glb>");
    process.exit(1);
}

const io = new NodeIO();

(async () => {
    try {
        const doc = await io.read(filePath);
        const scene = doc.getRoot().listScenes()[0];

        console.log(`Analyzing: ${path.basename(filePath)}\n`);

        scene.listChildren().forEach((node, idx) => {
            if (node.getMesh()) {
                computeBounds(node); // populates bounds info
                const bounds = node.getBounds(); // { min: [x,y,z], max: [x,y,z] }

                console.log(`Mesh ${idx + 1}: ${node.getName() || "(Unnamed)"}`);
                console.log(`  AABB Min: [${bounds.min.map(n => n.toFixed(4)).join(', ')}]`);
                console.log(`  AABB Max: [${bounds.max.map(n => n.toFixed(4)).join(', ')}]`);
                console.log(`  Dimensions: [${(bounds.max[0] - bounds.min[0]).toFixed(4)}, ${(bounds.max[1] - bounds.min[1]).toFixed(4)}, ${(bounds.max[2] - bounds.min[2]).toFixed(4)}]`);
                console.log('');
            }
        });

    } catch (err) {
        console.error("Error reading GLB:", err);
    }
})();
