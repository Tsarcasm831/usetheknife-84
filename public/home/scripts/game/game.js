import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
THREE.Cache.enabled = true;
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js'; // Import OrbitControls
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

import config from './config.js';
import { initControls, updateCameraRotation, getCurrentCameraAngleRad, getCurrentZoomLevel, getMovementVector, isCompassTogglePressed, keys } from './controls.js';
import { setupLights, createGroundChunks, setupGridAndLabels } from './scripts/world/worldSetup.js';
import { createWalls } from './scripts/structures/wall.js';
import { createTownCenter } from './scripts/world/town.js';
import { createRadChicken, updateRadChicken } from './scripts/world/rad_chicken.js'; // Import chicken functions
import { createPlayer, updatePlayer } from './scripts/world/player.js';
import { createBus } from './scripts/bus.js';
import { createCompass, updateCompass } from './scripts/ui/compass.js'; // Import compass functions
import * as MODEL_LOADER from './scripts/world/modelLoader.js'; // Import model loader
import { initStatusUI, updateStatus, showStatus, hideStatus, onStartGame } from './scripts/ui/loadingScreen.js'; // Import loading screen functions
import { initCredits } from './scripts/ui/credits.js'; // Import credits functions
import { createTalEhn, updateTalEhn } from './scripts/tal_ehn.js'; // Import Tal'Ehn NPC
import { createWwHuman, updateWwHuman, WW_HUMAN_GLB_URLS } from './scripts/world/ww_human.js';
import { initBuggyInteraction, interactWithBuggy, canInteractWithBuggy } from './scripts/world/buggyInteraction.js'; // Import buggy interaction system
import { createAlienArmored, updateAlienArmored } from './scripts/alien_armored.js';
import { createAlienMercenary, updateAlienMercenary } from './scripts/alien_mercenary.js';
import { createAnthromorph, updateAnthromorph } from './scripts/anthromorph.js';
import { createBill, updateBill } from './scripts/bill.js';
import { createHiveDrone, updateHiveDrone } from './scripts/hive_drone.js';
import { spawnFauna, updateFauna } from '../fauna.js';
import { createIvey, updateIvey } from './scripts/ivey.js';
import { createMercenary, updateMercenary } from './scripts/mercenary.js';
import { createPrometheanRobot, updatePrometheanRobot } from './scripts/promethean_robot.js';
import { createRanger, updateRanger } from './scripts/ranger.js';
import { createTalEhn2, updateTalEhn2 } from './scripts/tal_ehn_2.js';
import { createXris, updateXris } from './scripts/xris.js';
import { initPopupUI, showDialogue, showInventory, showPopup } from './scripts/ui/popupUI.js';
import { showWastelanderConversation } from './scripts/ui/wastelanderConversation.js';
import { showInventoryModal, isInventoryModalOpen } from './scripts/inventoryModal.js'; // Inventory modal overlay
import { createPineTree } from './scripts/world/pinetree.js';
import { createPineGrove } from './scripts/world/pinegrove.js';
import { createGrass } from './scripts/world/grass.js';
import { createAgavePlant } from './scripts/world/flora/agavePlant.js';
import { createBushes3 } from './scripts/world/flora/bushes3.js';
import { createGlowingBlueMushroom } from './scripts/world/flora/glowingBlueMushroom.js';
import { createLowPolyPlant } from './scripts/world/flora/lowPolyPlant.js';
import { createMushrooms } from './scripts/world/flora/mushrooms.js';
import { createMutaPlant } from './scripts/world/flora/mutaplant.js';
import { createMutaPlant2 } from './scripts/world/flora/mutaplant2.js';
import { createMutaPlant3 } from './scripts/world/flora/mutaplant3.js';
import { createPineForest } from './scripts/world/flora/pineforest.js';
import { createPotato } from './scripts/world/flora/potato.js';
import { createTallCornPlantHigh } from './scripts/world/flora/tallCornPlantHigh.js';

let scene, camera, renderer, player, clock, gridHelper, gridLabelsGroup, controls;
let workerRenderer = null; // OffscreenCanvas worker
let collidableObjects = []; // Array to hold all objects that the player can collide with
// Precomputed list of collidables excluding the player to avoid filtering each frame
let playerCollidables = [];
let bus; // Reference to the bus object
let allChickens = []; // Array to hold all chicken objects
let allTalEhns = []; // Array to hold all Tal'Ehn objects
let wwHuman; // Reference to the WwHuman object
let totalWorldSize = { x: 0, z: 0 }; // Initialize world size
let allCreatures = []; // Container for other spawned models
let interactableHumanoids = [];
let warehouseObject = null;
let clubObject = null; // track the club group for interaction
let tavernObject = null; // track the tavern group for interaction
const INTERACTION_DISTANCE = 2.0;
const collRadiusSq = 100; // Collision radius squared

let compassElement; // Store the compass DOM element
let isCompassVisible = false; // Track compass visibility
let isPaused = false; // Pause flag for when window is inactive
let pauseOverlay; // Fullscreen grey overlay for pause
document.addEventListener('visibilitychange', () => {
  isPaused = document.hidden;
  if (pauseOverlay) pauseOverlay.style.display = isPaused ? 'block' : 'none';
  if (!isPaused && clock) clock.getDelta();
});

// Toggle pause via Delete key
document.addEventListener('keydown', e => {
  if (e.code === 'Delete') {
    isPaused = !isPaused;
    if (pauseOverlay) pauseOverlay.style.display = isPaused ? 'block' : 'none';
    if (!isPaused && clock) clock.getDelta();
  }
});

/* @tweakable Intensity of the ambient light */
const ambientLightIntensity = 0.6;
/* @tweakable Intensity of the directional light */
const directionalLightIntensity = 0.9;

/**
 * Preloads essential GLB models and updates the loading status UI.
 * @returns {Promise<void>} A promise that resolves when all essential models are loaded or fail.
 */
async function preloadEssentialModels() {
    // Precomputed assets manifest at build time
    let essentialModelUrls = (await fetch('/assets/manifest.json').then(r => r.json()));

    if (essentialModelUrls.length === 0) {
        updateStatus(1, "No models to load.");
        setTimeout(hideStatus, 500); // Hide if nothing to load
        return Promise.resolve();
    }

    const totalModels = essentialModelUrls.length;
    let modelsLoaded = 0;

    showStatus(); // Show loading screen
    updateStatus(0, `Loading models 0 / ${totalModels}`);
    // Sequentially load each model to update status dynamically
    for (let i = 0; i < essentialModelUrls.length; i++) {
        const url = essentialModelUrls[i];
        try {
            // Load model with progress callback to update UI smoothly
            await MODEL_LOADER.loadModel(url, (fraction) => {
                updateStatus((modelsLoaded + fraction) / totalModels,
                    `Loading model ${modelsLoaded + 1} / ${totalModels}...`);
            });
            modelsLoaded++;
            // Ensure full fill on complete
            updateStatus(modelsLoaded / totalModels, `Loaded ${modelsLoaded} / ${totalModels}`);
        } catch (error) {
            modelsLoaded++;
            updateStatus(modelsLoaded / totalModels, `Error loading... ${modelsLoaded} / ${totalModels}`);
        }
    }
    return;
}


/**
 * Initializes the scene, camera, renderer, and game objects.
 */
async function init() {
    // --- Basic Setup ---
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc); // Light grey background

    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

    const container = document.getElementById('container');
    const gameCanvas = document.getElementById('game-canvas');
    // Initialize optimized main-thread renderer
    workerRenderer = null;
    renderer = new THREE.WebGLRenderer({
      canvas: gameCanvas,
      antialias: false, // disable antialias for performance
      powerPreference: 'high-performance'
    });
    // Lower pixel ratio for faster rendering
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = false; // disable shadows to reduce load

    clock = new THREE.Clock();

    // Background music managed by main.js playRandomBgm(), remove redundant WebAudio BGM init

    // --- Initialize UI Elements ---
    compassElement = createCompass(container); // Create compass UI
    initCredits(container); // Initialize credits UI
    initPopupUI(container); // Initialize popup UI
    initControls(); // Hook keyboard controls

    // Ensure container positioned for overlay
    container.style.position = 'relative';
    // Create and append pause overlay
    pauseOverlay = document.createElement('div');
    pauseOverlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background-color:rgba(128,128,128,0.5);display:none;pointer-events:none;z-index:9999';
    container.appendChild(pauseOverlay);

    // --- Setup World (can proceed after models are loaded/cached) ---
    const worldConfig = config.world;
    totalWorldSize.x = worldConfig.chunkSize.x * worldConfig.numChunks.x;
    totalWorldSize.z = worldConfig.chunkSize.z * worldConfig.numChunks.z;

    setupLights(scene, config, totalWorldSize, ambientLightIntensity, directionalLightIntensity);
    createGroundChunks(scene, config);

    try {
        const { gridHelper: createdGrid, gridLabelsGroup: createdLabels } = await setupGridAndLabels(scene, totalWorldSize);
        gridHelper = createdGrid;
        gridLabelsGroup = createdLabels;
    } catch (error) {
        // console.error("Error setting up grid and labels:", error);
    }

    const wallMeshes = createWalls(scene, config.world, config.wall);
    collidableObjects.push(...wallMeshes);

    // Town center creation is now async because it loads models via loading screen
    try {
        const townCollidables = await createTownCenter(scene, config);
        collidableObjects.push(...townCollidables);
        warehouseObject = townCollidables.find(obj => obj.name === 'Warehouse');
        clubObject      = townCollidables.find(obj => obj.name === 'ClubGroup');
        tavernObject    = townCollidables.find(obj => obj.name === 'TavernGroup');
        if (warehouseObject) {
            warehouseObject.userData.boundingBoxSize = config.warehouse.size;
            warehouseObject.userData.collidable = true;
        }
        if (clubObject) {
            clubObject.userData.boundingBoxSize = config.club.size;
            clubObject.userData.collidable = true;
        }
        if (tavernObject) {
            tavernObject.userData.boundingBoxSize = config.tavern.size;
            tavernObject.userData.collidable = true;
        }
    } catch (error) {
        // console.error("Error creating town center:", error);
        updateStatus(1, "Error loading town structures!");
    }
    // end town center creation

    // Create grass in world
    createGrass(scene, config.world, config.grass, config);

    // Spawn multiple pine trees outside central town chunk in its own block to avoid naming conflicts
    {
        const divisions = config.grid.divisions;
        const { numChunks } = config.world;
        const fullDivX = divisions * numChunks.x;
        const fullDivZ = divisions * numChunks.z;
        const centralXStart = Math.floor(numChunks.x / 2) * divisions;
        const centralXEnd = centralXStart + divisions;
        const centralZStart = Math.floor(numChunks.z / 2) * divisions;
        const centralZEnd = centralZStart + divisions;
        for (let i = 0; i < 1030; i++) {
            let x, z;
            do {
                x = Math.floor(Math.random() * fullDivX);
                z = Math.floor(Math.random() * fullDivZ);
            } while (
                x >= centralXStart && x < centralXEnd &&
                z >= centralZStart && z < centralZEnd
            );
            createPineTree(scene, x, z);
        }
        // Spawn 20 pine groves outside of town
        for (let i = 0; i < 20; i++) {
            let gx, gz;
            do {
                gx = Math.floor(Math.random() * fullDivX);
                gz = Math.floor(Math.random() * fullDivZ);
            } while (
                gx >= centralXStart && gx < centralXEnd &&
                gz >= centralZStart && gz < centralZEnd
            );
            createPineGrove(scene, gx, gz);
        }
    }
    // end spawn pine trees and groves

    // Spawn up to 20 of each other flora types outside town
    {
        const divisions = config.grid.divisions;
        const { numChunks } = config.world;
        const fullDivX = divisions * numChunks.x;
        const fullDivZ = divisions * numChunks.z;
        const centralXStart = Math.floor(numChunks.x / 2) * divisions;
        const centralXEnd = centralXStart + divisions;
        const centralZStart = Math.floor(numChunks.z / 2) * divisions;
        const centralZEnd = centralZStart + divisions;
        const floraCreators = [
            createAgavePlant,
            createBushes3,
            createGlowingBlueMushroom,
            createLowPolyPlant,
            createMushrooms,
            createMutaPlant,
            createMutaPlant2,
            createMutaPlant3,
            createPineForest,
            createPotato,
            createTallCornPlantHigh
        ];
        for (const createFlora of floraCreators) {
            for (let i = 0; i < 20; i++) {
                let x, z;
                do {
                    x = Math.floor(Math.random() * fullDivX);
                    z = Math.floor(Math.random() * fullDivZ);
                } while (
                    x >= centralXStart && x < centralXEnd &&
                    z >= centralZStart && z < centralZEnd
                );
                try {
                    const plant = await createFlora(scene, x, z);
                    if (plant) {
                        plant.userData.collidable = true;
                        plant.traverse(node => {
                            if (node.isMesh) {
                                node.userData.collidable = true;
                                collidableObjects.push(node);
                            }
                        });
                    }
                } catch (err) {
                    console.warn('Failed to spawn flora:', err);
                }
            }
        }
    }
    // end spawn flora types

    // --- Setup Player and NPCs (reliant on preloaded models) ---
    try {
        player = await createPlayer(scene, config, totalWorldSize);
        if (player) collidableObjects.push(player);
    } catch(error) {
        // console.error("Failed to create Player:", error);
    }

    try {
        const chickenConfig = config.radChicken;
        const gridConfig = config.grid;
        const fullDivX = gridConfig.divisions * worldConfig.numChunks.x;
        const fullDivZ = gridConfig.divisions * worldConfig.numChunks.z;
        const cellSizeX = worldConfig.chunkSize.x / gridConfig.divisions;
        const cellSizeZ = worldConfig.chunkSize.z / gridConfig.divisions;
        const radChicken = await createRadChicken(scene, {
            ...chickenConfig,
            position: {
                x: (chickenConfig.gridPosition.x - fullDivX/2) * cellSizeX,
                y: chickenConfig.yOffset,
                z: (chickenConfig.gridPosition.z - fullDivZ/2) * cellSizeZ
            }
        }, worldConfig, gridConfig);

        if (radChicken) {
             radChicken.userData.collidable = true;
             radChicken.traverse(node => {
                if (node.isMesh) {
                    node.userData.collidable = true;
                    collidableObjects.push(node);
                }
            });
             allChickens.push(radChicken);
        }
    } catch (error) {
        // console.error("Failed to create Rad Chicken:", error);
    }

    try {
        const talEhnConfig = config.talEhn;
        const gridConfig = config.grid;
        const talEhn = await createTalEhn(scene, talEhnConfig, worldConfig, gridConfig);
        if (talEhn) {
            talEhn.userData.collidable = true;
            talEhn.traverse(node => {
                if (node.isMesh) {
                    node.userData.collidable = true;
                    collidableObjects.push(node);
                }
            });
            allTalEhns.push(talEhn);
            interactableHumanoids.push(talEhn);
        }
    } catch (error) {
        // console.error("Failed to create Tal'Ehn:", error);
    }

    try {
        const wwConfig = config.wwHuman.spawnConfig;
        const gridConfig = config.grid;
        // Compute absolute position from full-world grid coords
        const fullDivX = gridConfig.divisions * worldConfig.numChunks.x;
        const fullDivZ = gridConfig.divisions * worldConfig.numChunks.z;
        const cellSizeX = worldConfig.chunkSize.x / gridConfig.divisions;
        const cellSizeZ = worldConfig.chunkSize.z / gridConfig.divisions;
        const position = {
            x: (wwConfig.gridPosition.x - fullDivX/2) * cellSizeX,
            y: wwConfig.yOffset,
            z: (wwConfig.gridPosition.z - fullDivZ/2) * cellSizeZ
        };
        const wwObj = await createWwHuman(scene, { ...wwConfig, position }, worldConfig, gridConfig);
        if (wwObj) {
            wwObj.userData.collidable = true;
            wwObj.traverse(node => {
                if (node.isMesh) {
                    node.userData.collidable = true;
                    collidableObjects.push(node);
                }
            });
            wwHuman = wwObj;
            interactableHumanoids.push(wwHuman);
        }
    } catch (error) {
        // console.error("Failed to create WwHuman:", error);
    }

    bus = createBus(scene, config.bus);
    // Compute grid-to-world conversion for creatures
    const gridCfg = config.grid;
    const fullDivX = gridCfg.divisions * worldConfig.numChunks.x;
    const fullDivZ = gridCfg.divisions * worldConfig.numChunks.z;
    const cellSizeX = worldConfig.chunkSize.x / gridCfg.divisions;
    const cellSizeZ = worldConfig.chunkSize.z / gridCfg.divisions;
    const baseGridX = 66, baseGridZ = 108, spacingX = 2;

    if (bus) collidableObjects.push(bus);

    // Spawn additional creatures
    try {
        // Animation map for each creature (animation type: relative GLB path)
        const animationMaps = {
            AlienArmored: {
                idle: '/assets/Alien_armored/biped/Animation_Idle_02_withSkin.glb',
                walk: '/assets/Alien_armored/biped/Animation_Walking_withSkin.glb',
                run: '/assets/Alien_armored/biped/Animation_Running_withSkin.glb',
                alert: '/assets/Alien_armored/biped/Animation_Alert_withSkin.glb',
                confused: '/assets/Alien_armored/biped/Animation_Confused_Scratch_withSkin.glb',
                injured_walk: '/assets/Alien_armored/biped/Animation_Injured_Walk_withSkin.glb',
                run2: '/assets/Alien_armored/biped/Animation_Run_02_withSkin.glb',
            },
            AlienMercenary: {
                idle: '/assets/alien_mercenary/biped/Animation_Idle_02_withSkin.glb',
                walk: '/assets/alien_mercenary/biped/Animation_Walking_withSkin.glb',
                run: '/assets/alien_mercenary/biped/Animation_Running_withSkin.glb',
            },
            Anthromorph: {
                idle: '/assets/Anthromorph/biped/Animation_Idle_02_withSkin.glb',
                walk: '/assets/Anthromorph/biped/Animation_Walking_withSkin.glb',
                run: '/assets/Anthromorph/biped/Animation_Running_withSkin.glb',
                alert: '/assets/Anthromorph/biped/Animation_Alert_withSkin.glb',
                casual_walk: '/assets/Anthromorph/biped/Animation_Casual_Walk_withSkin.glb',
                combat: '/assets/Anthromorph/biped/Animation_Combat_Stance_withSkin.glb',
                dead: '/assets/Anthromorph/biped/Animation_Dead_withSkin.glb',
                listen: '/assets/Anthromorph/biped/Animation_Listening_Gesture_withSkin.glb',
                mummy_stagger: '/assets/Anthromorph/biped/Animation_Mummy_Stagger_withSkin.glb',
                runfast: '/assets/Anthromorph/biped/Animation_RunFast_withSkin.glb',
                run2: '/assets/Anthromorph/biped/Animation_Run_02_withSkin.glb',
                skill1: '/assets/Anthromorph/biped/Animation_Skill_01_withSkin.glb',
                skill3: '/assets/Anthromorph/biped/Animation_Skill_03_withSkin.glb',
                slow_orc_walk: '/assets/Anthromorph/biped/Animation_Slow_Orc_Walk_withSkin.glb',
            },
            Bill: {
                idle: '/assets/Bill/biped/Animation_Idle_02_withSkin.glb',
                walk: '/assets/Bill/biped/Animation_Walking_withSkin.glb',
                run: '/assets/Bill/biped/Animation_Running_withSkin.glb',
                alert: '/assets/Bill/biped/Animation_Alert_withSkin.glb',
                casual_walk: '/assets/Bill/biped/Animation_Casual_Walk_withSkin.glb',
                dozing: '/assets/Bill/biped/Animation_Dozing_Elderly_withSkin.glb',
            },
            HiveDrone: {
                walk: '/assets/hive_drone/biped/Animation_Walking_withSkin.glb',
                run: '/assets/hive_drone/biped/Animation_Running_withSkin.glb',
            },
            Ivey: {
                idle: '/assets/Ivey/biped/Animation_Idle_02_withSkin.glb',
                walk: '/assets/Ivey/biped/Animation_Walking_withSkin.glb',
                run: '/assets/Ivey/biped/Animation_Running_withSkin.glb',
                run2: '/assets/Ivey/biped/Animation_Run_02_withSkin.glb',
                texting_walk: '/assets/Ivey/biped/Animation_Texting_Walk_withSkin.glb',
            },
            Mercenary: {
                idle: '/assets/mercenary/biped/Animation_Idle_02_withSkin.glb',
                walk: '/assets/mercenary/biped/Animation_Walking_withSkin.glb',
                run: '/assets/mercenary/biped/Animation_Running_withSkin.glb',
                alert: '/assets/mercenary/biped/Animation_Alert_withSkin.glb',
            },
            PrometheanRobot: {
                idle: '/assets/Promethean%20Robot/biped/Animation_Idle_02_withSkin.glb',
                walk: '/assets/Promethean%20Robot/biped/Animation_Walking_withSkin.glb',
                run: '/assets/Promethean%20Robot/biped/Animation_Running_withSkin.glb',
                dead: '/assets/Promethean%20Robot/biped/Animation_Dead_withSkin.glb',
                slow_orc_walk: '/assets/Promethean%20Robot/biped/Animation_Slow_Orc_Walk_withSkin.glb',
                unsteady_walk: '/assets/Promethean%20Robot/biped/Animation_Unsteady_Walk_withSkin.glb',
            },
            Ranger: {
                idle: '/assets/ranger/biped/Animation_Idle_02_withSkin.glb',
                walk: '/assets/ranger/biped/Animation_Walking_withSkin.glb',
                run: '/assets/ranger/biped/Animation_Running_withSkin.glb',
                listen: '/assets/ranger/biped/Animation_Listening_Gesture_withSkin.glb',
                chat: '/assets/ranger/biped/Animation_Stand_and_Chat_withSkin.glb',
            },
            TalEhn2: {
                idle: '/assets/tal_ehn_2/biped/Animation_Idle_02_withSkin.glb',
                walk: '/assets/tal_ehn_2/biped/Animation_Walking_withSkin.glb',
                run: '/assets/tal_ehn_2/biped/Animation_Running_withSkin.glb',
                listen: '/assets/tal_ehn_2/biped/Animation_Listening_Gesture_withSkin.glb',
                phone: '/assets/tal_ehn_2/biped/Animation_Phone_Call_Gesture_withSkin.glb',
                happy_jump: '/assets/tal_ehn_2/biped/Animation_happy_jump_m_withSkin.glb',
            },
            Xris: {
                idle: '/assets/Xris/biped/Animation_Idle_02_withSkin.glb',
                idle2: '/assets/Xris/biped/Animation_Idle_withSkin.glb',
                walk: '/assets/Xris/biped/Animation_Walking_withSkin.glb',
                run: '/assets/Xris/biped/Animation_Running_withSkin.glb',
                runfast: '/assets/Xris/biped/Animation_RunFast_withSkin.glb',
                run3: '/assets/Xris/biped/Animation_Run_03_withSkin.glb',
                alert: '/assets/Xris/biped/Animation_Alert_withSkin.glb',
                casual_walk: '/assets/Xris/biped/Animation_Casual_Walk_withSkin.glb',
                injured_walk: '/assets/Xris/biped/Animation_Injured_Walk_withSkin.glb',
                chat: '/assets/Xris/biped/Animation_Stand_and_Chat_withSkin.glb',
            }
        };
        // Creature spawn order must match above
        const creatureList = [
            { fn: createAlienArmored, anims: animationMaps.AlienArmored },
            { fn: createAlienMercenary, anims: animationMaps.AlienMercenary },
            { fn: createAnthromorph, anims: animationMaps.Anthromorph },
            { fn: createBill, anims: animationMaps.Bill },
            { fn: createHiveDrone, anims: animationMaps.HiveDrone },
            { fn: createIvey, anims: animationMaps.Ivey },
            { fn: createMercenary, anims: animationMaps.Mercenary },
            { fn: createPrometheanRobot, anims: animationMaps.PrometheanRobot },
            { fn: createRanger, anims: animationMaps.Ranger },
            { fn: createTalEhn2, anims: animationMaps.TalEhn2 },
            { fn: createXris, anims: animationMaps.Xris }
        ];
        for (let i = 0; i < creatureList.length; i++) {
            const { fn, anims } = creatureList[i];
            // console.log(`Trying spawn #${i}:`, anims);

            let obj;
            try {
                // No 'path' variable in new anims-based logic; just log the anim map
                obj = await fn(scene, anims);
                // console.log(`Spawned creature #${i}: ${obj.name} at`, obj.position);
            } catch (err) {
                // console.error(`Error spawning creature #${i}:`, err);
                continue;
            }
            // Snap to grid for non-patrol creatures
            if (!obj.userData?.patrolPoints) {
                let gx = baseGridX + i * spacingX;
                let gz = baseGridZ;
                // Override default positions:
                if (obj.name === 'Bill') {
                    gx = 87; gz = 88;
                }
                if (obj.name === 'AlienArmored') {
                    gx = 65; gz = 98;
                }
                if (obj.name === 'AlienMercenary') {
                    gx = 75; gz = 71;
                }
                if (obj.name === 'HiveDrone') {
                    gx = 68; gz = 103;
                }
                if (obj.name === 'Ivey') {
                    gx = 83; gz = 80;
                }
                if (obj.name === 'Mercenary') {
                    gx = 81; gz = 70;
                }
                if (obj.name === 'PrometheanRobot') {
                    gx = 73; gz = 57;
                }
                if (obj.name === 'Ranger') {
                    gx = 65; gz = 93;
                }
                if (obj.name === 'TalEhn2') {
                    gx = 62; gz = 62;
                }
                if (obj.name === 'Xris') {
                    gx = 69; gz = 61;
                }
                const wx = (gx - fullDivX / 2) * cellSizeX;
                const wz = (gz - fullDivZ / 2) * cellSizeZ;
                obj.position.set(wx, obj.position.y, wz);
            }
            obj.updateMatrixWorld(true);
            obj.userData.collidable = true;
            obj.traverse(node => {
                if (node.isMesh) {
                    node.userData.collidable = true;
                    collidableObjects.push(node);
                }
            });
            allCreatures.push(obj);
            // Make script-based creature interactable
            interactableHumanoids.push(obj);
        }
    } catch (error) {
        // console.error('Failed to spawn creatures:', error);
    }
    
    // Spawn radiation fauna outside town
    try {
        console.log('Spawning radiation fauna outside town...');
        // Create a simple progress function or pass null
        const faunaProgress = progress => console.log(`Fauna loading: ${Math.round(progress * 100)}%`);
        const faunaCreatures = await spawnFauna(scene, faunaProgress);
        // Add fauna to collidable objects and creatures list
        for (const fauna of faunaCreatures) {
            fauna.updateMatrixWorld(true);
            fauna.userData.collidable = true;
            fauna.traverse(node => {
                if (node.isMesh) {
                    node.userData.collidable = true;
                    collidableObjects.push(node);
                }
            });
            allCreatures.push(fauna);
        }
    } catch (error) {
        console.error('Failed to spawn fauna:', error);
    }

    // --- Final Setup ---
    window.addEventListener('resize', onWindowResize);
    // Precompute player collidables once after all objects are added
    playerCollidables = collidableObjects.filter(obj => obj !== player);
    animate(); // Start the animation loop
}

/**
 * Checks proximity to humanoids and triggers interaction.
 * @returns {boolean} true if interacted with a humanoid.
 */
async function interactWithHumanoids() {
    if (!player) return false;
    const playerPos = player.position;
    let interacted = false;
    for (const obj of interactableHumanoids) {
        if (!obj) continue;
        const dist = playerPos.distanceTo(obj.position);
        if (dist <= INTERACTION_DISTANCE) {
            interacted = true;
            if (obj.userData) obj.userData.paused = true;
            if (obj.name === 'WwHuman') {
                const choice = await showPopup({
                    title: 'Wastelander',
                    html: '<b>How can I help you?</b>',
                    buttons: [
                        { label: 'Talk', value: 'talk' },
                        { label: 'Gossip', value: 'gossip' },
                        { label: 'Cancel', value: 'cancel' }
                    ]
                });
                if (choice === 'talk') {
                    isPaused = true;
                    showWastelanderConversation(() => {
                        isPaused = false;
                        if (obj.userData) obj.userData.paused = false;
                    });
                } else if (choice === 'gossip') {
                    showDialogue('Wastelander', [
                        "Rumor is, the mutants have been seen closer to the river lately.",
                        "Some say there's something valuable hidden in the ruins north of here."
                    ], () => {
                        if (obj.userData) obj.userData.paused = false;
                    });
                } else {
                    if (obj.userData) obj.userData.paused = false;
                }
            } else if (obj.name === 'TalEhn2') {
                // Custom popup for TalEhn2: pause animation during conversation
                if (obj.userData?.mixer) obj.userData.mixer.timeScale = 0;
                const choice2 = await showPopup({
                    title: 'TalEhn II',
                    html: '<b>Greetings traveler, I am TalEhn2. What would you like to know?</b>',
                    buttons: [
                        { label: 'This place', value: 'world' },
                        { label: 'Your story', value: 'story' },
                        { label: 'Goodbye', value: 'bye' }
                    ]
                });
                // handle responses (add custom logic if needed)
                if (obj.userData) {
                    // resume movement and animation
                    obj.userData.paused = false;
                    if (obj.userData.mixer) obj.userData.mixer.timeScale = 1;
                }
            } else {
                // Default interaction for other humanoids
                showDialogue(obj.name, [`You interacted with ${obj.name}.`], () => {
                    if (obj.userData) {
                        obj.userData.paused = false;
                        if (obj.userData.idleAction) obj.userData.idleAction.stop();
                        if (obj.userData.walkAction) obj.userData.walkAction.reset().play();
                    }
                });
            }

        }
    }
    return interacted;
}

/**
 * Handles interacting with buildings (e.g., Bill's warehouse).
 */
function interactWithBuildings() {
    // console.log('enter interactWithBuildings', {
    //     playerX: player.position.x,
    //     playerZ: player.position.z,
    //     warehouseX: warehouseObject?.position.x,
    //     warehouseZ: warehouseObject?.position.z,
    //     boundingBoxSize: warehouseObject?.userData?.boundingBoxSize
    // });
    if (warehouseObject && warehouseObject.userData?.boundingBoxSize) {
        const size = warehouseObject.userData.boundingBoxSize;
        const halfX = size.x / 2;
        const halfZ = size.z / 2;
        const dx = Math.abs(player.position.x - warehouseObject.position.x);
        const dz = Math.abs(player.position.z - warehouseObject.position.z);
        // console.log('interactWithBuildings distances', { dx, dz, threshX: halfX + INTERACTION_DISTANCE, threshZ: halfZ + INTERACTION_DISTANCE });
        if (dx <= halfX + INTERACTION_DISTANCE && dz <= halfZ + INTERACTION_DISTANCE) {
            // console.log('Within range of Bill\'s Warehouse - triggering showPopup');
            showPopup({
                title: "Bill's Warehouse",
                html: "Do you want to enter Bill's Garage?",
                buttons: [{ label: "No", value: "no" }, { label: "Yes", value: "yes" }]
            }).then(value => {
                // console.log('popup response:', value);
                if (value === 'yes') enterBillsGarage();
            });
        }
    }
}

/**
 * Handle interacting with the club at specific grid spots.
 * @returns {boolean} true if interaction was triggered.
 */
function interactWithClub() {
    // console.log('enter interactWithClub', { clubObjectName: clubObject?.name, clubBoundingSize: config.club?.size });
    if (!clubObject || !config.club?.size) return false;
    // Use club bounding size for interaction
    const size = config.club.size;
    const halfX = size.x / 2;
    const halfZ = size.z / 2;
    const dx = Math.abs(player.position.x - clubObject.position.x);
    const dz = Math.abs(player.position.z - clubObject.position.z);
    // console.log('interactWithClub distances', { dx, dz, threshX: halfX + INTERACTION_DISTANCE, threshZ: halfZ + INTERACTION_DISTANCE });
    if (dx <= halfX + INTERACTION_DISTANCE && dz <= halfZ + INTERACTION_DISTANCE) {
        showPopup({
            title: "Diamond's Club",
            html: "Do you want to enter Diamond's Club?",
            buttons: [{ label: "No", value: "no" }, { label: "Yes", value: "yes" }]
        }).then(value => {
            if (value === 'yes') enterDiamondsClub();
        });
        return true;
    }
    return false;
}

/**
 * Handle interacting with the tavern at specific grid spots.
 * @returns {boolean} true if interaction was triggered.
 */
function interactWithTavern() {
    // console.log('enter interactWithTavern', { tavernObjectName: tavernObject?.name, tavernBoundingSize: config.tavern?.size });
    if (!tavernObject || !config.tavern?.size) return false;
    // Use tavern bounding size for interaction
    const size = config.tavern.size;
    const halfX = size.x / 2;
    const halfZ = size.z / 2;
    const dx = Math.abs(player.position.x - tavernObject.position.x);
    const dz = Math.abs(player.position.z - tavernObject.position.z);
    // console.log('interactWithTavern distances', { dx, dz, threshX: halfX + INTERACTION_DISTANCE, threshZ: halfZ + INTERACTION_DISTANCE });
    if (dx <= halfX + INTERACTION_DISTANCE && dz <= halfZ + INTERACTION_DISTANCE) {
        showPopup({
            title: "Martha's Tavern",
            html: "Do you want to enter Martha's Tavern?",
            buttons: [{ label: "No", value: "no" }, { label: "Yes", value: "yes" }]
        }).then(value => {
            if (value === 'yes') enterMarthasTavern();
        });
        return true;
    }
    return false;
}

/**
 * Main interaction handler bound to the F key.
 */
async function interact() {
    // console.log('interact() called');
    const humanoidHit = await interactWithHumanoids();
    // console.log('interactWithHumanoids ->', humanoidHit);
    if (humanoidHit) return;

    // Check if buggy interaction is available and try to use it
    if (window.interactWithBuggy) {
        try {
            // Pass the player object to the buggy interaction
            const buggyHit = await window.interactWithBuggy(player);
            console.log('Buggy interaction result:', buggyHit);
            if (buggyHit) return;
        } catch (err) {
            console.warn('Buggy interaction failed:', err);
        }
    }

    const clubHit = interactWithClub();
    // console.log('interactWithClub ->', clubHit);
    if (clubHit) return;

    const tavernHit = interactWithTavern();
    // console.log('interactWithTavern ->', tavernHit);
    if (tavernHit) return;

    interactWithBuildings();
}

// Bind F key to interaction
document.addEventListener('keydown', e => {
    if (e.code === 'KeyF') {
        // console.log('KeyF pressed, calling interact()');
        interact().catch(() => {});
    }
});

// Toggle inventory modal on 'I' key
document.addEventListener('keydown', event => {
    if (event.code === 'KeyI') {
        showInventoryModal(); // Now toggles open/close
    }
});

// Flag to ensure grid toggle logic runs only once per press
let gridToggleProcessed = false;
// Track if the bus is currently moving
let busMoving = false;

/**
 * The main animation loop.
 */
let frameCounter = 0;
let lastHeartbeat = performance.now();
let lastFrameTime = performance.now();
let freezeWarned = false;

// Pre-allocated temp objects to avoid per-frame allocations
const _projScreenMat = new THREE.Matrix4();
const _frustum = new THREE.Frustum();
const _tempVec = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
const _startPos = new THREE.Vector3();

function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    // Heartbeat log every 5 seconds
    if (now - lastHeartbeat > 5000) {
        // console.log('[ANIMATE] Heartbeat at', new Date().toLocaleTimeString());
        // Log memory usage if available
        if (window.performance && performance.memory) {
            const mem = performance.memory;
            // console.log(`[ANIMATE] JS Heap: ${(mem.usedJSHeapSize/1048576).toFixed(2)} MB / ${(mem.totalJSHeapSize/1048576).toFixed(2)} MB`);
        }
        // console.log('[ANIMATE] Array sizes:', {
        //     collidableObjects: collidableObjects.length,
        //     allChickens: allChickens.length,
        //     allTalEhns: allTalEhns.length,
        //     allCreatures: allCreatures.length,
        //     interactableHumanoids: interactableHumanoids.length
        // });
        // THREE.js scene resource diagnostics
        let meshCount = 0, materialCount = 0, geometryCount = 0;
        scene.traverse(obj => {
            if (obj.isMesh) {
                meshCount++;
                if (obj.material) materialCount++;
                if (obj.geometry) geometryCount++;
            }
        });
        let mixerCount = 0;
        // Try to count AnimationMixers if stored on objects
        if (player && player.userData && player.userData.mixer) mixerCount++;
        allChickens.forEach(obj => { if (obj.userData && obj.userData.mixer) mixerCount++; });
        allTalEhns.forEach(obj => { if (obj.userData && obj.userData.mixer) mixerCount++; });
        allCreatures.forEach(obj => { if (obj.userData && obj.userData.mixer) mixerCount++; });
        // console.log('[ANIMATE] Scene diagnostics:', {
        //     sceneChildren: scene.children.length,
        //     meshCount,
        //     materialCount,
        //     geometryCount,
        //     mixerCount
        // });
        lastHeartbeat = now;
    }
    // Freeze detection: warn if loop stalls for >2s
    if (now - lastFrameTime > 2000 && !freezeWarned) {
        freezeWarned = true;
        // console.warn('[ANIMATE] Detected possible freeze! Last frame was', ((now - lastFrameTime)/1000).toFixed(2), 'seconds ago');
    }
    lastFrameTime = now;
    if (freezeWarned && now - lastFrameTime < 1000) freezeWarned = false;
    if (isPaused) return; // Skip updates when paused
    const deltaTime = clock.getDelta();
    frameCounter++;
    const heavyUpdate = frameCounter % 5 === 0;

    // Update camera rotation based on Q/E input
    updateCameraRotation(deltaTime);
    const cameraAngle = getCurrentCameraAngleRad();
    const zoomLevel = getCurrentZoomLevel();

    // Animation vs movement speed factors
    const animFactor = 0.5;
    const moveFactor = animFactor * 1.15; // 15% more lateral movement without speeding animations

    // Update Player (Position, Collision, Rotation, Animation)
    if (player) {
        // Use precomputed obstacles list
        const obstacles = playerCollidables;
        updatePlayer(player, deltaTime, obstacles, scene, config, totalWorldSize);

        // Update Camera Position to follow player
        const playerPosition = player.position;
        const baseOffset = config.camera.offset; // Get base offset from config
        const lookAtOffset = config.camera.lookAtOffset;

        // Apply rotation to the base offset
        const rotatedOffsetX = baseOffset.x * Math.cos(cameraAngle) - baseOffset.z * Math.sin(cameraAngle);
        const rotatedOffsetZ = baseOffset.x * Math.sin(cameraAngle) + baseOffset.z * Math.cos(cameraAngle);

        // Apply zoom multiplier to the offset components
        const effectiveOffsetX = rotatedOffsetX * zoomLevel;
        const effectiveOffsetY = baseOffset.y * zoomLevel; // Zoom affects height too
        const effectiveOffsetZ = rotatedOffsetZ * zoomLevel;

        camera.position.x = playerPosition.x + effectiveOffsetX;
        camera.position.y = playerPosition.y + effectiveOffsetY; // Adjust Y based on zoom
        camera.position.z = playerPosition.z + effectiveOffsetZ;

        // Make the camera look slightly above the player's feet
        camera.lookAt(playerPosition.x, playerPosition.y + lookAtOffset.y, playerPosition.z);
    }

    // Build view frustum for culling
    _projScreenMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    _frustum.setFromProjectionMatrix(_projScreenMat);

    // Update Chickens with collision
    allChickens.forEach(chicken => {
        if (!_frustum.containsPoint(chicken.position)) return;
        // Advance chicken animations
        if (chicken.userData.mixer) chicken.userData.mixer.update(deltaTime * animFactor);
        updateRadChicken(chicken, player, deltaTime * moveFactor, collidableObjects, scene);
    });

    // Update Tal'Ehns with collision
    allTalEhns.forEach(ehn => {
        if (!_frustum.containsPoint(ehn.position)) return;
        // Advance Tal'Ehn animations
        if (ehn.userData.mixer) ehn.userData.mixer.update(deltaTime * animFactor);
        updateTalEhn(ehn, deltaTime * moveFactor, collidableObjects, scene);
    });

    // Update WwHuman
    if (wwHuman && _frustum.containsPoint(wwHuman.position)) updateWwHuman(wwHuman, deltaTime * moveFactor);

    // Update AI creatures with collision
    allCreatures.forEach(cre => {
        if (!_frustum.containsPoint(cre.position)) return;
        // Advance AI animations
        if (cre.userData.mixer) cre.userData.mixer.update(deltaTime * animFactor);
        const obstaclesCre = collidableObjects;
        if (cre.name === 'AlienArmored') {
            updateAlienArmored(cre, deltaTime * moveFactor, obstaclesCre, scene);
        } else if (cre.name === 'AlienMercenary') {
            updateAlienMercenary(cre, deltaTime * moveFactor, obstaclesCre, scene);
        } else if (cre.name === 'HiveDrone') {
            updateHiveDrone(cre, deltaTime * moveFactor, obstaclesCre, scene);
        } else if (cre.name === 'RadBear' || cre.name === 'RadCow' || cre.name === 'RadFox') {
            // Skip RadChicken here as it's updated separately in allChickens loop
            updateFauna(cre, deltaTime * moveFactor, obstaclesCre, scene);
        } else if (cre.name === 'Ranger') {
            updateRanger(cre, deltaTime * moveFactor, obstaclesCre, scene);
        } else if (cre.name === 'Mercenary') {
            updateMercenary(cre, deltaTime * moveFactor, obstaclesCre, scene);
        } else if (cre.name === 'TalEhn2') {
            updateTalEhn2(cre, deltaTime * moveFactor, obstaclesCre, scene);
        } else if (cre.userData?.patrolPoints) {
            updateAnthromorph(cre, deltaTime * moveFactor, obstaclesCre, scene);
        }
    });

    // Clamp characters within world bounds
    const clampToBounds = (obj) => {
        const bounds = obj?.userData?.boundaries || obj?.userData?.worldBounds;
        if (bounds && obj.position) {
            obj.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, obj.position.x));
            obj.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, obj.position.z));
        }
    };
    clampToBounds(player);
    allChickens.forEach(clampToBounds);
    allTalEhns.forEach(clampToBounds);
    allCreatures.forEach(clampToBounds);

    // Update Bus Logic
    if (bus && player && config.bus.targetPosition) {
        const busConfig = config.bus;
        const distanceToPlayerSq = bus.position.distanceToSquared(player.position);
        _targetPos.set(busConfig.targetPosition.x, busConfig.targetPosition.y, busConfig.targetPosition.z);
        _startPos.set(config.bus.position.x, config.bus.position.y, config.bus.position.z); // Use original config pos as start

        if (distanceToPlayerSq < busConfig.triggerDistance * busConfig.triggerDistance && !busMoving) {
            // Move towards target if player is close and not already moving
             _tempVec.subVectors(_targetPos, bus.position).normalize(); // reuse tempVec for direction
             const moveStep = busConfig.moveSpeed * deltaTime;
             const distanceToTarget = bus.position.distanceTo(_targetPos);

             if (distanceToTarget > moveStep) {
                 bus.position.add(_tempVec.multiplyScalar(moveStep));
             } else {
                 bus.position.copy(_targetPos); // Snap to target
                 busMoving = true; // Mark as having moved (or reached target)
             }
        } else if (distanceToPlayerSq >= busConfig.triggerDistance * busConfig.triggerDistance && busMoving) {
             // Move back to start if player moved away and bus had moved
             _tempVec.subVectors(_startPos, bus.position).normalize(); // reuse tempVec for reverse direction
             const moveStep = busConfig.moveSpeed * deltaTime;
             const distanceToStart = bus.position.distanceTo(_startPos);

             if (distanceToStart > moveStep) {
                 bus.position.add(_tempVec.multiplyScalar(moveStep));
             } else {
                 bus.position.copy(_startPos); // Snap to start
                 busMoving = false; // Mark as returned to start
             }
        }
         bus.updateMatrixWorld(); // Update world matrix after position change
    }

    // Toggle Grid Visibility with 'G' key
    if (keys[config.grid.toggleKey] && !gridToggleProcessed) {
        if (gridHelper) gridHelper.visible = !gridHelper.visible;
        if (gridLabelsGroup) gridLabelsGroup.visible = !gridLabelsGroup.visible;
        gridToggleProcessed = true;
        // console.log("Grid visibility toggled:", gridHelper ? gridHelper.visible : 'N/A');
    }
    // Reset the flag when the key is released
    if (!keys[config.grid.toggleKey]) {
        gridToggleProcessed = false;
    }

    // Toggle Compass Visibility with 'C' key
    if (isCompassTogglePressed()) { // Check the one-shot toggle from controls.js
        isCompassVisible = !isCompassVisible;
        if (compassElement) {
            compassElement.style.display = isCompassVisible ? 'block' : 'none';
            // console.log("Compass visibility toggled:", isCompassVisible);
        }
    }

    // Update Compass Needle if visible
    if (isCompassVisible) {
        updateCompass(cameraAngle); // Pass current camera angle
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// --- Background Music Logic ---
// Preload disabled until playback to reduce startup lag
const bgmTracks = [
    './assets/sounds/town1.mp3',
    './assets/sounds/town2.mp3',
    "./assets/sounds/Shadow's Whisper.mp3",
    './assets/sounds/bg3.mp3'
];
let lastBgmIndex = null; // track last played background music index
const bgAudio = document.getElementById('bgAudio') || new Audio();
bgAudio.preload = 'none';
bgAudio.volume = 0.5;
window.bgAudio = bgAudio; // expose audio element globally for controls
function playRandomBgm() {
    let idx;
    if (bgmTracks.length > 1) {
        do {
            idx = Math.floor(Math.random() * bgmTracks.length);
        } while (idx === lastBgmIndex);
    } else {
        idx = 0;
    }
    lastBgmIndex = idx;
    const trackUrl = bgmTracks[idx];
    bgAudio.src = trackUrl;
    bgAudio.load();
    bgAudio.play().catch(() => {});
}
window.playRandomBgm = playRandomBgm; // expose globally
bgAudio.addEventListener('ended', () => setTimeout(window.playRandomBgm, 0));

// --- Enhanced Track Controls ---
function playTrack(idx) {
    lastBgmIndex = idx;
    const trackUrl = bgmTracks[idx];
    bgAudio.src = trackUrl;
    bgAudio.load();
    bgAudio.play().catch(() => {});
}
function togglePlay() {
    if (bgAudio.paused) bgAudio.play().catch(() => {});
    else bgAudio.pause();
}
function nextTrack() {
    const idx = lastBgmIndex != null ? (lastBgmIndex + 1) % bgmTracks.length : 0;
    playTrack(idx);
}
function prevTrack() {
    const idx = lastBgmIndex != null
        ? (lastBgmIndex - 1 + bgmTracks.length) % bgmTracks.length
        : 0;
    playTrack(idx);
}
function getCurrentTrackName() {
    return lastBgmIndex != null
        ? bgmTracks[lastBgmIndex].split('/').pop().replace(/\.mp3$/, '')
        : '';
}
// Expose controls globally
window.playTrack = playTrack;
window.nextTrack = nextTrack;
window.prevTrack = prevTrack;
window.togglePlay = togglePlay;
window.getCurrentTrackName = getCurrentTrackName;

// Setup loading screen as main menu
const container = document.getElementById('container');
initStatusUI(container);
showStatus(); // Show loading screen
// Preload assets
(async () => {
    try {
        await preloadEssentialModels();
        updateStatus(1, 'Ready to Start!');
    } catch (e) {
        updateStatus(1, 'Error loading assets.');
    }
})();
// Start game on button click
onStartGame(async () => {
    hideStatus();
    await init().catch(err => {});
    window.playRandomBgm(); // play random background music
});

// Dynamic iframe references for bill's garage and club
let garageFrame = null;
let clubFrame = null;
let tavernFrame = null;

// Handle entering Bill's Garage
function enterBillsGarage() {
    // Hide main container and create/show garage iframe
    document.getElementById('container').style.display = 'none';
    if (!garageFrame) {
        garageFrame = document.createElement('iframe');
        garageFrame.id = 'garageFrame';
        garageFrame.src = 'pages/bills_garage/index.html';
        garageFrame.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;z-index:100;';
        document.body.appendChild(garageFrame);
    }
    garageFrame.style.display = 'block';
}

// Handle entering Diamond's Club
function enterDiamondsClub() {
    // Hide main container and create/show club iframe
    document.getElementById('container').style.display = 'none';
    if (!clubFrame) {
        clubFrame = document.createElement('iframe');
        clubFrame.id = 'clubFrame';
        clubFrame.src = 'pages/diamonds_club/diamonds.html';
        clubFrame.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;z-index:100;';
        document.body.appendChild(clubFrame);
    }
    clubFrame.style.display = 'block';
}

// Handle entering Martha's Tavern
function enterMarthasTavern() {
    // Hide main container and create/show tavern iframe
    document.getElementById('container').style.display = 'none';
    if (!tavernFrame) {
        tavernFrame = document.createElement('iframe');
        tavernFrame.id = 'tavernFrame';
        tavernFrame.src = 'pages/marthas_tavern/index.html';
        tavernFrame.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;z-index:100;';
        document.body.appendChild(tavernFrame);
    }
    tavernFrame.style.display = 'block';
}

// Listen for exit message from garage iframe
window.addEventListener('message', event => {
    if (event.data === 'exitGarage') {
        // Remove garage iframe and show main container
        if (garageFrame) {
            garageFrame.remove();
            garageFrame = null;
        }
        document.getElementById('container').style.display = 'block';
    } else if (event.data === 'exitClub') {
        // Remove club iframe and show main container
        if (clubFrame) {
            clubFrame.remove();
            clubFrame = null;
        }
        document.getElementById('container').style.display = 'block';
    } else if (event.data === 'exitTavern') {
        // Remove tavern iframe and show main container
        if (tavernFrame) {
            tavernFrame.remove();
            tavernFrame = null;
        }
        document.getElementById('container').style.display = 'block';
    }
});

// Spawn asset window on P key
async function spawnAssetUI() {
    initPopupUI();
    const overlay = document.getElementById('ui-overlay');
    // Fetch manifest and group by folder under /assets
    const manifest = await fetch('/assets/manifest.json').then(r=>r.json());
    const groups = {};
    manifest.forEach(url => {
        const parts = url.split('/').filter(Boolean); // ["assets","folder",...]
        if (parts.length >= 2) {
            const key = parts[1];
            groups[key] = groups[key] || [];
            groups[key].push(url);
        }
    });
    const groupKeys = Object.keys(groups).sort();

    // Compute default grid
    const fullDivX = config.grid.divisions*config.world.numChunks.x;
    const fullDivZ = config.grid.divisions*config.world.numChunks.z;
    const cellSizeX = config.world.chunkSize.x/config.grid.divisions;
    const cellSizeZ = config.world.chunkSize.z/config.grid.divisions;
    const hwX = config.world.chunkSize.x*config.world.numChunks.x/2;
    const hwZ = config.world.chunkSize.z*config.world.numChunks.z/2;
    const gX = Math.round((player.position.x+hwX)/cellSizeX)+1;
    const gZ = Math.round((player.position.z+hwZ)/cellSizeZ);
    // Build modal layout
    const modal = document.createElement('div'); modal.className='popup';
    Object.assign(modal.style,{top:'50%',left:'50%',transform:'translate(-50%,-50%)'});
    modal.innerHTML = `<div class="inv-header"><span>Spawn Asset</span></div>
      <div style="padding:14px;max-height:46vh;overflow-y:auto;">
        <label>Asset: <select id="spawn-group">${groupKeys.map(k=>`<option value="${k}">${k}</option>`).join('')}</select></label><br>
        <label>Animation: <select id="spawn-anim"></select></label><br>
        <label>Grid X: <input id="spawn-gx" type="number" value="${gX}"></label>&nbsp;
        <label>Grid Z: <input id="spawn-gz" type="number" value="${gZ}"></label>
      </div>
      <div style="padding:10px;display:flex;justify-content:flex-end;gap:8px;">
        <button id="spawn-ok">Spawn</button><button id="spawn-cancel">Cancel</button>
      </div>`;
    overlay.appendChild(modal);
    const groupSel = modal.querySelector('#spawn-group');
    const animSel = modal.querySelector('#spawn-anim');
    // Populate animations for selected group
    const updateAnims = ()=>{
        const urls = groups[groupSel.value]||[];
        animSel.innerHTML = urls.map(u=>{
            const name = u.split('/').pop().replace(/\.glb$/,'');
            return `<option value="${u}">${name}</option>`;
        }).join('');
    };
    groupSel.addEventListener('change', updateAnims);
    updateAnims();
    // Await user
    const ok = await new Promise(res=>{
        modal.querySelector('#spawn-ok').onclick=()=>res(true);
        modal.querySelector('#spawn-cancel').onclick=()=>res(false);
    });
    if(!ok){ modal.remove(); return; }
    const url = animSel.value;
    const gx2 = parseInt(modal.querySelector('#spawn-gx').value,10);
    const gz2 = parseInt(modal.querySelector('#spawn-gz').value,10);
    modal.remove();
    try{
        const gltf = await MODEL_LOADER.loadModel(url);
        if(!gltf) return;
        const obj = gltf.scene;
        const wx = (gx2-fullDivX/2)*cellSizeX;
        const wz = (gz2-fullDivZ/2)*cellSizeZ;
        obj.position.set(wx,obj.position.y,wz);
        scene.add(obj);
        obj.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        obj.userData.boundingBoxSize = { x: size.x, y: size.y, z: size.z };
        obj.userData.collidable = true;
        collidableObjects.push(obj); // Push the group obj into collidableObjects
        obj.traverse(node => {
            if (node.isMesh) {
                node.userData.collidable = true;
                collidableObjects.push(node);
            }
        });
    }catch(e){ console.error('Spawn failed:',e); }
}
window.addEventListener('keydown', e => { if (e.code === 'KeyP') spawnAssetUI(); });

// U key toggles underground/surface teleport
window.addEventListener('keydown', event => {
  if (event.code === 'KeyU' && player && camera) {
    const cs = config.world.chunkSize;
    // Only when in central chunk
    if (Math.abs(player.position.x) <= cs.x/2 && Math.abs(player.position.z) <= cs.z/2) {
      let newY;
      const halfHeight = player.userData.size.y / 2;
      if (!player.userData.isUnderground) {
        // Teleport underground (bottom sits on underground floor)
        newY = -cs.y/2 - config.world.undergroundDepth + halfHeight + 0.1;
        player.userData.isUnderground = true;
      } else {
        // Return to surface (bottom sits on road)
        const roadHeight = config.road.thickness/2 + 0.01;
        newY = roadHeight + halfHeight;
        player.userData.isUnderground = false;
      }
      player.position.y = newY;
      // Reposition camera
      const camAngle = getCurrentCameraAngleRad();
      const zoom = getCurrentZoomLevel();
      const baseOff = config.camera.offset;
      const rx = baseOff.x * Math.cos(camAngle) - baseOff.z * Math.sin(camAngle);
      const rz = baseOff.x * Math.sin(camAngle) + baseOff.z * Math.cos(camAngle);
      camera.position.set(
        player.position.x + rx * zoom,
        player.position.y + baseOff.y * zoom,
        player.position.z + rz * zoom
      );
      camera.lookAt(player.position.x, player.position.y + config.camera.lookAtOffset.y, player.position.z);
      // console.log('Teleport ', player.userData.isUnderground ? 'down' : 'up', camera.position);
    }
  }
});

// --- Ranger Thought Bubble UI Utility ---
function updateThoughtBubble(ranger, camera) {
    const thoughtEl = document.getElementById('ranger-thought');
    if (!thoughtEl || !ranger) return;
    const screenPos = ranger.position.clone().project(camera);
    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;
    if (ranger.userData.currentThought) {
        thoughtEl.style.left = `${x}px`;
        thoughtEl.style.top = `${y - 50}px`;
        thoughtEl.innerText = ranger.userData.currentThought;
        thoughtEl.style.opacity = 1;
    } else {
        thoughtEl.style.opacity = 0;
    }
}