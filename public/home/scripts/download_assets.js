"use strict";
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Request failed ${res.statusCode} ${url}`));
        return;
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => stream.close(resolve));
    }).on('error', reject);
  });
}

async function processEntries(obj, currentPath) {
  for (const [name, value] of Object.entries(obj)) {
    const target = path.join(currentPath, name);
    if (typeof value === 'string') {
      console.log(`Downloading ${name}`);
      await download(value, target);
    } else if (typeof value === 'object') {
      await processEntries(value, target);
    }
  }
}

(async () => {
  const listPath = path.join(__dirname, '..', 'downloadableassets.txt');
  const json = fs.readFileSync(listPath, 'utf8');
  const assets = JSON.parse(json);
  const base = path.join(__dirname, '..', 'assets');
  await processEntries(assets, base);

  // Rebuild manifest once downloads complete
  require(path.join(__dirname, 'build_assets_manifest.js'));
})();
