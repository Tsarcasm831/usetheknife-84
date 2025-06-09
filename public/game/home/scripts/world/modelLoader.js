import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Shim deprecated encoding to colorSpace mapping for GLTF textures
Object.defineProperty(THREE.Texture.prototype, 'encoding', {
  get() { return this.colorSpace; },
  set(v) {
    if (v === THREE.sRGBEncoding) this.colorSpace = THREE.SRGBColorSpace;
    else if (v === THREE.LinearEncoding) this.colorSpace = THREE.LinearSRGBColorSpace;
    else this.colorSpace = v;
  },
  configurable: true
});

import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/FBXLoader.js';
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/DRACOLoader.js';

// Preserve original GLTFLoader.load before any monkey-patching
const originalGLTFLoaderLoad = GLTFLoader.prototype.load;

// Build-time unused assets filter (reads unused_list.txt served at root)
const unusedAssetsPromise = fetch('unused_list.txt')
  .then(res => res.ok ? res.text() : '')
  .then(text => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    return {
      full: new Set(lines),
      base: new Set(lines.map(l => l.split(/[/\\]/).pop()))
    };
  });

// Monkey-patch GLTFLoader.load to skip unused assets globally
GLTFLoader.prototype.load = function(url, onLoad, onProgress, onError) {
    // Resolve URL w.r.t. document.baseURI
    const rel = url.startsWith('/') ? url.slice(1) : url;
    const fixedUrl = url.startsWith('http')
        ? url
        : new URL(rel, document.baseURI).href;
    unusedAssetsPromise
      .then(({ base: unusedBase }) => {
          const basename = fixedUrl.split('/').pop();
          if (unusedBase.has(basename)) {
              // console.log(`GLTFLoader: Skipping unused asset ${basename}`);
              if (onLoad) onLoad(null);
          } else {
              originalGLTFLoaderLoad.call(this, fixedUrl, onLoad, onProgress, onError);
          }
      })
      .catch(err => {
          console.warn('Error fetching unused_list.txt:', err);
          // fallback to normal load
          originalGLTFLoaderLoad.call(this, fixedUrl, onLoad, onProgress, onError);
      });
};

// Cache to store promises for loaded models
const modelCache = new Map();
const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();

// Enable Draco compression decoding for GLTF
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/');
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Loads a GLB or FBX model with optional progress callback.
 * Supports caching and is used for both single and multi-animation loading.
 * @param {string} url - The URL of the model file.
 * @param {function(number):void} [onProgress] - Optional callback receiving progress 0-1.
 * @returns {Promise<Object>} - Returns a GLTF or FBX object with scene and animations
 */
export async function loadModel(url, onProgress) {
    // Resolve full URL for asset loading
    const relativeUrl = url.startsWith('/') ? url.slice(1) : url;
    const requestUrl = url.startsWith('http')
        ? url
        : new URL(relativeUrl, document.baseURI).href;

    // Skip unused assets by basename
    const basename = requestUrl.split('/').pop();
    const { base: unusedBase } = await unusedAssetsPromise;
    if (unusedBase.has(basename)) {
        // console.log(`ModelLoader: Skipping unused model ${basename}`);
        return null;
    }

    // Check if the model promise is already in the cache
    if (modelCache.has(requestUrl)) {
        return modelCache.get(requestUrl);
    }

    // Determine loader based on file extension
    const isFBX = requestUrl.toLowerCase().endsWith('.fbx');
    const loader = isFBX ? fbxLoader : gltfLoader;

    // Create a new promise for this URL and store it immediately
    const loadPromise = new Promise((resolve, reject) => {
        // Log extra details for fauna models to help with debugging
        const isFaunaModel = requestUrl.includes('/fauna/') || 
                            basename.includes('rad_bear') || 
                            basename.includes('radcow') || 
                            basename.includes('rad_chicken') || 
                            basename.includes('undead_fox');
        
        if (isFaunaModel) {
            console.log(`ModelLoader: Loading ${isFBX ? 'FBX' : 'GLTF'} fauna model from ${requestUrl}`);
            // Extra validation for fauna model existence
            fetch(requestUrl, { method: 'HEAD' })
                .then(response => {
                    if (!response.ok) {
                        console.warn(`ModelLoader: Fauna model at ${requestUrl} may not exist! Status: ${response.status}`);
                    } else {
                        console.log(`ModelLoader: Fauna model at ${requestUrl} exists. Size: ${response.headers.get('content-length')} bytes`);
                    }
                })
                .catch(err => {
                    console.warn(`ModelLoader: Failed to check fauna model existence at ${requestUrl}:`, err);
                });
        }

        const onLoad = (object) => {
            if (isFaunaModel) {
                console.log(`ModelLoader: Successfully loaded ${isFBX ? 'FBX' : 'GLTF'} fauna model from ${requestUrl}`);
            }

            // Process the model: enable shadows and fix empty textures
            const processObject = (obj) => {
                obj.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        // Fix missing texture image data
                        const mats = Array.isArray(child.material) ? child.material : [child.material];
                        mats.forEach(mat => {
                            if (mat && mat.map && !mat.map.image) {
                                // create 1x1 white canvas
                                const canvas = document.createElement('canvas');
                                canvas.width = canvas.height = 1;
                                const ctx = canvas.getContext('2d');
                                ctx.fillStyle = '#ffffff';
                                ctx.fillRect(0, 0, 1, 1);
                                mat.map.image = canvas;
                                mat.map.needsUpdate = true;
                            }
                        });
                    }
                });
            };

            // For GLTF, the scene is in object.scene
            // For FBX, the object is the scene itself
            if (object.scene) {
                processObject(object.scene);
            } else {
                processObject(object);
                // For FBX, wrap in a similar structure to GLTF
                object = {
                    scene: object,
                    animations: object.animations || []
                };
            }

            resolve(object);
        };

        const onProgressWrapper = (xhr) => {
            if (onProgress && xhr.total) {
                onProgress(xhr.loaded / xhr.total);
                if (isFaunaModel && xhr.loaded > 0) {
                    console.log(`ModelLoader: Fauna model loading progress: ${Math.round(xhr.loaded / xhr.total * 100)}%`);
                }
            }
        };

        const onError = (error) => {
            const errorMsg = `ModelLoader: Error loading ${isFBX ? 'FBX' : 'GLTF'} model from ${requestUrl}: ${error.message || error}`;
            if (isFaunaModel) {
                console.error(`FAUNA MODEL ERROR: ${errorMsg}`, error);
            } else {
                console.error(errorMsg, error);
            }
            reject(error);
        };

        // Load the appropriate model type
        if (isFBX) {
            loader.load(requestUrl, onLoad, onProgressWrapper, onError);
        } else {
            // Use original load to avoid our global override for GLTF
            originalGLTFLoaderLoad.call(loader, requestUrl, onLoad, onProgressWrapper, onError);
        }
    });

    // Store the promise (whether it resolves or rejects) in the cache
    modelCache.set(requestUrl, loadPromise);

    return loadPromise;
}

/**
 * Clears the model cache.
 */
export function clearModelCache() {
    modelCache.clear();
    // console.log("ModelLoader: Cache cleared.");
}

// Names of default animations
export const animNames = [
    'Alert','Casual_Walk','Idle','Idle_02','Injured_Walk','RunFast',
    'Run','Run_02','Running','Slow_Orc_Walk','Stand_and_Chat','Walking',
    'Skill_01','Skill_03','Listening_Gesture','Combat_Stance','Dead',
    'Unsteady_Walk','Texting_Walk','Dozing_Elderly'
];
// Keys for animation lookup
export const animKeys = animNames.map(anim => anim.toLowerCase().replace(/[^a-z0-9]+/g, '_'));

// Utility for batch loading animation maps
/**
 * Loads all GLB models from an animation map { animName: url }.
 * Returns a map of { animName: GLTF }.
 * @param {Object} animMap
 * @param {function(number):void} [onProgress]
 * @returns {Promise<Object>} Map of { animName: GLTF }
 */
export async function loadAnimationMap(animMap, onProgress) {
    const result = {};
    const entries = Object.entries(animMap);
    let loaded = 0;
    // Filter out known unused assets by basename
    const { base: unusedBase } = await unusedAssetsPromise;
    for (const [anim, url] of entries) {
        const basename = url.split('/').pop();
        if (unusedBase.has(basename)) {
            // console.log(`ModelLoader: Skipping unused animation ${basename}`);
            loaded++;
            continue;
        }
        try {
            result[anim] = await loadModel(url, (fraction) => {
                if (onProgress) onProgress((loaded + fraction) / entries.length);
            });
            loaded++;
        } catch (e) {
            console.warn(`Failed to load animation '${anim}' from ${url}`);
        }
    }
    return result;
}

// Generic animated character loader and updater
export async function createAnimatedCharacter(scene, name, onProgress) {
    const animMap = {};
    for (const anim of animNames) {
        const key = anim.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        animMap[key] = `/assets/${name}/biped/Animation_${anim}_withSkin.glb`;
    }
    const gltfMap = await loadAnimationMap(animMap, onProgress);
    const actions = {};
    let baseObj = null;
    for (const [key, gltf] of Object.entries(gltfMap)) {
        if (!baseObj && gltf.scene) {
            baseObj = gltf.scene;
            baseObj.name = name;
            scene.add(baseObj);
        }
        if (gltf.animations && gltf.animations.length > 0) {
            actions[key] = gltf.animations[0];
        }
    }
    if (baseObj) {
        // Determine the idle animation variant available
        const idleKey = Object.keys(actions).find(k => k.startsWith('idle'));
        const mixer = idleKey ? new THREE.AnimationMixer(baseObj) : null;
        baseObj.userData = { mixer, actions };
        if (mixer && idleKey) {
            const idleAction = mixer.clipAction(actions[idleKey]);
            idleAction.play();
            baseObj.userData.currentAction = idleAction;
        }
    }
    return baseObj;
}

export function updateCharacter(obj, deltaTime) {
    if (obj && obj.userData && obj.userData.mixer) {
        obj.userData.mixer.update(deltaTime);
    }
}

// Creature loader exports via generic helper
export const createAlienArmored = (scene, onProgress) => createAnimatedCharacter(scene, 'Alien_armored', onProgress);
export const updateAlienArmored = updateCharacter;
export const createAlienMercenary = (scene, onProgress) => createAnimatedCharacter(scene, 'alien_mercenary', onProgress);
export const updateAlienMercenary = updateCharacter;
export const createAnthromorph = (scene, onProgress) => createAnimatedCharacter(scene, 'Anthromorph', onProgress);
export const updateAnthromorph = updateCharacter;
export const createBill = (scene, onProgress) => createAnimatedCharacter(scene, 'Bill', onProgress);
export const updateBill = updateCharacter;
export const createHiveDrone = (scene, onProgress) => createAnimatedCharacter(scene, 'hive_drone', onProgress);
export const updateHiveDrone = updateCharacter;
export const createIvey = (scene, onProgress) => createAnimatedCharacter(scene, 'Ivey', onProgress);
export const updateIvey = updateCharacter;
export const createMercenary = (scene, onProgress) => createAnimatedCharacter(scene, 'mercenary', onProgress);
export const updateMercenary = updateCharacter;
export const createPrometheanRobot = (scene, onProgress) => createAnimatedCharacter(scene, 'Promethean Robot', onProgress);
export const updatePrometheanRobot = updateCharacter;
export const createRanger = (scene, onProgress) => createAnimatedCharacter(scene, 'ranger', onProgress);
export const updateRanger = updateCharacter;
export const createTalEhn = (scene, onProgress) => createAnimatedCharacter(scene, 'tal_ehn', onProgress);
export const updateTalEhn = updateCharacter;
export const createTalEhn2 = (scene, onProgress) => createAnimatedCharacter(scene, 'tal_ehn_2', onProgress);
export const updateTalEhn2 = updateCharacter;
export const createXris = (scene, onProgress) => createAnimatedCharacter(scene, 'Xris', onProgress);
export const updateXris = updateCharacter;

// Static building model paths
export const FDG_BUILDING_PATH = '/assets/static/fdg_building.glb';
export const SPYDER_WORKSHOP_PATH = '/assets/static/Spyders_Workshop.glb';

// Convenience functions to load static building models
export async function loadDepartmentBuildingModel(onProgress) {
    const { base: unusedBase } = await unusedAssetsPromise;
    const basename = FDG_BUILDING_PATH.split('/').pop();
    if (unusedBase.has(basename)) {
        // console.log(`ModelLoader: Skipping unused asset ${basename}`);
        return null;
    }
    return loadModel(FDG_BUILDING_PATH, onProgress);
}
export async function loadSpyderWorkshopModel(onProgress) {
    const { base: unusedBase } = await unusedAssetsPromise;
    const basename = SPYDER_WORKSHOP_PATH.split('/').pop();
    if (unusedBase.has(basename)) {
        // console.log(`ModelLoader: Skipping unused asset ${basename}`);
        return null;
    }
    return loadModel(SPYDER_WORKSHOP_PATH, onProgress);
}