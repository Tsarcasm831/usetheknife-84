import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

export class GridOverlay {
  constructor(scene, gridSize = 100, cellSize = 1) {
    this.scene = scene;
    this.gridSize = gridSize;
    this.cellSize = cellSize;
    // Create a grid helper overlay. The number of divisions is based on cellSize.
    const divisions = gridSize / cellSize;
    this.gridHelper = new THREE.GridHelper(gridSize, divisions, 0x888888, 0x444444);
    this.gridHelper.material.transparent = true;
    this.gridHelper.material.opacity = 0.5;
    scene.add(this.gridHelper);
  }

  // Given a THREE.Vector3, returns a new vector snapped to the grid.
  snapPosition(position) {
    const snapped = position.clone();
    snapped.x = Math.round(snapped.x / this.cellSize) * this.cellSize;
    snapped.y = Math.round(snapped.y / this.cellSize) * this.cellSize;
    snapped.z = Math.round(snapped.z / this.cellSize) * this.cellSize;
    return snapped;
  }

  // Toggle the visibility of the grid overlay.
  toggleVisibility() {
    this.gridHelper.visible = !this.gridHelper.visible;
  }
}