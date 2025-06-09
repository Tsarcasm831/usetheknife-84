// configs/vehiclesNpcs.js
export const vehiclesNpcsConfig = {
    radChicken: {
        /* @tweakable Path to the chicken model */
        modelPath: '/assets/rad_chicken2/biped/Animation_Idle_02_withSkin.glb',
        /* @tweakable Initial spawn position (grid coordinates) */
        gridPosition: { x: 75, z: 84 },
        /* @tweakable Model scale factor */
        scale: { x: 0.5, y: 0.5, z: 0.5 },
        /* @tweakable Vertical offset from ground */
        yOffset: 0.1,
        /* @tweakable Whether the chicken is collidable */
        collidable: true,

        /* @tweakable Path to the walking animation model */
        walkingModelPath: '/assets/rad_chicken2/biped/Animation_Walking_withSkin.glb',
        /* @tweakable Path to the alert animation model */
        alertModelPath: '/assets/rad_chicken2/biped/Animation_Alert_withSkin.glb',

        /* @tweakable Base speed of the chicken */
        speed: 1.5,
        /* @tweakable Speed multiplier when fleeing */
        fleeSpeedMultiplier: 2.0,
        /* @tweakable Distance (in grid cells) from player to trigger fleeing */
        fleeDistanceGridCells: 5,
        /* @tweakable Maximum distance for random wander target */
        wanderTargetDistance: 15,
        /* @tweakable Minimum time (seconds) to wait before picking new wander target */
        minWanderWaitTime: 3.0,
        /* @tweakable Maximum time (seconds) to wait before picking new wander target */
        maxWanderWaitTime: 8.0,
        /* @tweakable Distance threshold to consider chicken 'arrived' at target */
        arrivalThreshold: 0.5,
        /* @tweakable How quickly the chicken turns (0-1, higher is faster) */
        turnSpeed: 0.15
    },
    truck: {
        /* @tweakable Position of the truck (Centered in grid spot 91.5, 94) */
        position: { x: 24.48, y: 0, z: 28.08 },
        /* @tweakable Overall size of the truck (cab + trailer) */
        size: { x: 4.5, y: 2.0, z: 1.8 },
        /* @tweakable Colors for the truck */
        colors: { cab: 0xff0000, trailer: 0xaaaaaa, wheels: 0x333333 },
        /* @tweakable Rotation of the truck (radians, Math.PI / 2 is North/South) */
        rotationY: Math.PI / 2,
        /* @tweakable Length of the cab relative to total length (0-1) */
        cabLengthRatio: 0.3,
        /* @tweakable Height of the cab relative to total height (0-1) */
        cabHeightRatio: 0.8,
        /* @tweakable Radius of the wheels relative to total height (0-1) */
        wheelRadiusRatio: 0.2,
        /* @tweakable Thickness of the wheels relative to total width (0-1) */
        wheelThicknessRatio: 0.2
    },
    bus: {
        /* @tweakable Path to the bus model */
        modelPath: 'assets/static/bus.glb',        /* @tweakable Initial position of the bus (Snapped to grid line 25, 100 -> X=-72, Z=36) */
        position: { x: -2.88, y: 0, z: 38.88 }, 
        /* @tweakable Size of the bus */
        size: { x: 6, y: 2.2, z: 3 },
        /* @tweakable Colors for the bus */
        colors: { body: 0xffdd00, wheels: 0x333333, window: 0x6699cc },
        /* @tweakable Rotation of the bus (radians, 0 = E/W, PI/2 = N/S) */
        rotationY: 0,
        /* @tweakable Target position for the bus to move to (Snapped to grid line 29, 100 -> X=4.32, Z=36) */
        targetPosition: { x: 4.32, y: 0, z: 38.88 }, 
        /* @tweakable Distance from player to trigger bus movement */
        triggerDistance: 10.0,
        /* @tweakable Speed at which the bus moves */
        moveSpeed: 2.0
    },
    talEhn: {
        /* @tweakable Path to the Tal'Ehn idle model */
        modelPath: '/assets/tal_ehn/files/tal_ehn_Animation_Idle_02_withSkin.glb',
        /* @tweakable Path to the Tal'Ehn walking animation model */
        walkModelPath: '/assets/tal_ehn/files/tal_ehn_Animation_Walking_withSkin.glb',
        /* @tweakable Initial spawn position (grid coordinates) */
        gridPosition: { x: 85, z: 95 },
        /* @tweakable Absolute spawn position (over parking lot) */
        position: { x: 15.6, y: 0, z: 23.76 },
        /* @tweakable Model scale factor (yet another 40% larger) */
        scale: { x: 0.5488, y: 0.5488, z: 0.5488 }, // 0.392 * 1.4
        /* @tweakable Vertical offset from ground */
        yOffset: 0.1,
        /* @tweakable Whether the Tal'Ehn is collidable */
        collidable: true,

        /* Patrol-specific settings */
        patrolGridPoints: [ { x: 85, z: 87 }, { x: 85, z: 69 } ],
        speed: 1.2,
        turnSpeed: 0.1,
        arrivalThreshold: 0.3
    },
    wwHuman: {
        /* @tweakable Path to the idle model */
        modelPath: '/assets/woman_wastelander/files/woman_wastelander_Animation_Idle_02_withSkin.glb',
        /* @tweakable Path to the walking model (unused for idle) */
        walkModelPath: '/assets/woman_wastelander/files/woman_wastelander_Animation_Walking_withSkin.glb',
        /* @tweakable Initial spawn position (grid coordinates) */
        gridPosition: { x: 75, z: 92 },
        /* @tweakable Absolute spawn position */
        position: { x: 72, y: 0, z: 96.48 },
        /* @tweakable Model scale factor */
        scale: { x: 1, y: 1, z: 1 },
        /* @tweakable Vertical offset from ground */
        yOffset: 0.1,
        /* @tweakable Whether the NPC is collidable */
        collidable: true
    }
};