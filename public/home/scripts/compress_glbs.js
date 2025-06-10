"use strict";
const fs = require('fs');
const path = require('path');
const gltfPipeline = require('gltf-pipeline');
const processGlb = gltfPipeline.processGlb;

function getGlbFiles(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getGlbFiles(fullPath));
    } else if (path.extname(fullPath).toLowerCase() === '.glb') {
      results.push(fullPath);
    }
  });
  return results;
}

const assetsDir = path.join(__dirname, '..', 'assets');
const glbFiles = getGlbFiles(assetsDir);

(async () => {
  // Target only the bear model file
  const bearFile = path.join(assetsDir, 'fauna', 'rad_bear', 'model_Animation_Walking_withSkin.glb');
  
  try {
    console.log(`Compressing bear model: ${bearFile}`);
    const data = fs.readFileSync(bearFile);
    const results = await processGlb(data, { dracoOptions: { compressionLevel: 7 } });
    fs.writeFileSync(bearFile, results.glb);
    console.log(`Successfully compressed ${bearFile}`);
  } catch (err) {
    console.error(`Error compressing bear file:`, err);
  }
  
  console.log('Bear GLB compression complete.');
})();
