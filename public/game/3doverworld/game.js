// game.js
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/PointerLockControls.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/OBJLoader.js';

import { DayNightCycle } from './daynightcycle.js';
import { PlayerStats } from './player_stats.js';
import { spawnTrees } from './trees.js';
import { GridOverlay } from './grid_overlay.js';
import { CollisionManager } from './collision.js';
import { Chest } from './chest.js';
import { spawnCottage } from './cottage.js';
import { spawnBrokenCars } from './broken_car.js';
import { spawnRottenLogs } from './rotten_log.js';
import { spawnRadstag } from './radstag.js';
import { spawnRadRabbit } from './rad_rabbit.js';
import { spawnKilrathi } from './kilrathi.js';
import { spawnChiropteran } from './chiropteran.js';
import { spawnDengarCharger } from './dengar_charger.js';
import { spawnDengarShalrah } from './dengar_shalrah.js';
import { spawnDengarChargerRoyal } from './dengar_charger_royal.js';
import { spawnDrone } from './drone.js';
import { makeBright } from './glb_lighting.js';
import { CreatedByScreen } from './createdby.js';
import { spawnSpider } from './spawn_spider.js';  // NEW: import spawnSpider

// --- Debounce helper function ---
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);

    // Add help message for credits
    this.addCreditsHelpMessage();

    this.scene.background = new THREE.Color(0x87ceeb);

    this.setupLighting();
    this.setupGround();
    this.setupControls();
    this.loadRadox();

    // Spawn trees first and store their reference
    this.trees = spawnTrees(this.scene, 50, this.camera.position.clone());

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    this.clock = new THREE.Clock();

    this.playerStats = new PlayerStats();

    this.gridOverlay = new GridOverlay(this.scene, 100, 1);

    this.collisionManager = new CollisionManager(this.camera, this.scene, 1);
    window.collisionManager = this.collisionManager;

    this.setupEventListeners();

    this.dayNightCycle = new DayNightCycle(
      this.directionalLight,
      this.ambientLight,
      this.scene,
      { cycleDuration: 120 }
    );

    this.spawnChest();

    spawnCottage(this.scene, this.camera);

    // Move broken cars further out to avoid trees
    spawnBrokenCars(this.scene, this.camera.position.clone(), 30, 4);

    // Wait for GLTF assets to be ready before spawning additional entities
    window.GLTFAssetsReady.then(() => {
      // Helper function to get circular positions.
      const getCircularPosition = (index, total, radius) => {
        const angle = (index / total) * Math.PI * 2;
        return new THREE.Vector3(
          radius * Math.cos(angle),
          0,
          radius * Math.sin(angle)
        );
      };

      const innerRadius = 15;  // For inner circle spawns.
      const outerRadius = 25;  // For outer circle spawns.
      const innerEntities = 4;
      const outerEntities = 4;

      // Inner circle spawns.
      const logSpawnCenter = this.camera.position.clone().add(getCircularPosition(0, innerEntities, innerRadius));
      spawnRottenLogs(this.scene, 1, 1, logSpawnCenter);

      const radstagSpawnPosition = this.camera.position.clone().add(getCircularPosition(1, innerEntities, innerRadius));
      spawnRadstag(this.scene, radstagSpawnPosition, 1.5)
        .then((radstag) => {
          console.log("Radstag spawned successfully.");
        })
        .catch((error) => {
          console.error("Error spawning radstag:", error);
        });
      
      const rabbitSpawnCenter = this.camera.position.clone().add(getCircularPosition(2, innerEntities, innerRadius));
      spawnRadRabbit(this.scene, 1, 2, rabbitSpawnCenter);
      
      const kilrathiOffset = getCircularPosition(3, innerEntities, innerRadius);
      spawnKilrathi(this.scene, this.camera.position.clone().add(kilrathiOffset), 1);

      // Outer circle spawns.
      const chiropteranOffset = getCircularPosition(0, outerEntities, outerRadius);
      spawnChiropteran(this.scene, this.camera.position.clone().add(chiropteranOffset))
        .then((chiropteran) => {
          console.log("Chiropteran spawned successfully.");
        })
        .catch((error) => {
          console.error("Error spawning chiropteran:", error);
        });

      const dengarChargerOffset = getCircularPosition(1, outerEntities, outerRadius);
      spawnDengarCharger(this.scene, this.camera.position.clone().add(dengarChargerOffset))
        .then((dengarCharger) => {
          console.log("Dengar Charger spawned successfully.");
        })
        .catch((error) => {
          console.error("Error spawning Dengar Charger:", error);
        });

      const dengarShalrahOffset = getCircularPosition(2, outerEntities, outerRadius);
      spawnDengarShalrah(this.scene, this.camera.position.clone().add(dengarShalrahOffset))
        .then((dengarShalrah) => {
          console.log("Dengar Shalrah spawned successfully.");
        })
        .catch((error) => {
          console.error("Error spawning Dengar Shalrah:", error);
        });

      const dengarChargerRoyalOffset = getCircularPosition(3, outerEntities, outerRadius);
      spawnDengarChargerRoyal(this.scene, this.camera.position.clone().add(dengarChargerRoyalOffset))
        .then((dengarChargerRoyal) => {
          console.log("Dengar Charger Royal spawned successfully.");
        })
        .catch((error) => {
          console.error("Error spawning Dengar Charger Royal:", error);
        });

      // NEW: Spawn the drone.
      const dronePosition = this.camera.position.clone().add(new THREE.Vector3(outerRadius + 10, 0, 0));
      spawnDrone(this.scene, dronePosition, 1)
        .then((drone) => {
          console.log("Drone spawned successfully.");
        })
        .catch((error) => {
          console.error("Error spawning drone:", error);
        });

      // NEW: Spawn the spider using the preloaded OBJ assets.
      spawnSpider(this.scene);
    });

    this.animate();
  }

  addCreditsHelpMessage() {
    const helpMessage = document.createElement('div');
    helpMessage.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      color: white;
      font-family: Arial, sans-serif;
      font-size: 14px;
      background: rgba(0, 0, 0, 0.5);
      padding: 8px 12px;
      border-radius: 4px;
      pointer-events: none;
      z-index: 100;
    `;
    helpMessage.textContent = 'Press V for Credits';
    document.body.appendChild(helpMessage);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.ambientLight = ambientLight;
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffee, 1.5);
    directionalLight.position.set(1, 2, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    this.directionalLight = directionalLight;
    this.scene.add(directionalLight);

    this.scene.fog = new THREE.Fog(0x666666, 20, 100);
  }

  setupGround() {
    const texture = new THREE.TextureLoader().load('/cracked_dirt.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(50, 50);

    const geometry = new THREE.PlaneGeometry(1000, 1000);
    const material = new THREE.MeshBasicMaterial({
      map: texture
    });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.userData.isGround = true;
    this.scene.add(ground);
  }

  setupControls() {
    this.controls = new PointerLockControls(this.camera, document.body);
    this.camera.position.y = 2;
    document.addEventListener('click', () => {
      this.controls.lock();
    });
  }

  loadRadox() {
    const loader = new GLTFLoader();
    const radoxUrl = window.GLTFAssetURLs['/radox_textured_mesh.glb'] || '/radox_textured_mesh.glb';

    loader.load(
      radoxUrl,
      (gltf) => {
        const radox = gltf.scene;
        radox.position.set(20, 2, 20);
        radox.scale.set(4, 4, 4);
        radox.rotation.y = Math.PI / 4;

        makeBright(radox, this.scene);

        radox.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        this.scene.add(radox);
        this.collisionManager.register(radox);
      },
      undefined,
      (error) => {
        console.error('Error loading radox GLB:', error);
      }
    );
  }

  spawnChest() {
    const playerPos = this.camera.position.clone();
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    const right = new THREE.Vector3().crossVectors(forward, this.camera.up).normalize();
    const chestPosition = playerPos.add(right.multiplyScalar(10));
    
    this.chest = new Chest(this.scene, this.camera, chestPosition);
  }

  setupEventListeners() {
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'KeyW':
          this.moveForward = true;
          break;
        case 'KeyS':
          this.moveBackward = true;
          break;
        case 'KeyA':
          this.moveLeft = true;
          break;
        case 'KeyD':
          this.moveRight = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.playerStats.setRunning(true);
          break;
        case 'KeyE':
          this.chopTree();
          break;
        case 'KeyG':
          this.gridOverlay.toggleVisibility();
          break;
        case 'KeyV':
          if (!this.createdByScreen) {
            this.createdByScreen = new CreatedByScreen(() => {
              this.createdByScreen = null;
              this.controls.lock();
            });
            this.controls.unlock();
          }
          break;
      }
    });

    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyW':
          this.moveForward = false;
          break;
        case 'KeyS':
          this.moveBackward = false;
          break;
        case 'KeyA':
          this.moveLeft = false;
          break;
        case 'KeyD':
          this.moveRight = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.playerStats.setRunning(false);
          break;
      }
    });

    window.addEventListener('resize', debounce(() => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }, 200));
  }

  chopTree() {
    const cameraDirection = new THREE.Vector3();
    this.camera.getWorldDirection(cameraDirection);

    const raycaster = new THREE.Raycaster(this.camera.position, cameraDirection);

    this.trees.forEach((treeObj, index) => {
      if (this.camera.position.distanceTo(treeObj.mesh.position) > 5) return;

      const intersects = raycaster.intersectObject(treeObj.mesh, true);

      if (intersects.length > 0 && intersects[0].distance < 5) {
        treeObj.health -= 25;

        if (treeObj.health <= 0) {
          this.scene.remove(treeObj.mesh);
          this.trees.splice(index, 1);
          this.playerStats.addWood(10);
          this.playerStats.incrementTreesChopped();
        }
      }
    });
  }

  updateMovement(delta) {
    if (this.controls.isLocked) {
      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;

      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      this.direction.normalize();

      const speed = 20.0 * this.playerStats.runSpeedMultiplier;
      if (this.moveForward || this.moveBackward) {
        this.velocity.z -= this.direction.z * speed * delta;
      }
      if (this.moveLeft || this.moveRight) {
        this.velocity.x -= this.direction.x * speed * delta;
      }

      this.controls.moveRight(-this.velocity.x * delta);
      this.controls.moveForward(-this.velocity.z * delta);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();
    const elapsedSeconds = this.clock.getElapsedTime();
    this.dayNightCycle.update(elapsedSeconds);
    this.updateMovement(delta);
    this.collisionManager.update();
    if (this.chest && typeof this.chest.update === 'function') {
      this.chest.update();
    }
    this.renderer.render(this.scene, this.camera);
  }
}

// Wait for GLTF, image, and OBJ assets to load before creating the game instance.
Promise.all([window.GLTFAssetsReady, window.ImageAssetsReady, window.OBJAssetsReady])
  .then(() => {
    window.game = new Game();
  })
  .catch(error => {
    console.error('Failed to load game assets:', error);
  });