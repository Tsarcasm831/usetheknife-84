import { createPineTree } from './pinetree.js';

/**
 * Creates a grove of 7 pine trees around a grid position.
 * @param {THREE.Scene} scene - The scene to add the pine trees to.
 * @param {number} [gridX=77] - Center grid X coordinate.
 * @param {number} [gridZ=96] - Center grid Z coordinate.
 * @param {Array} [collidableObjects=[]] - Array of objects to check collision against.
 * @returns {Promise<THREE.Group[]>} Promise resolving to an array of created pine tree groups.
 */
export function createPineGrove(scene, gridX = 77, gridZ = 96, collidableObjects = []) {
    const offsets = [
        [0, 0],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [-1, -1]
    ];
    return Promise.all(
        offsets.map(([dx, dz]) => createPineTree(scene, gridX + dx, gridZ + dz, collidableObjects))
    ).then(trees => {
        // Filter out null trees (those that would have collision conflicts)
        return trees.filter(tree => tree !== null);
    });
}
