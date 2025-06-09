"use strict";

const fs = require('fs');
const path = require('path');

// Recursively collect .glb files under assets directory
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

// Generate URLs relative to project root
const urls = glbFiles.map(f => {
  const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');
  return '/' + rel;
});

const manifestPath = path.join(assetsDir, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(urls, null, 2));
console.log(`Generated ${manifestPath} with ${urls.length} entries.`);
