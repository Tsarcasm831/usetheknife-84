import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { createNoise2D } from 'simplex-noise';
import WebsimSocket from '../../utils/WebsimSocket.js';
import { slotThemes } from '../../constants/slotThemes.js';

// Core class: constructor, animate loop, DOMContentLoaded & exit handlers
export default class SocialSpaceCore {
    constructor(options) {
        this.webglContainer = document.getElementById('webgl-container');
        this.css3dContainer = document.getElementById('css3d-container');
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.webglContainer.appendChild(this.renderer.domElement);
        this.cssRenderer = new CSS3DRenderer();
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
        this.css3dContainer.appendChild(this.cssRenderer.domElement);
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.y = 1.8;
        this.controls = new PointerLockControls(this.camera, this.webglContainer);
        this.scene.add(this.controls.getObject());
        document.addEventListener('click', (event) => {
            if (!this.controls.isLocked && !this.chatActive && !event.target.closest('.slot-machine-ui')) {
                this.controls.lock();
            }
        });
        this.player = {
            velocity: new THREE.Vector3(),
            direction: new THREE.Vector3(),
            onGround: true,
            model: null,
            armStretch: 0,
            targetArmStretch: 0,
            firstPersonArms: null,
            legStretch: 1,
            targetLegStretch: 1,
            chompAmount: 0,
            targetChompAmount: 0,
            money: 100
        };
        // Movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.jump = false;
        this.sprint = false;
        
        // Chat state
        this.chatActive = false;
        this.room = null; // Will be set by multiplayer module
        this.css3dContainer = this.css3dContainer || document.getElementById('css3d-container');
        this.chatMessages = null; // Will be initialized by chat module
        this.chatInput = null; // Will be initialized by chat module
        this.chatHideTimer = null; // For auto-hiding chat
        
        // Store cleanup functions
        this._cleanupFunctions = [];
        
        // Add window resize cleanup
        const onResize = () => this.onWindowResize();
        window.addEventListener('resize', onResize);
        this._cleanupFunctions.push(() => window.removeEventListener('resize', onResize));
        
        this.crouch = false;
        this.rightArmRaised = false;
        this.leftArmRaised = false;
        this.chatActive = false;
        this.isHoldingQ = false;
        this.players = {};
        this.objects = [];
        this.occluderObjects = [];
        this.slotMachines = {};
        this.minesGames = {};
        this.noise2D = createNoise2D();
        this.raycaster = new THREE.Raycaster();
        this.uiRaycaster = new THREE.Raycaster();
        this.mousePosition = new THREE.Vector2(0, 0);
        this.hoveredElement = null;
        this.room = new WebsimSocket();
        // Initialize multiplayer only if mixin has been applied
        if (typeof this.initializeMultiplayer === 'function') {
            this.initializeMultiplayer();
        }
        // Rendering and input initialization now occurs after mixin application in subclass
        this.playerList = document.getElementById('player-list');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.currencyDisplay = document.getElementById('currency-display');
        this.chompIndicator = document.getElementById('chomp-indicator');
        this.chompIndicatorFill = document.getElementById('chomp-indicator-fill');
        if (typeof this.setupChatSystem === 'function') {
            this.setupChatSystem();
        }
        if (typeof this.addPlayerFaceToCamera === 'function') {
            this.addPlayerFaceToCamera();
        }
        this.prevTime = performance.now();
        this.animate();
        window.addEventListener('resize', () => this.onWindowResize());
        this.freeSpinsAvailable = 0;
        this.currentFreeSpinMachine = null;
        this.freeSpinsMultiplier = 1;
        this.freeSpinsIndicator = document.querySelector('.free-spins-indicator');
        this.freeSpinsCount = document.getElementById('free-spins-count');
        this.multiplierWheelContainer = document.querySelector('.multiplier-wheel-container');
        this.multiplierWheel = document.querySelector('.multiplier-wheel');
        this.wheelResult = document.querySelector('.wheel-result');
        if (typeof this.createMultiplierWheel === 'function') {
            this.createMultiplierWheel();
        }
        this.freeSpinsCounter = 0;
        this.totalWinnings = 0;
    }

    animate() {
        const time = performance.now();
        const delta = (time - this.prevTime) / 1000;
        // Movement physics
        if (this.controls.isLocked) {
            // --- Player boundary config (CLUB BOUNDS) ---
            // Adjust these to set the allowed area for the player
            // For the whole club (default):
            const BOUNDS = {
                minX: -19.5, // left wall (roomSize/2 - wall thickness)
                maxX: 19.5,  // right wall
                minZ: -19.5, // back wall
                maxZ: 19.5   // front wall
            };
            // --- To restrict only to the BAR AREA, use instead:
            // const BOUNDS = { minX: 4, maxX: 10, minZ: -6, maxZ: 6 };
            // -----------------------------------------------
            // friction and gravity
            this.player.velocity.x -= this.player.velocity.x * 10.0 * delta;
            this.player.velocity.z -= this.player.velocity.z * 10.0 * delta;
            this.player.velocity.y -= 9.8 * 10.0 * delta;
            // movement direction
            this.player.direction.set(0, 0, 0);
            if (this.moveForward) this.player.direction.z += 1;
            if (this.moveBackward) this.player.direction.z -= 1;
            if (this.moveLeft) this.player.direction.x -= 1;
            if (this.moveRight) this.player.direction.x += 1;
            this.player.direction.normalize();
            // acceleration
            const speed = this.sprint ? 800.0 : 400.0;
            this.player.velocity.z -= this.player.direction.z * speed * delta;
            this.player.velocity.x -= this.player.direction.x * speed * delta;
            // apply movement
            this.controls.moveRight(-this.player.velocity.x * delta);
            this.controls.moveForward(-this.player.velocity.z * delta);
            this.controls.getObject().position.y += this.player.velocity.y * delta;
            // ground collision
            if (this.controls.getObject().position.y < 1.8) {
                this.player.velocity.y = 0;
                this.controls.getObject().position.y = 1.8;
                this.player.onGround = true;
            }
            // --- Clamp player position to boundaries ---
            const pos = this.controls.getObject().position;
            pos.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, pos.x));
            pos.z = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, pos.z));
            // ------------------------------------------
        }
        // Animate arms and chomp UI only if arms are ready
        if (this.controls.isLocked && this.player.firstPersonArms?.left?.rotation && this.player.firstPersonArms?.right?.rotation) {
            const leftArm = this.player.firstPersonArms.left;
            const rightArm = this.player.firstPersonArms.right;
            const raisedAngle = -Math.PI / 2.2;
            const loweredAngle = Math.PI / 7;
            const armSpring = 0.15;
            // Arm rotation easing
            const targetLeft = this.leftArmRaised ? raisedAngle : loweredAngle;
            leftArm.rotation.x += (targetLeft - leftArm.rotation.x) * armSpring;
            const targetRight = this.rightArmRaised ? raisedAngle : loweredAngle;
            rightArm.rotation.x += (targetRight - rightArm.rotation.x) * armSpring;
            // Chomp indicator
            if (this.player.chompAmount > 0.01) {
                this.chompIndicator.style.display = 'block';
                const pct = Math.min(100, this.player.chompAmount * 100);
                this.chompIndicatorFill.style.width = `${pct}%`;
            } else {
                this.chompIndicator.style.display = 'none';
            }
            // Presence update throttle
            if (!this.lastPresenceUpdateTime || time - this.lastPresenceUpdateTime > 50) {
                const pos = this.controls.getObject().position;
                const quat = this.camera.quaternion;
                this.room.updatePresence({
                    position: { x: pos.x, y: pos.y, z: pos.z },
                    quaternion: { x: quat.x, y: quat.y, z: quat.z, w: quat.w },
                    leftArmRaised: this.leftArmRaised,
                    rightArmRaised: this.rightArmRaised,
                    armStretch: this.player.armStretch,
                    legStretch: this.player.legStretch,
                    chompAmount: this.player.chompAmount
                });
                this.lastPresenceUpdateTime = time;
            }
        }
        // Update all AnimationMixers (for animated models like the dancer)
        if (this.mixers && Array.isArray(this.mixers)) {
            for (let i = 0; i < this.mixers.length; i++) {
                this.mixers[i].update(delta);
            }
        }
        // Only process occlusion after rendering mixin applied
        if (typeof this.processOcclusion === 'function') {
            this.processOcclusion(this.slotMachines);
            this.processOcclusion(this.minesGames);
        }
        this.renderer.render(this.scene, this.camera);
        this.cssRenderer.render(this.scene, this.camera);
        this.prevTime = time;
        requestAnimationFrame(() => this.animate());
    }

    // Create noise texture for procedural material maps
    createNoiseTexture(width, height, scale, contrast, brightness, tiledFloor = false) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const noiseX = x / width;
                const noiseY = y / height;
                const value = this.noise2D(noiseX * scale, noiseY * scale);
                const normalized = (value + 1) / 2;
                let adjusted = (normalized - 0.5) * (contrast * 2) + 0.5 + (brightness - 0.5);
                adjusted = Math.max(0, Math.min(1, adjusted));
                const col = Math.floor(adjusted * 255);
                const idx = (y * width + x) * 4;
                data[idx] = col;
                data[idx + 1] = col;
                data[idx + 2] = col;
                data[idx + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    // Apply noise-based textures to a material
    applyNoiseToMaterial(material, textureSize = 1024, scale = 0.05, contrast = 0.7, brightness = 0.5, tiledFloor = false) {
        console.log('[applyNoiseToMaterial] called with', { material, textureSize, scale, contrast, brightness, tiledFloor });
        const noiseTexture = this.createNoiseTexture(textureSize, textureSize, scale, contrast, brightness, tiledFloor);
        noiseTexture.wrapS = THREE.RepeatWrapping;
        noiseTexture.wrapT = THREE.RepeatWrapping;
        const repeat = tiledFloor ? 8 : 2;
        noiseTexture.repeat.set(repeat, repeat);
        const bumpTexture = this.createNoiseTexture(textureSize, textureSize, scale * 0.5, contrast * 1.2, brightness, tiledFloor);
        bumpTexture.wrapS = THREE.RepeatWrapping;
        bumpTexture.wrapT = THREE.RepeatWrapping;
        bumpTexture.repeat.set(repeat, repeat);
        const roughTexture = this.createNoiseTexture(textureSize, textureSize, scale * 1.5, contrast, brightness * 0.9, tiledFloor);
        roughTexture.wrapS = THREE.RepeatWrapping;
        roughTexture.wrapT = THREE.RepeatWrapping;
        roughTexture.repeat.set(repeat, repeat);
        // Debug: log texture creation
        console.log('[applyNoiseToMaterial] Created textures', {
            noiseTexture,
            bumpTexture,
            roughTexture
        });
        if (!noiseTexture.image || !bumpTexture.image || !roughTexture.image) {
            console.warn('[applyNoiseToMaterial] One or more textures missing image data', {
                noiseTextureImage: noiseTexture.image,
                bumpTextureImage: bumpTexture.image,
                roughTextureImage: roughTexture.image
            });
        }
        const side = material.side;
        if (!(material instanceof THREE.MeshStandardMaterial)) {
            const color = material.color ? material.color.clone() : new THREE.Color(0xffffff);
            const rough = material.roughness !== undefined ? material.roughness : 0.8;
            const metal = material.metalness !== undefined ? material.metalness : 0.2;
            material = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, side });
        } else {
            material.side = side;
            const hsl = {};
            material.color.getHSL(hsl);
            hsl.s *= 0.95 + Math.random() * 0.1;
            hsl.l *= 0.95 + Math.random() * 0.1;
            material.color.setHSL(hsl.h, hsl.s, hsl.l);
        }
        material.map = noiseTexture;
        material.bumpMap = bumpTexture;
        material.bumpScale = 0.01 + Math.random() * 0.02;
        material.roughnessMap = roughTexture;
        material.needsUpdate = true;
        // Debug: log material assignment
        console.log('[applyNoiseToMaterial] Assigned textures to material', {
            material,
            map: material.map,
            bumpMap: material.bumpMap,
            roughnessMap: material.roughnessMap
        });
        if (!material.map || !material.map.image) {
            console.error('[applyNoiseToMaterial] Material map is missing or has no image data', material.map);
        }
        if (!material.bumpMap || !material.bumpMap.image) {
            console.error('[applyNoiseToMaterial] Material bumpMap is missing or has no image data', material.bumpMap);
        }
        if (!material.roughnessMap || !material.roughnessMap.image) {
            console.error('[applyNoiseToMaterial] Material roughnessMap is missing or has no image data', material.roughnessMap);
        }
        return material;
    }
    
    /**
     * Handle window resize events
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Clean up resources and event listeners
     */
    cleanup() {
        // Clear any active timers
        if (this.chatHideTimer) {
            clearTimeout(this.chatHideTimer);
            this.chatHideTimer = null;
        }
        
        // Run all cleanup functions
        this._cleanupFunctions.forEach(cleanup => cleanup());
        this._cleanupFunctions = [];
        
        // Clean up Three.js resources
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            this.renderer.domElement = null;
            this.renderer = null;
        }
        
        // Clean up scene
        if (this.scene) {
            while (this.scene.children.length > 0) {
                const object = this.scene.children[0];
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
                this.scene.remove(object);
            }
            this.scene = null;
        }
        
        // Clean up camera and controls
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }
        
        // Clean up DOM elements
        if (this.webglContainer && this.webglContainer.parentNode) {
            this.webglContainer.parentNode.removeChild(this.webglContainer);
        }
        
        if (this.css3dContainer && this.css3dContainer.parentNode) {
            this.css3dContainer.parentNode.removeChild(this.css3dContainer);
        }
    }
}
