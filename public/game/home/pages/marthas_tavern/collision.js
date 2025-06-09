import * as THREE from 'three';

const collisionDistance = 0.5; // Adjusted distance
const raycaster = new THREE.Raycaster();
let collidableObjects = []; // Cache collidable objects

export function setupCollision(scene) {
    // Clear previous collidables if setup is called again (unlikely but safe)
    collidableObjects = [];

    // Find all meshes that should be collidable
    scene.traverse(node => {
        // Add individual meshes marked as collidable
        if (node.isMesh && node.userData.collidable) {
            collidableObjects.push(node);
            // console.log("Adding collidable mesh:", node.name || node.uuid, node.parent?.userData?.name || '');
        }
        // Handle NPC groups correctly - add their body mesh if the group is collidable
        else if (node.isGroup && node.userData.isNPCGroup && node.userData.collidable) {
            const body = node.children.find(child => child.geometry instanceof THREE.CylinderGeometry);
            if (body) {
                 // Ensure the body mesh is marked collidable if the group is
                 if (!body.userData.collidable) {
                    body.userData.collidable = true;
                 }
                 body.userData.isNPC = true; // Mark as NPC if needed for specific logic
                 collidableObjects.push(body);
                 // console.log("Adding NPC body to collision:", node.userData.name);
            } else {
                 // console.warn("NPC group marked collidable but no body mesh found:", node.userData.name);
            }
        }
    });
    console.log(`Found ${collidableObjects.length} collidable objects for collision detection.`);
}

export function checkCollision(cameraPosition, moveDirection) {
    // Don't perform collision checks if the move direction is zero
    if (moveDirection.lengthSq() === 0) {
        return false;
    }

    // Use a significantly lower origin for the raycaster to better detect chairs, table legs, NPC bases etc.
    const rayOrigin = cameraPosition.clone();
    // Lower the ray origin significantly to represent player's lower body/legs
    rayOrigin.y -= 1.0; // Lowered further

    raycaster.set(rayOrigin, moveDirection.normalize());
    const intersections = raycaster.intersectObjects(collidableObjects, false); // Non-recursive check

    if (intersections.length > 0) {
        // Check if the closest intersection is within the collision distance
        if (intersections[0].distance < collisionDistance) {
             // Optional: Log which object was hit and the distance
             // console.log(`Collision detected with: ${intersections[0].object.name || intersections[0].object.parent?.userData?.name || 'Unnamed Object'} at distance: ${intersections[0].distance.toFixed(2)}`);
            return true; // Collision detected
        }
    }

    return false; // No collision
}