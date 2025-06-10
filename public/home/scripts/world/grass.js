import * as THREE from 'three';
import { mergeBufferGeometries } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/utils/BufferGeometryUtils.js';
import config from '../../config.js'; // Import config to access road/building data

/**
 * Checks if a given point (x, z) lies within any of the defined exclusion zones.
 * Assumes exclusion zones are only relevant for the central chunk (offset 0,0).
 * @param {number} x - The world x-coordinate of the point.
 * @param {number} z - The world z-coordinate of the point.
 * @param {object} exclusionConfig - Object containing configurations for exclusion zones.
 * @returns {boolean} - True if the point is inside an exclusion zone, false otherwise.
 */
function isInExclusionZone(x, z, exclusionConfig) {
    /* @tweakable Buffer zone around roads where grass won't grow */
    const roadBuffer = 0.2;
    /* @tweakable Buffer zone around buildings/objects where grass won't grow */
    const objectBuffer = 0.05;

    // Helper function to check a single road segment (handles rotation)
    const checkRoadSegment = (segmentConfig) => {
        if (!segmentConfig || !segmentConfig.position || !segmentConfig.size) return false;
        const rotationY = segmentConfig.rotationY || 0;
        const halfSizeX = segmentConfig.size.x / 2;
        const halfSizeZ = segmentConfig.size.z / 2;
        const posX = segmentConfig.position.x;
        const posZ = segmentConfig.position.z;

        // Transform point into local coordinates of the road segment
        const localX = (x - posX) * Math.cos(-rotationY) - (z - posZ) * Math.sin(-rotationY);
        const localZ = (x - posX) * Math.sin(-rotationY) + (z - posZ) * Math.cos(-rotationY);

        // Check if the local point is within the unrotated segment bounds + buffer
        return Math.abs(localX) <= halfSizeX + roadBuffer && Math.abs(localZ) <= halfSizeZ + roadBuffer;
    };

    // Check against generic roads
    if (exclusionConfig.road && exclusionConfig.road.segments) {
        for (const segment of exclusionConfig.road.segments) {
            if (checkRoadSegment(segment)) return true;
        }
    }

    // Check against Bowen St
    if (checkRoadSegment(exclusionConfig.bowenStreet)) return true;

    // Check against Ken Pratt Blvd
    if (checkRoadSegment(exclusionConfig.kenPrattBlvd)) return true;

    // Check against Pratt St (the eastern N/S road)
    if (checkRoadSegment(exclusionConfig.prattStreet)) return true;

    // Check against Colorado Ave (the northern E/W road)
    if (checkRoadSegment(exclusionConfig.coloradoAve)) return true;


    // Check against building/object footprints (AABB)
    const checkFootprint = (itemConfig, applyRotation = false) => {
        if (!itemConfig || !itemConfig.position || !itemConfig.size) return false;

        const posX = itemConfig.position.x;
        const posZ = itemConfig.position.z;
        const rotationY = (applyRotation && itemConfig.rotationY) ? itemConfig.rotationY : 0;

        // Add a small buffer to slightly expand the exclusion zone
        const buffer = objectBuffer;
        const halfSizeX = itemConfig.size.x / 2 + buffer;
        const halfSizeZ = itemConfig.size.z / 2 + buffer;

        // Transform point into local coordinates of the item
        const localX = (x - posX) * Math.cos(-rotationY) - (z - posZ) * Math.sin(-rotationY);
        const localZ = (x - posX) * Math.sin(-rotationY) + (z - posZ) * Math.cos(-rotationY);

        // Check if the local point is within the unrotated item bounds + buffer
        if (Math.abs(localX) <= halfSizeX && Math.abs(localZ) <= halfSizeZ) {
            return true;
        }
        return false;
    };

    if (exclusionConfig.house && checkFootprint(exclusionConfig.house)) return true;
    if (exclusionConfig.house2 && checkFootprint(exclusionConfig.house2)) return true;
    if (exclusionConfig.house3 && checkFootprint(exclusionConfig.house3)) return true;
    if (exclusionConfig.house4 && checkFootprint(exclusionConfig.house4)) return true;
    if (exclusionConfig.house5 && checkFootprint(exclusionConfig.house5)) return true;
    if (exclusionConfig.house6 && checkFootprint(exclusionConfig.house6)) return true;
    if (exclusionConfig.abandonedHouse && checkFootprint(exclusionConfig.abandonedHouse)) return true;
    if (exclusionConfig.hospital && checkFootprint(exclusionConfig.hospital)) return true;
    if (exclusionConfig.departmentBuilding && checkFootprint(exclusionConfig.departmentBuilding)) return true;
    if (exclusionConfig.warehouse && checkFootprint(exclusionConfig.warehouse)) return true;
    if (exclusionConfig.club && checkFootprint(exclusionConfig.club)) return true;
    if (exclusionConfig.scienceOffice && checkFootprint(exclusionConfig.scienceOffice)) return true;
    if (exclusionConfig.tavern && checkFootprint(exclusionConfig.tavern, true)) return true;
    if (exclusionConfig.storageBuilding && checkFootprint(exclusionConfig.storageBuilding, true)) return true;
    if (exclusionConfig.spyderWorkshop && checkFootprint(exclusionConfig.spyderWorkshop)) return true;
    if (exclusionConfig.waterworks && checkFootprint(exclusionConfig.waterworks, true)) return true;
    if (exclusionConfig.parkingLot && checkFootprint(exclusionConfig.parkingLot)) return true;
    if (exclusionConfig.schoolhouse && checkFootprint(exclusionConfig.schoolhouse)) return true;
    if (exclusionConfig.mineshaftEntrance && checkFootprint(exclusionConfig.mineshaftEntrance, true)) return true; 
    // Check bus and truck (handle potential rotation)
    if (exclusionConfig.bus && checkFootprint(exclusionConfig.bus, true)) return true;
    if (exclusionConfig.truck && checkFootprint(exclusionConfig.truck, true)) return true;
    // Check against watchtowers
    if (exclusionConfig.watchtowers && Array.isArray(exclusionConfig.watchtowers)) {
        for (const towerConfig of exclusionConfig.watchtowers) {
            if (checkFootprint(towerConfig)) return true;
        }
    }

    return false;
}

/**
 * Creates instanced grass blades across multiple chunks, avoiding exclusion zones in the central chunk.
 * @param {THREE.Scene} scene - The scene to add the grass to.
 * @param {object} worldConfig - World configuration including chunkSize and numChunks.
 * @param {object} grassConfig - Configuration for the grass blades.
 * @param {object} exclusionConfig - Configuration containing areas to exclude grass (only applied to chunk 0,0).
 */
export function createGrass(scene, worldConfig, grassConfig, exclusionConfig) {
    const { chunkSize, numChunks } = worldConfig;
    const grassCount = grassConfig.count;
    const bladeHeight = grassConfig.bladeHeight;
    const bladeWidth = grassConfig.bladeWidth;
    const spreadFactor = grassConfig.spreadFactor; 
    /* @tweakable Random lean amount for grass blades (radians) */
    const leanVariance = grassConfig.leanVariance !== undefined ? grassConfig.leanVariance : 0.1;
    /* @tweakable Random scale variance for grass blades (multiplier) */
    const scaleVariance = grassConfig.scaleVariance !== undefined ? grassConfig.scaleVariance : 0.3;

    // Crossed planes geometry for a grass blade
    const plane1 = new THREE.PlaneGeometry(bladeWidth, bladeHeight, 1, 1);
    plane1.translate(0, bladeHeight / 2, 0);
    const plane2 = plane1.clone();
    plane2.rotateY(Math.PI / 2);
    const bladeGeometry = mergeBufferGeometries([plane1, plane2], false);

    // wave amplitude for bending
    const waveAmplitude = grassConfig.waveAmplitude !== undefined ? grassConfig.waveAmplitude : 0.05;

    const grassMaterial = new THREE.MeshPhongMaterial({
        color: grassConfig.color,
        side: THREE.DoubleSide,
        emissive: grassConfig.color,
        emissiveIntensity: grassConfig.emissiveIntensity,
        flatShading: true
    });

    grassMaterial.onBeforeCompile = function(shader) {
        shader.uniforms.time = { value: 0 };
        this.userData.shader = shader;
        // Prepend time uniform
        shader.vertexShader = 'uniform float time;\n' + shader.vertexShader;
        // Inline waveAmplitude constant during vertex transformations
        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            '#include <begin_vertex>\n' +
            'float heightFactor = position.y / ' + bladeHeight + ';\n' +
            'float amp = ' + waveAmplitude + ';\n' +
            'transformed.x += sin(time + instanceMatrix[3][0] * 0.2 + instanceMatrix[3][2] * 0.1) * amp * heightFactor;\n' +
            'transformed.z += cos(time + instanceMatrix[3][2] * 0.2 + instanceMatrix[3][0] * 0.1) * amp * heightFactor;'
        );
    };

    const clock = new THREE.Clock();
    const instancedGrass = new THREE.InstancedMesh(bladeGeometry, grassMaterial, grassCount);
    instancedGrass.castShadow = false;
    instancedGrass.receiveShadow = true;
    instancedGrass.onBeforeRender = (renderer, scene, camera, geometry, material) => {
        if (material.userData.shader) {
            material.userData.shader.uniforms.time.value = clock.getElapsedTime();
        }
    };

    const dummy = new THREE.Object3D();
    let placedCount = 0;
    const maxAttempts = grassCount * 1.5; 
    let attempts = 0;

    const totalChunks = numChunks.x * numChunks.z;
    const countPerChunk = Math.floor(grassCount / totalChunks);

    const chunkOffsetXStart = -Math.floor(numChunks.x / 2);
    const chunkOffsetZStart = -Math.floor(numChunks.z / 2);

    // If using global clumps, skip per-chunk logic
    if (grassConfig.clusterCount > 0) {
        const worldWidth = chunkSize.x * numChunks.x * spreadFactor;
        const halfW = worldWidth / 2;
        const worldDepth = chunkSize.z * numChunks.z * spreadFactor;
        const halfD = worldDepth / 2;
        const fX = grassConfig.clusterOblongFactorX || 1;
        const fZ = grassConfig.clusterOblongFactorZ || 1;
        const bgFrac = grassConfig.backgroundFraction || 0;
        const clusterBlades = Math.floor(grassCount * (1 - bgFrac));
        const bgBlades = grassCount - clusterBlades;
        // generate cluster centers
        const clustersGlobal = Array.from({ length: grassConfig.clusterCount }, () => ({
            x: (Math.random() - 0.5) * worldWidth,
            z: (Math.random() - 0.5) * worldDepth
        }));
        let placed = 0;
        let attemptsGlobal = 0;
        const maxGlobal = clusterBlades * 1.5;
        // Place clustered blades with tapering (radius * sqrt(rnd))
        while (placed < clusterBlades && attemptsGlobal < maxGlobal) {
            attemptsGlobal++;
            const c = clustersGlobal[Math.floor(Math.random() * clustersGlobal.length)];
            const R = grassConfig.clusterRadius || Math.min(worldWidth, worldDepth) * 0.1;
            const theta = Math.random() * Math.PI * 2;
            const r = R * Math.sqrt(Math.random());
            let worldX = c.x + r * Math.cos(theta) * fX;
            let worldZ = c.z + r * Math.sin(theta) * fZ;
            // clamp to world bounds
            worldX = Math.max(-halfW, Math.min(halfW, worldX));
            worldZ = Math.max(-halfD, Math.min(halfD, worldZ));
            if (!isInExclusionZone(worldX, worldZ, exclusionConfig)) {
                dummy.position.set(worldX, 0, worldZ);
                dummy.rotation.set(
                    (Math.random() - 0.5) * leanVariance * 2,
                    Math.random() * Math.PI * 2,
                    (Math.random() - 0.5) * leanVariance * 2
                );
                const scale = 1 + (Math.random() - 0.5) * 2 * scaleVariance;
                dummy.scale.set(scale, scale, scale);
                dummy.updateMatrix();
                instancedGrass.setMatrixAt(placed, dummy.matrix);
                placed++;
            }
        }
        // Sparse background grass
        let placedBg = placed;
        let attemptsBg = 0;
        const maxBg = bgBlades * 1.5;
        while (placedBg < grassCount && attemptsBg < maxBg) {
            attemptsBg++;
            let worldX = (Math.random() - 0.5) * worldWidth;
            let worldZ = (Math.random() - 0.5) * worldDepth;
            // clamp to world bounds
            worldX = Math.max(-halfW, Math.min(halfW, worldX));
            worldZ = Math.max(-halfD, Math.min(halfD, worldZ));
            if (!isInExclusionZone(worldX, worldZ, exclusionConfig)) {
                dummy.position.set(worldX, 0, worldZ);
                dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
                const scale = 0.5 + Math.random() * 0.5;
                dummy.scale.set(scale, scale, scale);
                dummy.updateMatrix();
                instancedGrass.setMatrixAt(placedBg, dummy.matrix);
                placedBg++;
            }
        }
        instancedGrass.count = placedBg;
        instancedGrass.instanceMatrix.needsUpdate = true;
        scene.add(instancedGrass);
        console.log(`Added ${placed} clustered + ${placedBg-placed} background blades.`);
        return;
    }
    console.log(`Attempting to place ~${countPerChunk} grass blades per chunk across ${totalChunks} chunks.`);

    // Loop through each chunk grid position
    for (let i = 0; i < numChunks.x; i++) {
        for (let j = 0; j < numChunks.z; j++) {

            const chunkX = chunkOffsetXStart + i;
            const chunkZ = chunkOffsetZStart + j;
            const offsetX = chunkX * chunkSize.x;
            const offsetZ = chunkZ * chunkSize.z;

            const isCentralChunk = (chunkX === 0 && chunkZ === 0);

            let placedInChunk = 0;
            const attemptsPerChunk = Math.ceil(maxAttempts / totalChunks);
            let chunkAttempts = 0;

            // Try to place blades within this chunk
            while (placedInChunk < countPerChunk && placedCount < grassCount && chunkAttempts < attemptsPerChunk) {
                chunkAttempts++;
                attempts++;

                // Generate potential position relative to chunk origin
                const localX = (Math.random() - 0.5) * chunkSize.x * spreadFactor;
                const localZ = (Math.random() - 0.5) * chunkSize.z * spreadFactor;

                // Calculate world position
                const worldX = offsetX + localX;
                const worldZ = offsetZ + localZ;

                // Check if the position is in an exclusion zone
                let excluded = false;
                if (isCentralChunk) {
                    excluded = isInExclusionZone(worldX, worldZ, exclusionConfig);
                }

                if (!excluded) {
                    // Position is valid, place the blade
                    dummy.position.set(worldX, 0, worldZ);

                    // Random rotation around Y axis and slight leans using leanVariance
                    dummy.rotation.set(
                        (Math.random() - 0.5) * leanVariance * 2, 
                        Math.random() * Math.PI * 2,
                        (Math.random() - 0.5) * leanVariance * 2 
                    );

                    // Optional random scale using scaleVariance
                    const scale = 1.0 + (Math.random() - 0.5) * 2 * scaleVariance; 
                    dummy.scale.set(scale, scale, scale);

                    dummy.updateMatrix();
                    instancedGrass.setMatrixAt(placedCount, dummy.matrix);
                    placedCount++;
                    placedInChunk++;
                }
            } 
        } 
    } 


    // If fewer blades were placed than requested, update the instance count
    if (placedCount < grassCount) {
        console.warn(`Could only place ${placedCount} grass blades out of ${grassCount} requested.`);
        instancedGrass.count = placedCount;
    }

    instancedGrass.instanceMatrix.needsUpdate = true;
    scene.add(instancedGrass);
    console.log(`Added ${placedCount} grass blades across ${totalChunks} chunks.`);
}