import * as THREE from 'three';

// Import setup functions from new modules
import { setupWorkbenchTools } from './workbenchTools.js';
import { setupPegboardTools } from './pegboardTools.js';
import { setupLooseItems } from './looseItems.js';
import { setupDecorItems } from './decorItems.js';
import { setupLargeTools } from './largeTools.js';

// Main entry point for setting up all tools and loose items
export async function setupTools(world) {
    // Setup tools located on the workbench
    setupWorkbenchTools(world);

    // Setup tools hanging on the pegboard
    setupPegboardTools(world);

    // Setup the poster on the wall (asynchronous operation)
    await setupDecorItems(world); // Await texture loading within this setup

    // Setup loose items like gears, cans, rags etc., and floor items
    setupLooseItems(world);

    // Setup larger tools like air hose, leaning tools
    setupLargeTools(world);
}