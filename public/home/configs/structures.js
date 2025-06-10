// configs/structures.js
export const structuresConfig = {
    house: {
        /* @tweakable Position of the first house */
        position: { x: -13, y: 0, z: 15.5 },
        /* @tweakable Size of the first house */
        scale: { x: 4.6, y: 2.875, z: 3.45 },
        /* @tweakable Rotation of the first house (radians) */
        rotationY: -Math.PI/2,
        /* @tweakable Colors for the first house */
        colors: { base: 0xaaaaaa, roof: 0x8B4513 }
    },
    house2: {
        /* @tweakable Position of the second house */
        position: { x: -23, y: -0.1, z: 18.5 },
        /* @tweakable Size of the second house */
        scale: { x: 4.2, y: 2.625, z: 3.15 },
        /* @tweakable Rotation of the second house (radians) */
        rotationY: -3*Math.PI/2,
        /* @tweakable Colors for the second house */
        colors: { base: 0xc0c0c0, roof: 0x696969 }
    },
    house3: {
        /* @tweakable Position of the third house (moved S 3 grids) */
        position: { x: -23, y: 0, z: 5.5 + (3 * (72/50)) },
        /* @tweakable Size of the third house */
        scale: { x: 4, y: 2.5, z: 3 },
        /* @tweakable Rotation of the third house (radians) */
        rotationY: Math.PI/2,
        /* @tweakable Colors for the third house */
        colors: { base: 0xb0b0b0, roof: 0x708090 }
    },
    house4: {
        /* @tweakable Position of the fourth house (moved S 2 grids) */
        position: { x: -13, y: 0, z: 5.5 + (2 * (72/50)) },
        /* @tweakable Size of the fourth house */
        scale: { x: 6.72, y: 4.2, z: 5.04 },
        /* @tweakable Rotation of the fourth house (radians) */
        rotationY: -Math.PI/2,
        /* @tweakable Colors for the fourth house */
        colors: { base: 0xa0b0c0, roof: 0x5a6a7a }
    },
    house5: {
        /* @tweakable Position of the fifth house */
        position: { x: -13, y: 0, z: 0.5 },
        /* @tweakable Size of the fifth house */
        scale: { x: 4, y: 2.5, z: 3 },
        /* @tweakable Colors for the fifth house */
        colors: { base: 0xeeeeee, roof: 0x4682B4 }
    },
    house6: {
        /* @tweakable Position of the sixth house */
        position: { x: -23, y: 0, z: 0.5 },
        /* @tweakable Size of the sixth house */
        scale: { x: 1.3333333333333333, y: 0.8333333333333334, z: 1 },
        /* @tweakable Rotation of the sixth house (radians) */
        rotationY: -Math.PI/2,
        /* @tweakable Colors for the sixth house */
        colors: { base: 0xd3d3d3, roof: 0x800080 }
    },
    houseGLB: {
        /* @tweakable Name for the GLB house */
        name: "HouseGLB_1",
        /* @tweakable Path to the house model */
        glbPath: 'assets/static/house1.glb',
        /* @tweakable Position (Calculated Grid: 65, 91) */
        position: { x: -12, y: 0, z: 22 },
        /* @tweakable Scale of the house model */
        scale: { x: 6.0, y: 6.0, z: 6.0 },
        /* @tweakable Rotation of the house model (radians) */
        rotationY: 0,
        /* @tweakable Bounding box size (estimate, adjust after loading) */
        size: { x: 30, y: 24, z: 30 },
        /* @tweakable Mark as collidable */
        collidable: true
    },
    abandonedHouse: {
        /* @tweakable Position of the abandoned house */
        position: { x: -12.5, y: 0, z: -20.5 },
        /* @tweakable Size of the abandoned house */
        size: { x: 7, y: 2.0, z: 5 },
        /* @tweakable Colors for the abandoned house */
        colors: { base: 0x8a8a7b, roof: 0x6b5a4a },
        /* @tweakable Roof angle variance (radians) */
        roofAngleVariance: { side1: Math.PI / 8, side2: -Math.PI / 12 }
    },
    hospital: {
        /* @tweakable Name for the Hospital */
        name: "Hospital",
        /* @tweakable Path to the hospital model */
        glbPath: 'assets/static/Abandoned_Hospital.glb',
        /* @tweakable Position of the hospital (Snapped to center of Grid X:21-24, Z:30-33), Moved S 9 grids */
        position: { x: -2.16, y: 7.8, z: 20.88 },  // Raised by half the model height (15.6/2)
        /* @tweakable Scale of the hospital model */
        scale: { x: 3.9, y: 3.9, z: 3.9 },
        /* @tweakable Rotation of the hospital model (radians) */
        rotationY: 0,
        /* @tweakable Bounding box size (estimate, adjust after loading) */
        size: { x: 4.32, y: 15.6, z: 4.32 },
        /* @tweakable Mark as collidable */
        collidable: true
    },
    departmentBuilding: {
        /* @tweakable Position of the department building */
        position: { x: 18.5, y: 0, z: -22.5 },
        /* @tweakable Size of the department building */
        size: { x: 1, y: 2, z: 2 },
        /* @tweakable Rotation of the department building (radians) */
        rotationY: -3*Math.PI/2,
        /* @tweakable Colors for the department building */
        colors: { base: 0x1a1a1a, roof: 0x101010, door: 0xcccccc },
        /* @tweakable Angle for corner fins (radians) */
        finAngle: Math.PI / 6,
         /* @tweakable Size factor for corner fins */
        finSizeFactor: 0.3
    },
    warehouse: {
        /* @tweakable Name for the Bills Warehouse */
        name: "BillsWarehouse",
        /* @tweakable Path to the warehouse model */
        glbPath: 'assets/static/Bills_warehouse.glb',
        /* @tweakable Position at grid (89,83) -> world coords approx */
        position: { x: 20.88, y: -0.05, z: 13.68 },
        /* @tweakable Scale of the warehouse model */
        scale: { x: 1.82, y: 1.82, z: 1.82 },
        /* @tweakable Rotation of the warehouse model (radians) */
        rotationY: -Math.PI/2,
        /* @tweakable Bounding box size (estimate) */
        size: { x: 9.8, y: 4.9, z: 14.7 },
        /* @tweakable Mark as collidable */
        collidable: true
    },
    storageBuilding: {
        /* @tweakable Position of the storage building */
        position: { x: 6.5, y: 0, z: -21 },
        /* @tweakable Size of the storage building */
        size: { x: 9, y: 3, z: 4 },
        /* @tweakable Colors for the storage building */
        colors: { base: 0xa0a0a0, roof: 0x505050, door: 0x707070 },
        /* @tweakable Number of storage doors */
        numDoors: 2,
        /* @tweakable Relative height of the storage doors (0-1) */
        doorHeightRatio: 0.7,
         /* @tweakable Fraction of wall width used for doors (0-1) */
        doorAreaFraction: 0.8
    },
    spyderWorkshop: {
        /* @tweakable Position of the Spyder workshop */
        position: { x: -3.0, y: 0, z: -20.5 },
        /* @tweakable Size of the Spyder workshop */
        size: { x: 6, y: 3.5, z: 5 },
        /* @tweakable Colors for the Spyder workshop */
        colors: { base: 0x777777, roof: 0x555555, door: 0xaaaaaa, accent: 0xff4400 },
        /* @tweakable Roof slant angle (radians) */
        roofSlant: -0.05,
        /* @tweakable Relative height of garage door (0-1) */
        garageDoorHeightRatio: 0.8,
         /* @tweakable Relative width of garage door (0-1) */
        garageDoorWidthRatio: 0.5,
         /* @tweakable Relative vertical position of accent stripe (0-1) */
        stripeYRatio: 0.7,
         /* @tweakable Height of accent stripe */
        stripeHeight: 0.3
    },
    waterworks: {
        /* @tweakable Position of the waterworks */
        position: { x: -23.5, y: 0, z: -11.1 },
        /* @tweakable Size of the main waterworks building */
        size: { x: 8, y: 4, z: 6 },
        /* @tweakable Rotation of the waterworks building (radians) */
        rotationY: Math.PI / 2,
        /* @tweakable Colors for the waterworks */
        colors: { base: 0xA0A0A0, roof: 0x606060, pipe: 0x708090, tank: 0xB0C4DE, door: 0x505050 },
        /* @tweakable Number of water tanks */
        numTanks: 2,
        /* @tweakable Radius of water tanks relative to building width */
        tankRadiusRatio: 0.15,
        /* @tweakable Height of water tanks relative to building height */
        tankHeightRatio: 0.8,
         /* @tweakable Radius of the main pipes */
        pipeRadius: 0.2
    },
    schoolhouse: {
        /* @tweakable Position of the schoolhouse */
        position: { x: -12.6, y: 0, z: -9.0 },
        /* @tweakable Size of the schoolhouse */
        size: { x: 6.0, y: 4.0, z: 6.0 },
        /* @tweakable Colors for the schoolhouse */
        colors: { base: 0xFFE4B5, roof: 0x8B4513, door: 0x654321 },
        /* @tweakable Relative height of the roof peak (factor of base height) */
        roofPeakRatio: 0.5,
        /* @tweakable Relative height of the door (factor of base height) */
        doorHeightRatio: 0.6,
        /* @tweakable Relative width of the door (factor of base depth/width) */
        doorWidthRatio: 0.15
    },
    mineshaftEntrance: {
        /* @tweakable Path to the mineshaft model */
        glbPath: 'assets/static/mineshaft_entrance.glb',
        /* @tweakable Position of the mineshaft entrance */
        position: { x: 30, y: 1, z: -30 },
        /* @tweakable Scale of the mineshaft model */
        scale: { x: 2, y: 2, z: 2 },
        /* @tweakable Rotation of the mineshaft model (radians) */
        rotationY: -Math.PI / 4,
        /* @tweakable Bounding box size (adjust after checking model dimensions) */
        size: { x: 8, y: 8, z: 8 },
        /* @tweakable Mark as collidable */
        collidable: true
    },
    truck: {
        /* @tweakable Position to spawn the truck */
        position: { x: 21.6, z: 23.76 },
        /* @tweakable Rotation of the truck (radians) */
        rotationY: Math.PI
    },
    parkingLot: {
        /* @tweakable Position of the parking lot (adjusted for size change) */
        position: { x: 21.6, y: 0, z: 23.76 },
        /* @tweakable Size of the parking lot (adjusted for grid size) */
        size: { x: 8.64, y: 0, z: 12.96 },
        /* @tweakable Colors for the parking lot */
        colors: { base: 0x505050, lines: 0xFFFF00 },
        /* @tweakable Width of a single parking space (2 grid units) */
        spaceWidth: 2.88,
        /* @tweakable Depth of a single parking space (3 grid units) */
        spaceDepth: 4.32,
        /* @tweakable Width of the marking lines */
        lineWidth: 0.1,
        /* @tweakable Length of the vertical marking lines (use space depth) */
        lineLengthZ: 4.32,
        /* @tweakable Thickness of the base asphalt layer */
        baseThickness: 0.05,
        /* @tweakable Thickness of the line markings */
        lineThickness: 0.02
    },
    buggy: {
        /* @tweakable GLB path for buggy model */
        glbPath: 'assets/static/buggy.glb',
        /* @tweakable Grid index range for buggy spawn */
        gridRange: { xMin: 87, xMax: 88, zMin: 93, zMax: 95 },
        /* @tweakable Scale of the buggy model (match truck scale) */
        scale: { x: 2.5, y: 2.5, z: 2.5},
        /* @tweakable Rotation of the buggy model (radians) */
        rotationY: 0,
        /* @tweakable Mark as collidable */
        collidable: true
    },
    club: {
        /* @tweakable Position of the club (Snapped to center of grid cell 81, 89) */
        position: { x: 9.36, y: -0.1, z: 20.88 },
        /* @tweakable Size of the club */
        size: { x: 6, y: 3, z: 5 },
        /* @tweakable Colors for the club */
        colors: { base: 0x550055, roof: 0x330033, windows: 0xffff00 },
         /* @tweakable Relative height of the 'windows' (0-1) */
        windowHeightRatio: 0.5,
         /* @tweakable Relative width of the front 'window' (0-1) */
        windowFrontWidthRatio: 0.2,
         /* @tweakable Relative depth of the side 'window' (0-1) */
        windowSideDepthRatio: 0.2
    },
    scienceOffice: {
        /* @tweakable Position of the science office (Moved 3 grids East from 78,76 to 81,76) */
        position: { x: 9.36, y: 0, z: 2.16 },
        /* @tweakable Size of the science office (Adjusted to fit 4x5 grid cells) */
        size: { x: 5.76, y: 6, z: 7.2 },
        /* @tweakable Colors for the science office */
        colors: { wall: 0xd0d8e0, floor: 0xb0b0b0, roof: 0x607d8b },
        /* @tweakable Window properties */
        windows: {
             /* @tweakable Window color */
             color: 0xadd8e6,
             /* @tweakable Window opacity (0-1) */
             opacity: 0.5,
             /* @tweakable Relative height of front window (0-1) */
             frontWindowHeightRatio: 0.6,
             /* @tweakable Relative width of front window (0-1) */
             frontWindowWidthRatio: 0.7
        }
    },
    tavern: {
        /* @tweakable Position of the tavern (Moved E 2, S 5 grids) */
        position: { x: 19.88, y: 0, z: -2.05 },
        /* @tweakable Size of the tavern */
        size: { x: 7.5, y: 4.5, z: 6 },
        /* @tweakable Rotation of the tavern (radians) */
        rotationY: Math.PI / 2,
        /* @tweakable Colors for the tavern */
        colors: { base: 0x966F33, roof: 0x5a4d41, door: 0x654321 },
        /* @tweakable Relative height of the roof peak (factor of base height) */
        roofPeakRatio: 0.4,
         /* @tweakable Relative height of the door (factor of base height) */
        doorHeightRatio: 0.6,
        /* @tweakable Relative width of the door (factor of base width/depth) */
        doorWidthRatio: 0.15
    },
    watchtower: {
        /* @tweakable Position of the watchtower */
        position: { x: 25, y: 0, z: 25 },
        /* @tweakable Size of the watchtower base */
        size: { x: 2.5, y: 6, z: 2.5 },
        /* @tweakable Height of the watchtower platform */
        platformHeight: 0.5,
        /* @tweakable Overhang of the platform beyond the base */
        platformOverhang: 0.5,
        /* @tweakable Colors for the watchtower */
        colors: { base: 0x886644, platform: 0x775533 }
    },
    roadLabels: {
        /* @tweakable Default font size for road labels (can be overridden) */
        fontSize: 1.0,
        /* @tweakable Default font height (thickness) for road labels */
        fontHeight: 0.01,
        /* @tweakable Default color of road labels (can be overridden) */
        color: 0xffffff,
        /* @tweakable Default vertical offset for road labels */
        yOffset: 0.05
        // Font URL is taken from the global helvetikerFontUrl
    },
    bowenStreet: {
        /* @tweakable Position of Bowen St. segment (center shifted south) */
        position: { x: -18, y: 0, z: 4.32 },
        /* @tweakable Size of Bowen St. segment (Width 3 grids, Length 30 grids) */
        size: { x: 4.32, z: 43.2 },
        /* @tweakable Label text for Bowen St. */
        label: "Bowen St.",
        /* @tweakable Font size for Bowen St. label */
        labelFontSize: 1.2,
        /* @tweakable Colors for Bowen St. */
        colors: { road: 0x404040, label: 0xe0e0ff }
    },
    kenPrattBlvd: {
        /* @tweakable Position of Ken Pratt Blvd. segment (Centered at Grid 72, 94) */
        position: { x: -3.6, y: 0, z: 28.08 },
        /* @tweakable Size of Ken Pratt Blvd. segment (Spans Grid X: 61-83, Z: 93-95) */
        size: { x: 33.12, z: 4.32 },
        /* @tweakable Label text for Ken Pratt Blvd. */
        label: "Ken Pratt Blvd.",
        /* @tweakable Font size for Ken Pratt Blvd. label */
        labelFontSize: 1.0,
        /* @tweakable Colors for Ken Pratt Blvd. */
        colors: { road: 0x404040, label: 0xe0e0ff }
    },
    prattStreet: {
        /* @tweakable Position of Pratt St. segment (Center adjusted for size) */
        position: { x: 15.12, y: 0, z: 7.92 },
        /* @tweakable Size of Pratt St. segment (Length +1 grid = 31 grids) */
        size: { x: 4.32, z: 44.64 },
        /* @tweakable Label text for Pratt St. */
        label: "Pratt St.",
        /* @tweakable Font size for Pratt St. label */
        labelFontSize: 1.2,
        /* @tweakable Colors for Pratt St. */
        colors: { road: 0x404040, label: 0xe0e0ff }
    },
    coloradoAve: {
        /* @tweakable Position of Colorado Ave. segment */
        position: { x: 4.5, y: 0, z: -15 },
        /* @tweakable Size of Colorado Ave. segment */
        size: { x: 41, z: 4 },
        /* @tweakable Label text for Colorado Ave. */
        label: "Colorado Ave.",
        /* @tweakable Font size for Colorado Ave. label */
        labelFontSize: 1.0,
        /* @tweakable Colors for Colorado Ave. */
        colors: { road: 0x404040, label: 0xe0e0ff }
    },
    road: {
        /* @tweakable Default color for generic road segments */
        color: 0x444444,
        /* @tweakable Default thickness for road segments */
        thickness: 0.05,
        /* @tweakable Array defining generic road segments (keep empty if defined elsewhere) */
        segments: []
    },
};