const fs = require('fs');
const path = require('path');

// Recursively collect files with given extensions
const getFiles = function(dir, exts) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(full, exts));
    } else if (exts.includes(path.extname(full).toLowerCase())) {
      results.push(full);
    }
  });
  return results;
};

const baseDir = __dirname;
// Include models, textures, and audio in asset search
const assetExts = ['.glb', '.gltf', '.obj', '.fbx', '.png', '.jpg', '.jpeg', '.gif', '.mp3', '.wav', '.hdr', '.exr'];
const jsFiles = getFiles(baseDir, ['.js']);
const allAssets = getFiles(baseDir, assetExts);
const usedAssets = new Set();

// Scan JS for any referenced asset basenames
jsFiles.forEach(jsFile => {
  const content = fs.readFileSync(jsFile, 'utf-8');
  allAssets.forEach(assetPath => {
    const name = path.basename(assetPath);
    if (content.includes(name)) usedAssets.add(assetPath);
  });
});

const unused = allAssets.filter(m => !usedAssets.has(m));
const outFile = path.join(baseDir, 'unused_list.txt');
fs.writeFileSync(outFile, unused.map(f => path.relative(baseDir, f)).join('\n'));
console.log(`Generated unused_list.txt with ${unused.length} entries.`);
