// download_and_cache.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_FILE = path.join(__dirname, 'public', 'home', 'downloadableassets.txt');
let assets;
try {
  assets = JSON.parse(fs.readFileSync(ASSETS_FILE, 'utf8'));
} catch (err) {
  console.error(`❌ Failed to read or parse ${ASSETS_FILE}:`, err);
  process.exit(1);
}

function collectUrls(obj, keyPath = [], out = []) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && /^https?:\/\//.test(value)) {
      out.push({ keyPath: [...keyPath, key], url: value });
    } else if (typeof value === 'object' && value !== null) {
      collectUrls(value, [...keyPath, key], out);
    }
  }
  return out;
}

const entries = collectUrls(assets);

async function downloadAndCache({ keyPath, url }) {
  const localPath = path.join(__dirname, 'cache', ...keyPath);
  const dir = path.dirname(localPath);
  fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(localPath)) {
    console.log(`🔹 Skipping (cached): ${keyPath.join('/')}`);
    return;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(localPath, Buffer.from(buffer));
    console.log(`✅ Saved: ${keyPath.join('/')}`);
  } catch (err) {
    console.error(`❌ Error downloading ${url}:`, err.message);
  }
}

(async () => {
  console.log(`Starting download of ${entries.length} assets…`);
  for (const entry of entries) {
    await downloadAndCache(entry);
  }
  console.log('All done! Your assets live in ./cache/');
})();
