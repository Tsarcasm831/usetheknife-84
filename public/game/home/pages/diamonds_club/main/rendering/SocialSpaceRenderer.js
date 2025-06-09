import * as THREE from 'three';
import { createLoader } from '../../../../scripts/loaderFactory.js';
import { slotThemes } from '../../constants/slotThemes.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

/**
 * Mixin for rendering and scene logic
 * Moves lighting, level creation, occlusion, and resize logic out.
 */
export default function applyRendering(instance) {
  // Setup WebGL canvas overlay and disable its pointer events
  instance.renderer.domElement.style.position = 'absolute';
  instance.renderer.domElement.style.top = '0';
  instance.renderer.domElement.style.left = '0';
  instance.renderer.domElement.style.pointerEvents = 'none';
  // Initialize and overlay CSS3DRenderer for HTML UI
  instance.cssRenderer = new CSS3DRenderer();
  instance.cssRenderer.setSize(window.innerWidth, window.innerHeight);
  instance.cssRenderer.domElement.style.position = 'absolute';
  instance.cssRenderer.domElement.style.top = '0';
  instance.cssRenderer.domElement.style.left = '0';
  instance.cssRenderer.domElement.style.pointerEvents = 'auto';
  // Append CSS3D layer
  instance.css3dContainer.appendChild(instance.cssRenderer.domElement);

  instance.addLighting = function() {
    // Add a single chandelier that provides all the room lighting
    instance.createChandelier();
  };

  // Mixin for chandelier creation
  instance.createChandelier = function() {
    // Create chandelier group
    const chandelierGroup = new THREE.Group();
    // Chandelier dimensions and positioning
    const centerY = 8;
    const centerRingRadius = 3.5;
    const metalColor = 0x995511;
    const crystalColor = 0xffbb44;
    // Create central structure
    const coreGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const metalMaterial = new THREE.MeshStandardMaterial({ color: metalColor, roughness: 0.2, metalness: 0.9 });
    const noisyMetalMaterial = instance.applyNoiseToMaterial(metalMaterial, 256, 0.2, 0.5, 0.5);
    const core = new THREE.Mesh(coreGeometry, noisyMetalMaterial);
    core.position.y = centerY;
    chandelierGroup.add(core);
    // Chains supporting the chandelier
    const chainCount = 3;
    const chainTopY = centerY + 6;
    const chainRadius = 2.0;
    for (let i = 0; i < chainCount; i++) {
      const angle = (i / chainCount) * Math.PI * 2;
      const chainX = Math.cos(angle) * chainRadius;
      const chainZ = Math.sin(angle) * chainRadius;
      const linkCount = 8;
      const linkLength = (chainTopY - centerY) / linkCount;
      const linkRadius = 0.12;
      for (let j = 0; j < linkCount; j++) {
        const linkY = centerY + j * linkLength + linkLength/2;
        const linkGeometry = new THREE.TorusGeometry(linkRadius, linkRadius/3, 8, 16);
        const link = new THREE.Mesh(linkGeometry, noisyMetalMaterial.clone());
        link.position.set(
          chainX * (1 - j/linkCount),
          linkY,
          chainZ * (1 - j/linkCount)
        );
        if (j % 2 === 0) link.rotation.x = Math.PI/2;
        else link.rotation.z = Math.PI/2;
        chandelierGroup.add(link);
      }
    }
    // Tiers of chandelier
    const tierCount = 3;
    const tierSpacing = 0.7;
    for (let tier = 0; tier < tierCount; tier++) {
      const tierRadius = centerRingRadius * (1 - tier * 0.25);
      const tierY = centerY - tier * tierSpacing;
      const ringGeometry = new THREE.TorusGeometry(tierRadius, 0.2, 16, 48);
      const ring = new THREE.Mesh(ringGeometry, noisyMetalMaterial.clone());
      ring.position.y = tierY;
      ring.rotation.x = Math.PI/2;
      chandelierGroup.add(ring);
      const detailCount = 16 - tier * 4;
      for (let i = 0; i < detailCount; i++) {
        const angle = (i / detailCount) * Math.PI * 2;
        const detailGeometry = new THREE.ConeGeometry(0.15, 0.3, 5);
        const detail = new THREE.Mesh(detailGeometry, noisyMetalMaterial.clone());
        detail.position.set(
          Math.cos(angle) * tierRadius,
          tierY,
          Math.sin(angle) * tierRadius
        );
        detail.rotation.x = Math.PI/2;
        detail.rotation.y = angle;
        chandelierGroup.add(detail);
        if (i % 2 === 0) {
          const crystalMaterial = new THREE.MeshStandardMaterial({ color: crystalColor, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.8, emissive: crystalColor, emissiveIntensity: 0.8 });
          const noisyCrystalMaterial = instance.applyNoiseToMaterial(crystalMaterial, 128, 0.3, 0.4, 0.6);
          const crystalLength = 0.8 + Math.random() * 0.6 - tier * 0.2;
          const crystalGeometry = new THREE.ConeGeometry(0.1 + Math.random() * 0.1, crystalLength, 6);
          const crystal = new THREE.Mesh(crystalGeometry, noisyCrystalMaterial.clone());
          crystal.position.set(
            Math.cos(angle) * tierRadius,
            tierY - crystalLength/2 - 0.2,
            Math.sin(angle) * tierRadius
          );
          chandelierGroup.add(crystal);
          if (i % 4 === 0) {
            const light = new THREE.PointLight(0xff8800, 0.8, 15);
            light.position.set(
              Math.cos(angle) * tierRadius,
              tierY - crystalLength - 0.2,
              Math.sin(angle) * tierRadius
            );
            light.castShadow = true;
            light.shadow.mapSize.width = 512;
            light.shadow.mapSize.height = 512;
            light.shadow.camera.near = 0.1;
            light.shadow.camera.far = 20;
            light.decay = 2;
            chandelierGroup.add(light);
          }
        }
      }
      // Spokes
      const spokeCount = 8;
      for (let i = 0; i < spokeCount; i++) {
        const angle = (i / spokeCount) * Math.PI * 2;
        const spokeGeometry = new THREE.CylinderGeometry(0.05, 0.05, tierRadius, 6);
        const spoke = new THREE.Mesh(spokeGeometry, noisyMetalMaterial.clone());
        spoke.position.set(
          Math.cos(angle) * tierRadius/2,
          tierY,
          Math.sin(angle) * tierRadius/2
        );
        spoke.rotation.z = Math.PI/2;
        spoke.rotation.y = -angle;
        chandelierGroup.add(spoke);
      }
    }
    // Central lights
    const centralLight = new THREE.PointLight(0xff7700, 3.0, 50);
    centralLight.position.y = centerY;
    centralLight.castShadow = true;
    centralLight.shadow.mapSize.width = 1024;
    centralLight.shadow.mapSize.height = 1024;
    centralLight.shadow.camera.near = 0.5;
    centralLight.shadow.camera.far = 50;
    centralLight.decay = 1.2;
    chandelierGroup.add(centralLight);
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x221100, 1.0);
    instance.scene.add(ambientLight);
    // Add chandelier group
    instance.scene.add(chandelierGroup);
    instance.occluderObjects.push(chandelierGroup);
  };

  // Simple placeholder slot machine model
  instance.createSlotMachineModel = function(machineId, theme) {
    const group = new THREE.Group();
    // 3D mesh body
    const geom = new THREE.BoxGeometry(1, 2, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.5, metalness: 0.3 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // --- CSS3D UI Panel ---
    const uiElem = document.createElement('div');
    uiElem.className = 'slot-machine-ui';
    uiElem.style.width = '200px';
    uiElem.style.height = '300px';
    uiElem.style.background = theme?.colors?.background || '#222';
    uiElem.style.border = '2px solid ' + (theme?.colors?.border || '#aa0');
    uiElem.style.borderRadius = '20px';
    uiElem.style.display = 'flex';
    uiElem.style.flexDirection = 'column';
    uiElem.style.alignItems = 'center';
    uiElem.style.justifyContent = 'space-between';
    uiElem.style.boxShadow = '0 0 16px #000a';
    uiElem.style.color = theme?.colors?.text || '#fff';
    uiElem.style.fontFamily = 'sans-serif';
    uiElem.style.padding = '10px';
    uiElem.innerHTML = `
      <div style="font-size:1.2em;font-weight:bold;margin-bottom:8px;">${theme?.name || 'Slot Machine'}</div>
      <div class="slot-reels" style="display:flex;gap:6px;justify-content:center;margin-bottom:8px;">
        <div class="slot-reel" style="width:36px;height:48px;background:${theme?.colors?.reelBg||'#333'};color:${theme?.colors?.reelText||'#fff'};border:2px solid ${theme?.colors?.reelBorder||'#fff'};border-radius:8px;font-size:2em;display:flex;align-items:center;justify-content:center;">7</div>
        <div class="slot-reel" style="width:36px;height:48px;background:${theme?.colors?.reelBg||'#333'};color:${theme?.colors?.reelText||'#fff'};border:2px solid ${theme?.colors?.reelBorder||'#fff'};border-radius:8px;font-size:2em;display:flex;align-items:center;justify-content:center;">7</div>
        <div class="slot-reel" style="width:36px;height:48px;background:${theme?.colors?.reelBg||'#333'};color:${theme?.colors?.reelText||'#fff'};border:2px solid ${theme?.colors?.reelBorder||'#fff'};border-radius:8px;font-size:2em;display:flex;align-items:center;justify-content:center;">7</div>
      </div>
      <div class="slot-message" style="min-height:32px;text-align:center;margin-bottom:8px;">Welcome!</div>
      <div class="slot-buttons" style="display:flex;gap:12px;">
        <button class="slot-button" style="padding:8px 16px;font-size:1em;background:${theme?.colors?.buttonBg||'#aa0'};color:${theme?.colors?.buttonText||'#222'};border:2px solid ${theme?.colors?.buttonBorder||'#fff'};border-radius:8px;cursor:pointer;">Spin</button>
        <button class="bet-button" style="padding:8px 16px;font-size:1em;background:${theme?.colors?.betBg||'#222'};color:${theme?.colors?.betText||'#fff'};border:2px solid ${theme?.colors?.betBorder||'#fff'};border-radius:8px;cursor:pointer;">Bet</button>
      </div>
    `;
    // Wrap in CSS3DObject and attach to group
    const css3d = new CSS3DObject(uiElem);
    css3d.position.set(0, 1.1, 0.56); // In front of box
    css3d.scale.set(0.005, 0.006, 0.005);
    group.add(css3d);
    group.userData.uiElement = uiElem;
    return group;
  };

  // Instantiate bar area: shelf and stools
  instance.createBarArea = function(wallX, y, z) {
    // Draw liquor shelf
    const shelfLength = instance.roomSize - 1;
    instance.createLiquorShelf(wallX, y + 2, z, shelfLength);
    // Place stools
    const numStools = 5;
    const spacing = shelfLength / (numStools + 1);
    const offsetX = wallX < 0 ? wallX + 0.5 : wallX - 0.5;
    for (let i = 1; i <= numStools; i++) {
      const zPos = z - shelfLength / 2 + spacing * i;
      instance.createBarStool(offsetX, y, zPos);
    }
  };

  // Instantiate mines games along wall
  instance.createMinesGames = function(wallX, y, z) {
    const numGames = 4;
    const spacing = instance.roomSize / (numGames + 1);
    const offsetX = wallX < 0 ? wallX + 0.5 : wallX - 0.5;
    for (let i = 1; i <= numGames; i++) {
      const zPos = z - instance.roomSize / 2 + spacing * i;
      const gameId = `mines_${i}`;
      const gameGroup = instance.createMinesGameModel(gameId, zPos, offsetX, y);
      instance.scene.add(gameGroup);
      instance.occluderObjects.push(gameGroup);
      instance.minesGames[gameId] = { model: gameGroup };
    }
  };

  // --- Bar and Shelf Assets ---
  instance.createBarStool = function(x, y, z) {
    const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.4, metalness: 0.8 });
    const noisyMetal = instance.applyNoiseToMaterial(metalMaterial, 256, 0.1, 0.5, 0.6);
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x990000, roughness: 0.9, metalness: 0.1 });
    const noisySeat = instance.applyNoiseToMaterial(seatMaterial, 256, 0.3, 0.6, 0.5);
    // seat
    const seatGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16);
    const seat = new THREE.Mesh(seatGeom, noisySeat);
    seat.position.set(x, y + 0.8, z);
    seat.castShadow = seat.receiveShadow = true;
    instance.scene.add(seat); instance.occluderObjects.push(seat);
    // pole
    const poleGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    const pole = new THREE.Mesh(poleGeom, noisyMetal.clone());
    pole.position.set(x, y + 0.4, z);
    pole.castShadow = pole.receiveShadow = true;
    instance.scene.add(pole); instance.occluderObjects.push(pole);
    // base
    const baseGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16);
    const base = new THREE.Mesh(baseGeom, noisyMetal.clone());
    base.position.set(x, y + 0.025, z);
    base.castShadow = base.receiveShadow = true;
    instance.scene.add(base); instance.occluderObjects.push(base);
    // footrest
    const ringGeom = new THREE.TorusGeometry(0.25, 0.02, 8, 16);
    const ring = new THREE.Mesh(ringGeom, noisyMetal.clone());
    ring.position.set(x, y + 0.25, z);
    ring.castShadow = ring.receiveShadow = true;
    instance.scene.add(ring); instance.occluderObjects.push(ring);
  };

  instance.createLiquorShelf = function(wallX, y, z, length) {
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x2d1506, roughness: 0.7, metalness: 0.2 });
    const noisyShelf = instance.applyNoiseToMaterial(shelfMat, 512, 0.15, 0.5, 0.5);
    // back panel
    const backGeom = new THREE.BoxGeometry(0.1, 3.5, length);
    const back = new THREE.Mesh(backGeom, noisyShelf.clone());
    back.position.set(wallX - 0.05, y + 1.75, z + length / 2);
    back.castShadow = back.receiveShadow = true;
    instance.scene.add(back); instance.occluderObjects.push(back);
    // shelves
    const shelfWidth = 0.8, shelfHeight = 0.06;
    const levels = 3, spacing = 1.5;
    for (let i = 0; i < levels; i++) {
      const shelfY = y + i * spacing;
      const geom = new THREE.BoxGeometry(shelfWidth, shelfHeight, length);
      const shelf = new THREE.Mesh(geom, noisyShelf.clone());
      shelf.position.set(wallX + shelfWidth / 2, shelfY, z + length / 2);
      shelf.castShadow = shelf.receiveShadow = true;
      instance.scene.add(shelf); instance.occluderObjects.push(shelf);
      instance.addBottlesToShelf(wallX + shelfWidth / 2, shelfY + shelfHeight / 2, z, length, 6 + i);
    }
  };

  instance.addBottlesToShelf = function(shelfX, shelfY, shelfZ, shelfLength, bottleCount) {
    const spacing = shelfLength / (bottleCount + 1);
    const colors = [0x7a3300,0xaa8800,0x336699,0xcc5500,0x446600,0x660033,0x007733,0xcc00cc,0x0099aa];
    for (let i = 1; i <= bottleCount; i++) {
      const zPos = shelfZ + i * spacing;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const h = 0.5 + Math.random() * 0.4;
      const r = 0.08 + Math.random() * 0.04;
      const nr = r * (0.3 + Math.random() * 0.2);
      const nh = h * (0.3 + Math.random() * 0.2);
      const grp = new THREE.Group();
      grp.position.set(shelfX, shelfY + h / 2, zPos);
      const bodyPts = [], segs = 8;
      for (let t = 0; t <= segs; t++) {
        const u = t / segs;
        const rad = r * (1 - u*u) + (r*0.6 + nr*0.4) * (u*u);
        bodyPts.push(new THREE.Vector2(rad, h*u));
      }
      const bodyGeom = new THREE.LatheGeometry(bodyPts, 16);
      bodyGeom.translate(0, -h/2,0);
      const mat = new THREE.MeshStandardMaterial({color,transparent:true,opacity:0.8,roughness:0.1,metalness:0.1});
      const body = new THREE.Mesh(bodyGeom, mat.clone());
      body.castShadow = body.receiveShadow = true;
      grp.add(body);
      // neck
      const neckPts = [];
      for (let t=0; t<=segs; t++) {
        const u = t/segs;
        const rad2 = (r*0.6+nr*0.4)*(1-u) + nr*u;
        neckPts.push(new THREE.Vector2(rad2, nh*u));
      }
      const neckGeom = new THREE.LatheGeometry(neckPts,16);
      neckGeom.translate(0,h/2,0);
      const neck = new THREE.Mesh(neckGeom, mat.clone());
      neck.castShadow = neck.receiveShadow = true;
      grp.add(neck);
      instance.scene.add(grp); instance.occluderObjects.push(grp);
    }
  };

  // Simple placeholder mines game model
  instance.createMinesGameModel = function(gameId, zPos, wallX, floorY) {
    const grp = new THREE.Group(); grp.userData.gameId = gameId;
    const geom = new THREE.BoxGeometry(1.2,2.2,0.5);
    const mat = new THREE.MeshStandardMaterial({color:0x3366ff,roughness:0.6,metalness:0.4});
    const mesh = new THREE.Mesh(geom,mat);
    mesh.castShadow=mesh.receiveShadow=true;
    mesh.position.set(0, floorY + 1.1, 0);
    grp.add(mesh);
    grp.position.set(wallX, 0, zPos);

    // --- CSS3D Mines Game UI ---
    const uiElem = document.createElement('div');
    uiElem.className = 'mines-game-ui';
    uiElem.style.width = '220px';
    uiElem.style.height = '320px';
    uiElem.style.background = '#222f';
    uiElem.style.border = '2px solid #44f';
    uiElem.style.borderRadius = '18px';
    uiElem.style.display = 'flex';
    uiElem.style.flexDirection = 'column';
    uiElem.style.alignItems = 'center';
    uiElem.style.justifyContent = 'space-between';
    uiElem.style.boxShadow = '0 0 16px #000a';
    uiElem.style.color = '#fff';
    uiElem.style.fontFamily = 'sans-serif';
    uiElem.style.padding = '10px';
    uiElem.innerHTML = `
      <div style="font-size:1.1em;font-weight:bold;margin-bottom:6px;">Mines Game</div>
      <div class="mines-message" style="min-height:28px;text-align:center;margin-bottom:8px;">Avoid the mines!</div>
      <div class="mines-grid" style="display:grid;grid-template-columns:repeat(5,1fr);grid-gap:4px;margin-bottom:8px;">
        ${Array(25).fill(0).map((_,i)=>`<button class="mines-tile" data-tile="${i}" style="width:32px;height:32px;background:#444;border:1px solid #666;border-radius:6px;color:#fff;font-size:1.1em;cursor:pointer;">?</button>`).join('')}
      </div>
      <div class="mines-buttons" style="display:flex;gap:10px;">
        <button class="mines-bet" style="padding:8px 14px;font-size:1em;background:#44f;color:#fff;border:2px solid #fff;border-radius:8px;cursor:pointer;">Bet</button>
        <button class="mines-start" style="padding:8px 14px;font-size:1em;background:#222;color:#fff;border:2px solid #fff;border-radius:8px;cursor:pointer;">Start</button>
      </div>
    `;
    const css3d = new CSS3DObject(uiElem);
    css3d.position.set(0, floorY + 1.35, 0.32); // In front of box
    css3d.scale.set(0.0055, 0.006, 0.0055);
    grp.add(css3d);
    grp.userData.uiElement = uiElem;
    grp.userData.cssObject = css3d;
    // Optionally, store in instance.minesGames for global access
    if (instance.minesGames && typeof gameId === 'string') {
      instance.minesGames[gameId] = instance.minesGames[gameId] || {};
      instance.minesGames[gameId].model = grp;
      instance.minesGames[gameId].uiElement = uiElem;
      instance.minesGames[gameId].cssObject = css3d;
    }
    return grp;
  };

  instance.createCasinoLevel = function() {
    instance.objects = [];
    instance.occluderObjects = [];
    instance.slotMachines = {};
    instance.minesGames = {};

    instance.roomSize = 40;
    const wallHeight = 10;
    const floorColor = 0x550000;

    // --- Floor ---
    const floorGeometry = new THREE.PlaneGeometry(instance.roomSize, instance.roomSize);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.8, metalness: 0.1 });
    const noisyFloorMaterial = instance.applyNoiseToMaterial(floorMaterial, 1024, 0.1, 0.5, 0.5, true);
    const floor = new THREE.Mesh(floorGeometry, noisyFloorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    instance.scene.add(floor);
    instance.occluderObjects.push(floor);

    // --- Ceiling ---
    const ceilingGeometry = new THREE.PlaneGeometry(instance.roomSize, instance.roomSize);
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.9, side: THREE.DoubleSide });
    const noisyCeilingMaterial = instance.applyNoiseToMaterial(ceilingMaterial, 1024, 0.2, 0.6, 0.4);
    const ceiling = new THREE.Mesh(ceilingGeometry, noisyCeilingMaterial);
    ceiling.position.y = wallHeight;
    ceiling.rotation.x = Math.PI / 2;
    ceiling.receiveShadow = true;
    instance.scene.add(ceiling);
    instance.occluderObjects.push(ceiling);

    // --- Walls ---
    const wallThickness = 0.5;
    const wallMaterial = new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.7, metalness: 0.0 });
    const noisyWallMaterial = instance.applyNoiseToMaterial(wallMaterial, 1024, 0.08, 0.5, 0.5);
    const wallData = [
      { x: 0, y: wallHeight/2, z: -instance.roomSize/2, ry: 0, size: [instance.roomSize + wallThickness, wallHeight, wallThickness] },
      { x: 0, y: wallHeight/2, z: instance.roomSize/2, ry: 0, size: [instance.roomSize + wallThickness, wallHeight, wallThickness] },
      { x: -instance.roomSize/2, y: wallHeight/2, z: 0, ry: Math.PI/2, size: [instance.roomSize + wallThickness, wallHeight, wallThickness] },
      { x: instance.roomSize/2, y: wallHeight/2, z: 0, ry: Math.PI/2, size: [instance.roomSize + wallThickness, wallHeight, wallThickness] },
    ];
    wallData.forEach(data => {
      const geom = new THREE.BoxGeometry(data.size[0], data.size[1], data.size[2]);
      const wall = new THREE.Mesh(geom, noisyWallMaterial.clone());
      wall.position.set(data.x, data.y, data.z);
      wall.rotation.y = data.ry;
      wall.castShadow = wall.receiveShadow = true;
      instance.scene.add(wall);
      instance.objects.push(wall);
      instance.occluderObjects.push(wall);
    });

    // --- Dancer NPC ---
    {
      if (!instance.mixers) instance.mixers = [];
      const loader = createLoader();
      const dancerNames = ['dancer1', 'dancer2', 'dancer3', 'dancer4'];
      const basePath = '/assets/static/diamond_dancers';
      dancerNames.forEach((dancerName, index) => {
        // Select animation per dancer
        let animFile = 'Animation_Love_You_Pop_Dance_withSkin.glb';
        if (dancerName === 'dancer3') animFile = 'Animation_Superlove_Pop_Dance_withSkin.glb';
        if (dancerName === 'dancer4') animFile = 'Animation_FunnyDancing_01_withSkin.glb';
        const url = `${basePath}/${dancerName}/biped/${animFile}`;
        loader.load(
          url,
          (gltf) => {
            const dancer = gltf.scene;
            const spacing = 2.5;
            const xOffset = (index - (dancerNames.length - 1) / 2) * spacing;
            dancer.position.set(xOffset, 0, 4);
            dancer.scale.set(1.54, 1.54, 1.54);
            dancer.name = `DiamondClub${dancerName.charAt(0).toUpperCase() + dancerName.slice(1)}`;
            dancer.traverse(child => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // Ensure materials are opaque for proper occlusion
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                      mat.transparent = false;
                      mat.opacity = 1.0;
                      mat.depthWrite = true;
                      mat.depthTest = true;
                    });
                  } else {
                    child.material.transparent = false;
                    child.material.opacity = 1.0;
                    child.material.depthWrite = true;
                    child.material.depthTest = true;
                  }
                }
              }
            });
            instance.scene.add(dancer);
            instance.objects.push(dancer);
            instance.occluderObjects.push(dancer);
            if (gltf.animations && gltf.animations.length > 0) {
              const mixer = new THREE.AnimationMixer(dancer);
              dancer.userData.animations = gltf.animations;
              dancer.userData.mixer = mixer;
              let lastIdx = -1;
              function getRandomIdx() {
                if (gltf.animations.length === 1) return 0;
                let i;
                do {
                  i = Math.floor(Math.random() * gltf.animations.length);
                } while (i === lastIdx);
                lastIdx = i;
                return i;
              }
              function playNext() {
                const idx = getRandomIdx();
                const clip = gltf.animations[idx];
                const action = mixer.clipAction(clip);
                mixer.stopAllAction && mixer.stopAllAction();
                action.reset();
                action.setLoop(THREE.LoopOnce, 1);
                action.clampWhenFinished = true;
                action.play();
                mixer.addEventListener('finished', () => {
                  mixer.removeEventListener('finished', playNext);
                  playNext();
                });
              }
              playNext();
              instance.mixers.push(mixer);
            }
          },
          undefined,
          (err) => console.error(`Error loading dancer ${dancerName}:`, err)
        );
      });
    }
    // --- Slot Machines ---
    const numSlots = 15;
    const machineSpacing = 2.5;
    const totalWidthNeeded = numSlots * machineSpacing;
    const startX = -(totalWidthNeeded/2) + machineSpacing/2;
    const machineBodyDepth = 0.8;
    const wallZ = -instance.roomSize/2 + wallThickness/2 + (machineBodyDepth/2) + 0.1;
    if (slotThemes.length < numSlots) {
      console.warn(`Not enough unique themes (${slotThemes.length}) for the number of slots (${numSlots}). Themes will repeat.`);
    }
    for (let i = 0; i < numSlots; i++) {
      if (typeof instance.createSlotMachineModel !== 'function') {
        console.error('createSlotMachineModel is not available on instance. Skipping slot setup.');
        break;
      }
      const machineId = `slot_${i}`;
      const themeIndex = i % slotThemes.length;
      const theme = slotThemes[themeIndex];
      const slotMachineGroup = instance.createSlotMachineModel(machineId, theme);
      instance.slotMachines[machineId] = { model: slotMachineGroup };
      const xPos = startX + i * machineSpacing;
      slotMachineGroup.position.set(xPos, 0, wallZ);
      slotMachineGroup.scale.set(1.2, 1.2, 1.2);
      instance.scene.add(slotMachineGroup);
      instance.occluderObjects.push(slotMachineGroup);

      const existingState = instance.room.roomState?.slotMachines?.[machineId];
      if (!existingState) {
        instance.room.updateRoomState({
          slotMachines: {
            [machineId]: {
              spinning: false,
              betAmount: 1,
              reels: [theme.symbols[0] || '?', theme.symbols[0] || '?', theme.symbols[0] || '?'],
              message: theme.name
            }
          }
        });
      }
    }
    instance.createBarArea(-instance.roomSize/2 + wallThickness, 0, 0);
    instance.createMinesGames(instance.roomSize/2 - wallThickness, 0, 0);
  };

  instance.processOcclusion = function(gameObjects) {
    // Camera position is our raycast origin
    const cameraPosition = instance.controls.getObject().position.clone();
    
    for (const gameId in gameObjects) {
      const game = gameObjects[gameId];
      if (!game || !game.model || !game.cssObject || !game.uiElement) continue;

      const gameGroup = game.model;
      const uiObject = game.cssObject;
      const uiElement = game.uiElement;

      // Get UI world position
      const uiWorldPosition = new THREE.Vector3();
      uiObject.getWorldPosition(uiWorldPosition);

      // Check direction from camera to UI element
      const dir = uiWorldPosition.clone().sub(cameraPosition).normalize();
      instance.raycaster.set(cameraPosition, dir);
      
      // Calculate distance from camera to UI
      const distanceToUI = cameraPosition.distanceTo(uiWorldPosition);
      
      // Set raycaster parameters to be more precise
      instance.raycaster.near = 0.1;
      instance.raycaster.far = distanceToUI;

      // Exclude the current game object from occlusion test
      const currentOccluders = instance.occluderObjects.filter(obj => obj !== gameGroup);
      
      // Cast ray to check for intersections
      const intersects = instance.raycaster.intersectObjects(currentOccluders, true);

      // Check if any dancer model specifically is between camera and UI
      let dancerOcclusion = false;
      for (const intersect of intersects) {
        let obj = intersect.object;
        let parent = obj;
        
        // Traverse up to find parent
        while (parent && parent !== gameGroup && parent !== instance.scene) {
          if (parent.name && parent.name.includes('DiamondClubDancer')) {
            dancerOcclusion = true;
            break;
          }
          parent = parent.parent;
        }
        
        // If this object or its parent is a dancer and it's closer than the UI, occlude
        if (dancerOcclusion && intersect.distance < distanceToUI) {
          break;
        }
      }
      
      // Object is occluded if there's anything between camera and UI
      const isOccluded = (intersects.length > 0 && intersects[0].distance < distanceToUI) || dancerOcclusion;
      
      // Set target opacity and pointer events based on occlusion
      const targetOpacity = isOccluded ? 0 : 1;
      const targetPointerEvents = isOccluded ? 'none' : 'auto';

      // Smooth transition for opacity changes
      const currentOpacity = parseFloat(uiElement.style.opacity) || 1;
      const newOpacity = currentOpacity + (targetOpacity - currentOpacity) * 0.2; // Faster transition
      uiElement.style.opacity = newOpacity.toFixed(2);

      // Update pointer events immediately
      if (uiElement.style.pointerEvents !== targetPointerEvents) {
        uiElement.style.pointerEvents = targetPointerEvents;
      }
    }
  };

  instance.onWindowResize = function() {
    instance.camera.aspect = window.innerWidth / window.innerHeight;
    instance.camera.updateProjectionMatrix();
    instance.renderer.setSize(window.innerWidth, window.innerHeight);
    instance.cssRenderer.setSize(window.innerWidth, window.innerHeight);
  };
}
