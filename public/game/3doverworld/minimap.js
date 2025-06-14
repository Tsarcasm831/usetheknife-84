import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

export class Minimap {
  constructor() {
    window.spawnedCottages = window.spawnedCottages || [];
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'minimap';
    const size = 200;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: ${size}px;
      height: ${size}px;
      border: 2px solid #fff;
      background-color: rgba(0,0,0,0.7);
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
      z-index: 1000;
      display: none;
    `;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);
    this.size = size;
    this.scale = 2;
    this.gridSpacing = 10;
    this.minScale = 0.5;
    this.maxScale = 5;
    this.canvas.addEventListener('wheel', this.onWheel.bind(this));
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyM' && !e.repeat) {
        this.canvas.style.display = this.canvas.style.display === 'none' ? 'block' : 'none';
        e.preventDefault();
      }
    });
    this.lastUpdate = performance.now();
    this.update();
  }

  update() {
    requestAnimationFrame(() => this.update());
    const now = performance.now();
    if (now - this.lastUpdate < 200) return;
    this.lastUpdate = now;
    if (!window.game || !window.game.camera) return;

    const camPos = window.game.camera.position;
    const cx = this.size / 2;
    const cy = this.size / 2;
    this.ctx.clearRect(0, 0, this.size, this.size);

    this.drawGrid(camPos, cx, cy);
    this.drawSpawnedItems(camPos, cx, cy);

    this.drawCompass(cx, cy);

    const dir = new THREE.Vector3();
    window.game.camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const angle = Math.atan2(dir.x, dir.z);

    this.drawPlayer(cx, cy, angle);
  }

  drawGrid(camPos, cx, cy) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    const r = this.size / this.scale / 2;
    const startX = camPos.x - r, endX = camPos.x + r;
    const startZ = camPos.z - r, endZ = camPos.z + r;
    let gx = startX - (startX % this.gridSpacing);
    for (; gx <= endX; gx += this.gridSpacing) {
      const sx = cx + (gx - camPos.x) * this.scale;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, this.size);
      ctx.stroke();
    }
    let gz = startZ - (startZ % this.gridSpacing);
    for (; gz <= endZ; gz += this.gridSpacing) {
      const sy = cy - (gz - camPos.z) * this.scale;
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(this.size, sy);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawSpawnedItems(camPos, cx, cy) {
    const ctx = this.ctx;
    (window.game.trees || []).forEach(t => {
      if (!t.mesh) return;
      const p = t.mesh.position;
      const x = cx + (p.x - camPos.x) * this.scale;
      const y = cy - (p.z - camPos.z) * this.scale;
      ctx.save();
      ctx.fillStyle = 'lime';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    });
    if (window.game.chest && window.game.chest.chestModel) {
      const p = window.game.chest.chestModel.position;
      const x = cx + (p.x - camPos.x) * this.scale;
      const y = cy - (p.z - camPos.z) * this.scale;
      ctx.save();
      ctx.fillStyle = 'saddlebrown';
      ctx.fillRect(x - 3, y - 3, 6, 6);
      ctx.restore();
    }
    (window.spawnedCottages || []).forEach(c => {
      if (!c.position) return;
      const p = c.position;
      const x = cx + (p.x - camPos.x) * this.scale;
      const y = cy - (p.z - camPos.z) * this.scale;
      ctx.save();
      ctx.fillStyle = 'deepskyblue';
      ctx.beginPath();
      ctx.moveTo(x, y - 4);
      ctx.lineTo(x - 4, y + 4);
      ctx.lineTo(x + 4, y + 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  drawCompass(cx, cy) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const pad = 10;
    ctx.fillText('N', cx, pad);
    ctx.fillText('S', cx, this.size - pad);
    ctx.fillText('W', pad, cy);
    ctx.fillText('E', this.size - pad, cy);
    ctx.restore();
  }

  drawPlayer(cx, cy, angle) {
    const ctx = this.ctx;
    const h = 12, w = 8;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-angle);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.lineTo(-w, h);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  onWheel(ev) {
    ev.preventDefault();
    const factor = ev.deltaY < 0 ? 1.1 : 0.9;
    this.scale = Math.min(this.maxScale, Math.max(this.minScale, this.scale * factor));
  }
}

new Minimap();