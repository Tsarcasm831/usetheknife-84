import * as THREE from 'three';
import { scene } from './scene.js';
import { createBuildingShell } from './building.js';
import { createBarArea } from './bar.js';
import { createFurniture } from './furniture.js';
import { createFireplace } from './fireplace.js';
import { createDoor } from './door.js';

/**
 * Creates the entire tavern structure and interior elements by calling specialized modules.
 * @returns {{updateFireFn: function, chairData: Array}} An object containing the fireplace update function and chair data.
 */
export function createTavernStructure() {
    createBuildingShell();
    createBarArea();
    const updateFireFn = createFireplace();
    const diningTableChairData = createFurniture(); // Get chair data
    createDoor();
    // Return both the update function and the chair data
    return { updateFireFn, chairData: diningTableChairData };
}