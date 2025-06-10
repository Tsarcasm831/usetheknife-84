import { InstancedMesh, Object3D, Vector3 } from 'three';
import config from '../../../config.js';
import { loadModel } from '../modelLoader.js';

/**
 * Creates a forest of 50 pine trees clustered around a grid cell, with 1-2m random spacing.
 * @param {THREE.Scene} scene - The scene to add the forest to.
 * @param {number} [gridX=77] - Center grid X coordinate.
 * @param {number} [gridZ=96] - Center grid Z coordinate.
 * @param {Array} [collidableObjects=[]] - Array of objects to check collision against.
 * @returns {Promise<THREE.InstancedMesh>} The created forest group.
 */
export async function createPineForest(scene, gridX = 77, gridZ = 96, collidableObjects = []) {
    const { chunkSize, numChunks } = config.world;
    const divisions = config.grid.divisions;
    const cellSizeX = chunkSize.x / divisions;
    const cellSizeZ = chunkSize.z / divisions;
    const halfTotalX = (chunkSize.x * numChunks.x) / 2;
    const halfTotalZ = (chunkSize.z * numChunks.z) / 2;
    const baseX = -halfTotalX + (gridX + 0.5) * cellSizeX;
    const baseZ = -halfTotalZ + (gridZ + 0.5) * cellSizeZ;

    const gltf = await loadModel('/assets/static/Pine_tree.glb');
    // Assume first mesh child is our tree prototype
    const prototype = gltf.scene.children.find(c => c.isMesh);
    if (!prototype) {
        console.warn('PineForest: no mesh found, falling back to group clone');
        const fallback = gltf.scene;
        scene.add(fallback);
        return fallback;
    }

    const count = 50;
    const instanced = new InstancedMesh(prototype.geometry, prototype.material, count);
    instanced.name = 'PineForest';
    instanced.castShadow = true;
    instanced.receiveShadow = true;
    const dummy = new Object3D();

    let validCount = 0;
    let attempts = 0;
    const maxAttempts = 200; // Limit the number of attempts to prevent infinite loops
    const treePositions = []; // Track positions of valid trees
    const treeRadius = 0.7; // Approximate radius of a tree (slightly smaller than individual trees)

    // Check if a position conflicts with any collidable object (walls or bus)
    function checkCollision(x, z) {
        const treePosition = new Vector3(x, 0, z);
        
        // First check against already placed trees to avoid clumping
        for (const pos of treePositions) {
            const dx = Math.abs(treePosition.x - pos.x);
            const dz = Math.abs(treePosition.z - pos.z);
            if (dx < treeRadius && dz < treeRadius) {
                return true; // Collision with existing tree
            }
        }
        
        // Check against walls and bus
        for (const obj of collidableObjects) {
            if (!obj) continue;
            
            // Skip if it's not a wall or the bus
            const isWall = obj.userData && (obj.userData.type === 'wall' || obj.name === 'Wall');
            const isBus = obj.userData && obj.userData.type === 'bus' || obj.name === 'Bus';
            
            if (!isWall && !isBus) continue;
            
            const objPosition = new Vector3();
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
                return true; // Collision detected
            }
        }
        
        return false; // No collision
    }

    while (validCount < count && attempts < maxAttempts) {
        attempts++;
        // random placement 1-2m around base cell center
        const angle = Math.random() * Math.PI * 2;
        const distance = 1 + Math.random();
        const posX = baseX + Math.cos(angle) * distance;
        const posZ = baseZ + Math.sin(angle) * distance;
        
        // Check for collisions
        if (!checkCollision(posX, posZ)) {
            dummy.position.set(posX, -0.05, posZ);
            dummy.scale.set(1.3, 1.3, 1.3);
            dummy.updateMatrix();
            instanced.setMatrixAt(validCount, dummy.matrix);
            
            // Store valid position
            treePositions.push(new Vector3(posX, 0, posZ));
            validCount++;
        }
    }
    
    // Update the count to reflect how many trees we actually placed
    instanced.count = validCount;
    
    // Log if we couldn't place all trees
    if (validCount < count) {
        console.log(`Could only place ${validCount} of ${count} trees due to collisions`);
    }
    scene.add(instanced);
    return instanced;
}
