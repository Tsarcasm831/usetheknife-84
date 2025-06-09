import * as THREE from 'three';
import { createPickupTruck } from './pickupTruckSetup.js';
import { createLamborghini } from './lamborghiniSetup.js';

export function setupVehicles(world) {
    createPickupTruck(world);
    createLamborghini(world);
}