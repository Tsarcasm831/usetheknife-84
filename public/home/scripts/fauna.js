import * as THREE from 'three';
import { loadModel } from './world/modelLoader.js';
import config from '../config.js';
import { checkCollision, createObjectBoundingBox } from './world/collision.js';

// Animation paths for each fauna type
const animationPaths = {
    radBear: {
        model: '/assets/fauna/rad_bear/quadruped/Character_output.fbx',
        walking: '/assets/fauna/rad_bear/quadruped/Animation_Walking_frame_rate_60.fbx',
        scale: 0.01, // Scale factor for FBX models which are often too large
        yOffset: 0   // Vertical offset to position the model correctly
    },
    radChicken: {
        walking: '/assets/rad_chicken2/biped/Animation_Walking_withSkin.glb',
        idle: '/assets/rad_chicken2/biped/Animation_Idle_02_withSkin.glb',
        alert: '/assets/rad_chicken2/biped/Animation_Alert_withSkin.glb',
        running: '/assets/rad_chicken2/biped/Animation_Running_withSkin.glb'
    },
    radCow: {
        // Using exact folder name confirmed to exist
        walking: '/assets/fauna/radcow/radcow_Animation_Walking_withSkin.glb'
    },
    radFox: {
        // Using exact folder name confirmed to exist
        walking: '/assets/fauna/undead_fox/undead_fox_Animation_Walking_withSkin.glb'
    }
};

/**
 * Generates a random position outside the town area
 * @param {object} worldBounds - The world boundaries
 * @param {number} townRadius - Distance from center to consider "outside town"
 * @returns {THREE.Vector3} - Random position vector
 */
function getRandomOutsidePosition(worldBounds, townRadius = 35) {
    const townCenterX = 0;
    const townCenterZ = 0;
    
    let x, z, distanceFromTown;
    
    // Keep generating positions until we find one outside the town radius
    do {
        // Generate random position within world bounds
        x = Math.random() * (worldBounds.maxX - worldBounds.minX) + worldBounds.minX;
        z = Math.random() * (worldBounds.maxZ - worldBounds.minZ) + worldBounds.minZ;
        
        // Calculate distance from town center
        distanceFromTown = Math.sqrt(
            Math.pow(x - townCenterX, 2) + 
            Math.pow(z - townCenterZ, 2)
        );
    } while (distanceFromTown < townRadius);
    
    return new THREE.Vector3(x, 0, z);
}

/**
 * Creates a rad bear
 * @param {THREE.Scene} scene - The scene to add the bear to
 * @param {function} onProgress - Progress callback
 * @returns {Promise<THREE.Object3D>} - The created bear object
 */
export async function createRadBear(scene, onProgress) {
    const bearConfig = animationPaths.radBear;
    
    // Create a container for our bear
    const container = new THREE.Group();
    container.name = 'RadBear';
    container.userData.type = 'fauna';
    container.userData.species = 'bear';
    
    const loader = { load: loadModel };
    const actions = {};
    let model = null;
    let animation = null;
    
    try {
        model = await loader.load(bearConfig.model, onProgress);
        
        if (!model || !model.scene) {
            console.warn('Failed to load bear model, using fallback');
            return container;
        }
        
        animation = await loader.load(bearConfig.walking, onProgress);
        
        if (!animation) {
            console.warn('Failed to load bear animation, continuing without animation');
        }
            
        const bearModel = model.scene;
        
        // Apply scale and position from config
        const scale = bearConfig.scale || 1;
        bearModel.scale.set(scale, scale, scale);
        bearModel.position.y = bearConfig.yOffset || 0;
        
        // Add the model to our container
        container.add(bearModel);
        
        // Set up mixer and actions after model is loaded
        container.userData.mixer = new THREE.AnimationMixer(bearModel);
        
        // Set up the walking animation
        if (animation && animation.animations && animation.animations.length > 0) {
            // For FBX animations, they're already in the format we need
            actions.walking = animation.animations[0];
            container.userData.actions = actions;
            const walkAction = container.userData.mixer.clipAction(actions.walking);
            walkAction.play();
            container.userData.currentAction = walkAction;
        }
        
        // Make all model elements visible
        bearModel.traverse(node => {
            if (node.isMesh) {
                // Set material properties for better visibility
                if (node.material) {
                    if (Array.isArray(node.material)) {
                        node.material.forEach(mat => {
                            mat.transparent = false;
                            mat.opacity = 1.0;
                            mat.side = THREE.DoubleSide;
                            mat.needsUpdate = true;
                        });
                    } else {
                        node.material.transparent = false;
                        node.material.opacity = 1.0;
                        node.material.side = THREE.DoubleSide;
                        node.material.needsUpdate = true;
                    }
                }
            }
        });

        // Set up AI state
        const totalX = config.world.chunkSize.x * config.world.numChunks.x;
        const totalZ = config.world.chunkSize.z * config.world.numChunks.z;
        const worldBounds = { minX: -totalX/2, maxX: totalX/2, minZ: -totalZ/2, maxZ: totalZ/2 };
        
        // AI configuration
        const aiConfig = {
            speed: 1.0,
            wanderDistance: 15,
            minWait: 1.5,
            maxWait: 4.0,
            arrivalThreshold: 0.5,
            turnSpeed: 0.05
        };
        
        // Initialize AI state
        Object.assign(container.userData, { 
            target: null,
            state: 'wandering',
            lastStateChange: Date.now(),
            lastWanderTime: 0,
            wanderTarget: null,
            speed: aiConfig.speed,
            turnSpeed: aiConfig.turnSpeed,
            arrivalThreshold: aiConfig.arrivalThreshold,
            worldBounds: worldBounds,
            config: aiConfig
        });

        return container;
    } catch (e) {
        console.error('Error creating bear:', e);
        throw e;
    }
}

/**
 * Creates a rad chicken
 * @param {THREE.Scene} scene - The scene to add the chicken to
 * @param {function} onProgress - Progress callback
 * @returns {Promise<THREE.Object3D>} - The created chicken object
 */
export async function createRadChicken(scene, onProgress) {
    // Create a container for our chicken
    const container = new THREE.Group();
    container.name = 'RadChicken';
    container.userData.type = 'fauna';
    container.userData.species = 'chicken';
    
    const loader = { load: loadModel };
    let gltf = null;
    
    try {
        gltf = await loader.load(animationPaths.radChicken.walking, onProgress);
        
        if (!gltf) {
            console.warn('Failed to load chicken model, using fallback');
            return container;
        }
        
        if (!gltf.scene) {
            console.warn('Loaded chicken model has no scene, using fallback');
            return container;
        }
            
        const chickenModel = gltf.scene;
        
        // Add the model to our container
        container.add(chickenModel);
        
        // Set scale for better visibility
        chickenModel.scale.set(0.5, 0.5, 0.5);
        
        // Position the model correctly
        chickenModel.position.y = 0;
        
        // Ensure the model updates its matrix
        chickenModel.updateMatrix();
        chickenModel.updateMatrixWorld(true);
        
        // Set a default bounding box size in case calculation fails
        container.userData.boundingBoxSize = { x: 1, y: 1, z: 1 };
        
        // Make all model elements visible
        chickenModel.traverse(node => {
            if (node.isMesh) {
                if (node.material) {
                    if (Array.isArray(node.material)) {
                        node.material.forEach(mat => {
                            mat.transparent = false;
                            mat.opacity = 1.0;
                            mat.side = THREE.DoubleSide;
                            mat.needsUpdate = true;
                        });
                    } else {
                        node.material.transparent = false;
                        node.material.opacity = 1.0;
                        node.material.side = THREE.DoubleSide;
                        node.material.needsUpdate = true;
                    }
                }
            }
        });
        
        // Initialize animations and actions
        container.userData.actions = {};
        container.userData.mixer = new THREE.AnimationMixer(container);
        
        // Set up animations if available
        if (gltf.animations && gltf.animations.length > 0) {
            // Store all animations in the actions object
            gltf.animations.forEach(anim => {
                container.userData.actions[anim.name.toLowerCase()] = anim;
            });
            
            // Play the first animation by default
            const defaultAction = container.userData.mixer.clipAction(gltf.animations[0]);
            defaultAction.play();
            container.userData.currentAction = defaultAction;
        }
        
        // Set up AI state
        const totalX = config.world.chunkSize.x * config.world.numChunks.x;
        const totalZ = config.world.chunkSize.z * config.world.numChunks.z;
        const worldBounds = { minX: -totalX/2, maxX: totalX/2, minZ: -totalZ/2, maxZ: totalZ/2 };
        
        // AI configuration - chickens move faster but in shorter bursts
        const aiConfig = {
            speed: 2.0,
            wanderDistance: 8,
            minWait: 0.5,
            maxWait: 2.0,
            arrivalThreshold: 0.3,
            turnSpeed: 0.2,
            fleeChance: 0.3 // Chance to flee when another entity gets close
        };
        
        // Initialize AI state with proper structure
        container.userData.ai = {
            state: 'waiting',
            speed: aiConfig.speed,
            turnSpeed: aiConfig.turnSpeed,
            arrivalThreshold: aiConfig.arrivalThreshold,
            wanderDistance: aiConfig.wanderDistance,
            minWait: aiConfig.minWait,
            maxWait: aiConfig.maxWait,
            waitUntil: 0,
            targetPosition: null
        };
        
        // Set initial target position to start wandering
        const initialTarget = pickWanderTarget(
            container.position, 
            aiConfig.wanderDistance, 
            worldBounds
        );
        container.userData.ai.targetPosition = initialTarget;
        container.userData.ai.state = 'wandering';
        
        // Keep other userData properties
        container.userData.type = 'fauna';
        container.userData.species = 'chicken';
    } catch (e) {
        console.error('Error creating chicken:', e);
    }
    
    return container;
}

/**
 * Creates a rad cow
 * @param {THREE.Scene} scene - The scene to add the cow to
 * @param {function} onProgress - Progress callback
 * @returns {Promise<THREE.Object3D>} - The created cow object
 */
export async function createRadCow(scene, onProgress) {
    // Create a container for our cow
    const container = new THREE.Group();
    container.name = 'RadCow';
    container.userData.type = 'fauna';
    container.userData.species = 'cow';
    
    const loader = { load: loadModel };
    let gltf = null;
    
    try {
        const cowModelPath = animationPaths.radCow.walking;
        
        // Load the model
        gltf = await loader.load(cowModelPath, onProgress);
        
        if (!gltf) {
            console.warn('Failed to load cow model, using fallback');
            return container;
        }
        
        if (!gltf.scene) {
            console.warn('Loaded cow model has no scene, using fallback');
            return container;
        }
        
        const cowModel = gltf.scene;
        
        // Add the model to our container
        container.add(cowModel);
        
        // Set scale for better visibility
        cowModel.scale.set(1.2, 1.2, 1.2);
        
        // Position the model correctly
        cowModel.position.y = 0;
        
        // Ensure the model updates its matrix
        cowModel.updateMatrix();
        cowModel.updateMatrixWorld(true);
        
        // Set a default bounding box size in case calculation fails
        container.userData.boundingBoxSize = { x: 1.5, y: 1.5, z: 1.5 };
        
        // Make all model elements visible
        cowModel.traverse(node => {
            if (node.isMesh) {
                if (node.material) {
                    if (Array.isArray(node.material)) {
                        node.material.forEach(mat => {
                            mat.transparent = false;
                            mat.opacity = 1.0;
                            mat.side = THREE.DoubleSide;
                            mat.needsUpdate = true;
                        });
                    } else {
                        node.material.transparent = false;
                        node.material.opacity = 1.0;
                        node.material.side = THREE.DoubleSide;
                        node.material.needsUpdate = true;
                    }
                }
            }
        });
        
        // Initialize animations and actions
        container.userData.actions = {};
        container.userData.mixer = new THREE.AnimationMixer(container);
        
        // Set up animations if available
        if (gltf.animations && gltf.animations.length > 0) {
            // Store all animations in the actions object
            gltf.animations.forEach(anim => {
                container.userData.actions[anim.name.toLowerCase()] = anim;
            });
            
            // Play the first animation by default
            const defaultAction = container.userData.mixer.clipAction(gltf.animations[0]);
            defaultAction.play();
            container.userData.currentAction = defaultAction;
        }
        
        // Set up AI state
        const totalX = config.world.chunkSize.x * config.world.numChunks.x;
        const totalZ = config.world.chunkSize.z * config.world.numChunks.z;
        const worldBounds = { minX: -totalX/2, maxX: totalX/2, minZ: -totalZ/2, maxZ: totalZ/2 };
        
        // AI configuration - cows move slowly and stay in one area
        const aiConfig = {
            speed: 0.8,
            wanderDistance: 10,
            minWait: 2.0,
            maxWait: 8.0,
            arrivalThreshold: 0.5,
            turnSpeed: 0.03
        };
        
        // Initialize AI state
        Object.assign(container.userData, { 
            state: 'wandering', 
            wanderTarget: pickWanderTarget(container.position, aiConfig.wanderDistance, worldBounds), 
            wanderWaitTimer: 0, 
            aiConfig, 
            worldBounds,
            type: 'fauna',
            species: 'cow'
        });
    } catch (e) {
        console.error('Error creating cow:', e);
    }
    
    return container;
}

/**
 * Creates a rad fox
 * @param {THREE.Scene} scene - The scene to add the fox to
 * @param {function} onProgress - Progress callback
 * @returns {Promise<THREE.Object3D>} - The created fox object
 */
export async function createRadFox(scene, onProgress) {
    // Create a container for our fox
    const container = new THREE.Group();
    container.name = 'RadFox';
    container.userData.type = 'fauna';
    container.userData.species = 'fox';
    
    const loader = { load: loadModel };
    let gltf = null;
    
    try {
        const foxModelPath = animationPaths.radFox.walking;
        
        // Load the model
        gltf = await loader.load(foxModelPath, onProgress);
        
        if (!gltf) {
            console.warn('Failed to load fox model, using fallback');
            return container;
        }
        
        if (!gltf.scene) {
            console.warn('Loaded fox model has no scene, using fallback');
            return container;
        }
        
        const foxModel = gltf.scene;
        
        // Add the model to our container
        container.add(foxModel);
        
        // Set scale for better visibility
        foxModel.scale.set(0.8, 0.8, 0.8);
        
        // Position the model correctly
        foxModel.position.y = 0;
        
        // Ensure the model updates its matrix
        foxModel.updateMatrix();
        foxModel.updateMatrixWorld(true);
        
        // Set a default bounding box size in case calculation fails
        container.userData.boundingBoxSize = { x: 0.8, y: 0.8, z: 0.8 };
        
        // Make all model elements visible
        foxModel.traverse(node => {
            if (node.isMesh) {
                if (node.material) {
                    if (Array.isArray(node.material)) {
                        node.material.forEach(mat => {
                            mat.transparent = false;
                            mat.opacity = 1.0;
                            mat.side = THREE.DoubleSide;
                            mat.needsUpdate = true;
                        });
                    } else {
                        node.material.transparent = false;
                        node.material.opacity = 1.0;
                        node.material.side = THREE.DoubleSide;
                        node.material.needsUpdate = true;
                    }
                }
            }
        });
        
        // Initialize animations and actions
        container.userData.actions = {};
        container.userData.mixer = new THREE.AnimationMixer(container);
        
        // Set up animations if available
        if (gltf.animations && gltf.animations.length > 0) {
            // Store all animations in the actions object
            gltf.animations.forEach(anim => {
                container.userData.actions[anim.name.toLowerCase()] = anim;
            });
            
            // Play the first animation by default
            const defaultAction = container.userData.mixer.clipAction(gltf.animations[0]);
            defaultAction.play();
            container.userData.currentAction = defaultAction;
        }
        
        // Set up AI state
        const totalX = config.world.chunkSize.x * config.world.numChunks.x;
        const totalZ = config.world.chunkSize.z * config.world.numChunks.z;
        const worldBounds = { minX: -totalX/2, maxX: totalX/2, minZ: -totalZ/2, maxZ: totalZ/2 };
        
        // AI configuration - foxes are quick and sneaky
        const aiConfig = {
            speed: 1.5,
            wanderDistance: 15,
            minWait: 1.0,
            maxWait: 3.0,
            arrivalThreshold: 0.4,
            turnSpeed: 0.1
        };
        
        // Initialize AI state
        Object.assign(container.userData, { 
            state: 'wandering', 
            wanderTarget: pickWanderTarget(container.position, aiConfig.wanderDistance, worldBounds), 
            wanderWaitTimer: 0, 
            aiConfig, 
            worldBounds,
            type: 'fauna',
            species: 'fox'
        });
    } catch (e) {
        console.error('Error creating fox:', e);
    }
    
    return container;
}

/**
 * Updates a fauna entity's animation and movement
 * @param {THREE.Object3D} fauna - The fauna object to update
 * @param {number} deltaTime - Time since last update
 * @param {Array<THREE.Object3D>} collidableObjects - Objects that can be collided with
 * @param {THREE.Scene} scene - The scene
 */
export function updateFauna(fauna, deltaTime, collidableObjects, scene) {
    if (!fauna || !fauna.userData || fauna.userData.type !== 'fauna') return;
    
    const ai = fauna.userData.ai;
    if (!ai) return;
    
    const position = fauna.position;
    const now = Date.now();
    
    // Update AI state machine
    switch (ai.state) {
        case 'wandering':
            // Move towards target
            if (ai.targetPosition) {
                const direction = new THREE.Vector3()
                    .subVectors(ai.targetPosition, position)
                    .normalize();
                
                const moveDistance = ai.speed * deltaTime;
                const newPosition = position.clone().add(direction.multiplyScalar(moveDistance));
                
                // Simple collision check - only check nearby objects
                const nearbyObjects = collidableObjects.filter(obj => 
                    obj.position && obj.position.distanceTo(newPosition) < 5
                );
                
                let canMove = true;
                for (const obj of nearbyObjects) {
                    if (obj !== fauna && newPosition.distanceTo(obj.position) < 2) {
                        canMove = false;
                        break;
                    }
                }
                
                if (canMove) {
                    position.copy(newPosition);
                    
                    // Rotate towards movement direction
                    if (direction.length() > 0.01) {
                        const targetRotation = Math.atan2(direction.x, direction.z);
                        fauna.rotation.y = THREE.MathUtils.lerp(fauna.rotation.y, targetRotation, ai.turnSpeed);
                    }
                }
                
                // Check if reached target
                if (position.distanceTo(ai.targetPosition) < ai.arrivalThreshold) {
                    ai.state = 'waiting';
                    ai.waitUntil = now + (ai.minWait + Math.random() * (ai.maxWait - ai.minWait)) * 1000;
                }
            }
            break;
            
        case 'waiting':
            if (now >= ai.waitUntil) {
                // Choose new random target
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * ai.wanderDistance;
                ai.targetPosition = new THREE.Vector3(
                    position.x + Math.cos(angle) * distance,
                    position.y,
                    position.z + Math.sin(angle) * distance
                );
                ai.state = 'wandering';
            }
            break;
    }
}

/**
 * Helper function to pick a random wander target within given bounds
 * @param {THREE.Vector3} currentPosition - Current position of the entity
 * @param {number} maxDistance - Maximum distance to wander
 * @param {object} worldBounds - World boundaries
 * @returns {THREE.Vector3} - Target position
 */
function pickWanderTarget(currentPosition, maxDistance, worldBounds) {
    // Pick a random direction and distance
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * maxDistance;
    
    // Calculate new position
    let x = currentPosition.x + Math.cos(angle) * distance;
    let z = currentPosition.z + Math.sin(angle) * distance;
    
    // Clamp to world bounds
    x = Math.max(worldBounds.minX, Math.min(worldBounds.maxX, x));
    z = Math.max(worldBounds.minZ, Math.min(worldBounds.maxZ, z));
    
    return new THREE.Vector3(x, currentPosition.y, z);
}

/**
 * Spawns multiple fauna creatures outside the town
 * @param {THREE.Scene} scene - The scene to add the fauna to
 * @param {function} onProgress - Progress callback
 * @returns {Promise<Array<THREE.Object3D>>} - Array of spawned fauna
 */
export async function spawnFauna(scene, onProgress) {
    const fauna = [];
    const totalX = config.world.chunkSize.x * config.world.numChunks.x;
    const totalZ = config.world.chunkSize.z * config.world.numChunks.z;
    const worldBounds = { minX: -totalX/2, maxX: totalX/2, minZ: -totalZ/2, maxZ: totalZ/2 };
    
    // Define number of each animal to spawn
    const bearCount = 3;    // Number of bears to spawn
    const chickenCount = 10; // Number of chickens to spawn
    const cowCount = 5;     // Number of cows to spawn
    const foxCount = 7;     // Number of foxes to spawn
    
    // Spawn bears in random positions like other animals
    for (let i = 0; i < bearCount; i++) {
        try {
            const bear = await createRadBear(scene, onProgress);
            if (bear) {
                const pos = getRandomOutsidePosition(worldBounds);
                
                // Position and scale the bear
                bear.position.set(pos.x, 0, pos.z);
                bear.scale.set(1.2, 1.2, 1.2); // Slightly larger scale for bears
                
                // Add to scene and track
                scene.add(bear);
                fauna.push(bear);
            } else {
                console.error(`Failed to create bear ${i+1}/${bearCount}`);
            }
        } catch (error) {
            console.error(`Error spawning bear ${i+1}/${bearCount}:`, error);
        }
    }
    
    // Spawn rad chickens
    for (let i = 0; i < chickenCount; i++) {
        const chicken = await createRadChicken(scene, onProgress);
        if (chicken) {
            const pos = getRandomOutsidePosition(worldBounds);
            
            // Position and scale the chicken
            chicken.position.set(pos.x, 0, pos.z);
            chicken.scale.set(0.5, 0.5, 0.5); // Scale down chickens
            
            // Add to scene and track
            scene.add(chicken);
            fauna.push(chicken);
        } else {
            console.error(`Failed to create chicken ${i+1}/${chickenCount}`);
        }
    }
    
    // Spawn rad cows
    for (let i = 0; i < cowCount; i++) {
        const cow = await createRadCow(scene, onProgress);
        if (cow) {
            const pos = getRandomOutsidePosition(worldBounds);
            
            // Position and scale the cow
            cow.position.set(pos.x, 0, pos.z);
            cow.scale.set(1.5, 1.5, 1.5); // Scale up cows
            
            // Add to scene and track
            scene.add(cow);
            fauna.push(cow);
        } else {
            console.error(`Failed to create cow ${i+1}/${cowCount}`);
        }
    }
    
    // Spawn rad foxes
    for (let i = 0; i < foxCount; i++) {
        const fox = await createRadFox(scene, onProgress);
        if (fox) {
            const pos = getRandomOutsidePosition(worldBounds);
            
            // Position and scale the fox
            fox.position.set(pos.x, 0, pos.z);
            fox.scale.set(0.8, 0.8, 0.8); // Slightly smaller scale for foxes
            
            // Add to scene and track
            scene.add(fox);
            fauna.push(fox);
        } else {
            console.error(`Failed to create fox ${i+1}/${foxCount}`);
        }
    }
    
    return fauna;
}
