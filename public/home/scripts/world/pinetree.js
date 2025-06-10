import config from '../../config.js';
import { loadModel } from './modelLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import * as THREE from 'three';

/**
 * Creates and places a GLB-based pine tree at a specified grid location.
 * @param {THREE.Scene} scene - The scene to add the pine tree to.
 * @param {number} [gridX=77] - Grid X coordinate.
 * @param {number} [gridZ=96] - Grid Z coordinate.
 * @param {Array} [collidableObjects=[]] - Array of objects to check collision against.
 * @returns {Promise<THREE.Group>} The created pine tree group.
 */
export function createPineTree(scene, gridX = 77, gridZ = 96, collidableObjects = []) {
    const { chunkSize, numChunks } = config.world;
    const divisions = config.grid.divisions;
    const cellSizeX = chunkSize.x / divisions;
    const cellSizeZ = chunkSize.z / divisions;
    const halfTotalX = (chunkSize.x * numChunks.x) / 2;
    const halfTotalZ = (chunkSize.z * numChunks.z) / 2;
    const posX = -halfTotalX + (gridX + 0.5) * cellSizeX;
    const posZ = -halfTotalZ + (gridZ + 0.5) * cellSizeZ;
    
    // Check for collisions with walls and bus
    const treeRadius = 1.0; // approximate radius of a tree
    const treePosition = new THREE.Vector3(posX, 0, posZ);
    
    // Check if the tree position conflicts with any collidable object
    for (const obj of collidableObjects) {
        if (!obj) continue;
        
        // Skip if it's not a wall or the bus
        const isWall = obj.userData && (obj.userData.type === 'wall' || obj.name === 'Wall');
        const isBus = obj.userData && obj.userData.type === 'bus' || obj.name === 'Bus';
        
        if (!isWall && !isBus) continue;
        
        const objPosition = new THREE.Vector3();
        if (obj.position) {
            objPosition.copy(obj.position);
        }
        
        // Get the bounding box of the object if available
        let boundingSize = { x: 2, z: 2 }; // default size
        if (obj.userData && obj.userData.boundingBoxSize) {
            boundingSize = obj.userData.boundingBoxSize;
        }
        
        // Calculate distance between tree and object
        const dx = Math.abs(treePosition.x - objPosition.x);
        const dz = Math.abs(treePosition.z - objPosition.z);
        
        // Check if tree is too close to the object
        if (dx < (boundingSize.x / 2 + treeRadius) && dz < (boundingSize.z / 2 + treeRadius)) {
            console.log(`Tree at (${gridX}, ${gridZ}) would conflict with ${obj.name}, skipping`);
            return Promise.resolve(null); // Skip this tree
        }
    }

    return loadModel('/assets/static/Pine_tree.glb')
        .then(gltf => {
            const tree = SkeletonUtils.clone(gltf.scene);
            tree.name = 'PineTree';
            tree.scale.y *= 1.3; // make tree 30% taller
            tree.scale.x *= 1.3; // scale width accordingly
            tree.scale.z *= 1.3; // scale depth accordingly
            tree.position.set(posX, -0.05, posZ);
            tree.traverse(child => { if (child.isMesh) child.castShadow = true, child.receiveShadow = true; });
            scene.add(tree);
            return tree;
        })
        .catch(err => console.error('Failed to load Pine_tree.glb:', err));
}
