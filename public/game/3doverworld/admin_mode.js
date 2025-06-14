import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

/**
 * AdminMode enables a mode where, when activated by pressing the "Z" key, the player
 * can click on any spawned object in the world and drag it around.
 *
 * When admin mode is enabled, mouse events are intercepted:
 *  - On mousedown, a raycaster is used to detect which object is clicked.
 *  - When an object is selected, a horizontal drag plane (parallel to the ground) is defined at the object's level.
 *  - On mousemove, the object is moved along the drag plane to follow the mouse.
 *  - On mouseup, dragging stops.
 */
class AdminMode {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.enabled = false;
    this.selectedObject = null;
    this.isDragging = false;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    // A plane with normal pointing upward for dragging (parallel to the ground)
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    // Offset between the intersection point and object’s position for smoother dragging.
    this.offset = new THREE.Vector3();

    // Bind event handlers.
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    // Toggle admin mode when "Z" is pressed.
    window.addEventListener('keydown', this.onKeyDown);
  }

  onKeyDown(event) {
    if (event.code === 'KeyZ' && !event.repeat) {
      this.toggle();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    console.log(`Admin Mode: ${this.enabled ? 'Enabled' : 'Disabled'}`);
    if (this.enabled) {
      window.addEventListener('mousedown', this.onMouseDown);
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mouseup', this.onMouseUp);
    } else {
      window.removeEventListener('mousedown', this.onMouseDown);
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('mouseup', this.onMouseUp);
      this.selectedObject = null;
      this.isDragging = false;
    }
  }

  onMouseDown(event) {
    // Compute normalized device coordinates from the mouse position.
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    // Intersect with all objects in the scene.
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    if (intersects.length > 0) {
      // Select the first intersected object.
      this.selectedObject = intersects[0].object;
      // Define a horizontal plane at the selected object's world position.
      const objWorldPos = new THREE.Vector3();
      this.selectedObject.getWorldPosition(objWorldPos);
      this.dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), objWorldPos);
      // Determine the offset between the intersection point and the object's position.
      const intersectionPoint = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.dragPlane, intersectionPoint);
      this.offset.copy(intersectionPoint).sub(objWorldPos);
      this.isDragging = true;
    }
  }

  onMouseMove(event) {
    if (this.isDragging && this.selectedObject) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersectionPoint = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.dragPlane, intersectionPoint)) {
        // Compute new world position for the object.
        const newWorldPos = new THREE.Vector3().copy(intersectionPoint).sub(this.offset);
        // Convert new world position to the object's parent's local space.
        if (this.selectedObject.parent) {
          this.selectedObject.parent.worldToLocal(newWorldPos);
        }
        // Update the object's position.
        this.selectedObject.position.copy(newWorldPos);
      }
    }
  }

  onMouseUp(event) {
    this.isDragging = false;
    this.selectedObject = null;
  }
}

console.log("Admin Mode loaded.");

// Initialize AdminMode once the game is available.
function initAdminMode() {
  if (window.game && window.game.scene && window.game.camera) {
    window.adminModeInstance = new AdminMode(window.game.scene, window.game.camera);
  } else {
    setTimeout(initAdminMode, 100);
  }
}

initAdminMode();

export { AdminMode };