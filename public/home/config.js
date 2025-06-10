// config.js - Main aggregator
import { worldConfig } from './configs/world.js';
import { playerCameraConfig } from './configs/playerCamera.js';
import { structuresConfig } from './configs/structures.js';
import { vehiclesNpcsConfig } from './configs/vehiclesNpcs.js';
import { createWwHuman, updateWwHuman } from './scripts/world/ww_human.js';

// Combine all configurations into a single export
const config = {
    ...worldConfig,
    ...playerCameraConfig,
    ...structuresConfig,
    ...vehiclesNpcsConfig,
    wwHuman: {
        createFn: createWwHuman,
        updateFn: updateWwHuman,
        spawnConfig: vehiclesNpcsConfig.wwHuman
    }
};

export default config;