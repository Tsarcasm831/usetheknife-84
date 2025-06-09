import * as THREE from 'three';
// Removed imports are handled by the new specific modules
// import { createNoiseCanvas } from './environmentSetup.js'; // Now imported by workbench.js

// Import setup functions from new modules
import { setupWorkbench } from './workbench.js';
import { setupToolbox } from './toolbox.js';
import { setupStorageItems } from './storageItems.js';
import { setupPegboard } from './pegboard.js';


export function setupFurniture(world) {
    setupWorkbench(world);
    setupToolbox(world);
    setupStorageItems(world); // Sets up TireStack, Shelves, FloorCabinet, WallCabinets
    setupPegboard(world);
}