import * as THREE from 'three';
// Import helper functions for creating truck parts from the new refactored files
import { createTruckMaterials, getTruckDimensions } from './pickupTruckShared.js';
// --- Refactored Imports for Body Parts ---
import { createTruckHood } from './pickupTruckHood.js';
import { createTruckCab } from './pickupTruckCab.js';
import { createTruckBed } from './pickupTruckBed.js';
import { createTruckWheelWells } from './pickupTruckWheelWells.js';
// --- End Refactored Imports ---
import { createTruckWindows } from './pickupTruckWindows.js';
import { createTruckWheels } from './pickupTruckWheels.js';
import {
    createTruckBumpers,
    createTruckGrille,
    createTruckLights,
    createTruckMirrors,
    createTruckDoorHandles,
    createTruckExhaust,
    createTruckMudFlaps,
    createTruckAntenna,
    createTruckWipers,
    createGasCap,
    createReflectors
} from './pickupTruckAccessories.js';

// --- Main Function ---

export function createPickupTruck(world) {
    const { scene, colliders } = world;
    const truck = new THREE.Group();

    const materials = createTruckMaterials();
    const dims = getTruckDimensions();

    // --- Body Components ---
    // Calculate exact start/end points based on dimensions
    const cabFrontX = dims.wheelbase / 2 - dims.hoodLength;
    const cabBackX = cabFrontX - dims.cabLength;
    const bedBackX = cabBackX - dims.bedLength;
    const hoodFrontX = cabFrontX + dims.hoodLength; // Should align near wheelbase/2

    // Hood - Position its *center* relative to its length and the cab's front
    const hood = createTruckHood(dims, materials);
    hood.position.set(cabFrontX + dims.hoodLength / 2, dims.bodyBaseY, 0); // Base Y, center X
    truck.add(hood);

    // Cab - Position its *center* relative to its length and where it starts/ends
    const cab = createTruckCab(dims, materials);
    cab.position.set(cabFrontX - dims.cabLength / 2, dims.bodyBaseY, 0); // Base Y, center X
    truck.add(cab);

    // Bed - Position its *center* relative to its length and where it starts/ends
    const bed = createTruckBed(dims, materials);
    bed.position.set(cabBackX - dims.bedLength / 2, dims.bodyBaseY, 0); // Base Y, center X
    truck.add(bed);

    // --- Wheel Wells ---
    // Wheel wells position themselves absolutely based on wheel locations in dims
    const wheelWells = createTruckWheelWells(dims, materials);
    // No need to position the group itself, its children are positioned absolutely
    truck.add(wheelWells);

    // --- Windows (and basic interior) ---
    // Pass the whole truck group so windows can be positioned relative to it
    createTruckWindows(dims, materials, truck);

    // --- Wheels ---
    createTruckWheels(dims, materials, truck);

    // --- Accessories ---
    // Accessories are positioned relative to the truck's coordinate system
    const bumpers = createTruckBumpers(dims, materials, hoodFrontX, bedBackX);
    truck.add(bumpers);

    const grille = createTruckGrille(dims, materials, hoodFrontX);
    truck.add(grille);

    const lights = createTruckLights(dims, materials, hoodFrontX, bedBackX);
    truck.add(lights);

    const mirrors = createTruckMirrors(dims, materials, cabFrontX);
    truck.add(mirrors);

    const doorHandles = createTruckDoorHandles(dims, materials, cabFrontX, cabBackX);
    truck.add(doorHandles);

    const exhaust = createTruckExhaust(dims, materials, cabBackX, bedBackX);
    truck.add(exhaust);

    const mudFlaps = createTruckMudFlaps(dims, materials);
    truck.add(mudFlaps);

    const antenna = createTruckAntenna(dims, materials, cabBackX);
    truck.add(antenna);

    const wipers = createTruckWipers(dims, materials, cabFrontX);
    truck.add(wipers);

    const gasCap = createGasCap(dims, materials);
    truck.add(gasCap);

    const reflectors = createReflectors(dims, materials, bedBackX);
    truck.add(reflectors);

    // --- Final Positioning ---
    truck.position.set(-1.8, 0, -2.5); // Position the entire truck group
    truck.rotation.y = Math.PI / 9;
    scene.add(truck);

    // --- Collider Update ---
    scene.updateMatrixWorld(); // Ensure transforms are calculated
    const truckBox = new THREE.Box3().setFromObject(truck, true); // Use precise=true for better fit with children

    // Add a small buffer to the collider box for safety margin
    truckBox.expandByScalar(0.05);

    // Remove previous truck collider if it exists (more robust)
    const oldColliderIndex = colliders.findIndex(c => c.name === "truckCollider");
    if(oldColliderIndex > -1) colliders.splice(oldColliderIndex, 1);

    // Store the Box3 itself for collision checks
    truckBox.name = "truckCollider"; // Add name for potential future identification
    colliders.push(truckBox);

    // Optional: Add Box3Helper for debugging the collider
    // const helper = new THREE.Box3Helper( truckBox, 0xffff00 );
    // scene.add( helper );
}