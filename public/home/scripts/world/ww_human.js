import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { createLoader } from '../loaderFactory.js';

// Local GLB URLs for Woman Wastelander animations
const WW_HUMAN_GLB_URLS = {
  walking: '/assets/woman_wastelander/files/woman_wastelander_Animation_Walking_withSkin.glb',
  idle:    '/assets/woman_wastelander/files/woman_wastelander_Animation_Idle_02_withSkin.glb',
  running: '/assets/woman_wastelander/files/woman_wastelander_Animation_Running_withSkin.glb'
};

// Export GLB URLs for external usage (e.g., preload)
export { WW_HUMAN_GLB_URLS };

// Beatific idle NPC (woman wastelander)
export function createWwHuman(scene, spawnConfig, worldConfig, gridConfig) {
    const loader = createLoader();
    return new Promise((resolve, reject) => {
        loader.load(WW_HUMAN_GLB_URLS.idle,
            (gltf) => {
                const obj = gltf.scene;
                // Compute cell sizes for grid positioning
                const divisions = gridConfig.divisions;
                const cellSizeX = worldConfig.chunkSize.x / divisions;
                const cellSizeZ = worldConfig.chunkSize.z / divisions;
                // Position based on absolute or grid coords
                if (spawnConfig.position) {
                    obj.position.set(
                        spawnConfig.position.x + cellSizeX * 0.5,
                        spawnConfig.position.y + spawnConfig.yOffset,
                        spawnConfig.position.z
                    );
                } else {
                    const sx = ((spawnConfig.gridPosition.x + 0.5) - divisions/2) * cellSizeX;
                    const sz = (spawnConfig.gridPosition.z - divisions/2) * cellSizeZ;
                    obj.position.set(sx, spawnConfig.yOffset, sz);
                }
                obj.scale.set(spawnConfig.scale.x, spawnConfig.scale.y, spawnConfig.scale.z);
                obj.name = 'WwHuman';
                // Enable shadows on meshes
                obj.traverse(n => {
                    if (n.isMesh) {
                        n.castShadow = true;
                        n.receiveShadow = false;
                    }
                });
                // Setup animation mixer and idle action
                const mixer = new THREE.AnimationMixer(obj);
                const idleClip = gltf.animations.find(c => /Idle/i.test(c.name)) || gltf.animations[0];
                const idleAction = idleClip ? mixer.clipAction(idleClip) : null;
                if (idleAction) idleAction.play();
                obj.userData = { collidable: spawnConfig.collidable, mixer, idleAction };
                scene.add(obj);
                resolve(obj);
            },
            undefined,
            err => reject(err)
        );
    });
}

export function updateWwHuman(obj, deltaTime) {
    if (obj && obj.userData && obj.userData.mixer && deltaTime > 0) {
        obj.userData.mixer.update(deltaTime);
    }
}
