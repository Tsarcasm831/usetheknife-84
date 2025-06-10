# Replication Strategy for FarHaven Core RPG Functions

Based on a deep dive into the FarHaven project, here's a suggested approach to replicate its core player and NPC mechanics in a new, single-run project:

## I. Project Setup & Configuration:

1.  **Basic HTML (`index.html`)**:
    *   Set up a canvas for Three.js rendering.
    *   Include an import map to load Three.js (and `GLTFLoader`, `OrbitControls` if used directly) from a CDN, similar to FarHaven.
    *   Load your main JavaScript file (e.g., `game.js`) as a module.

2.  **Configuration Module (e.g., `config.js`)**:
    *   **World Config**: Define `worldSize` (total dimensions), `gridCellSize` (world units per grid cell). This can be derived from FarHaven's `chunkSize` and `divisions`.
    *   **Player Config**: Initial `gridPosition`, `modelPath`, `animationPaths` (idle, walk, run), `speed`, `runSpeedMultiplier`, `turnSpeed`, `cameraOffset`.
    *   **NPC Config (e.g., for a "Creature")**:
        *   `modelPath`, `animationPaths` (idle, walk, alert/flee).
        *   `scale`, `yOffset`.
        *   `collidable` (boolean).
        *   AI parameters: `speed`, `fleeSpeedMultiplier`, `fleeDistanceGridCells`, `wanderTargetDistanceGridCells`, `min/maxWanderWaitTime`, `arrivalThreshold`, `turnSpeed`.
    *   **Asset Manifest (Optional but Recommended)**: A simple JSON listing paths to models/textures for preloading.

## II. Core Modules & Logic:

1.  **Main Game Module (e.g., `game.js`)**:
    *   **Initialization (`init` function)**:
        *   Set up Three.js `Scene`, `PerspectiveCamera`, `WebGLRenderer`, `Clock`.
        *   Load configurations from `config.js`.
        *   **Asset Preloading**: Load all models/textures defined in the manifest.
        *   **World Setup**: Create a ground plane based on `worldSize`. Optionally add boundary walls.
        *   **Player Creation**:
            *   Call a `createPlayer` function, passing the scene and player config.
            *   Store the player object and add it to a `collidableObjects` array.
        *   **NPC Creation**:
            *   Loop through NPC spawn definitions (if you have multiple types or instances).
            *   For each, call a `createNPC` function, passing the scene, NPC config, and its specific `gridPosition`.
            *   Convert `gridPosition` to world coordinates using `gridCellSize`.
            *   Store created NPCs in an `allNPCs` array and add to `collidableObjects` if applicable.
        *   Initialize input controls.
    *   **Game Loop (`animate` function)**:
        *   Get `deltaTime`.
        *   Update player (input, movement, animation, collision).
        *   Update camera to follow player.
        *   Loop through `allNPCs`:
            *   Update NPC AI state.
            *   Update NPC movement, animation, collision.
        *   Render the scene.
        *   `requestAnimationFrame(animate)`.

2.  **Input/Controls Module (e.g., `controls.js`)**:
    *   Listen for keyboard events (WASD, Shift, Q/E for camera).
    *   Store current key states.
    *   Provide functions to get:
        *   `movementVector` (normalized, based on WASD and camera angle).
        *   `isRunning` (boolean).
        *   `cameraRotationChange` (for Q/E).
        *   `cameraZoomChange` (mouse wheel).

3.  **Player Module (e.g., `player.js`)**:
    *   **`createPlayer(scene, playerConfig)`**:
        *   Load player GLB model and separate animation GLBs (idle, walk, run).
        *   Set up `AnimationMixer` and store `AnimationActions`.
        *   Set initial position (converted from `playerConfig.gridPosition`).
        *   Create a bounding box (AABB).
        *   Store relevant data in `player.userData` (speed, state, boundingBox, etc.).
        *   Add player model to scene.
    *   **`updatePlayer(player, deltaTime, movementVector, isRunning, collidableObjects, worldSize)`**:
        *   Determine target speed based on `isRunning`.
        *   Calculate `targetPosition` based on `movementVector` and speed.
        *   **Rotation**: Smoothly rotate player model to face `movementVector`.
        *   **Collision Detection**:
            *   Predict next position.
            *   Check for collisions with `collidableObjects` using AABB.
            *   Implement slide-on-collision: If collision on an axis, zero out movement on that axis and attempt movement on the other. Repeat if necessary.
        *   **World Boundaries**: Clamp final position within `worldSize`.
        *   Update player's actual `position`.
        *   **Animation**:
            *   Determine current animation state (idle, walking, running) based on velocity.
            *   Cross-fade to the appropriate animation.
            *   Update `AnimationMixer`.

4.  **NPC Module (e.g., `npc.js` - generic for a creature type)**:
    *   **`createNPC(scene, npcConfig, worldPosition)`**:
        *   Similar to `createPlayer`: load model and animation GLBs (idle, walk, alert/flee).
        *   Set up `AnimationMixer`, store `AnimationActions`.
        *   Set initial `worldPosition`.
        *   Create bounding box.
        *   Store data in `npc.userData`: AI state ('wandering', 'fleeing'), speed, `fleeDistanceWorld` (converted from `npcConfig.fleeDistanceGridCells` using `gridCellSize`), `worldBounds` (derived from `worldSize`), current wander target, wander wait timer, etc.
        *   Add NPC model to scene.
    *   **`updateNPC(npc, deltaTime, player, collidableObjects, worldSize, gridCellSize)`**:
        *   **AI State Logic**:
            *   Calculate distance to player.
            *   If distance < `npc.userData.fleeDistanceWorld` and not already fleeing, switch to 'fleeing' state.
            *   If in 'fleeing' state and distance > `fleeDistanceWorld` + buffer, switch to 'wandering'.
        *   **Movement Logic**:
            *   **Fleeing**: Calculate direction away from player. Set target speed to `speed * fleeSpeedMultiplier`.
            *   **Wandering**:
                *   If no wander target or arrived at target or timer expired:
                    *   Pick a new random `wanderTarget` within `worldBounds` (or within `wanderTargetDistanceGridCells` converted to world units, then clamped).
                    *   Reset wander wait timer.
                *   Calculate direction towards `wanderTarget`. Set target speed to base `speed`.
        *   Calculate `targetPosition`.
        *   **Rotation**: Smoothly rotate NPC model to face movement direction.
        *   **Collision Detection**: Same as player (AABB, slide-on-collision).
        *   **World Boundaries**: Clamp final position.
        *   Update NPC's actual `position`.
        *   **Animation**:
            *   Determine animation state (idle, walking, fleeing/alert) based on velocity and AI state.
            *   Cross-fade to appropriate animation.
            *   Update `AnimationMixer`.

5.  **Collision Module (e.g., `collision.js`)**:
    *   **`checkCollision(objectA, objectB)`**: Takes two objects with `userData.boundingBox` (AABB: `{min: {x,y,z}, max: {x,y,z}}`). Returns true if they intersect.
    *   **`getSweptCollisionTime(movingBox, staticBox, velocity)` (Optional, for more precise CCD)**: For continuous collision detection. Simpler AABB checks after discrete movement steps are often sufficient for RPGs.
    *   Helper to update an object's AABB based on its current position and pre-calculated `boundingBoxSize`.

6.  **Camera Module (e.g., `camera_handler.js` or integrated into `main.js`)**:
    *   Store `cameraOffset` (from player), current `zoomLevel`, `cameraAngleY`.
    *   **`updateCamera(camera, player, cameraRotationChange, cameraZoomChange)`**:
        *   Update `cameraAngleY` and `zoomLevel` based on input.
        *   Calculate desired camera position based on player's position, `cameraOffset`, `cameraAngleY`, and `zoomLevel`.
        *   Smoothly interpolate camera to this desired position and make it look at the player's position + a slight vertical offset.

## III. Asset Preparation:

*   Ensure you have simple GLB models for player and NPCs, ideally with separate GLBs for animations (e.g., `player_idle.glb`, `player_walk.glb`, `npc_flee.glb`). This matches FarHaven's approach and simplifies animation management.

## Key Principles from FarHaven to Emulate:

*   **Modularity**: Separate JS files for different concerns.
*   **Configuration-Driven**: Define entities and their core properties in config files.
*   **Grid-Based Logic**: Use a grid for placement and some AI distance calculations, then convert to world units.
*   **State Machines**: Simple states for NPCs (wandering, fleeing) and player (idle, walk, run for animation).
*   **AABB Collision**: Effective for character-environment and character-character collisions.
*   **Animation Cross-Fading**: For smooth transitions between animation states.
