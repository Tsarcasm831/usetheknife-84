import * as THREE from 'three';
import { loadModel } from '../world/modelLoader.js';
import { structuresConfig } from '../../configs/structures.js';
import { getWorldCoordsFromGrid } from '../world/grid.js';

/**
 * Spawns a buggy model within a specified grid range.
 * @param {THREE.Scene} scene
 * @returns {Promise<THREE.Group|null>}
 */
export async function createBuggy(scene) {
    const cfg = structuresConfig.buggy;
    if (!cfg) {
        console.warn('Buggy config not found');
        return null;
    }
    // Random grid indices within range
    const ix = Math.floor(Math.random() * (cfg.gridRange.xMax - cfg.gridRange.xMin + 1)) + cfg.gridRange.xMin;
    const iz = Math.floor(Math.random() * (cfg.gridRange.zMax - cfg.gridRange.zMin + 1)) + cfg.gridRange.zMin;
    // Convert grid index to world coords via grid utility
    const { x, z } = getWorldCoordsFromGrid(ix, iz);
    // Load the model
    const gltf = await loadModel(`/${cfg.glbPath}`);
    if (!gltf || !gltf.scene) {
        console.warn('Buggy model not loaded for path:', `/${cfg.glbPath}`);
        return null;
    }
    const buggy = gltf.scene;
    buggy.name = 'BuggyGroup';
    // Scale buggy same as truck and elevate to account for bottom-at-center
    buggy.scale.set(cfg.scale.x, cfg.scale.y, cfg.scale.z);
    // Compute bounding box height after scaling
    const bbox = new THREE.Box3().setFromObject(buggy);
    const height = bbox.getSize(new THREE.Vector3()).y;
    buggy.userData = { collidable: cfg.collidable };
    // Set horizontal position and elevate so bottom rests on ground
    buggy.position.set(x, height / 2, z);
    buggy.rotation.y = cfg.rotationY;
    scene.add(buggy);
    console.log(`Spawned buggy at grid (${ix},${iz}) -> coords (${x.toFixed(2)},${(height / 2).toFixed(2)},${z.toFixed(2)})`);
    return buggy;
}

/**
 * Helper to convert grid indices to world coordinates.
 * Grids is imported from grid.js
 */
