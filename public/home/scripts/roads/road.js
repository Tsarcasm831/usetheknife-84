import * as THREE from 'three';

// Cache for geometries and materials
const roadCache = {
    geometries: new Map(),
    materials: new Map()
};

/**
 * Creates a simple road segment and adds it to the scene.
 * @param {THREE.Scene} scene - The scene to add the road to.
 * @param {object} roadConfig - General configuration for roads (color, thickness).
 * @param {object} segmentConfig - Configuration for this specific segment (position, size, rotation).
 */
export function createRoadSegment(scene, roadConfig, segmentConfig) {
    // Early return if invalid config
    if (!segmentConfig || !segmentConfig.size || !segmentConfig.position) {
        console.warn('Invalid segment configuration:', segmentConfig);
        return null;
    }

    // Create unique key for geometry based on dimensions
    const geometryKey = `${segmentConfig.size.x}-${roadConfig.thickness}-${segmentConfig.size.z}`;
    let roadGeometry = roadCache.geometries.get(geometryKey);

    if (!roadGeometry) {
        roadGeometry = new THREE.BoxGeometry(
            segmentConfig.size.x,
            roadConfig.thickness,
            segmentConfig.size.z
        );
        roadCache.geometries.set(geometryKey, roadGeometry);
    }

    // Create unique key for texture-based material (include size and swapUV)
    const materialKey = `asphalt_cracked_${segmentConfig.size.x}_${segmentConfig.size.z}_${segmentConfig.swapUV ? 'swap' : 'noswap'}`;
    let roadMaterial = roadCache.materials.get(materialKey);

    if (!roadMaterial) {
        // Load asphalt texture
        const texture = new THREE.TextureLoader().load('assets/static/textures/asphalt_cracked.png');
        // Enable tiling of the asphalt texture
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        // Use a fixed tile size (world units per texture repeat)
        const TILE_SIZE = 2; // world units per tile
        if (segmentConfig.swapUV) {
            texture.repeat.set(
                segmentConfig.size.z / TILE_SIZE,
                segmentConfig.size.x / TILE_SIZE
            );
        } else {
            texture.repeat.set(
                segmentConfig.size.x / TILE_SIZE,
                segmentConfig.size.z / TILE_SIZE
            );
        }
        roadMaterial = new THREE.MeshPhongMaterial({ map: texture });
        roadCache.materials.set(materialKey, roadMaterial);
    }

    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);

    // Position the road slightly above the ground to avoid z-fighting
    roadMesh.position.set(
        segmentConfig.position.x,
        roadConfig.thickness / 2 + 0.01,
        segmentConfig.position.z
    );

    // Apply rotation if specified (around the Y axis)
    if (segmentConfig.rotationY) {
        roadMesh.rotation.y = segmentConfig.rotationY;
    }

    roadMesh.name = segmentConfig.name || "RoadSegment";
    roadMesh.userData = { collidable: false };
    roadMesh.castShadow = false;
    roadMesh.receiveShadow = true;

    roadMesh.trackReference();

    scene.add(roadMesh);
    return roadMesh;
}

/**
 * Creates a collection of road segments based on an array of configurations.
 * Excludes segments handled elsewhere (like Pratt St.).
 * @param {THREE.Scene} scene - The scene to add the roads to.
 * @param {object} roadConfig - General configuration for roads.
 * @param {Array<object>} segments - An array of segment configurations.
 */
export function createRoads(scene, roadConfig, segments) {
    if (!segments || segments.length === 0) return;

    // Process segments in batches to prevent memory issues
    const BATCH_SIZE = 100;
    for (let i = 0; i < segments.length; i += BATCH_SIZE) {
        const batch = segments.slice(i, i + BATCH_SIZE);
        batch.forEach(segmentConf => {
            createRoadSegment(scene, roadConfig, segmentConf);
        });
    }

    // Clean up unused geometries and materials
    cleanUpCache();
}

/**
 * Clean up unused geometries and materials from cache
 */
function cleanUpCache() {
    // Remove geometries that aren't being used
    for (const [key, geometry] of roadCache.geometries) {
        if (geometry.userData.referenceCount === 0) {
            geometry.dispose();
            roadCache.geometries.delete(key);
        }
    }

    // Remove materials that aren't being used
    for (const [key, material] of roadCache.materials) {
        if (material.userData.referenceCount === 0) {
            material.dispose();
            roadCache.materials.delete(key);
        }
    }
}

// Add reference counting for geometries and materials
THREE.Mesh.prototype.trackReference = function() {
    if (this.geometry) {
        this.geometry.userData.referenceCount = (this.geometry.userData.referenceCount || 0) + 1;
    }
    if (this.material) {
        this.material.userData.referenceCount = (this.material.userData.referenceCount || 0) + 1;
    }
};

// Override dispose to decrement reference counts
THREE.Mesh.prototype.dispose = function() {
    if (this.geometry) {
        this.geometry.userData.referenceCount = (this.geometry.userData.referenceCount || 0) - 1;
    }
    if (this.material) {
        this.material.userData.referenceCount = (this.material.userData.referenceCount || 0) - 1;
    }
    THREE.Mesh.prototype.dispose.call(this);
};