import { createServer } from 'http';
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { promises as fs } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, 'public');

function getContentType(ext) {
  switch (ext) {
    case '.html': return 'text/html';
    case '.css': return 'text/css';
    case '.js': return 'application/javascript';
    case '.json': return 'application/json';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.ico': return 'image/x-icon';
    case '.mp4': return 'video/mp4';
    case '.glb': return 'model/gltf-binary';
    default: return 'application/octet-stream';
  }
}

function serveStatic(filePath, res) {
  fs.readFile(filePath)
    .then(data => {
      const ext = extname(filePath);
      res.writeHead(200, { 'Content-Type': getContentType(ext) });
      res.end(data);
    })
    .catch(() => {
      res.writeHead(404);
      res.end('Not found');
    });
}

const server = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/cache-assets') {
    const script = join(__dirname, 'public', 'home', 'scripts', 'cache_assets.js');
    execFile('node', [script], err => {
      if (err) {
        res.writeHead(500);
        res.end('Error');
      } else {
        res.writeHead(200);
        res.end('ok');
      }
    });
    return;
  }

  let urlPath = req.url || '/';
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = join(publicDir, urlPath);
  serveStatic(filePath, res);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Cache server running on port ${PORT}`);
});
