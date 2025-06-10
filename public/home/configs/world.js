// configs/world.js
export const worldConfig = {
    /* @tweakable Path to the font file for labels (relative to server root) */
    helvetikerFontUrl: 'fonts/helvetiker_regular.typeface.json',
    world: {
        /* @tweakable Dimensions of a single world chunk */
        chunkSize: { x: 72, y: 0.1, z: 72 },
        /* @tweakable Number of chunks in each dimension */
        numChunks: { x: 3, z: 3 },
        /* @tweakable Ground color (Now overridden by texture) */
        // groundColor: 0x888888,
        /* @tweakable URL for the ground texture */
        groundTextureUrl: 'assets/images/dirt.png',
        /* @tweakable How many times the ground texture repeats per chunk */
        groundTextureRepeat: { x: 18, z: 18 }, // Adjust as needed for texture scale
        undergroundDepth: 20, // Depth below ground to create underground level
    },
    wall: {
        /* @tweakable Height of the boundary walls */
        height: 5,
        /* @tweakable Thickness of the boundary walls */
        thickness: 1,
        /* @tweakable Color of the boundary walls (Texture applied, color ignored) */
        // color: 0x654321,
        /* @tweakable Position of the gap in the south wall (world coordinates) */
        gap: {
            startX: -5.5,
            endX: -0.5,
            z: 36.5 // Relative to chunk center (0,0), corresponds to +halfChunkZ + wallThickness/2
        }
    },
    grid: {
        /* @tweakable Number of grid divisions per chunk */
        divisions: 50,
        /* @tweakable Color of the main X and Z axis lines */
        colorCenterLine: 0xaaaaaa,
        /* @tweakable Color of the other grid lines */
        colorGrid: 0x666666,
        /* @tweakable Vertical offset of the grid helper */
        yOffset: 0.02,
        /* @tweakable Key to toggle grid visibility */
        toggleKey: 'KeyG'
    },
    gridLabels: {
        /* @tweakable Enable/disable grid cell labels */
        enabled: true,
        /* @tweakable Font size for grid labels */
        fontSize: 0.2,
        /* @tweakable Font height (thickness) for grid labels */
        fontHeight: 0.01,
        /* @tweakable Color of grid labels */
        color: 0xffffff,
        /* @tweakable Vertical offset for grid labels */
        yOffset: 0.45
        // Font URL is taken from the global helvetikerFontUrl
    },
    grass: {
        /* @tweakable Target number of grass blades */
        count: 600000,
        /* @tweakable Color of the grass blades */
        color: 0x44aa44,
        /* @tweakable Height of individual grass blades */
        bladeHeight: 0.3,
        /* @tweakable Width of individual grass blades */
        bladeWidth: 0.03,
        /* @tweakable How much of the world area grass can spread into (0-1) */
        spreadFactor: 1.0,
        /* @tweakable Number of clumps (global clusters) */
        clusterCount: 200,
        /* @tweakable Radius of each clump */
        clusterRadius: 10,
        /* @tweakable Oblong shape factors for clumps */
        clusterOblongFactorX: 1.5,
        clusterOblongFactorZ: 0.5,
        /* @tweakable Fraction of grass blades for sparse background */
        backgroundFraction: 0.1,
        /* @tweakable Emissive color intensity for grass */
        emissiveIntensity: 0.3,
        /* @tweakable Random lean amount for grass blades (radians) */
        leanVariance: 0.1,
        /* @tweakable Random scale variance for grass blades (multiplier) */
        scaleVariance: 0.3
    },
};