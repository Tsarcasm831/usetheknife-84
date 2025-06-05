let scene;
let camera;
let renderer;
let controls;

function setupScene(canvas) {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 3);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = false;

  const loader = new THREE.TextureLoader();
  loader.load("globe/earth_texture.jpg", (texture) => {
    const geo = new THREE.SphereGeometry(1, 64, 64);
    const mat = new THREE.MeshBasicMaterial({ map: texture });
    const globe = new THREE.Mesh(geo, mat);
    scene.add(globe);
    animate();
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function initGlobeView(map) {
  const btn = document.getElementById("globe-view-btn");
  const container = document.getElementById("globe-container");
  const exitBtn = document.getElementById("exit-globe-btn");
  const canvas = document.getElementById("globe-canvas");
  if (!btn || !container || !exitBtn || !canvas) return;

  btn.addEventListener("click", () => {
    map.getContainer().classList.add("hide-map");
    setTimeout(() => {
      map.getContainer().style.display = "none";
      container.classList.remove("hidden");
      if (!scene) {
        setupScene(canvas);
        window.addEventListener("resize", onResize);
      }
    }, 300);
  });

  exitBtn.addEventListener("click", () => {
    container.classList.add("hidden");
    map.getContainer().style.display = "block";
    map.getContainer().classList.remove("hide-map");
  });
}
