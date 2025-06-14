import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { PointerLockControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/PointerLockControls.js';

/**
 * CottageInterior creates an interior scene for a cottage.
 * When opened, it hides the main game view and displays a new scene overlay;
 * the player can walk around inside a simple room. Pressing "E" again exits the interior.
 */
export class CottageInterior {
  constructor() {
    this.isRunning = false;
    this.createContainer();
    this.createScene();
    this.bindEvents();
  }

  createContainer() {
    // Create a full-screen container to hold the interior canvas.
    this.container = document.createElement("div");
    this.container.id = "cottageInteriorContainer";
    Object.assign(this.container.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      zIndex: "2000",
      background: "#000"
    });
    // Create the canvas to render the interior scene.
    this.canvas = document.createElement("canvas");
    Object.assign(this.canvas.style, {
      width: "100%",
      height: "100%",
      display: "block"
    });
    this.container.appendChild(this.canvas);
  }

  createScene() {
    // Create renderer, scene, and camera.
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    
    this.scene = new THREE.Scene();
    // Set a warm interior background color.
    this.scene.background = new THREE.Color(0xf0e0d6);
    
    // Create camera.
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1.6, 5); // Player starts a bit back from the room center

    // Add simple pointer lock controls.
    this.controls = new PointerLockControls(this.camera, this.container);
    
    // Create a simple room interior: floor, ceiling, and four walls.
    const roomWidth = 10, roomDepth = 10, roomHeight = 4;
    const roomMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.BackSide });
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    // Ceiling
    const ceiling = new THREE.Mesh(floorGeometry, roomMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight;
    this.scene.add(ceiling);
    // Walls
    const wallGeometry = new THREE.PlaneGeometry(roomWidth, roomHeight);
    // Back wall
    const backWall = new THREE.Mesh(wallGeometry, roomMaterial);
    backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
    backWall.receiveShadow = true;
    this.scene.add(backWall);
    // Front wall (with a simple door opening, we'll leave a gap in the center)
    const frontWallLeft = new THREE.Mesh(new THREE.PlaneGeometry((roomWidth / 2) - 1, roomHeight), roomMaterial);
    frontWallLeft.position.set(-((roomWidth / 2) + 1)/2, roomHeight / 2, roomDepth / 2);
    frontWallLeft.receiveShadow = true;
    this.scene.add(frontWallLeft);
    const frontWallRight = new THREE.Mesh(new THREE.PlaneGeometry((roomWidth / 2) - 1, roomHeight), roomMaterial);
    frontWallRight.position.set(((roomWidth / 2) + 1)/2, roomHeight / 2, roomDepth / 2);
    frontWallRight.receiveShadow = true;
    this.scene.add(frontWallRight);
    // Left wall
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomHeight), roomMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);
    // Right wall
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomHeight), roomMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
    rightWall.receiveShadow = true;
    this.scene.add(rightWall);

    // Add some lighting.
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8, 100);
    pointLight.position.set(0, roomHeight - 0.5, 0);
    pointLight.castShadow = true;
    this.scene.add(pointLight);

    // Optionally add a simple furnishing: a table.
    const tableGeometry = new THREE.BoxGeometry(2, 0.1, 1);
    const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(0, 0.75, 0);
    table.castShadow = true;
    table.receiveShadow = true;
    this.scene.add(table);
  }

  bindEvents() {
    // Bind keydown event to exit the interior when pressing "E".
    this.onKeyDown = this.onKeyDown.bind(this);
    window.addEventListener("keydown", this.onKeyDown);
    // Adjust on window resize.
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener("resize", this.onWindowResize);
  }

  onKeyDown(event) {
    // In the interior, pressing "E" will exit the interior.
    if (event.code === "KeyE" && !event.repeat) {
      this.close();
      event.preventDefault();
    }
  }

  onWindowResize() {
    if (!this.isRunning) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  open() {
    // Hide the main game canvas.
    const gameCanvas = document.querySelector("canvas");
    if (gameCanvas) {
      gameCanvas.style.display = "none";
    }
    // Append the interior container.
    document.body.appendChild(this.container);
    // Request pointer lock for interior controls.
    this.controls.lock();
    this.isRunning = true;
    this.animate();
  }

  close() {
    this.isRunning = false;
    // Remove the interior container.
    if (this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
    // Remove key and resize event listeners.
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("resize", this.onWindowResize);
    // Show the main game canvas.
    const gameCanvas = document.querySelector("canvas");
    if (gameCanvas) {
      gameCanvas.style.display = "block";
    }
    // Unlock pointer.
    document.exitPointerLock();
  }

  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.animate());
    // For simple movement within interior, basic controls can be added here.
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialization helper: call CottageInterior.open() when conditions are met.
// For instance, in game.js when the player is looking at a cottage and is close enough,
// you could do the following:
//
// import { CottageInterior } from './cottage_interior.js';
// 
// window.addEventListener('keydown', (event) => {
//   if (event.code === 'KeyE' && /* check proximity and that the player looks at a cottage door */) {
//     const interior = new CottageInterior();
//     interior.open();
//   }
// });