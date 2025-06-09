import * as THREE from 'three';
import { createNoiseCanvas } from './environmentSetup.js'; // For potential texture generation

// --- Shared Resources for Truck ---

// Helper to create a subtle bump map for imperfections
function createSubtleBumpMap(size = 64, intensity = 0.005) {
    const canvas = createNoiseCanvas(size, size, 0.45, 0.55); // Very subtle noise
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4); // Repeat the subtle pattern
    return texture;
}

// Helper to create a subtle normal map for lens effect (simple radial lines)
function createLensNormalMap(size = 128) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;
    ctx.fillStyle = 'rgb(128, 128, 255)'; // Base normal color (flat)
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(180, 128, 180, 0.5)'; // Adjust color for normal direction (purple-ish)
    ctx.lineWidth = 1;

    // Draw concentric rings instead of radial lines for a different lens effect
    for (let r = 5; r < center; r += 5) {
        ctx.beginPath();
        ctx.arc(center, center, r, 0, Math.PI * 2);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Helper to create a tire tread bump map
function createTireTreadBumpMap(width = 64, height = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(128, 128, 128)'; // Mid-gray base
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgb(160, 160, 160)'; // Lighter grey for raised blocks
    const blockHeight = height / 10;
    const blockWidth = width * 0.3;
    const gap = blockWidth * 0.5;

    for (let y = 0; y < height; y += blockHeight * 1.5) {
        ctx.fillRect(gap * 0.5, y, blockWidth, blockHeight);
        ctx.fillRect(width - blockWidth - gap * 0.5, y + blockHeight * 0.75, blockWidth, blockHeight); // Staggered
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

export function createTruckMaterials() {
    // Optional: Load environment map for better reflections if available
    // const envMap = new THREE.CubeTextureLoader()...load([...]); // See sceneSetup for envMap usage
    const subtleBump = createSubtleBumpMap(64, 0.002); // Create one bump map for reuse
    const lensNormal = createLensNormalMap(); // Create one lens normal map
    const tireBump = createTireTreadBumpMap(); // Create tire bump map

    return {
        wheelMat: new THREE.MeshStandardMaterial({
            color: 0x111111, // Darker tire
            roughness: 0.9,
            metalness: 0.0,
            bumpMap: tireBump, // Use the specific tire bump map
            bumpScale: 0.018, // Slightly more pronounced bump for tread
            // Add anisotropy for a subtle sidewall sheen effect (optional)
            // anisotropy: 0.5,
        }),
        bodyMat: new THREE.MeshPhysicalMaterial({
            color: 0x0a1a40, // Darker blue like the screenshot
            roughness: 0.08, // Shinier paint (reduced roughness)
            metalness: 0.75, // Slightly less metallic
            envMapIntensity: 0.8, // Adjust reflection intensity
            clearcoat: 0.7,       // Strong clear coat effect
            clearcoatRoughness: 0.02, // Very smooth clear coat
            // envMap: envMap // Assign env map if loaded - will be handled by scene.environment
            bumpMap: subtleBump,
            bumpScale: 0.001 // Very subtle bump scale for paint
        }),
        windowMat: new THREE.MeshStandardMaterial({
            color: 0x101215, // Darker, slightly bluer tint
            roughness: 0.0, // Almost perfect reflection
            metalness: 0.95, // Glass can have high metalness for reflection
            transparent: true,
            opacity: 0.50, // Slightly more transparent
            envMapIntensity: 0.9, // Maximize reflections on glass (will use scene env map)
            side: THREE.DoubleSide // Render both sides for interior visibility
            // envMap: envMap
        }),
        chromeMat: new THREE.MeshStandardMaterial({
            color: 0xf8f8f8, // Brighter chrome base
            roughness: 0.02, // Very shiny chrome
            metalness: 1.0, // Fully metallic
            envMapIntensity: 0.9, // (will use scene env map)
             // envMap: envMap
            bumpMap: subtleBump,
            bumpScale: 0.0005 // Extremely subtle bump scale for chrome
        }),
        lightMatRed: new THREE.MeshPhysicalMaterial({
            color: 0x990000, // Darker base red
            emissive: 0x660000, // More intense emission
            emissiveIntensity: 1.0, // Boost intensity slightly
            roughness: 0.2, // Smoother plastic
            metalness: 0.1,
            transparent: true,
            opacity: 0.75, // Slightly less transparent
            transmission: 0.2, // Add slight light transmission
        }),
        lightMatWhite: new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            emissive: 0xcccccc, // Slightly brighter emission
            emissiveIntensity: 0.9,
            roughness: 0.2, // Smoother plastic
            metalness: 0.1,
            transparent: true,
            opacity: 0.65, // Slightly less transparent
            transmission: 0.25, // Add slight light transmission
        }),
        lightLensMat: new THREE.MeshPhysicalMaterial({ // More detailed lens
            color: 0xffffff,
            roughness: 0.02, // Very smooth lens
            metalness: 0.0,
            transparent: true,
            opacity: 0.1, // Even less opaque cover
            envMapIntensity: 0.6, // (will use scene env map)
            transmission: 0.5, // Higher transmission for clear lens
            normalMap: lensNormal, // Add subtle texture
            normalScale: new THREE.Vector2(0.08, 0.08) // Slightly stronger normal effect
        }),
        hubcapMat: new THREE.MeshStandardMaterial({
            color: 0xe0e0e0, // Brighter hubcap
            metalness: 0.98, // Highly metallic
            roughness: 0.08, // Shinier hubcap
            // Add subtle bump
             bumpMap: subtleBump,
             bumpScale: 0.001
        }),
        interiorMat: new THREE.MeshStandardMaterial({
            color: 0x18181d, // Darker interior
            roughness: 0.9, // Keep interior matte
            bumpMap: subtleBump, // Use bump map for subtle texture
            bumpScale: 0.01 // Slightly stronger bump for interior fabric/plastic
        }),
        // Generic dark plastic/rubber material for trim, mudflaps, etc.
        plasticTrimMat: new THREE.MeshStandardMaterial({
            color: 0x151515, // Darker trim
            roughness: 0.75, // Slightly less rough
            metalness: 0.05, // Barely metallic
            bumpMap: subtleBump,
            bumpScale: 0.005
        }),
        // Material for panel gaps/seams
        gapMat: new THREE.MeshBasicMaterial({ color: 0x080808, side: THREE.DoubleSide }), // Slightly lighter gap
        // Material for windshield wipers
        wiperMat: new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.7, metalness: 0.0 }),
        // Material for gas cap
        gasCapMat: new THREE.MeshStandardMaterial({ color: 0x505050, metalness: 0.95, roughness: 0.2 }),
         // Material for reflectors
        reflectorMatRed: new THREE.MeshPhysicalMaterial({
            color: 0xff2222, // Bright red
            emissive: 0x880000, // More emissive
            roughness: 0.1,
            metalness: 0.1,
            envMapIntensity: 0.5,
            transparent: true, // Make slightly transparent
            opacity: 0.85,
            transmission: 0.1 // Add slight transmission
        }),
        // Material for antenna
        antennaMat: new THREE.MeshStandardMaterial({
            color: 0x101010,
            roughness: 0.6,
            metalness: 0.2
        }),
        // Material for Axles/Suspension
        axleMat: new THREE.MeshStandardMaterial({
            color: 0x303030, // Dark metal
            roughness: 0.7,
            metalness: 0.4,
            bumpMap: subtleBump,
            bumpScale: 0.01
        })
    };
}

export function getTruckDimensions() {
    const wheelRadius = 0.45; // Increased wheel radius
    const groundClearance = 0.2;
    return {
        // Main body block dimensions
        cabWidth: 1.15,  // Max width at base (Slightly wider to match wheel scale)
        cabHeight: 0.7, // Vertical height of cab block
        cabLength: 1.0, // Length of cab block along X
        bedWidth: 1.15, // Slightly wider than cab base, matches flare width better
        bedHeight: 0.55, // Slightly lower bed sides
        bedLength: 1.2,
        hoodLength: 0.8,

        // Positioning & Frame
        wheelbase: 1.8, // Distance between front/rear wheel centers X
        trackWidth: 1.2, // Distance between left/right wheel centers Z
        groundClearance: groundClearance + 0.05, // Slightly higher ground clearance
        bodyBaseY: groundClearance + wheelRadius, // Y level for bottom of main body components
        frameThickness: 0.04, // Thickness for various frame elements

        // Wheels
        wheelRadius: wheelRadius,
        wheelWidth: 0.2,
    };
}