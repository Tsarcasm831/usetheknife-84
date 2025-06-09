import * as THREE from 'three';
import { createNoiseCanvas } from './environmentSetup.js';

export function setupStorageItems(world) {
    createTireStack(world);
    createShelves(world);
    createWallCabinets(world); 
    createFloorCabinet(world); 
}

function createTireStack(world) {
    const { scene, colliders } = world;

    const tireBumpCanvas = createNoiseCanvas(64, 64, 0.4, 0.6); 
    const tireBumpMap = new THREE.CanvasTexture(tireBumpCanvas);
    tireBumpMap.wrapS = THREE.RepeatWrapping;
    tireBumpMap.wrapT = THREE.RepeatWrapping;
    tireBumpMap.repeat.set(4, 8); 

    const tireMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.9, 
        bumpMap: tireBumpMap,
        bumpScale: 0.005 
    });
    const tireGeom = new THREE.TorusGeometry(0.3, 0.15, 16, 40); 
    const tireStack = new THREE.Group();

    for (let i = 0; i < 3; i++) {
        const tire = new THREE.Mesh(tireGeom, tireMat);
        tire.rotation.y = Math.PI / 2;
        tire.position.y = 0.15 + i * 0.3; 
        tire.castShadow = true;
        tire.receiveShadow = true;
        tireStack.add(tire);
    }

    const wallLen = 20; 
    tireStack.position.set(wallLen/2 - 0.5, 0, -wallLen/2 + 1.5); 
    scene.add(tireStack);

    const tireStackBox = new THREE.Box3().setFromObject(tireStack);
    colliders.push(tireStackBox);
}

function createShelves(world) {
    const { scene, colliders } = world;

    const shelfGroup = new THREE.Group();
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x606060, roughness: 0.7, metalness: 0.3 });
    const shelfBoardGeo = new THREE.BoxGeometry(1.5, 0.05, 0.4);
    const shelfSupportGeo = new THREE.BoxGeometry(0.05, 1.2, 0.05);

    for (let x of [-0.7, 0.7]) {
        for (let z of [-0.18, 0.18]) {
            const support = new THREE.Mesh(shelfSupportGeo, shelfMat);
            support.position.set(x, 0.6, z); 
            support.castShadow = true;
            shelfGroup.add(support);
        }
    }
    for (let y of [0.025, 0.6, 1.175]) { 
        const shelf = new THREE.Mesh(shelfBoardGeo, shelfMat);
        shelf.position.y = y;
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        shelfGroup.add(shelf);
    }

    const boxMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.8 });
    const oilCanMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4, metalness: 0.2 });
    const oilCanLabelMat = new THREE.MeshStandardMaterial({ color: 0xaa0000, side: THREE.DoubleSide }); 

    const box1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.3), boxMat);
    box1.position.set(-0.4, 0.025 + 0.1, 0); 
    box1.castShadow = true;
    shelfGroup.add(box1);

    const oilCan1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.25, 16), oilCanMat);
    oilCan1.position.set(0.2, 0.025 + 0.125, -0.1); 
    oilCan1.castShadow = true;
    shelfGroup.add(oilCan1);
    const oilCanLabel1 = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), oilCanLabelMat); 
    oilCanLabel1.position.y = 0; 
    oilCanLabel1.position.z = 0.081; 
    oilCan1.add(oilCanLabel1);

    const box2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.25), boxMat);
    box2.position.set(0.3, 0.6 + 0.15, -0.05); 
    box2.rotation.y = -Math.PI / 8;
    box2.castShadow = true;
    shelfGroup.add(box2);

    const oilCan2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 16), oilCanMat);
    oilCan2.position.set(-0.5, 1.175 + 0.1, 0.1); 
    oilCan2.castShadow = true;
    shelfGroup.add(oilCan2);

    const oilCan3 = oilCan2.clone();
    oilCan3.position.set(-0.25, 1.175 + 0.1, 0.05); 
    shelfGroup.add(oilCan3);

    shelfGroup.position.set(3.5, 0, -4.5);
    shelfGroup.rotation.y = -Math.PI / 18;
    scene.add(shelfGroup);
    colliders.push(new THREE.Box3().setFromObject(shelfGroup));
}

function createWallCabinets(world) {
    const { scene, colliders } = world;
    const wallLen = 20; 
    const wallHt = 4;
    const wallTh = 0.2;
    const cabinetGroup = new THREE.Group();

    const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.7, metalness: 0.4 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.4, metalness: 0.6 });
    const cabinetDepth = 0.3;
    const cabinetWidth = 0.8;
    const cabinetHeight = 0.6;
    const doorThickness = 0.02;

    const cab1 = new THREE.Group();
    const cab1Body = new THREE.Mesh(new THREE.BoxGeometry(cabinetWidth, cabinetHeight, cabinetDepth), cabinetMat);
    cab1.add(cab1Body);

    const doorGeo = new THREE.BoxGeometry(cabinetWidth / 2 - 0.01, cabinetHeight - 0.02, doorThickness);
    const door1L = new THREE.Mesh(doorGeo, cabinetMat);
    door1L.position.set(-cabinetWidth / 4, 0, cabinetDepth / 2 + doorThickness / 2);
    cab1.add(door1L);
    const door1R = new THREE.Mesh(doorGeo, cabinetMat);
    door1R.position.set(cabinetWidth / 4, 0, cabinetDepth / 2 + doorThickness / 2);
    cab1.add(door1R);

    const handleGeo = new THREE.BoxGeometry(0.02, 0.1, 0.02);
    const handle1L = new THREE.Mesh(handleGeo, handleMat);
    handle1L.position.set(-0.02, -cabinetHeight * 0.3, doorThickness / 2 + 0.01);
    door1L.add(handle1L);
    const handle1R = new THREE.Mesh(handleGeo, handleMat);
    handle1R.position.set(0.02, -cabinetHeight * 0.3, doorThickness / 2 + 0.01);
    door1R.add(handle1R);

    cab1.position.set(-wallLen / 2 + wallTh + cabinetDepth / 2, wallHt - 0.8, 4.5); 
    cab1.rotation.y = Math.PI / 2;
    cab1.castShadow = true;
    cab1.receiveShadow = true;
    cabinetGroup.add(cab1);

    const cab2 = cab1.clone(true); 
    cab2.position.set(-0.5, wallHt - 0.8, -wallLen / 2 + cabinetDepth / 2); 
    cab2.rotation.y = 0; 
    cabinetGroup.add(cab2);

    scene.add(cabinetGroup);
    scene.updateMatrixWorld(); 

    colliders.push(new THREE.Box3().setFromObject(cab1));
    colliders.push(new THREE.Box3().setFromObject(cab2));
}

function createFloorCabinet(world) {
    const { scene, colliders } = world;
    const wallLen = 20;

    const cabinetHeight = 0.8;
    const cabinetWidth = 0.6;
    const cabinetDepth = 0.5;
    const floorCabMat = new THREE.MeshStandardMaterial({ color: 0x404048, roughness: 0.6, metalness: 0.3 }); 
    const drawerFrontMat = new THREE.MeshStandardMaterial({ color: 0x454550, roughness: 0.5, metalness: 0.35 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.3, metalness: 0.7 });

    const cabinet = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(cabinetWidth, cabinetHeight, cabinetDepth);
    const body = new THREE.Mesh(bodyGeo, floorCabMat);
    body.castShadow = true;
    body.receiveShadow = true;
    cabinet.add(body);

    const numDrawers = 4;
    const drawerHeight = (cabinetHeight * 0.9) / numDrawers; 
    const drawerGap = (cabinetHeight * 0.1) / (numDrawers + 1);
    const drawerFrontDepth = 0.02;

    for (let i = 0; i < numDrawers; i++) {
        const yPos = cabinetHeight / 2 - drawerGap * (i + 1) - drawerHeight * (i + 0.5);
        const drawerFrontGeo = new THREE.BoxGeometry(cabinetWidth * 0.95, drawerHeight, drawerFrontDepth);
        const drawerFront = new THREE.Mesh(drawerFrontGeo, drawerFrontMat);
        drawerFront.position.set(0, yPos, cabinetDepth / 2 + drawerFrontDepth / 2);

        const handleGeo = new THREE.BoxGeometry(cabinetWidth * 0.6, 0.03, 0.03);
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.position.z = drawerFrontDepth / 2 + 0.015; 
        drawerFront.add(handle);
        drawerFront.castShadow = true;
        cabinet.add(drawerFront);
    }

    cabinet.position.set(wallLen / 2 - cabinetWidth / 2 - 0.5, cabinetHeight / 2, wallLen / 2 - cabinetDepth / 2 - 1.0);
    cabinet.rotation.y = -Math.PI / 2; 
    cabinet.castShadow = true; 
    cabinet.receiveShadow = true;
    scene.add(cabinet);
    colliders.push(new THREE.Box3().setFromObject(cabinet));
}