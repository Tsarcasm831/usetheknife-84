import * as THREE from 'three';
import { createRoads } from '../roads/road.js';
import { createParkingLot } from './parking_lot.js';
import { createHouse } from '../structures/house.js';
import { createHospital } from '../structures/hospital.js';
import { createDepartmentBuilding } from '../structures/department_building.js';
import { createBowenStreet } from '../roads/bowenStreet.js';
import { createKenPrattBlvd } from '../roads/kenPrattBlvd.js';
import { createPrattStreet } from '../roads/prattStreet.js';
import { createColoradoAve } from '../roads/coloradoAve.js';
import { createTruck } from '../structures/truck.js';
import { createClub } from '../structures/club.js';
import { createHouse2 } from '../structures/house2.js';
import { createHouse3 } from '../structures/house3.js';
import { createHouse4 } from '../structures/house4.js';
import { createHouse5 } from '../structures/house5.js';
import { createHouse6 } from '../structures/house6.js';
import { createScienceOffice } from '../structures/science_office.js';
import { createTavern } from '../structures/tavern.js';
import { createStorageBuilding } from '../structures/storage_building.js';
import { createSpyderWorkshop } from '../structures/spyder_workshop.js';
import { createAbandonedHouse } from '../structures/abandoned_house.js';
import { createWaterPlantBuilding } from '../structures/waterworks.js';
import { createSchoolhouse } from '../structures/schoolhouse.js';
import { createHouseGLB } from '../structures/house_glb.js'; // Import the new GLB house creator
import { loadModel } from './modelLoader.js';
import { setupLights, createGroundChunks, setupGridAndLabels } from './worldSetup.js';
import { createBuggy } from '../structures/buggy.js'; // Import the buggy creator
// Import SkeletonUtils using the namespace style
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

/**
 * Creates the structures for the central town area (chunk 0,0).
 * @param {THREE.Scene} scene - The scene to add the town elements to.
 * @param {object} config - The main configuration object.
 * @returns {Promise<Array<THREE.Object3D>>} - A promise that resolves with an array of collidable objects created in the town.
 */
export async function createTownCenter(scene, config) {
    console.log('🚀 createTownCenter invoked with config keys:', Object.keys(config));
    const collidableTownObjects = [];

    // --- Structures (Only in the central chunk, positions are relative to 0,0) ---
    // Create generic roads (excluding specific named streets)
    createRoads(scene, config.road, config.road.segments);

    // Create Bowen Street specifically
    const bowenStreetMesh = createBowenStreet(scene, config.bowenStreet, config.road, config.roadLabels);
    // Note: Bowen street mesh itself isn't collidable

    // Create Ken Pratt Blvd specifically
    const kenPrattBlvdMesh = createKenPrattBlvd(scene, config.kenPrattBlvd, config.road, config.roadLabels);
    // Note: Ken Pratt Blvd mesh itself isn't collidable

    // Create Pratt Street specifically (Eastern N/S road)
    const prattStreetMesh = createPrattStreet(scene, config.prattStreet, config.road, config.roadLabels);
    // Note: Pratt Street mesh itself isn't collidable

    // Create Colorado Ave specifically (Northern E/W road)
    const coloradoAveMesh = createColoradoAve(scene, config.coloradoAve, config.road, config.roadLabels);
    // Note: Colorado Ave mesh itself isn't collidable


    const parkingLot = createParkingLot(scene, config.parkingLot); // Defined relative to 0,0
    // Note: Parking lots are generally not collidable by the player walking

    // Create the truck in the parking lot
    const truck = await createTruck(scene, config.truck);
    truck.scale.set(0.6, 0.6, 0.6);
    truck.rotation.y += Math.PI;
    truck.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    collidableTownObjects.push(truck); // Add truck to collidables

    // Create and add buggy (errors handled so structures still load)
    console.log('Buggy config:', config.buggy);
    let buggyObj = null;
    try {
        buggyObj = await createBuggy(scene);
    } catch (err) {
        console.warn('Buggy failed to load:', err);
    }
    if (buggyObj) {
        buggyObj.traverse(c => c.isMesh && (c.castShadow = true));
        collidableTownObjects.push(buggyObj);
        
        // Dynamically import and initialize buggy interaction
        import('./buggyInteraction.js')
            .then(module => {
                window.initBuggyInteraction = module.initBuggyInteraction;
                window.interactWithBuggy = module.interactWithBuggy;
                window.canInteractWithBuggy = module.canInteractWithBuggy;
                // Pass the showPopup function from the game's UI system
                const popupFn = window.showPopup || (() => console.warn('Popup function not available'));
                module.initBuggyInteraction(buggyObj, popupFn);
                console.log('Buggy interaction system loaded and initialized');
            })
            .catch(err => {
                console.error('Failed to load buggy interaction system:', err);
            });
    }

    console.log('House1 config:', config.house);
    const house = createHouse(scene, config.house); // Defined relative to 0,0
    house.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    collidableTownObjects.push(house); // Add to collidables

    // Create the second house using its specific config
    const house2 = createHouse2(scene, config.house2);
    house2.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    collidableTownObjects.push(house2); // Add house2 to collidables

    // Create the third house using its specific config
    const house3 = createHouse3(scene, config.house3);
    house3.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    collidableTownObjects.push(house3); // Add house3 to collidables

    // Create the fourth house using its specific config
    const house4 = createHouse4(scene, config.house4);
    house4.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    collidableTownObjects.push(house4); // Add house4 to collidables

    // Create the fifth house using its specific config
    const house5 = createHouse5(scene, config.house5);
    house5.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    collidableTownObjects.push(house5); // Add house5 to collidables

    // Create the sixth house using its specific config
    const house6 = createHouse6(scene, config.house6);
    house6.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    collidableTownObjects.push(house6); // Add house6 to collidables

    const hospital = createHospital(scene, config.hospital); // Defined relative to 0,0
    hospital.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    collidableTownObjects.push(hospital); // Add to collidables

    const departmentBuilding = createDepartmentBuilding(scene, config.departmentBuilding); // Defined relative to 0,0
    departmentBuilding.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    collidableTownObjects.push(departmentBuilding); // Add to collidables

    const club = createClub(scene, config.club); // Create the club
    club.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    collidableTownObjects.push(club); // Add to collidables

    const scienceOffice = await createScienceOffice(scene, config.scienceOffice); // Create the science office
    if (scienceOffice) {
        scienceOffice.traverse((child) => { if (child.isMesh) child.castShadow = true; });
        collidableTownObjects.push(scienceOffice); // Add to collidables
    }

    const tavern = createTavern(scene, config.tavern); // Create the tavern
    tavern.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    collidableTownObjects.push(tavern); // Add to collidables

    const storageBuilding = createStorageBuilding(scene, config.storageBuilding); // Create the storage building
    storageBuilding.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    collidableTownObjects.push(storageBuilding); // Add to collidables

    const spyderWorkshop = createSpyderWorkshop(scene, config.spyderWorkshop); // Create the workshop
    spyderWorkshop.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    collidableTownObjects.push(spyderWorkshop); // Add to collidables

    const abandonedHouse = createAbandonedHouse(scene, config.abandonedHouse); // Create the abandoned house
    abandonedHouse.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    collidableTownObjects.push(abandonedHouse); // Add to collidables

    // Create the waterworks building
    const waterworks = createWaterPlantBuilding(scene, config.waterworks);
    waterworks.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    collidableTownObjects.push(waterworks);

    // Create the schoolhouse
    const schoolhouse = await createSchoolhouse(scene, config.schoolhouse);
    if (schoolhouse) {
        schoolhouse.traverse((child) => { if (child.isMesh) child.castShadow = true; });
        collidableTownObjects.push(schoolhouse);
    }

    // --- Load and place GLB Models ---

    // Load and place Mineshaft Entrance
    try {
        const mineshaftConfig = config.mineshaftEntrance;
        const gltf = await loadModel(mineshaftConfig.glbPath);
        // Clone the scene for this instance using SkeletonUtils
        const mineshaftModel = SkeletonUtils.clone(gltf.scene);

        mineshaftModel.position.set(mineshaftConfig.position.x, mineshaftConfig.position.y, mineshaftConfig.position.z);
        mineshaftModel.scale.set(mineshaftConfig.scale.x, mineshaftConfig.scale.y, mineshaftConfig.scale.z);
        if (mineshaftConfig.rotationY) {
            mineshaftModel.rotation.y = mineshaftConfig.rotationY;
        }
        mineshaftModel.name = "MineshaftEntrance";
        // Set userData for collision/exclusion using config size
        mineshaftModel.userData = {
            collidable: mineshaftConfig.collidable,
            boundingBoxSize: mineshaftConfig.size // Use config size for grass exclusion etc.
        };

        // Ensure shadows are cast/received (modelLoader should handle this, but double-check)
        mineshaftModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(mineshaftModel);
        if (mineshaftConfig.collidable) {
            collidableTownObjects.push(mineshaftModel);
        }
        console.log("Mineshaft Entrance loaded and placed at:", mineshaftConfig.position);

    } catch (error) {
        console.error("Error loading or placing Mineshaft Entrance:", error);
    }

    // Load and place the GLB House
    try {
        const houseGLBModel = await createHouseGLB(scene, config.houseGLB);
        if (houseGLBModel && houseGLBModel.userData.collidable) {
            collidableTownObjects.push(houseGLBModel);
        }
    } catch (error) {
        console.error("Error creating House GLB:", error);
    }

    // Load and place Warehouse GLB
    try {
        const whConfig = config.warehouse;
        const whGltf = await loadModel(whConfig.glbPath);
        const whModel = SkeletonUtils.clone(whGltf.scene);
        whModel.position.set(whConfig.position.x, whConfig.position.y, whConfig.position.z);
        whModel.scale.set(whConfig.scale.x, whConfig.scale.y, whConfig.scale.z);
        if (whConfig.rotationY) whModel.rotation.y = whConfig.rotationY;
        whModel.name = "Warehouse";
        whModel.userData = { collidable: whConfig.collidable, boundingBoxSize: whConfig.size };
        whModel.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
        scene.add(whModel);
        if (whConfig.collidable) collidableTownObjects.push(whModel);
        console.log("Warehouse GLB loaded and placed at:", whConfig.position);
    } catch (error) {
        console.error("Error creating Warehouse GLB:", error);
    }

    console.log("Town center created/updated including Water Plant, Schoolhouse, Mineshaft, and House GLB.");
    return collidableTownObjects;
}