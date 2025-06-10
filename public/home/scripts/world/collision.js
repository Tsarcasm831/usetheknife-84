// collision.js
import * as THREE from 'three';

// Simple Axis-Aligned Bounding Box (AABB) collision check
// Checks against the AABBs of individual meshes within collidable objects/groups.

/**
 * Checks if a bounding box intersects with any collidable objects.
 * Uses traverse() to check all descendant meshes within groups or complex objects.
 * @param {THREE.Box3} subjectBox - The bounding box of the object being checked (player or NPC).
 * @param {Array<THREE.Object3D>} collidableObjects - An array of objects to check against.
 * @param {THREE.Scene} scene - The scene object.
 * @returns {boolean} - True if a collision is detected, false otherwise.
 */
export function checkCollision(subjectBox, collidableObjects, scene) {
    const objectBox = new THREE.Box3(); // Reuse the same Box3 object

    for (const object of collidableObjects) {
        object.updateWorldMatrix(true, false); // Ensure matrices are up-to-date

        let collisionDetected = false;

        if (object.isMesh) {
            objectBox.setFromObject(object);
            if (subjectBox.intersectsBox(objectBox)) {
                // console.log("Collision with standalone mesh:", object.name || object.uuid);
                return true;
            }
        } else if (object.children && object.children.length > 0) {
            object.traverse((node) => {
                if (collisionDetected) return;
                if (node.isMesh) {
                    objectBox.setFromObject(node);
                    if (subjectBox.intersectsBox(objectBox)) {
                        // console.log("Collision with descendant mesh:", node.name || node.uuid, " (parent:", object.name || object.uuid, ")");
                        collisionDetected = true;
                    }
                }
            });
            if (collisionDetected) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Creates a bounding box based on a center position and a fixed size.
 * @param {THREE.Vector3} position - The center position for the box.
 * @param {object} size - The size { x, y, z }.
 * @returns {THREE.Box3} - The calculated bounding box.
 */
export function createBoundingBox(position, size) {
    if (!size || typeof size.x !== 'number' || typeof size.y !== 'number' || typeof size.z !== 'number') {
        console.warn("createBoundingBox called with invalid size:", size, "at position:", position);
        // Return a tiny box at the position to avoid errors, but collision might fail
        return new THREE.Box3(position.clone().subScalar(0.01), position.clone().addScalar(0.01));
    }
     if (!position || typeof position.x !== 'number' || typeof position.y !== 'number' || typeof position.z !== 'number') {
        console.warn("createBoundingBox called with invalid position:", position);
         // Return a tiny box at origin
         const origin = new THREE.Vector3();
        return new THREE.Box3(origin.clone().subScalar(0.01), origin.clone().addScalar(0.01));
    }

    const halfSize = { x: size.x / 2, y: size.y / 2, z: size.z / 2 };
    return new THREE.Box3(
        new THREE.Vector3(position.x - halfSize.x, position.y - halfSize.y, position.z - halfSize.z),
        new THREE.Vector3(position.x + halfSize.x, position.y + halfSize.y, position.z + halfSize.z)
    );
}

/**
 * Creates a bounding box for the player using its config size.
 * @param {THREE.Vector3} position - The center position for the box (player.position).
 * @param {object} playerSize - The player's size config { x, y, z }.
 * @returns {THREE.Box3} - The calculated bounding box.
 */
export function createPlayerBoundingBox(position, playerSize) {
    // Directly use the generic function
    return createBoundingBox(position, playerSize);
}

/**
 * Creates a bounding box for an object using size potentially stored in its userData.
 * Falls back to calculating from object if size is not available.
 * @param {THREE.Object3D} object - The object (e.g., chicken).
 * @param {THREE.Vector3} position - The potential future center position for the box.
 * @returns {THREE.Box3} - The calculated bounding box.
 */
export function createObjectBoundingBox(object, position) {
    if (object.userData && object.userData.boundingBoxSize) {
        // Use pre-calculated size for consistency
        return createBoundingBox(position, object.userData.boundingBoxSize);
    } else {
        // Fallback: Calculate size on the fly without warning
        const tempBox = new THREE.Box3();
        const size = new THREE.Vector3();
        tempBox.setFromObject(object, true); // Calculate current AABB
        tempBox.getSize(size);              // Get its size
        if (size.x === 0 && size.y === 0 && size.z === 0) {
             // Handle cases where the object might not be fully loaded or has no geometry yet
             size.set(0.5, 0.5, 0.5); // Default small size
             console.warn("Calculated size is zero, using default small size for:", object.name || object.uuid);
        }
        // Store it for next time IF userData exists
        if(object.userData) {
            object.userData.boundingBoxSize = { x: size.x, y: size.y, z: size.z };
        }
        return createBoundingBox(position, { x: size.x, y: size.y, z: size.z });
    }
}