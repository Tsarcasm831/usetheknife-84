import * as THREE from 'three';

export function setupScene(playerHeight) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333340);
    // Adjust fog for larger space
    scene.fog = new THREE.Fog(0x333340, 20, 50); // Start fog further out, extend further

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Start player slightly further back in the larger garage
    camera.position.set(0, playerHeight, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; // Slightly adjust exposure if needed
    document.body.appendChild(renderer.domElement);

    return { scene, camera, renderer };
}

export function setupLights(scene) {
    const hemiLight = new THREE.HemisphereLight(0xaaaaaa, 0x444444, 0.15); // Slightly less ambient
    scene.add(hemiLight);

    const bulbMaterial = new THREE.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 1.5, // Slightly brighter bulb
        color: 0x000000
    });
    const lightFixtureMat = new THREE.MeshStandardMaterial({ color: 0x505050, roughness: 0.6, metalness: 0.4 });

    // Adjusted light parameters for larger space
    const lightIntensity = 0.5;
    const lightDistance = 25; // Increased range
    const lightDecay = 1.5; // Adjust falloff

    function createOverheadLight(x, z) {
        const light = new THREE.PointLight(0xfff8e0, lightIntensity, lightDistance, lightDecay);
        light.position.set(x, 7.8, z); // Higher up for larger space
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.bias = -0.008; // Adjusted bias
        light.shadow.radius = 4; // Soften shadows more
        scene.add(light);

        const fixture = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16), lightFixtureMat); // Larger fixture base
        fixture.add(base);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 8), bulbMaterial); // Slightly larger bulb
        bulb.position.y = -0.1;
        fixture.add(bulb);
        fixture.position.copy(light.position);
        fixture.position.y += 0.04; // Adjust based on base height
        fixture.castShadow = true;
        scene.add(fixture);
    }

    // Spread out the overhead lights
    createOverheadLight(-5, -3);
    createOverheadLight(5, -3);
    createOverheadLight(-5, 6);
    createOverheadLight(5, 6);


    // Adjusted spotlight for new workbench position
    const spotLight = new THREE.SpotLight(0xffffff, 0.7, 20, Math.PI / 6, 0.4, 1.8); // Adjusted range, angle, decay
    spotLight.position.set(-8, 6, -7.5); // Repositioned
    spotLight.target.position.set(-8.5, 1.2, -8.5); // Target workbench area
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.bias = -0.003;
    spotLight.shadow.radius = 3;
    scene.add(spotLight);
    scene.add(spotLight.target);

     // Add a subtle fill light from near the door
    const doorFillLight = new THREE.RectAreaLight(0x88aaff, 0.3, 5, 8); // Soft blueish light
    doorFillLight.position.set(0, 3, 9.5); // Position near front opening
    doorFillLight.lookAt(0, 1, 0);
    scene.add(doorFillLight);
}