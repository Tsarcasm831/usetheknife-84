// configs/playerCamera.js
export const playerCameraConfig = {
    player: {
        /* @tweakable Grid spawn position override (grid units) */
        gridPosition: { x: 69, z: 117 },
        /* @tweakable Path to the idle animation GLB */
        idleGltfPath: 'assets/player/Animation_Idle_02_withSkin.glb',
        /* @tweakable Path to the walking animation GLB */
        walkGltfPath: 'assets/player/Animation_Walking_withSkin.glb',
        /* @tweakable Path to the running animation GLB */
        runGltfPath: 'assets/player/Animation_Running_withSkin.glb',
        /* @tweakable Player movement speed in units per second */
        speed: 6.0,
        /* @tweakable Run speed multiplier (applied when holding Shift) */
        runMultiplier: 2.0,
        /* @tweakable Player color (fallback material) */
        color: 0x00ff00,
        /* @tweakable Player dimensions for collision */
        size: { x: 0.8, y: 1.5, z: 0.8 },
        /* @tweakable Player model scale */
        modelScale: 0.8,
        /* @tweakable Vertical offset for the player model relative to its base */
        modelYOffset: -0.75,
        /* @tweakable Duration for crossfading between animations (seconds) */
        animationCrossfadeDuration: 0.2,
        /* @tweakable Multiplier for animation playback speed */
        animationSpeedMultiplier: 1.0
    },
    camera: {
        /* @tweakable Camera offset from player (initial view) */
        offset: { x: 10, y: 10, z: 10 },
        /* @tweakable Vertical offset for the camera's look-at point relative to player */
        lookAtOffset: { y: 0 },
        /* @tweakable Mouse wheel zoom sensitivity */
        zoomSpeed: 0.05,
        /* @tweakable Minimum camera zoom multiplier (Reduced for closer zoom) */
        minZoom: 0.2,
        /* @tweakable Maximum camera zoom multiplier */
        maxZoom: 2.0,
        /* @tweakable Camera rotation speed (radians per second) */
        rotationSpeed: 5.0
    },
};