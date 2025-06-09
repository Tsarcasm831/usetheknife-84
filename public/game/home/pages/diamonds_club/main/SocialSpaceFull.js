import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { createNoise2D } from 'simplex-noise';

// Provide dummy WebsimSocket for non-Websim environment
const WebsimSocket = window.WebsimSocket || class {
    constructor() {
        console.warn('Dummy WebsimSocket initialized');
    }
    initialize() { return Promise.resolve(); }
    updateRoomState() {}
    updatePresence() {}
    subscribePresence(cb) {}
    subscribeRoomState(cb) {}
    subscribePresenceUpdateRequests(cb) {}
    onmessage = null;
    on() {}
    emit() {}
};

// --- Define Slot Machine Themes ---
const slotThemes = [
    {
        name: "Hellfire",
        symbols: ['7', '❌', '👹', '👿', '🔥', '💀', '🌋', '⚰️'],
        colors: {
            background: '#330000',
            border: '#990000',
            text: '#ff9900',
            reelBg: '#440000',
            reelText: '#ffcc00',
            reelBorder: '#aa0000',
            buttonBg: '#990000',
            buttonText: '#ffcc00',
            buttonBorder: '#ff6600',
            buttonHoverBg: '#cc0000',
            buttonHoverShadow: '#ff3300',
            buttonActiveBg: '#660000',
            betBg: '#990000',
            betText: '#ffcc00',
            betBorder: '#ff6600',
            messageDefault: '#ff3300',
            messageWin: '#ffffaa',
            messageLose: '#ff4444',
            themeName: '#ff9900'
        },
        loseMessage: "Soul not worthy!"
    },
    {
        name: "Ocean Deep",
        symbols: ['7', '❌', '🐙', '🐠', '🐳', '🦀', '⚓', '🔱', '🐡'],
        colors: {
            background: '#001f3f', // Dark blue
            border: '#0074D9',     // Bright blue
            text: '#7FDBFF',       // Light cyan
            reelBg: '#003366',
            reelText: '#A6E5FF',
            reelBorder: '#005ea8',
            buttonBg: '#0074D9',
            buttonText: '#FFFFFF',
            buttonBorder: '#7FDBFF',
            buttonHoverBg: '#008be0',
            buttonHoverShadow: '#7FDBFF',
            buttonActiveBg: '#005ea8',
            betBg: '#0074D9',
            betText: '#FFFFFF',
            betBorder: '#7FDBFF',
            messageDefault: '#7FDBFF',
            messageWin: '#A6E5FF',
            messageLose: '#ff4444',
            themeName: '#7FDBFF'
        },
        loseMessage: "The depths claim your gold!"
    },
    {
        name: "Jungle Fever",
        symbols: ['7', '❌', '🐒', '🐍', '🌴', '🍌', '🌺', '🐯', '🦜'],
        colors: {
            background: '#1e4620', // Dark jungle green
            border: '#2ECC40',     // Lime green
            text: '#FFDC00',       // Yellow
            reelBg: '#29602c',
            reelText: '#F0FF99',
            reelBorder: '#25a834',
            buttonBg: '#2ECC40',
            buttonText: '#111111',
            buttonBorder: '#FFDC00',
            buttonHoverBg: '#3fff53',
            buttonHoverShadow: '#FFDC00',
            buttonActiveBg: '#25a834',
            betBg: '#2ECC40',
            betText: '#111111',
            betBorder: '#FFDC00',
            messageDefault: '#FFDC00',
            messageWin: '#F0FF99',
            messageLose: '#ff4444',
            themeName: '#FFDC00'
        },
        loseMessage: "Lost in the jungle!"
    },
    {
        name: "Cosmic Void",
        symbols: ['7', '❌', '👽', '🚀', '⭐', '🪐', '☄️', '🌌', '🛸'],
        colors: {
            background: '#111122', // Very dark blue/purple
            border: '#B10DC9',     // Purple
            text: '#F012BE',       // Magenta
            reelBg: '#222244',
            reelText: '#DDDDFF',
            reelBorder: '#8A0FAD',
            buttonBg: '#B10DC9',
            buttonText: '#FFFFFF',
            buttonBorder: '#F012BE',
            buttonHoverBg: '#c71edb',
            buttonHoverShadow: '#F012BE',
            buttonActiveBg: '#8A0FAD',
            betBg: '#B10DC9',
            betText: '#FFFFFF',
            betBorder: '#F012BE',
            messageDefault: '#F012BE',
            messageWin: '#DDDDFF',
            messageLose: '#ff4444',
            themeName: '#F012BE'
        },
        loseMessage: "Sucked into the void!"
    },
    {
        name: "Desert Mirage",
        symbols: ['7', '❌', '🏜️', '🐪', '🦂', '🌵', '🏺', '☀️', '💎'],
        colors: {
            background: '#593d28', // Sandy brown
            border: '#FF851B',     // Orange
            text: '#FFDC00',       // Gold/Yellow
            reelBg: '#755238',
            reelText: '#FFF0A5',
            reelBorder: '#e07517',
            buttonBg: '#FF851B',
            buttonText: '#3d2c1f',
            buttonBorder: '#FFDC00',
            buttonHoverBg: '#ff9a3d',
            buttonHoverShadow: '#FFDC00',
            buttonActiveBg: '#e07517',
            betBg: '#FF851B',
            betText: '#3d2c1f',
            betBorder: '#FFDC00',
            messageDefault: '#FFDC00',
            messageWin: '#FFF0A5',
            messageLose: '#ff4444',
            themeName: '#FFDC00'
        },
        loseMessage: "Just a mirage, traveler!"
    },
    // --- NEW THEMES START HERE ---
    {
        name: "Retro Arcade",
        symbols: ['7', '❌', '🕹️', '👾', '🚀', '🏅', '💯', '⚡', '💾'],
        colors: {
            background: '#1a1a1a', // Dark grey
            border: '#00ffff',     // Cyan
            text: '#ff00ff',       // Magenta
            reelBg: '#333333',
            reelText: '#00ff00',   // Bright green
            reelBorder: '#555555',
            buttonBg: '#00ffff',
            buttonText: '#111111',
            buttonBorder: '#ff00ff',
            buttonHoverBg: '#50ffff',
            buttonHoverShadow: '#ff00ff',
            buttonActiveBg: '#00aaaa',
            betBg: '#00ffff',
            betText: '#111111',
            betBorder: '#ff00ff',
            messageDefault: '#ff00ff',
            messageWin: '#00ff00',
            messageLose: '#ff4444',
            themeName: '#00ffff'
        },
        loseMessage: "GAME OVER! Insert coin!"
    },
    {
        name: "Enchanted Forest",
        symbols: ['7', '❌', '🍄', '🎍', '☯️', '🏮', '🍵', '⛰️', '💧'],
        colors: {
            background: '#003300', // Dark green
            border: '#669966',     // Moss green
            text: '#ccffcc',       // Light green
            reelBg: '#004d00',
            reelText: '#99ff99',
            reelBorder: '#336633',
            buttonBg: '#669966',
            buttonText: '#002200',
            buttonBorder: '#ccffcc',
            buttonHoverBg: '#85b285',
            buttonHoverShadow: '#ccffcc',
            buttonActiveBg: '#4d7a4d',
            betBg: '#669966',
            betText: '#002200',
            betBorder: '#ccffcc',
            messageDefault: '#ccffcc',
            messageWin: '#99ff99',
            messageLose: '#ff6666',
            themeName: '#99ff99'
        },
        loseMessage: "The forest's magic eludes you!"
    },
    {
        name: "Steampunk Gears",
        symbols: ['7', '❌', '⚙️', '🔧', '🕰️', '🎩', '💡', '🚂', '🧭'],
        colors: {
            background: '#4d3319', // Dark brown
            border: '#b38663',     // Bronze
            text: '#ffe6cc',       // Cream
            reelBg: '#664422',
            reelText: '#ffd1a3',
            reelBorder: '#806040',
            buttonBg: '#b38663',
            buttonText: '#332211',
            buttonBorder: '#ffe6cc',
            buttonHoverBg: '#cc9f7e',
            buttonHoverShadow: '#ffe6cc',
            buttonActiveBg: '#996f57',
            betBg: '#b38663',
            betText: '#332211',
            betBorder: '#ffe6cc',
            messageDefault: '#ffe6cc',
            messageWin: '#ffd1a3',
            messageLose: '#ff8888',
            themeName: '#b38663'
        },
        loseMessage: "Gears grind to a halt!"
    },
    {
        name: "Candy Kingdom",
        symbols: ['7', '❌', '🍬', '🍭', '🍫', '🍩', '🍰', '🍦', '👑'],
        colors: {
            background: '#ffccf2', // Light pink
            border: '#ff66cc',     // Bright pink
            text: '#66004d',       // Dark magenta
            reelBg: '#ff99e6',
            reelText: '#ffffff',   // White
            reelBorder: '#e600ac',
            buttonBg: '#ff66cc',
            buttonText: '#ffffff',
            buttonBorder: '#ffff99', // Light yellow
            buttonHoverBg: '#ff85d6',
            buttonHoverShadow: '#ffff99',
            buttonActiveBg: '#e600ac',
            betBg: '#ff66cc',
            betText: '#ffffff',
            betBorder: '#ffff99',
            messageDefault: '#66004d',
            messageWin: '#ffffff',
            messageLose: '#cc0000',
            themeName: '#ff66cc'
        },
        loseMessage: "Sugar crash! Better luck next time!"
    },
    {
        name: "Wild West",
        symbols: ['7', '❌', '🤠', '🐴', '🌵', '💰', '🌟', '🔫', '🚪'],
        colors: {
            background: '#663300', // Dark leather brown
            border: '#cc9900',     // Gold-ish brown
            text: '#ffffcc',       // Pale yellow
            reelBg: '#804000',
            reelText: '#ffe066',
            reelBorder: '#a66600',
            buttonBg: '#cc9900',
            buttonText: '#4d2600',
            buttonBorder: '#ffffcc',
            buttonHoverBg: '#e6ae1a',
            buttonHoverShadow: '#ffffcc',
            buttonActiveBg: '#a66600',
            betBg: '#cc9900',
            betText: '#4d2600',
            betBorder: '#ffffcc',
            messageDefault: '#ffffcc',
            messageWin: '#ffe066',
            messageLose: '#ff4444',
            themeName: '#cc9900'
        },
        loseMessage: "This town ain't big enough for winners!"
    },
    {
        name: "Ancient Egypt",
        symbols: ['7', '❌', '🏛️', '🐞', '☥', '🐍', '👑', '☀️', '🏺'],
        colors: {
            background: '#001a33', // Deep blue
            border: '#ffd700',     // Gold
            text: '#e0e0e0',       // Off-white
            reelBg: '#002b55',
            reelText: '#fffacd',   // Lemon chiffon (gold-ish)
            reelBorder: '#b8860b', // Dark goldenrod
            buttonBg: '#ffd700',
            buttonText: '#001a33',
            buttonBorder: '#00e5ee', // Turquoise
            buttonHoverBg: '#ffec80',
            buttonHoverShadow: '#00e5ee',
            buttonActiveBg: '#b8860b',
            betBg: '#ffd700',
            betText: '#001a33',
            betBorder: '#00e5ee',
            messageDefault: '#e0e0e0',
            messageWin: '#fffacd',
            messageLose: '#ff6347', // Tomato red
            themeName: '#ffd700'
        },
        loseMessage: "The pharaoh's curse strikes!"
    },
    {
        name: "Viking Valor",
        symbols: ['7', '❌', '🛡️', '⚔️', '⛵', '🍺', '🐻', '🌲', '🌀'],
        colors: {
            background: '#1f2e3d', // Dark slate blue/grey
            border: '#c0c0c0',     // Silver
            text: '#e1e1e1',       // Light grey
            reelBg: '#2d4256',
            reelText: '#ffffff',
            reelBorder: '#a0a0a0',
            buttonBg: '#c0c0c0',
            buttonText: '#10151c',
            buttonBorder: '#87ceeb', // Sky blue
            buttonHoverBg: '#d8d8d8',
            buttonHoverShadow: '#87ceeb',
            buttonActiveBg: '#a0a0a0',
            betBg: '#c0c0c0',
            betText: '#10151c',
            betBorder: '#87ceeb',
            messageDefault: '#e1e1e1',
            messageWin: '#ffffff',
            messageLose: '#dc143c', // Crimson
            themeName: '#c0c0c0'
        },
        loseMessage: "Valhalla denies your entry!"
    },
    {
        name: "Galactic Fruits",
        symbols: ['7', '❌', '🍇', '🍉', '🍓', '🍊', '🍒', '🍋', '🌟'],
        colors: {
            background: '#480048', // Deep purple
            border: '#ff00ff',     // Magenta
            text: '#ffff00',       // Yellow
            reelBg: '#6a006a',
            reelText: '#ffffff',
            reelBorder: '#cc00cc',
            buttonBg: '#ff00ff',
            buttonText: '#ffffff',
            buttonBorder: '#ffff00',
            buttonHoverBg: '#ff4dff',
            buttonHoverShadow: '#ffff00',
            buttonActiveBg: '#cc00cc',
            betBg: '#ff00ff',
            betText: '#ffffff',
            betBorder: '#ffff00',
            messageDefault: '#ffff00',
            messageWin: '#ffffff',
            messageLose: '#ff4444',
            themeName: '#ff00ff'
        },
        loseMessage: "Not so a-peeling this time!"
    },
    {
        name: "Haunted Mansion",
        symbols: ['7', '❌', '👻', '💀', '🕸️', '🕯️', '🦇', '🌕', '🚪'],
        colors: {
            background: '#1a1a1a', // Very dark grey
            border: '#660066',     // Dark purple
            text: '#aaddaa',       // Ghostly green
            reelBg: '#333333',
            reelText: '#ffffff',   // White
            reelBorder: '#4d004d',
            buttonBg: '#660066',
            buttonText: '#ffffff',
            buttonBorder: '#aaddaa',
            buttonHoverBg: '#800080',
            buttonHoverShadow: '#aaddaa',
            buttonActiveBg: '#4d004d',
            betBg: '#660066',
            betText: '#ffffff',
            betBorder: '#aaddaa',
            messageDefault: '#aaddaa',
            messageWin: '#ffffff',
            messageLose: '#ff3333',
            themeName: '#660066'
        },
        loseMessage: "The spirits have forsaken you!"
    },
    {
        name: "Zen Garden",
        symbols: ['7', '❌', '🌸', '🎍', '☯️', '🏮', '🍵', '⛰️', '💧'],
        colors: {
            background: '#e0f0e0', // Pale green
            border: '#90ee90',     // Light green
            text: '#556b2f',       // Dark olive green
            reelBg: '#c1e0c1',
            reelText: '#4f5d2f',
            reelBorder: '#78c278',
            buttonBg: '#90ee90',
            buttonText: '#002200',
            buttonBorder: '#ffb6c1', // Light pink
            buttonHoverBg: '#a0f4a0',
            buttonHoverShadow: '#ffb6c1',
            buttonActiveBg: '#78c278',
            betBg: '#90ee90',
            betText: '#002200',
            betBorder: '#ffb6c1',
            messageDefault: '#556b2f',
            messageWin: '#4f5d2f',
            messageLose: '#d2691e', // Chocolate brown (like soil)
            themeName: '#90ee90'
        },
        loseMessage: "Inner peace requires patience!"
    }
];

class SocialSpace {
    constructor() {
        this.webglContainer = document.getElementById('webgl-container');
        this.css3dContainer = document.getElementById('css3d-container');

        // Renderer setup (WebGL)
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.webglContainer.appendChild(this.renderer.domElement);

        // CSS3D Renderer setup
        this.cssRenderer = new CSS3DRenderer();
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
        this.css3dContainer.appendChild(this.cssRenderer.domElement);

        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);
        // Remove fog
        // this.scene.fog = new THREE.Fog(0x87ceeb, 10, 100);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.y = 1.8; // Player height

        // Controls
        this.controls = new PointerLockControls(this.camera, this.webglContainer);
        this.scene.add(this.controls.getObject());

        // Add event listener for pointer lock
        document.addEventListener('click', (event) => {
            // Prevent locking if clicking on the CSS3D UI itself
            if (!this.controls.isLocked && !this.chatActive && !event.target.closest('.slot-machine-ui')) {
                 this.controls.lock();
            }
        });

        // Player state
        this.player = {
            velocity: new THREE.Vector3(),
            direction: new THREE.Vector3(),
            onGround: true,
            model: null, // This seems unused, players{} holds models
            armStretch: 0,
            targetArmStretch: 0,
            firstPersonArms: null,
            legStretch: 1,
            targetLegStretch: 1,
            chompAmount: 0,
            targetChompAmount: 0,
            money: 100
        };

        // Controls state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.jump = false;
        this.sprint = false;
        this.crouch = false;
        this.rightArmRaised = false;
        this.leftArmRaised = false;
        this.chatActive = false;
        this.isHoldingQ = false;

        // Game objects
        this.players = {};
        this.objects = []; // Holds general static collidable objects (like walls)
        this.occluderObjects = []; // Holds objects that should occlude CSS3D UI
        this.slotMachines = {};
        this.minesGames = {};

        // Create noise function
        this.noise2D = createNoise2D();

        // Raycaster for occlusion
        this.raycaster = new THREE.Raycaster();
        
        // Raycaster for UI interaction
        this.uiRaycaster = new THREE.Raycaster();
        this.mousePosition = new THREE.Vector2(0, 0); // Center of screen
        this.hoveredElement = null; // Track currently hovered UI element
        
        // Setup multiplayer
        this.room = new WebsimSocket();
        this.initializeMultiplayer();

        // Lighting
        this.addLighting();

        // Create the level
        this.createCasinoLevel();

        // Key handlers
        this.setupInputHandlers();

        // UI elements
        this.playerList = document.getElementById('player-list');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.currencyDisplay = document.getElementById('currency-display');
        this.chompIndicator = document.getElementById('chomp-indicator');
        this.chompIndicatorFill = document.getElementById('chomp-indicator-fill');

        // Setup chat handlers
        this.setupChatSystem();

        // Add player face to camera/player view
        this.addPlayerFaceToCamera();

        // Start animation loop
        this.prevTime = performance.now();
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Free spins tracking
        this.freeSpinsAvailable = 0;
        this.currentFreeSpinMachine = null;
        this.freeSpinsMultiplier = 1;
        this.freeSpinsIndicator = document.querySelector('.free-spins-indicator');
        this.freeSpinsCount = document.getElementById('free-spins-count');
        this.multiplierWheelContainer = document.querySelector('.multiplier-wheel-container');
        this.multiplierWheel = document.querySelector('.multiplier-wheel');
        this.wheelResult = document.querySelector('.wheel-result');
        
        // Create multiplier wheel segments
        this.createMultiplierWheel();
        
        this.freeSpinsCounter = 0; 
        this.totalWinnings = 0; 
        this.isNewPlayer = true; 
        this.totalPlayerSpins = 0;
    }

    async initializeMultiplayer() {
        await this.room.initialize();

        // Initial presence setup
        this.room.updatePresence({
            position: { x: 0, y: 1.8, z: 0 },
            quaternion: { x: 0, y: 0, z: 0, w: 1 },
            leftArmRaised: false,
            rightArmRaised: false,
            armStretch: this.player.armStretch,
            legStretch: this.player.legStretch,
            chompAmount: this.player.chompAmount,
            money: this.player.money
        });

        // Subscribe to presence updates (for player movement, money changes, etc.)
        this.room.subscribePresence(presence => {
            // Update own money if received from presence update
            if (presence[this.room.clientId] && presence[this.room.clientId].money !== undefined) {
                this.player.money = presence[this.room.clientId].money;
                // Update UI only if the value actually changed
                const currentDisplayValue = parseInt(this.currencyDisplay.textContent.replace(/[^0-9]/g, ''));
                if (currentDisplayValue !== this.player.money) {
                     this.currencyDisplay.textContent = `$${this.player.money.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
                }
            }
            this.updatePlayers(presence);
            this.updatePlayerList(); // Update list when presence changes
        });

        // Subscribe to room state updates (for game states like slots, mines)
        this.room.subscribeRoomState(roomState => {
            if (roomState.slotMachines) {
                this.updateSlotMachinesFromRoomState(roomState.slotMachines);
            }
            if (roomState.minesGames) {
                this.updateMinesGamesFromRoomState(roomState.minesGames);
            }
        });

        // Subscribe to presence update requests (for receiving money)
        this.room.subscribePresenceUpdateRequests((updateRequest, fromClientId) => {
            const senderUsername = this.room.peers[fromClientId]?.username || 'Someone';
            const clientPresence = this.room.presence[this.room.clientId];

            if (updateRequest.type === 'giveMoney') {
                const amount = parseFloat(updateRequest.amount);
                if (amount > 0 && clientPresence) {
                    const currentMoney = parseFloat(clientPresence.money) || 0;
                    const newMoney = currentMoney + amount;
                    // Update own presence with the new amount
                    this.room.updatePresence({
                        money: newMoney
                    });
                    // Add chat feedback for receiver
                    this.addChatMessage(`${senderUsername} gave you $${amount.toLocaleString('en-US', {maximumFractionDigits: 0})}!`, 'system');
                }
            }
        });


        // Handle incoming messages/events
        this.room.onmessage = (event) => {
            const data = event.data;

            switch (data.type) {
                case 'connected':
                    console.log(`Player connected: ${data.username}`);
                    this.addChatMessage(`${data.username} entered the casino`, 'system');
                    this.updatePlayerList(); // Update list when someone connects
                    break;
                case 'disconnected':
                    console.log(`Player disconnected: ${data.username}`);
                    // Get username before potential removal from peers
                    const username = this.room.peers[data.clientId]?.username || this.players[data.clientId]?.username || 'Someone';
                    // Defer removal visual effects/messages until updatePlayers confirms removal
                     if (username !== 'Someone') {
                        this.addChatMessage(`${username} left the casino`, 'system');
                    }
                    // updatePlayers handles model removal and occluder removal
                    // updatePlayerList handles UI update
                    break;
                case 'chat':
                    this.addChatMessage(data.message, data.username);
                    break;
                 // --- Money Transfer Feedback ---
                case 'moneySent':
                     if (data.senderId === this.room.clientId) { // Message for the sender
                        this.addChatMessage(`You gave $${data.amount.toLocaleString('en-US', {maximumFractionDigits: 0})} to ${data.recipientUsername}.`, 'system');
                    }
                    break;
                case 'moneySendError':
                     if (data.senderId === this.room.clientId) { // Message for the sender
                        this.addChatMessage(`Error: ${data.message}`, 'system-error'); // Use a different style?
                    }
                    break;
                 // --- Mines Game Events ---
                case 'minesGameStart':
                    if (data.clientId !== this.room.clientId) {
                        this.addChatMessage(`${data.username} started a mines game with $${data.betAmount} bet (${data.mineCount} mines)`, 'system');
                    }
                    break;
                case 'minesCashout':
                    if (data.clientId !== this.room.clientId) {
                        let message = `${data.username} cashed out $${data.payout} after revealing ${data.revealed} tiles!`;
                        if (data.isPerfectGame) {
                            message = `🏆 PERFECT GAME! ${data.username} revealed all safe tiles and won $${data.payout}!`;
                        }
                        this.addChatMessage(message, 'system');
                    }
                    break;
                case 'minesBust':
                    if (data.clientId !== this.room.clientId) {
                        this.addChatMessage(`${data.username} hit a mine and lost $${data.betAmount} after revealing ${data.revealedCount} tiles`, 'system');
                    }
                    break;
            }
        };

        this.updatePlayerList();

        this.createFirstPersonArms();

        this.currencyDisplay.textContent = `$${this.player.money}`;
    }

    setupChatSystem() {
        document.addEventListener('keydown', (event) => {
            if ((event.key === 't' || event.key === 'Enter') && !this.chatActive && this.controls.isLocked) {
                event.preventDefault();
                this.openChat();
            } else if (event.key === 'Escape' && this.chatActive) {
                this.closeChat();
            } else if (event.key === 'Enter' && this.chatActive) {
                this.sendChatMessage();
            }
        });

        this.chatInput.addEventListener('blur', () => {
            if (this.chatActive) {
                // Delay closing chat on blur slightly to allow clicking send button etc. if ever needed
                setTimeout(() => {
                    if(this.chatActive && document.activeElement !== this.chatInput) {
                        this.closeChat();
                    }
                }, 100);
            }
        });
    }

    openChat() {
        this.chatActive = true;
        this.controls.unlock(); // Unlocks pointer lock
        this.chatInput.disabled = false;
        this.chatInput.focus();
        this.showChatContainer();
        // Allow pointer events on CSS3D layer for chat input (and potentially other UI later)
        this.css3dContainer.style.pointerEvents = 'auto';
    }

    closeChat() {
        this.chatActive = false;
        this.chatInput.disabled = true;
        this.chatInput.value = '';
        // Re-lock controls only if not interacting with other UI elements like slots
        if (!document.activeElement || !document.activeElement.closest('.slot-machine-ui')) {
             this.controls.lock();
             // If locked, disable pointer events on CSS3D again
             this.css3dContainer.style.pointerEvents = 'none';
        }
        // Hide chat container after a delay (handled by showChatContainer's timer)
    }

    sendChatMessage() {
        const message = this.chatInput.value.trim();
        if (message) {
            const username = this.room.peers[this.room.clientId]?.username || 'Player';
            // Send chat message via websocket
            this.room.send({
                type: 'chat',
                message: message,
                username: username // Include username for display on other clients
            });
            // Note: The message will be displayed locally via the 'chat' event received back
            this.chatInput.value = ''; // Clear input field
            this.closeChat(); // Close chat interface
        } else {
            this.closeChat(); // Close even if message is empty
        }
    }

    addChatMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        const senderUsername = this.room.peers[this.room.clientId]?.username; // Get current user's name

        if (sender === 'system') {
            messageElement.innerHTML = `<span style="color: #aaffaa;">${message}</span>`; // System messages in green
        } else if (sender === 'system-error') {
            messageElement.innerHTML = `<span style="color: #ffaaaa;">${message}</span>`; // Error messages in light red
        } else {
            const usernameSpan = document.createElement('span');
            usernameSpan.className = 'chat-username';

            // Color own messages differently
            if (sender === senderUsername) {
                usernameSpan.style.color = '#aaffaa'; // Own messages green
            } else {
                usernameSpan.style.color = '#aaaaff'; // Others' messages blueish
            }

            usernameSpan.textContent = sender; // Display sender's username

            messageElement.appendChild(usernameSpan);
            messageElement.appendChild(document.createTextNode(`: ${message}`)); // Add the message text
        }

        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight; // Scroll to bottom

        // Limit chat history
        while (this.chatMessages.children.length > 50) {
            this.chatMessages.removeChild(this.chatMessages.firstChild);
        }

        // Make chat visible briefly
        this.showChatContainer();
    }

    showChatContainer() {
        const chatContainer = document.getElementById('chat-container');
        chatContainer.style.opacity = '1'; // Make it visible

        // Clear existing timer if any
        if (this.chatHideTimer) {
            clearTimeout(this.chatHideTimer);
        }

        // Set a timer to hide the chat if not actively typing
        this.chatHideTimer = setTimeout(() => {
            if (!this.chatActive) { // Only hide if chat input is not focused
                chatContainer.style.opacity = '0';
            }
        }, 7000); // Hide after 7 seconds of inactivity
    }

    updatePlayers(presence) {
        const currentPeerIds = Object.keys(this.room.peers || {});
        const currentPlayers = Object.keys(this.players);

        // Update existing players and add new ones
        for (const clientId in presence) {
            if (clientId !== this.room.clientId) {
                const playerData = presence[clientId];
                const peerData = this.room.peers[clientId]; // Get peer info (username, avatar)

                // Skip if essential data is missing or peer doesn't exist anymore
                if (!playerData || !playerData.position || !peerData) continue;

                // If player model doesn't exist, create it
                if (!this.players[clientId]) {
                    this.createPlayerModel(clientId, peerData.username); // Pass username for potential use
                }

                // Update player model position, rotation, animations
                if (this.players[clientId] && this.players[clientId].model) {
                    const player = this.players[clientId];

                    // --- Position Interpolation ---
                    const currentPosition = new THREE.Vector3(
                        playerData.position.x,
                        playerData.position.y,
                        playerData.position.z
                    );
                     // Lerp for smoother movement
                    player.model.position.lerp(currentPosition, 0.3);

                    // --- Check for Movement (for walk cycle) ---
                    if (!player.lastPosition) player.lastPosition = new THREE.Vector3();
                    const movement = new THREE.Vector2(
                        currentPosition.x - player.lastPosition.x,
                        currentPosition.z - player.lastPosition.z
                    );
                    player.isMoving = movement.length() > 0.01; // Threshold to detect movement
                    player.lastPosition.copy(currentPosition); // Store current position for next frame's check


                    // --- Rotation Interpolation ---
                    if (playerData.quaternion) {
                        const targetQuaternion = new THREE.Quaternion(
                            playerData.quaternion.x,
                            playerData.quaternion.y,
                            playerData.quaternion.z,
                            playerData.quaternion.w
                        );
                        // Slerp for smoother rotation
                        player.model.quaternion.slerp(targetQuaternion, 0.15);
                    }

                    // --- Walk Cycle Animation ---
                    if (player.isMoving) {
                        player.walkCycle = (player.walkCycle || 0) + movement.length() * 2.5; // Increment walk cycle based on distance moved
                        if (player.leftLegSegments && player.rightLegSegments) {
                            const legAngle = Math.sin(player.walkCycle) * 0.5; // Calculate swing angle
                            this.animateSegmentedLeg(player.leftLegGroup, player.leftLegSegments, legAngle, player.model.position);
                            this.animateSegmentedLeg(player.rightLegGroup, player.rightLegSegments, -legAngle, player.model.position);
                        }
                    } else {
                        // Reset legs to idle position if not moving
                        if (player.leftLegSegments && player.rightLegSegments) {
                            this.resetSegmentedLeg(player.leftLegGroup, player.leftLegSegments);
                            this.resetSegmentedLeg(player.rightLegGroup, player.rightLegSegments);
                        }
                        player.walkCycle = 0;
                    }


                     // --- Arm Raise Animation ---
                    if (player.leftArm) {
                        const targetLeftArmRotX = playerData.leftArmRaised ? -Math.PI / 2 : (player.leftArm.userData.baseRotation?.x || 0);
                        player.leftArm.rotation.x += (targetLeftArmRotX - player.leftArm.rotation.x) * 0.2; // Smooth transition
                    }
                    if (player.rightArm) {
                        const targetRightArmRotX = playerData.rightArmRaised ? -Math.PI / 2 : (player.rightArm.userData.baseRotation?.x || 0);
                        player.rightArm.rotation.x += (targetRightArmRotX - player.rightArm.rotation.x) * 0.2; // Smooth transition
                    }

                     // --- Arm Stretch Animation ---
                    if (playerData.armStretch !== undefined) player.targetArmStretch = playerData.armStretch;
                    player.armStretch += (player.targetArmStretch - player.armStretch) * 0.1; // Smooth transition
                    const currentStretchScale = 1 + player.armStretch * 2; // Calculate scale based on stretch value
                    const currentStretchOffset = -player.armStretch * 0.8; // Calculate position offset

                    if (player.leftArm && player.rightArm) {
                        // Apply stretch only when arm is raised
                        const targetLeftScaleY = playerData.leftArmRaised ? currentStretchScale : 1;
                        const targetLeftPosZ = playerData.leftArmRaised ? player.leftArm.userData.basePosition.z + currentStretchOffset : player.leftArm.userData.basePosition.z;
                        player.leftArm.scale.y += (targetLeftScaleY - player.leftArm.scale.y) * 0.2; // Smooth scale transition
                        player.leftArm.position.z += (targetLeftPosZ - player.leftArm.position.z) * 0.2; // Smooth position transition

                        const targetRightScaleY = playerData.rightArmRaised ? currentStretchScale : 1;
                        const targetRightPosZ = playerData.rightArmRaised ? player.rightArm.userData.basePosition.z + currentStretchOffset : player.rightArm.userData.basePosition.z;
                        player.rightArm.scale.y += (targetRightScaleY - player.rightArm.scale.y) * 0.2; // Smooth scale transition
                        player.rightArm.position.z += (targetRightPosZ - player.rightArm.position.z) * 0.2; // Smooth position transition
                    }

                     // --- Leg Stretch Animation ---
                    if (playerData.legStretch !== undefined) player.targetLegStretch = playerData.legStretch;
                    player.legStretch += (player.targetLegStretch - player.legStretch) * 0.1; // Smooth transition
                    if (player.leftLegGroup && player.rightLegGroup && player.leftLegSegments && player.rightLegSegments) {
                        const newLegScale = player.legStretch;
                        // Apply scale to each leg segment
                        player.leftLegSegments.forEach(seg => seg.scale.y = newLegScale);
                        player.rightLegSegments.forEach(seg => seg.scale.y = newLegScale);

                        // Adjust model height based on leg stretch (simplified)
                        const baseHeight = 1.8; // Assumed base height
                        const targetY = baseHeight + (player.legStretch - 1) * 1.5; // Target Y based on stretch
                        player.model.position.y += (targetY - player.model.position.y) * 0.1; // Smooth height transition
                    }


                    // --- Chomp Animation ---
                    if (playerData.chompAmount !== undefined) player.targetChompAmount = playerData.chompAmount;
                    player.chompAmount += (player.targetChompAmount - player.chompAmount) * 0.2; // Smooth transition
                    if (player.headTop && player.headBottom) {
                        const maxChompAngle = Math.PI / 6; // Max angle for jaw opening
                        const currentChompAngle = player.chompAmount * maxChompAngle;
                        player.headTop.rotation.x = currentChompAngle; // Rotate top jaw up
                        player.headBottom.rotation.x = -currentChompAngle; // Rotate bottom jaw down
                    }

                     // Update player's username if stored (might be useful)
                     player.username = peerData.username;
                }
            }
        }

        // Remove models for players who are no longer present or in peers list
        for (const clientId of currentPlayers) {
             // Check if player still exists in presence OR in the peers list
            if (!presence[clientId] || !currentPeerIds.includes(clientId)) {
                if (this.players[clientId] && this.players[clientId].model) {
                    this.scene.remove(this.players[clientId].model);

                    // Remove from occluder list
                    const index = this.occluderObjects.indexOf(this.players[clientId].model);
                    if (index > -1) {
                        this.occluderObjects.splice(index, 1);
                    }
                     console.log(`Removing model and occluder for disconnected player: ${clientId}`);
                }
                delete this.players[clientId]; // Remove from local player cache
            }
        }
    }

    createPlayerModel(clientId, username = 'Player') { // Added username parameter
        const modelGroup = new THREE.Group();
        modelGroup.userData.clientId = clientId; // Store client ID

        const headRadius = 0.7;
        // Generate a color based on clientId hash
        let hash = 0;
        for (let i = 0; i < clientId.length; i++) {
            hash = clientId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const headColor = new THREE.Color().setHSL((hash % 360) / 360, 0.6 + (hash % 40) / 100, 0.4 + (hash % 30) / 100);

        // Material settings for noise
        const textureSize = 256;
        const scale = 0.15;
        const contrast = 0.4;
        const brightness = 0.6;

        // Base material for head
        const headMaterial = new THREE.MeshLambertMaterial({
            color: headColor,
            side: THREE.DoubleSide // Render inside for chomp view
        });
        // Apply noise texture to the material
        const noisyHeadMaterial = this.applyNoiseToMaterial(headMaterial, textureSize, scale, contrast, brightness);

        // Create top half of the head (sphere)
        const headTopGeometry = new THREE.SphereGeometry(headRadius, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const headTop = new THREE.Mesh(headTopGeometry, noisyHeadMaterial.clone());
        headTop.material.side = THREE.DoubleSide; // Ensure inside is visible when chomping
        headTop.position.y = 0; // Pivot point at the center
        modelGroup.add(headTop);

        // Create bottom half of the head (sphere)
        const headBottomGeometry = new THREE.SphereGeometry(headRadius, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        const headBottom = new THREE.Mesh(headBottomGeometry, noisyHeadMaterial.clone());
        headBottom.material.side = THREE.DoubleSide; // Ensure inside is visible when chomping
        headBottom.position.y = 0; // Pivot point at the center
        modelGroup.add(headBottom);

        // Eyes (attached to the top head part)
        const eyeGroup = new THREE.Group();
        const eyeGeometry = new THREE.SphereGeometry(0.12, 8, 8); // Small black spheres
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const noisyEyeMaterial = this.applyNoiseToMaterial(eyeMaterial, 128, 0.5, 0.2, 0.2); // Subtle noise

        const leftEye = new THREE.Mesh(eyeGeometry, noisyEyeMaterial.clone());
        // Position eyes relative to head center
        leftEye.position.set(0.25, headRadius * 0.3, -headRadius * 0.8);
        eyeGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, noisyEyeMaterial.clone());
        // Position eyes relative to head center
        rightEye.position.set(-0.25, headRadius * 0.3, -headRadius * 0.8);
        eyeGroup.add(rightEye);

        headTop.add(eyeGroup); // Attach eyes to the top half of the head

        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 6); // Hexagonal cylinder
        const armMaterial = new THREE.MeshLambertMaterial({ color: headColor }); // Same base color as head
        const noisyArmMaterial = this.applyNoiseToMaterial(armMaterial, textureSize, scale, contrast, brightness);

        const leftArm = new THREE.Mesh(armGeometry, noisyArmMaterial.clone());
        leftArm.position.set(headRadius + 0.1, -0.4, 0); // Position relative to head center
        leftArm.userData.basePosition = leftArm.position.clone(); // Store base position for animation
        leftArm.userData.baseRotation = new THREE.Euler().copy(leftArm.rotation); // Store base rotation
        modelGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, noisyArmMaterial.clone());
        rightArm.position.set(-(headRadius + 0.1), -0.4, 0); // Position relative to head center
        rightArm.userData.basePosition = rightArm.position.clone(); // Store base position
        rightArm.userData.baseRotation = new THREE.Euler().copy(rightArm.rotation); // Store base rotation
        modelGroup.add(rightArm);

        // Segmented Legs
        const segmentsPerLeg = 3;
        const legHeight = 1.5;
        const segmentHeight = legHeight / segmentsPerLeg;

        // Left Leg
        const leftLegSegments = [];
        const leftLegGroup = new THREE.Group();
        leftLegGroup.position.set(0.2, -headRadius * 0.8, 0); // Position relative to head bottom center

        for (let i = 0; i < segmentsPerLeg; i++) {
            const segmentGeometry = new THREE.CylinderGeometry(0.12, 0.12, segmentHeight, 5); // Pentagon cylinder
            const segment = new THREE.Mesh(segmentGeometry, noisyArmMaterial.clone()); // Use noisy arm material
            segment.position.y = -segmentHeight / 2; // Center pivot
            if (i > 0) {
                segment.position.y = -segmentHeight; // Position below the previous segment
                leftLegSegments[i - 1].add(segment); // Add to the previous segment for chaining
            } else {
                leftLegGroup.add(segment); // Add the first segment to the leg group
            }
            leftLegSegments.push(segment); // Store segment reference
        }

        // Right Leg (similar structure)
        const rightLegSegments = [];
        const rightLegGroup = new THREE.Group();
        rightLegGroup.position.set(-0.2, -headRadius * 0.8, 0);

        for (let i = 0; i < segmentsPerLeg; i++) {
            const segmentGeometry = new THREE.CylinderGeometry(0.12, 0.12, segmentHeight, 5);
            const segment = new THREE.Mesh(segmentGeometry, noisyArmMaterial.clone());
            segment.position.y = -segmentHeight / 2;
            if (i > 0) {
                segment.position.y = -segmentHeight; // Position below the previous segment
                rightLegSegments[i - 1].add(segment);
            } else {
                rightLegGroup.add(segment);
            }
            rightLegSegments.push(segment);
        }

        modelGroup.add(leftLegGroup); // Add legs to the main model group
        modelGroup.add(rightLegGroup);

        // Enable shadows for the model and its parts
        modelGroup.castShadow = true;
        modelGroup.receiveShadow = true;
        modelGroup.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        this.scene.add(modelGroup);
        this.occluderObjects.push(modelGroup); // Add to occluders list

        // Store references to model parts for easy access in animations/updates
        this.players[clientId] = {
            model: modelGroup,
            headTop: headTop,
            headBottom: headBottom,
            leftArm: leftArm,
            rightArm: rightArm,
            leftLegGroup: leftLegGroup,
            rightLegGroup: rightLegGroup,
            leftLegSegments: leftLegSegments,
            rightLegSegments: rightLegSegments,
            walkCycle: 0,
            isMoving: false,
            lastPosition: new THREE.Vector3(0, 1.8, 0), // Initialize last known position
            armStretch: 0,
    }

        // Apply rotation to the top group (hip swing)
        legGroup.rotation.x = baseAngle * 0.5; // Reduced hip swing

        // Apply rotation to individual segments (knee/ankle bend)
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const bendFactor = (segments.length - i) / segments.length; // More bend lower down
            const segmentAngle = baseAngle * bendFactor * 1.0; // Calculate individual segment angle

            // Apply different rotation logic based on segment index (e.g., knee vs ankle)
            if (i === 0) { // Top segment (thigh)
                segment.rotation.x = segmentAngle * 0.3; // Less rotation
            } else { // Lower segments (calf/foot)
                segment.rotation.x = segmentAngle * (1.0 + (i*0.2)); // More rotation further down
            }
        }
    }

    resetSegmentedLeg(legGroup, segments) {
        if (!segments || segments.length === 0) return;

        const resetSpeed = 0.1; // How quickly the leg returns to neutral
        // Smoothly interpolate leg group rotation back to 0
        legGroup.rotation.x += (0 - legGroup.rotation.x) * resetSpeed;

        // Smoothly interpolate each segment's rotation back to 0
        for (let i = 0; i < segments.length; i++) {
            segments[i].rotation.x += (0 - segments[i].rotation.x) * resetSpeed;
        }
    }

    setupInputHandlers() {
        const onKeyDown = (event) => {
            if (this.chatActive) return; // Ignore movement keys if chat is open

            switch (event.code) {
                case 'KeyW': this.moveForward = true; break;
                case 'KeyS': this.moveBackward = true; break;
                case 'KeyA': this.moveLeft = true; break;
                case 'KeyD': this.moveRight = true; break;
                case 'KeyQ': this.isHoldingQ = true; break;
                case 'Space':
                    if (this.player.onGround) { // Only jump if on the ground
                        this.jump = true; // Flag that jump action is initiated
                        this.player.velocity.y = 10; // Apply upward velocity
                        this.player.onGround = false; // No longer on ground
                    }
                    break;
                case 'ShiftLeft': this.sprint = true; break;
                case 'KeyC': this.crouch = true; break;
            }
        };

        const onKeyUp = (event) => {
            // No need to check chatActive here, releasing keys should always work
            switch (event.code) {
                case 'KeyW': this.moveForward = false; break;
                case 'KeyS': this.moveBackward = false; break;
                case 'KeyA': this.moveLeft = false; break;
                case 'KeyD': this.moveRight = false; break;
                case 'KeyQ': this.isHoldingQ = false; break;
                case 'ShiftLeft': this.sprint = false; break;
                case 'KeyC': this.crouch = false; break;
            }
        };

        const onMouseDown = (event) => {
            // If clicking on a slot machine UI, let the UI handle it, don't raise arms
             if (event.target.closest('.slot-machine-ui')) {
                 // Allow interaction with CSS3D layer when clicking slot UI
                 this.css3dContainer.style.pointerEvents = 'auto';
                 return;
             }

            // Check for slot machine interaction via raycaster
            if (event.button === 0 && this.controls.isLocked && !this.chatActive) {
                // Try to click any UI element at the center of the screen
                this.handleUiRaycastClick();
            }

            // Only raise arms if controls are locked and chat isn't active
            if (this.controls.isLocked && !this.chatActive) {
                if (event.button === 0) { // Left mouse button
                    this.leftArmRaised = true;
                    this.room.updatePresence({ leftArmRaised: true }); // Sync state
                } else if (event.button === 2) { // Right mouse button
                    this.rightArmRaised = true;
                    this.room.updatePresence({ rightArmRaised: true }); // Sync state
                }
            }
        };

        const onMouseUp = (event) => {
            // Lower arms regardless of control lock state (if they were raised)
            if (event.button === 0) { // Left mouse button
                if(this.leftArmRaised) { // Only update if it was actually raised
                    this.leftArmRaised = false;
                    this.room.updatePresence({ leftArmRaised: false });
                }
            } else if (event.button === 2) { // Right mouse button
                if(this.rightArmRaised) { // Only update if it was actually raised
                    this.rightArmRaised = false;
                    this.room.updatePresence({ rightArmRaised: false });
                }
            }

             // After releasing mouse, check if we should disable pointer events on CSS layer
             // Delay slightly to ensure click events on UI are processed
             setTimeout(() => {
                 // If controls are locked and mouse isn't over a UI element, disable CSS layer events
                 if (this.controls.isLocked && !document.querySelector('.slot-machine-ui:hover')) {
                     this.css3dContainer.style.pointerEvents = 'none';
                 }
             }, 50);
        };

        const onMouseWheel = (event) => {
             // Only process scroll actions if controls are locked and chat isn't active
            if (this.controls.isLocked && !this.chatActive) {
                // Determine scroll direction (normalized)
                const delta = Math.sign(event.deltaY) * -0.5; // Invert Y delta, scale down

                if (this.isHoldingQ) { // Q + Scroll = Chomp
                    // Adjust target chomp amount, clamping between 0 and 1
                    this.player.targetChompAmount = Math.min(Math.max(this.player.targetChompAmount + delta * 0.2, 0), 1);
                    this.room.updatePresence({ chompAmount: this.player.targetChompAmount }); // Sync
                } else if (this.crouch) { // C + Scroll = Leg Stretch
                    // Adjust target leg stretch, clamping between 1 (normal) and 3 (max stretch)
                    this.player.targetLegStretch = Math.min(Math.max(this.player.targetLegStretch + delta, 1), 3);
                    this.room.updatePresence({ legStretch: this.player.targetLegStretch }); // Sync
                } else { // Default Scroll = Arm Stretch
                    // Adjust target arm stretch, clamping between 0 (no stretch) and 5 (max stretch)
                    this.player.targetArmStretch = Math.min(Math.max(this.player.targetArmStretch + delta, 0), 5);
                    this.room.updatePresence({ armStretch: this.player.targetArmStretch }); // Sync
                }
            }
        };

        // Attach event listeners
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        window.addEventListener('mousedown', onMouseDown); // Use window to catch clicks outside canvas too
        window.addEventListener('mouseup', onMouseUp);     // Use window to catch mouse releases anywhere
        window.addEventListener('wheel', onMouseWheel);     // Listen for mouse wheel events

        // Prevent default context menu when pointer is locked
        document.addEventListener('contextmenu', (event) => {
            if(this.controls.isLocked) {
                event.preventDefault();
            }
        });

        // Pointer Lock event listeners
        this.controls.addEventListener('lock', () => {
            // When locked:
            // - Hide cursor (handled by PointerLockControls)
            // - Disable pointer events on the CSS3D layer so clicks go to the game
            this.css3dContainer.style.pointerEvents = 'none';
             // Ensure chat input is blurred and disabled
            this.chatInput.blur();
            this.chatActive = false; // Ensure chat state is inactive
            this.chatInput.disabled = true;
            // Optionally hide chat container immediately on lock
            document.getElementById('chat-container').style.opacity = '0';
            // Ensure first-person arms are visible when locked
            if (this.player.firstPersonArms) {
                this.player.firstPersonArms.group.visible = true;
            }
        });

        this.controls.addEventListener('unlock', () => {
            // When unlocked:
            // - Show cursor (handled by PointerLockControls)
            // - Enable pointer events on the CSS3D layer to allow UI interaction
            this.css3dContainer.style.pointerEvents = 'auto';
            // Do NOT hide first-person arms when unlocked. They should remain visible.
            // Arm animations will stop updating in the animate loop anyway.
            // If unlock was due to opening chat, openChat() already set pointerEvents = 'auto'
        });
    }

    addLighting() {
        // Add a single chandelier that provides all the room lighting
        this.createChandelier();
    }

    createChandelier() {
        // Create chandelier group
        const chandelierGroup = new THREE.Group();
        
        // Chandelier dimensions and positioning
        const centerY = 8; // Height from floor
        const centerRingRadius = 3.5;
        const metalColor = 0x995511; // Darker gold-brass color
        const crystalColor = 0xffbb44; // Warmer crystal color
        
        // Create central structure
        const coreGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: metalColor, // Base color
            roughness: 0.2,
            metalness: 0.9
        });
        
        // Apply noise texture to materials
        const noisyMetalMaterial = this.applyNoiseToMaterial(metalMaterial, 256, 0.2, 0.5, 0.5);
        
        const core = new THREE.Mesh(coreGeometry, noisyMetalMaterial);
        core.position.y = centerY;
        chandelierGroup.add(core);
        
        // Create chains supporting the chandelier (3 chains)
        const chainCount = 3;
        const chainTopY = centerY + 6; // How high the chains go
        const chainRadius = 2.0; // Distance from center where chains attach
        
        for (let i = 0; i < chainCount; i++) {
            const angle = (i / chainCount) * Math.PI * 2;
            const chainX = Math.cos(angle) * chainRadius;
            const chainZ = Math.sin(angle) * chainRadius;
            
            // Create chain segments
            const linkCount = 8;
            const linkLength = (chainTopY - centerY) / linkCount;
            const linkRadius = 0.12;
            
            for (let j = 0; j < linkCount; j++) {
                const linkY = centerY + j * linkLength + linkLength/2;
                const linkGeometry = new THREE.TorusGeometry(linkRadius, linkRadius/3, 8, 16);
                const link = new THREE.Mesh(linkGeometry, noisyMetalMaterial.clone());
                
                // Position and rotate the link
                link.position.set(
                    chainX * (1 - j/linkCount), // Chains converge at the center as they go up
                    linkY,
                    chainZ * (1 - j/linkCount)
                );
                
                // Alternate link orientation
                if (j % 2 === 0) {
                    link.rotation.x = Math.PI / 2;
                } else {
                    link.rotation.z = Math.PI / 2;
                }
                
                chandelierGroup.add(link);
            }
        }
        
        // Create main tiers (3 tiers of decreasing size)
        const tierCount = 3;
        const tierSpacing = 0.7; // Vertical spacing between tiers
        
        for (let tier = 0; tier < tierCount; tier++) {
            const tierRadius = centerRingRadius * (1 - tier * 0.25);
            const tierY = centerY - tier * tierSpacing;
            
            // Create tier ring
            const ringGeometry = new THREE.TorusGeometry(tierRadius, 0.2, 16, 48);
            const ring = new THREE.Mesh(ringGeometry, noisyMetalMaterial.clone());
            ring.position.y = tierY;
            ring.rotation.x = Math.PI / 2;
            chandelierGroup.add(ring);
            
            // Add decorative details to ring
            const detailCount = 16 - tier * 4; // Fewer details on smaller tiers
            for (let i = 0; i < detailCount; i++) {
                const angle = (i / detailCount) * Math.PI * 2;
                
                // Add ornate detail
                const detailGeometry = new THREE.ConeGeometry(0.15, 0.3, 5);
                const detail = new THREE.Mesh(detailGeometry, noisyMetalMaterial.clone());
                detail.position.set(
                    Math.cos(angle) * tierRadius,
                    tierY,
                    Math.sin(angle) * tierRadius
                );
                detail.rotation.x = Math.PI / 2;
                detail.rotation.y = angle;
                chandelierGroup.add(detail);
                
                // Add hanging crystals from each tier with varied lengths
                if (i % 2 === 0) { // Only add to every other detail point
                    // Crystal material with glow
                    const crystalMaterial = new THREE.MeshStandardMaterial({
                        color: crystalColor,
                        roughness: 0.1,
                        metalness: 0.2,
                        transparent: true,
                        opacity: 0.8,
                        emissive: crystalColor,
                        emissiveIntensity: 0.8
                    });
                    const noisyCrystalMaterial = this.applyNoiseToMaterial(crystalMaterial, 128, 0.3, 0.4, 0.6);
                    
                    // Vary crystal length based on tier and position
                    const crystalLength = 0.8 + Math.random() * 0.6 - tier * 0.2;
                    const crystalGeometry = new THREE.ConeGeometry(0.1 + Math.random() * 0.1, crystalLength, 6);
                    const crystal = new THREE.Mesh(crystalGeometry, noisyCrystalMaterial.clone());
                    
                    crystal.position.set(
                        Math.cos(angle) * tierRadius,
                        tierY - crystalLength/2 - 0.2,
                        Math.sin(angle) * tierRadius
                    );
                    chandelierGroup.add(crystal);
                    
                    // Add a point light at some of the crystals (but not all to avoid too many lights)
                    if (i % 4 === 0) {
                        const light = new THREE.PointLight(0xff8800, 0.8, 15);
                        light.position.set(
                            Math.cos(angle) * tierRadius,
                            tierY - crystalLength - 0.2,
                            Math.sin(angle) * tierRadius
                        );
                        light.castShadow = true;
                        light.shadow.mapSize.width = 512;
                        light.shadow.mapSize.height = 512;
                        light.shadow.camera.near = 0.1;
                        light.shadow.camera.far = 20;
                        light.decay = 2;
                        chandelierGroup.add(light);
                    }
                }
            }
            
            // Connect to center with spokes
            const spokeCount = 8;
            for (let i = 0; i < spokeCount; i++) {
                const angle = (i / spokeCount) * Math.PI * 2;
                const spokeGeometry = new THREE.CylinderGeometry(0.05, 0.05, tierRadius, 6);
                const spoke = new THREE.Mesh(spokeGeometry, noisyMetalMaterial.clone());
                
                spoke.position.set(
                    Math.cos(angle) * tierRadius / 2,
                    tierY,
                    Math.sin(angle) * tierRadius / 2
                );
                spoke.rotation.z = Math.PI / 2;
                spoke.rotation.y = -angle;
                
                chandelierGroup.add(spoke);
            }
        }
        
        // Add a central bright light
        const centralLight = new THREE.PointLight(0xff7700, 3.0, 50);
        centralLight.position.y = centerY;
        centralLight.castShadow = true;
        centralLight.shadow.mapSize.width = 1024;
        centralLight.shadow.mapSize.height = 1024;
        centralLight.shadow.camera.near = 0.5;
        centralLight.shadow.camera.far = 50;
        centralLight.decay = 1.2;
        chandelierGroup.add(centralLight);
        
        // Add ambient light for general room illumination
        const ambientLight = new THREE.AmbientLight(0x221100, 1.0);
        this.scene.add(ambientLight);
        
        // Add chandelier to the scene and occluder objects
        this.scene.add(chandelierGroup);
        this.occluderObjects.push(chandelierGroup);
    }

    createSlotMachineModel(machineId, theme) { 
        const machineGroup = new THREE.Group();
        machineGroup.userData.machineId = machineId; // Store ID for reference
        machineGroup.userData.theme = theme; // Store the theme

        // --- Dimensions ---
        const bodyWidth = 0.9; 
        const bodyHeight = 2.0; 
        const bodyDepth = 0.8; 

        // --- Materials ---
        const primaryColor = 0xddaa66; 
        const secondaryColor = 0x331100; 
        const metalColor = 0x999999; 
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.1, metalness: 0.95 }); 

        const primaryMat = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.4, metalness: 0.6 });
        const secondaryMat = new THREE.MeshStandardMaterial({ color: secondaryColor, roughness: 0.5, metalness: 0.4 });
        const metalMat = new THREE.MeshStandardMaterial({ color: metalColor, roughness: 0.3, metalness: 0.8 });

        // Apply noise for texture variation
        const noisyPrimaryMat = this.applyNoiseToMaterial(primaryMat.clone(), 128, 0.2, 0.5, 0.5);
        const noisySecondaryMat = this.applyNoiseToMaterial(secondaryMat.clone(), 128, 0.1, 0.6, 0.4);
        const noisyMetalMat = this.applyNoiseToMaterial(metalMat, 128, 0.1, 0.4, 0.5);

        // --- Main Body (Extruded Shape) ---
        const bodyShape = new THREE.Shape();
        const halfW = bodyWidth / 2;
        const cornerRadius = 0.05; 
        bodyShape.moveTo(-halfW + cornerRadius, 0);
        bodyShape.lineTo(halfW - cornerRadius, 0);
        bodyShape.absarc(halfW - cornerRadius, cornerRadius, cornerRadius, -Math.PI / 2, 0, false); 
        bodyShape.lineTo(halfW, bodyHeight - cornerRadius);
        bodyShape.absarc(halfW - cornerRadius, bodyHeight - cornerRadius, cornerRadius, 0, Math.PI / 2, false); 
        bodyShape.lineTo(-halfW + cornerRadius, bodyHeight);
        bodyShape.absarc(-halfW + cornerRadius, bodyHeight - cornerRadius, cornerRadius, Math.PI / 2, Math.PI, false); 
        bodyShape.lineTo(-halfW, cornerRadius);
        bodyShape.absarc(-halfW + cornerRadius, cornerRadius, cornerRadius, Math.PI, Math.PI * 1.5, false); 

        const extrudeSettings = { depth: bodyDepth * 0.9, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 };
        const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
        bodyGeometry.center(); 
        const body = new THREE.Mesh(bodyGeometry, noisyPrimaryMat);
        body.position.y = bodyHeight / 2; 
        body.position.z = -bodyDepth * 0.05; 
        machineGroup.add(body);

        // --- Side Panels ---
        const sidePanelWidth = 0.05;
        const sidePanelGeometry = new THREE.BoxGeometry(sidePanelWidth, bodyHeight, bodyDepth);
        const leftPanel = new THREE.Mesh(sidePanelGeometry, noisySecondaryMat);
        leftPanel.position.set(-halfW - sidePanelWidth/2, bodyHeight / 2, 0);
        machineGroup.add(leftPanel);

        const rightPanel = new THREE.Mesh(sidePanelGeometry, noisySecondaryMat);
        rightPanel.position.set(halfW + sidePanelWidth/2, bodyHeight / 2, 0);
        machineGroup.add(rightPanel);

        // --- Top Panel ---
        const topPanelGeometry = new THREE.BoxGeometry(bodyWidth + sidePanelWidth*2, sidePanelWidth, bodyDepth);
        const topPanel = new THREE.Mesh(topPanelGeometry, noisySecondaryMat);
        topPanel.position.set(0, bodyHeight + sidePanelWidth / 2, 0);
        machineGroup.add(topPanel);

        // --- Screen Bezel ---
        const screenBezelThickness = 0.04;
        const screenWidth = bodyWidth * 0.7;
        const screenHeight = bodyHeight * 0.4;
        const screenDepth = 0.02;

        const bezelGeometry = new THREE.BoxGeometry(screenWidth + screenBezelThickness, screenHeight + screenBezelThickness, screenDepth + 0.01);
        const bezel = new THREE.Mesh(bezelGeometry, noisyMetalMat);
        const screenPosY = bodyHeight * 0.60; 
        const screenPosZ = bodyDepth / 2 + 0.01; 
        bezel.position.set(0, screenPosY, screenPosZ);
        machineGroup.add(bezel);

        // --- Control Panel Area (slanted) ---
        const panelHeight = 0.25;
        const panelWidth = bodyWidth * 0.8;
        const panelDepth = 0.1;
        const panelGeometry = new THREE.BoxGeometry(panelWidth, panelHeight, panelDepth);
        const panel = new THREE.Mesh(panelGeometry, noisySecondaryMat.clone());
        panel.position.set(0, bodyHeight * 0.3, bodyDepth / 2 - panelDepth/2 + 0.02); 
        panel.rotation.x = -Math.PI / 12; // Slant
        machineGroup.add(panel);

        // --- Coin Tray ---
        const trayWidth = bodyWidth * 0.5;
        const trayHeight = 0.05;
        const trayDepth = 0.2;
        const trayGeometry = new THREE.BoxGeometry(trayWidth, trayHeight, trayDepth);
        const tray = new THREE.Mesh(trayGeometry, chromeMat.clone()); 
        tray.position.set(0, bodyHeight * 0.08, bodyDepth / 2 - trayDepth / 2 + 0.05); 
        machineGroup.add(tray);

        // --- Tray Lip ---
        const lipHeight = 0.03;
        const lipGeometry = new THREE.BoxGeometry(trayWidth, lipHeight, 0.01);
        const lip = new THREE.Mesh(lipGeometry, chromeMat.clone());
        lip.position.set(0, -trayHeight/2 + lipHeight/2 , trayDepth/2); 
        tray.add(lip); 

        // --- Top Sign (Glowy) ---
        const signHeight = 0.5; 
        const signWidth = bodyWidth * 0.95; 
        const signDepth = bodyDepth * 0.3; 
        const signGeometry = new THREE.BoxGeometry(signWidth, signHeight, signDepth);
        const signMaterial = new THREE.MeshStandardMaterial({
            color: 0x660000, 
            roughness: 0.3,
            metalness: 0.1,
            emissive: 0x550000, 
            emissiveIntensity: 0.8, 
            transparent: true,
            opacity: 0.9 
        });
        const noisySignMaterial = this.applyNoiseToMaterial(signMaterial.clone(), 64, 0.5, 0.4, 0.6); 
        const sign = new THREE.Mesh(signGeometry, noisySignMaterial);
        sign.position.y = topPanel.position.y + sidePanelWidth / 2 + signHeight / 2; 
        machineGroup.add(sign);

        // --- Base ---
        const baseHeight = 0.08;
        const baseGeometry = new THREE.BoxGeometry(bodyWidth + sidePanelWidth*2 + 0.05, baseHeight, bodyDepth + 0.05);
        const base = new THREE.Mesh(baseGeometry, noisySecondaryMat.clone());
        base.position.y = baseHeight / 2; 
        machineGroup.add(base);

        // --- Shadows ---
        machineGroup.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Adjust group position so base sits on the floor (y=0)
        machineGroup.position.y = -baseHeight / 2;

        // --- CSS3D UI Object ---
        const element = document.createElement('div');
        element.className = 'slot-machine-ui';
        element.id = `slot-ui-${machineId}`;

        // Apply theme colors using CSS custom properties
        const colors = theme.colors;
        element.style.setProperty('--slot-bg', colors.background);
        element.style.setProperty('--slot-border', colors.border);
        element.style.setProperty('--slot-text', colors.text);
        element.style.setProperty('--slot-reel-bg', colors.reelBg);
        element.style.setProperty('--slot-reel-text', colors.reelText);
        element.style.setProperty('--slot-reel-border', colors.reelBorder);
        element.style.setProperty('--slot-button-bg', colors.buttonBg);
        element.style.setProperty('--slot-button-text', colors.buttonText);
        element.style.setProperty('--slot-button-border', colors.buttonBorder);
        element.style.setProperty('--slot-button-hover-bg', colors.buttonHoverBg);
        element.style.setProperty('--slot-button-hover-shadow', colors.buttonHoverShadow);
        element.style.setProperty('--slot-button-active-bg', colors.buttonActiveBg);
        element.style.setProperty('--slot-bet-bg', colors.betBg);
        element.style.setProperty('--slot-bet-text', colors.betText);
        element.style.setProperty('--slot-bet-border', colors.betBorder);
        element.style.setProperty('--slot-message-default', colors.messageDefault);
        element.style.setProperty('--slot-message-win', colors.messageWin);
        element.style.setProperty('--slot-message-lose', colors.messageLose);
        element.style.setProperty('--slot-theme-name-color', colors.themeName);

        // Apply base styles dynamically from theme colors
        element.style.backgroundColor = colors.background;
        element.style.borderColor = colors.border;
        element.style.color = colors.text; // Default text color

        // Use a symbol from the theme as the default display
        const defaultSymbol = theme.symbols[0] || '?';

        element.innerHTML = `
            <div class="slot-theme-name" style="color: ${colors.themeName};">${theme.name}</div>
            <div class="slot-reels">
                <div class="slot-reel" data-reel="0" style="background-color: ${colors.reelBg}; color: ${colors.reelText}; border-color: ${colors.reelBorder};">${defaultSymbol}</div>
                <div class="slot-reel" data-reel="1" style="background-color: ${colors.reelBg}; color: ${colors.reelText}; border-color: ${colors.reelBorder};">${defaultSymbol}</div>
                <div class="slot-reel" data-reel="2" style="background-color: ${colors.reelBg}; color: ${colors.reelText}; border-color: ${colors.reelBorder};">${defaultSymbol}</div>
            </div>
            <div class="slot-message" style="color: ${colors.messageDefault};">Deal with the Devil?</div>
            <div class="bet-controls">
                <div class="bet-button" data-action="decrease" style="background-color: ${colors.betBg}; color: ${colors.betText}; border-color: ${colors.betBorder};">-</div>
                <div class="bet-amount" style="color: ${colors.betText};">$1</div>
                <div class="bet-button" data-action="increase" style="background-color: ${colors.betBg}; color: ${colors.betText}; border-color: ${colors.betBorder};">+</div>
            </div>
            <button class="slot-button" style="background-color: ${colors.buttonBg}; color: ${colors.buttonText}; border-color: ${colors.buttonBorder};">SPIN</button>
        `;

        // Add hover/active styles for buttons dynamically
        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
            #slot-ui-${machineId} .slot-button:hover {
                background-color: ${colors.buttonHoverBg};
                box-shadow: 0 0 15px ${colors.buttonHoverShadow};
            }
            #slot-ui-${machineId} .slot-button:active {
                background-color: ${colors.buttonActiveBg};
                transform: scale(0.95);
            }
             #slot-ui-${machineId} .slot-button:disabled {
                background-color: ${colors.buttonActiveBg}; /* Use active color for disabled */
                opacity: 0.6;
                cursor: not-allowed;
             }
            #slot-ui-${machineId} .bet-button:hover {
                background-color: ${colors.buttonHoverBg};
                box-shadow: 0 0 15px ${colors.buttonHoverShadow};
            }
            #slot-ui-${machineId} .bet-button:active {
                background-color: ${colors.buttonActiveBg};
                transform: scale(0.9);
            }
             #slot-ui-${machineId} .slot-reel.winning {
                border-color: ${colors.reelText}; /* Use bright reel text color for win border */
                animation: winPulse 0.5s ease-in-out 2;
             }
            #slot-ui-${machineId} .slot-message.winning {
                color: ${colors.messageWin};
                animation: winMessagePulse 0.5s ease-in-out 2;
             }
        `;
        element.appendChild(styleSheet);


        const cssObject = new CSS3DObject(element);

        // Scale and position the CSS3D object relative to the screen bezel
        const scale = 0.0018; 
        cssObject.scale.set(scale, scale, scale);
        // Position slightly in front of the bezel position
        cssObject.position.copy(bezel.position).add(new THREE.Vector3(0, 0, 0.02)); 

        machineGroup.add(cssObject); 

        // Store references to UI parts in the machineGroup's userData for easy access
        machineGroup.userData.cssObject = cssObject;
        machineGroup.userData.uiElement = element;
        machineGroup.userData.spinButton = element.querySelector('.slot-button');
        machineGroup.userData.reelElements = element.querySelectorAll('.slot-reel');
        machineGroup.userData.messageElement = element.querySelector('.slot-message');
        machineGroup.userData.betAmountElement = element.querySelector('.bet-amount');
        machineGroup.userData.betDecreaseButton = element.querySelector('.bet-button[data-action="decrease"]');
        machineGroup.userData.betIncreaseButton = element.querySelector('.bet-button[data-action="increase"]');

        // Add click listener to the spin button
        machineGroup.userData.spinButton.addEventListener('click', (event) => {
            event.stopPropagation(); 
            this.handleSlotSpin(machineId); 
        });

        // Add click listeners to the bet control buttons
        machineGroup.userData.betDecreaseButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.adjustBetAmount(machineId, -1); 
        });

        machineGroup.userData.betIncreaseButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.adjustBetAmount(machineId, 1); 
        });

        // Store main group reference in slotMachines map
        this.slotMachines[machineId] = {
            id: machineId,
            theme: theme, // Store the theme object
            model: machineGroup, 
            reels: [defaultSymbol, defaultSymbol, defaultSymbol], // Use default symbol from theme
            message: 'Click Spin to Play!',
            spinning: false, // Server state
            visualSpinActive: false, // Local animation state
            betAmount: 1, 
            uiElement: machineGroup.userData.uiElement, 
            spinButton: machineGroup.userData.spinButton, 
            reelElements: machineGroup.userData.reelElements, 
            messageElement: machineGroup.userData.messageElement, 
            betAmountElement: machineGroup.userData.betAmountElement, 
            cssObject: cssObject, 
            reelSpinTimeouts: [] // To store stopping timeouts
        };

        return machineGroup;
    }

    updateSlotMachinesFromRoomState(slotMachinesState) {
        for (const machineId in slotMachinesState) {
            const serverMachine = slotMachinesState[machineId];
            const localMachine = this.slotMachines[machineId];

            if (!localMachine || !localMachine.theme) continue; // Make sure local machine and theme exist

            const wasSpinning = localMachine.spinning;
            const themeColors = localMachine.theme.colors; // Get theme colors

            // Update spinning state (crucial for logic below)
            localMachine.spinning = serverMachine.spinning;

            // Update bet amount if it changed
            if (serverMachine.betAmount !== undefined && serverMachine.betAmount !== localMachine.betAmount) {
                localMachine.betAmount = serverMachine.betAmount;
                localMachine.betAmountElement.textContent = `$${serverMachine.betAmount}`;
            }

            // --- Reel and Spin Logic ---
            if (serverMachine.spinning && !wasSpinning) {
                // State changed from not spinning to spinning: Start the visual spin
                this.startSlotVisualSpin(machineId, serverMachine.spinningClientId);
            } else if (!serverMachine.spinning && wasSpinning) {
                // State changed from spinning to not spinning: Stop the visual spin and show final results
                this.stopSlotVisualSpin(machineId, serverMachine.reels || localMachine.theme.symbols.slice(0,3), serverMachine.winnings > 0);
            } else if (!serverMachine.spinning) {
                // Machine is not spinning, just ensure reels display the correct (potentially old) state
                // (Handles initial load or joining mid-game)
                const currentReels = serverMachine.reels || localMachine.theme.symbols.slice(0,3);
                 for (let i = 0; i < Math.min(localMachine.reelElements.length, currentReels.length); i++) {
                    // Only update if different to prevent interrupting win animation
                    if (localMachine.reelElements[i].textContent !== currentReels[i]) {
                        localMachine.reelElements[i].textContent = currentReels[i];
                    }
                    localMachine.reels[i] = currentReels[i]; // Update local cache
                }
                // Clear any lingering winning animations if state changed without spinning
                localMachine.reelElements.forEach(reel => reel.classList.remove('winning'));
                localMachine.messageElement.classList.remove('winning');
            }

            // --- Message Update ---
            if (serverMachine.message && serverMachine.message !== localMachine.message) {
                localMachine.messageElement.textContent = serverMachine.message;
                localMachine.message = serverMachine.message;
                localMachine.messageElement.classList.remove('winning'); // Remove winning class by default

                // Update message color based on content and theme colors
                if (serverMachine.message.includes("Not enough money") ||
                    serverMachine.message.includes("Soul not worthy") ||
                     serverMachine.message.includes("Machine in use")) { // Added check for machine in use
                    localMachine.messageElement.style.color = themeColors.messageLose;
                } else if (serverMachine.message.includes("pays")) {
                    localMachine.messageElement.style.color = themeColors.messageWin;
                    localMachine.messageElement.classList.add('winning'); // Add class for animation
                } else if (serverMachine.message.includes("Spinning")) {
                    localMachine.messageElement.style.color = themeColors.text; // Use default theme text color
                } else {
                    localMachine.messageElement.style.color = themeColors.messageDefault; // Default message color from theme
                }
            }

            // --- Button State ---
            // Disable button if the server says it's spinning OR if the local visual spin is still active
            localMachine.spinButton.disabled = serverMachine.spinning || localMachine.visualSpinActive;

            // Store the current server state to detect changes next time
            localMachine.lastServerState = {...serverMachine};
        }
    }

    startSlotVisualSpin(machineId, spinningClientId) {
        const slotState = this.slotMachines[machineId];
        if (!slotState || !slotState.theme) return;

        slotState.visualSpinActive = true; // Flag for local visual animation state
        slotState.spinButton.disabled = true;
        slotState.messageElement.textContent = "Spinning...";
        slotState.messageElement.style.color = slotState.theme.colors.text; // Use theme's default text color
        slotState.messageElement.classList.remove('winning');

        // Clear previous win states and apply spinning animation class
        slotState.reelElements.forEach((reel, index) => {
            reel.classList.remove('winning');
            reel.classList.add('spinning');
            reel.style.color = '#ffffff'; // Make symbols white while spinning fast (contrast)

             // Clear existing timeouts for this reel if any
             if (slotState.reelSpinTimeouts && slotState.reelSpinTimeouts[index]) {
                clearTimeout(slotState.reelSpinTimeouts[index]);
            }
        });

        // Store timeouts if needed (though stopping is now handled by state change)
        slotState.reelSpinTimeouts = slotState.reelSpinTimeouts || [];
    }

    stopSlotVisualSpin(machineId, finalReels, isWin) {
        const slotState = this.slotMachines[machineId];
        if (!slotState || !slotState.theme) return;

        slotState.visualSpinActive = false; // Turn off local visual flag
        slotState.spinButton.disabled = false; // Re-enable button

        const stopDelay = 250; // ms delay between reel stops
        const themeColors = slotState.theme.colors;

        slotState.reelElements.forEach((reel, index) => {
            // Schedule the stopping animation for each reel with a delay
            slotState.reelSpinTimeouts[index] = setTimeout(() => {
                reel.classList.remove('spinning');
                reel.style.color = themeColors.reelText; // Restore theme reel text color
                reel.textContent = finalReels[index] || slotState.theme.symbols[0] || '?'; // Set final symbol
                reel.style.transform = 'rotateX(0deg)'; // Reset transform

                 // Apply winning animation if it's a win
                if (isWin) {
                    reel.classList.add('winning');
                    // Optional: Remove winning class after animation finishes
                    setTimeout(() => {
                         // Check if still winning before removing, might have spun again quickly
                         const currentServerState = this.room.roomState?.slotMachines?.[machineId];
                         if (currentServerState && !currentServerState.spinning) {
                            reel.classList.remove('winning');
                         }
                    }, 1000); // Duration of 2 pulses (0.5s * 2)
                }
            }, index * stopDelay);
        });

         // If it's a win, the message animation is handled by CSS class added in updateSlotMachinesFromRoomState
    }

    handleSlotSpin(machineId) {
        const slotState = this.slotMachines[machineId];
        if (!slotState || slotState.spinning) return;
        
        // Get the current room state for this machine
        const currentRoomState = this.room.roomState?.slotMachines?.[machineId];

        // Prevent spinning if already spinning (server state) or visually spinning locally
        // Also check if someone else is currently spinning this machine
        if (slotState.spinning || currentRoomState?.spinning || slotState.visualSpinActive) {
            console.log("Attempted to spin while already spinning or in use.");
             // Show message if someone else is spinning
            if (currentRoomState?.spinning && currentRoomState.spinningClientId !== this.room.clientId) {
                 slotState.messageElement.textContent = "Machine in use!";
                 slotState.messageElement.style.color = slotState.theme.colors.messageLose;
                 slotState.messageElement.classList.remove('winning');
                 setTimeout(() => {
                    if (slotState.message === "Machine in use!") {
                         const latestState = this.room.roomState?.slotMachines?.[machineId];
                         if (latestState && !latestState.spinning) { // Only reset if no longer spinning
                            slotState.messageElement.textContent = latestState.message || slotState.theme.name; // Reset to theme name or last server msg
                            slotState.message = slotState.messageElement.textContent;
                        }
                    }
                 }, 1500);
            }
            return;
        }

        const betAmount = slotState.betAmount;
        const isFreeSpinActive = this.freeSpinsAvailable > 0;

        // Check if player has enough money (skip check if using free spins)
        if (!isFreeSpinActive && this.player.money < betAmount) {
            // Update local UI immediately using theme colors
            slotState.messageElement.textContent = "Not enough money!";
            slotState.messageElement.style.color = slotState.theme.colors.messageLose;
            slotState.messageElement.classList.remove('winning');
            // Reset message after a delay locally
            setTimeout(() => {
                // Check if message hasn't changed in the meantime
                if (slotState.message === "Not enough money!") {
                     const currentServerMsg = this.room.roomState?.slotMachines?.[machineId]?.message;
                     if (!currentServerMsg || currentServerMsg === "Not enough money!") {
                        slotState.messageElement.textContent = slotState.theme.name; // Reset to theme name
                        slotState.messageElement.style.color = slotState.theme.colors.messageDefault;
                        slotState.message = slotState.theme.name; // Update local cache too
                    }
                }
            }, 2000);
            return;
        }

        // Increment player's total spin count for this session
        this.totalPlayerSpins++;

        // --- Deduct bet amount locally and update presence (skip if using free spins) ---
        if (!isFreeSpinActive) {
            this.player.money -= betAmount;
            // Ensure money doesn't go below zero after deduction
            this.player.money = Math.max(0, this.player.money);
            this.room.updatePresence({ money: this.player.money });
            this.currencyDisplay.textContent = `$${this.player.money}`;
        } else {
            // Using a free spin
            this.freeSpinsAvailable--;
            this.freeSpinsCounter++;
            this.updateFreeSpinsIndicator();

            // If first free spin, record the machine
            if (!this.currentFreeSpinMachine) {
                this.currentFreeSpinMachine = machineId;
                this.totalWinnings = 0; // Reset total winnings for this free spin session
            }
        }

        // --- Determine Spin Results using theme symbols ---
        const symbols = slotState.theme.symbols; // Use symbols from the assigned theme

        // Check if this is a new player's 10th spin and force triple 7s as a welcome bonus
        let finalReels;
        if (this.isNewPlayer && this.totalPlayerSpins === 10) { // Check session spin count
            finalReels = ['7', '7', '7']; // Force triple 7s
            this.isNewPlayer = false; // No longer a new player after the bonus
            console.log("Triggering new player 10th spin bonus!");
        } else {
            finalReels = [
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)]
            ];
        }

        // Determine winnings based on the reels and bet amount
        let winnings = 0;
        let finalMessage = slotState.theme.loseMessage || "Better luck next time!"; // Use theme-specific lose message instead
        let freeSpinsWon = 0;
        let showMultiplierWheel = false;

        // Count the ❌ symbols
        const badSymbolCount = finalReels.filter(symbol => symbol === '❌').length;

        // Handle penalty for ❌ symbols
        if (badSymbolCount > 0) {
            let penaltyMultiplier = 0;
            switch (badSymbolCount) {
                case 1: penaltyMultiplier = 2; break;    // Double loss
                case 2: penaltyMultiplier = 3; break;    // Triple loss
                case 3: penaltyMultiplier = 4; break;    // Quadruple loss
            }

            // Calculate potential loss but cap it to prevent going below zero
            // Use the betAmount, not current money for penalty calculation base
            const potentialLoss = betAmount * penaltyMultiplier;
            const currentMoney = this.room.presence[this.room.clientId]?.money || this.player.money; // Get current money *before* potential penalty
            const actualLoss = Math.min(potentialLoss, currentMoney); // Cap loss at current money

            winnings = -actualLoss; // Negative winnings represent the loss

            if (actualLoss < potentialLoss && currentMoney === 0) {
                 finalMessage = `${badSymbolCount} ❌ symbols! Still at $0!`; // Special message if already at $0
            } else if (actualLoss < potentialLoss) {
                finalMessage = `${badSymbolCount} ❌ symbols! Lost all your money! Back to $0!`;
            } else {
                finalMessage = `${badSymbolCount} ❌ symbols! You lose $${Math.abs(winnings)}!`;
            }

            // Free spins don't protect from ❌ penalty loss, but don't charge the bet
            if (isFreeSpinActive) {
                 this.totalWinnings += winnings; // Track penalty loss during free spins
            }

        }
        // Simple Three of a kind logic (can be expanded)
        else if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
            // Base payout depends on the symbol
            let basePayout = 10;

            // Special case for triple 7s
            if (finalReels[0] === '7') {
                basePayout = 20; // Higher base payout for 7s
                freeSpinsWon = 10; // Award 10 free spins
                finalMessage = `JACKPOT! 10 Free Spins!`;
                showMultiplierWheel = !isFreeSpinActive; // Only show wheel when not already in free spins mode
            } else {
                finalMessage = `${slotState.theme.name} pays $${basePayout * betAmount}!`; // Theme-specific win message
            }

            winnings = basePayout * betAmount;

            // If in free spins mode, track winnings but don't apply multiplier yet
            if (isFreeSpinActive) {
                this.totalWinnings += winnings;
            }
        }
        // Handle pairs of 7s or single 7
        else {
            // Count number of 7s
            const sevenCount = finalReels.filter(symbol => symbol === '7').length;

            if (sevenCount === 2) {
                winnings = betAmount * 3; // 2 sevens pays 3x bet
                finalMessage = `2 Sevens pays $${winnings}!`;
                 if (isFreeSpinActive) this.totalWinnings += winnings;
            } else if (sevenCount === 1) {
                winnings = betAmount * 2; // 1 seven pays 2x bet
                finalMessage = `7 pays $${winnings}!`;
                 if (isFreeSpinActive) this.totalWinnings += winnings;
            }
        }
        // Add more winning combinations here if desired (e.g., two symbols, specific symbol payouts)

        // --- Update Room State to Start Spin ---
        this.room.updateRoomState({
            slotMachines: {
                [machineId]: {
                    ...currentRoomState, // Preserve existing state like betAmount
                    spinning: true,
                    spinningClientId: this.room.clientId,
                    // betAmount: betAmount, // Keep existing bet amount unless changed
                    reels: slotState.theme.symbols.slice(0,3).map(() => '?'), // Use theme symbols for placeholder
                    message: "Spinning...",
                    finalReels: finalReels,
                    winnings: winnings,
                    finalMessage: finalMessage,
                    freeSpinsWon: freeSpinsWon,
                    showMultiplierWheel: showMultiplierWheel,
                    isFreeSpinActive: isFreeSpinActive
                }
            }
        });

        // Schedule the Result Reveal (Server-Side simulation)
        const spinDuration = 1500;
        const stopDelay = 250;
        const totalSpinTime = spinDuration + (stopDelay * finalReels.length);
        const messageResetDelay = 3000;

        setTimeout(async () => {
            const currentState = this.room.roomState?.slotMachines?.[machineId];

            // Only the client that initiated the spin should send the final state update.
            if (currentState && currentState.spinningClientId === this.room.clientId) {
                 // Update state to spinning: false, showing results
                 this.room.updateRoomState({
                     slotMachines: {
                         [machineId]: {
                             // No need to spread currentState here, just set the final values
                             spinning: false,
                             reels: currentState.finalReels,
                             message: currentState.finalMessage,
                             winnings: currentState.winnings, // Keep winnings info
                             betAmount: currentState.betAmount, // Keep bet amount
                             spinningClientId: currentState.spinningClientId // Keep who spun last
                         }
                     }
                 });

                 // If player won free spins, add them now
                 if (currentState.freeSpinsWon > 0) {
                    this.freeSpinsAvailable += currentState.freeSpinsWon;
                    this.updateFreeSpinsIndicator();

                    // If multiplier wheel is needed, show it 
                    // (but we'll apply the multiplier at the end of all free spins)
                    if (currentState.showMultiplierWheel) {
                        const multiplier = await this.spinMultiplierWheel();
                        this.freeSpinsMultiplier = multiplier;

                        // Update message to show the multiplier
                        this.room.updateRoomState({
                            slotMachines: {
                                [machineId]: {
                                    message: `JACKPOT! 10 Free Spins with ${multiplier}x Bonus at the end!`
                                }
                            }
                        });
                    }
                 }

                 // If this player won/lost money and NOT in free spins, award/deduct it NOW
                 if (currentState.winnings !== 0 && !currentState.isFreeSpinActive) {
                    // Ensure player money isn't fetched from stale closure
                    const currentMoney = this.room.presence[this.room.clientId]?.money || this.player.money;
                    // Apply winnings/losses and prevent going below zero
                    this.player.money = Math.max(0, currentMoney + currentState.winnings);
                    this.room.updatePresence({ money: this.player.money });
                    this.currencyDisplay.textContent = `$${this.player.money}`;
                }

                 // Auto-continue free spins if there are more available
                 if (this.freeSpinsAvailable > 0 && machineId === this.currentFreeSpinMachine) {
                     setTimeout(() => this.handleSlotSpin(machineId), 2000);
                 } else if (this.freeSpinsAvailable === 0 && this.freeSpinsCounter > 0) {
                     // --- Free Spins Session End ---
                      // Apply multiplier to total winnings when all free spins are used
                      // Note: totalWinnings could be negative due to ❌ symbols
                     let finalWinnings = this.totalWinnings * this.freeSpinsMultiplier;
                     finalWinnings = Math.round(finalWinnings * 100) / 100; // Round to cents

                     // Prepare end message
                     let endMessage;
                     if (finalWinnings > 0) {
                         endMessage = `Free Spins Complete! Won $${finalWinnings.toFixed(2)} (${this.freeSpinsMultiplier}x multiplier)`;
                     } else if (finalWinnings < 0) {
                         endMessage = `Free Spins Complete! Lost $${Math.abs(finalWinnings).toFixed(2)} (${this.freeSpinsMultiplier}x multiplier)`;
                     } else {
                         endMessage = `Free Spins Complete! Broke even (${this.freeSpinsMultiplier}x multiplier)`;
                     }

                     // Only award money if finalWinnings > 0
                     if (finalWinnings > 0) {
                         const currentMoney = this.room.presence[this.room.clientId]?.money || this.player.money;
                         this.player.money = currentMoney + finalWinnings;
                         this.room.updatePresence({ money: this.player.money });
                         this.currencyDisplay.textContent = `$${this.player.money}`;
                     } else if (finalWinnings < 0) {
                        // If loss, apply it (capped at $0)
                         const currentMoney = this.room.presence[this.room.clientId]?.money || this.player.money;
                         this.player.money = Math.max(0, currentMoney + finalWinnings); // finalWinnings is negative
                         this.room.updatePresence({ money: this.player.money });
                         this.currencyDisplay.textContent = `$${this.player.money}`;
                     }

                     // Show message about total winnings/losses
                     this.room.updateRoomState({
                         slotMachines: {
                             [machineId]: {
                                 message: endMessage
                             }
                         }
                     });


                     // Reset free spins tracking
                     this.currentFreeSpinMachine = null;
                     this.freeSpinsMultiplier = 1;
                     this.freeSpinsCounter = 0;
                     this.totalWinnings = 0;
                     this.updateFreeSpinsIndicator(); // Hide indicator
                 }
            }
        }, totalSpinTime);
    }

    adjustBetAmount(machineId, change) {
        const slotState = this.slotMachines[machineId];
        if (!slotState || slotState.spinning) return;
        
        // Calculate new bet amount based on current value
        let newBet = slotState.betAmount;
        
        if (change > 0) {
            if (newBet < 1) newBet += 0.1;
            else if (newBet < 10) newBet += 1;
            else if (newBet < 100) newBet += 10;
            else if (newBet < 1000) newBet += 100;
            else newBet += 1000;
        } else {
            if (newBet > 10000) newBet -= 10000;
            else if (newBet > 1000) newBet -= 1000;
            else if (newBet > 100) newBet -= 100;
            else if (newBet > 10) newBet -= 10;
            else if (newBet > 1) newBet -= 1;
            else newBet -= 0.1;
        }
        
        // Keep within min/max range and round to 1 decimal place
        newBet = Math.max(0.1, Math.min(10000, parseFloat(newBet.toFixed(1))));
        
        if (newBet !== slotState.betAmount) {
            slotState.betAmount = newBet;
            slotState.betAmountElement.textContent = `$${newBet.toFixed(1)}`;
            
            // Update room state with new bet amount for this machine
            this.room.updateRoomState({
                slotMachines: {
                    [machineId]: {
                        betAmount: newBet
                    }
                }
            });
        }
    }

    createCasinoLevel() {
        this.objects = []; // Clear existing objects
        this.occluderObjects = []; // Clear existing occluders
        this.slotMachines = {}; // Clear existing machines
        this.minesGames = {}; // Clear existing mines games

        const roomSize = 40;
        const wallHeight = 10;
        const floorColor = 0x550000; // Base floor color
    
        // --- Floor ---
        const floorGeometry = new THREE.PlaneGeometry(roomSize, roomSize);
        // Use a standard material, then apply noise
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: floorColor, // Base color
            roughness: 0.8,
            metalness: 0.1
        });
        const noisyFloorMaterial = this.applyNoiseToMaterial(floorMaterial, 1024, 0.1, 0.5, 0.5, true); // tiled=true for floor
        const floor = new THREE.Mesh(floorGeometry, noisyFloorMaterial);
        floor.rotation.x = -Math.PI / 2; // Rotate to lay flat
        floor.receiveShadow = true; // Enable shadow receiving
        this.scene.add(floor);
        this.occluderObjects.push(floor); // Add floor to occluders

        // --- Ceiling ---
        const ceilingGeometry = new THREE.PlaneGeometry(roomSize, roomSize);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: floorColor, // Match floor for now
            roughness: 0.9,
            side: THREE.DoubleSide // Render bottom side too
        });
        const noisyCeilingMaterial = this.applyNoiseToMaterial(ceilingMaterial, 1024, 0.2, 0.6, 0.4);
        const ceiling = new THREE.Mesh(ceilingGeometry, noisyCeilingMaterial);
        ceiling.position.y = wallHeight; // Position at wall height
        ceiling.rotation.x = Math.PI / 2; // Rotate to face down
        ceiling.receiveShadow = true;
        this.scene.add(ceiling);
        this.occluderObjects.push(ceiling); // Add ceiling to occluders

        // --- Walls ---
        const wallThickness = 0.5;
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: floorColor, // Match floor color
            roughness: 0.7,
            metalness: 0.0
        });
        const noisyWallMaterial = this.applyNoiseToMaterial(wallMaterial, 1024, 0.08, 0.5, 0.5); // Apply noise

        // Define wall positions and sizes
        const wallData = [
            { x: 0, y: wallHeight / 2, z: -roomSize / 2, ry: 0, size: [roomSize + wallThickness, wallHeight, wallThickness] }, // Back wall
            { x: 0, y: wallHeight / 2, z: roomSize / 2, ry: 0, size: [roomSize + wallThickness, wallHeight, wallThickness] }, // Front wall
            { x: -roomSize / 2, y: wallHeight / 2, z: 0, ry: Math.PI / 2, size: [roomSize + wallThickness, wallHeight, wallThickness] }, // Left wall
            { x: roomSize / 2, y: wallHeight / 2, z: 0, ry: Math.PI / 2, size: [roomSize + wallThickness, wallHeight, wallThickness] }, // Right wall
        ];

        wallData.forEach(data => {
            const geom = new THREE.BoxGeometry(data.size[0], data.size[1], data.size[2]);
            const wall = new THREE.Mesh(geom, noisyWallMaterial.clone()); // Clone material for each wall
            wall.position.set(data.x, data.y, data.z);
            wall.rotation.y = data.ry;
            wall.castShadow = true;
            wall.receiveShadow = true;
            this.scene.add(wall);
            this.objects.push(wall); // Add wall to collidable objects list
            this.occluderObjects.push(wall); // Add wall to occluders
        });

        // --- Slot Machines ---
        const numSlots = 15; // Number of slot machines to create
        const machineSpacing = 2.5; // Spacing between machines
        const totalWidthNeeded = numSlots * machineSpacing;
        const startX = -(totalWidthNeeded / 2) + machineSpacing / 2; // Starting X position for the first machine
        const machineBodyDepth = 0.8; // Depth of the machine model (adjust if model changes)
        const wallZ = -roomSize / 2 + wallThickness / 2 + (machineBodyDepth / 2) + 0.1; // Position machines slightly in front of the back wall

        // Ensure we have enough themes, otherwise themes will repeat (which is fine now with 15 themes)
        if (slotThemes.length < numSlots) {
            console.warn(`Not enough unique themes (${slotThemes.length}) for the number of slots (${numSlots}). Themes will repeat.`);
        }

        for (let i = 0; i < numSlots; i++) {
            const machineId = `slot_${i}`;
            // Assign a theme based on index, cycling through available themes
            const themeIndex = i % slotThemes.length; // This ensures themes repeat if numSlots > numThemes
            const theme = slotThemes[themeIndex];
            const defaultSymbol = theme.symbols[0] || '?'; // Get default symbol from theme

            // Create the 3D model and the CSS3D UI for the slot machine
            const slotMachineGroup = this.createSlotMachineModel(machineId, theme); // Pass theme

            // Position and scale the machine
            const xPos = startX + i * machineSpacing;
            slotMachineGroup.position.set(xPos, 0, wallZ); // Set position (y=0 places base on the floor)
            // slotMachineGroup.rotation.y = Math.PI; // Face forward (Removed as requested)
            slotMachineGroup.scale.set(1.2, 1.2, 1.2); // Keep scale
            this.scene.add(slotMachineGroup);
            this.occluderObjects.push(slotMachineGroup);

            // Initialize the room state for this slot machine (if it doesn't exist)
            // We check this first to avoid overwriting existing state if level is recreated
             const existingState = this.room.roomState?.slotMachines?.[machineId];
             if (!existingState) {
                this.room.updateRoomState({
                    slotMachines: {
                        [machineId]: {
                            spinning: false,
                            betAmount: 1,
                            reels: [defaultSymbol, defaultSymbol, defaultSymbol], // Use theme's default symbol
                            message: theme.name // Use theme name as initial message
                            // Add other initial state properties if needed
                        }
                    }
                });
             } else {
                 // Optional: If state exists, ensure theme matches? Or just leave it.
                 // Currently, recreating the level keeps existing server state.
             }
        }

        this.createBarArea(-roomSize / 2 + wallThickness, 0, 0);
        
        // Add this line to create mines games on the right wall
        this.createMinesGames(roomSize / 2 - wallThickness, 0, 0);
    }
    
    createBarArea(wallX, floorY, wallZ) {
        // Bar dimensions
        const barLength = 12;
        const barWidth = 1.2;
        const barHeight = 1.1;
        const barZ = 0; // Center Z position
        const barStartZ = barZ - (barLength / 2);
        const offsetFromWall = 3.5; // Increased from 1.5 to 3.5 - moves bar further from wall
        
        // Bar materials
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x5d2906, // Dark wood
            roughness: 0.8,
            metalness: 0.2
        });
        const noisyWoodMaterial = this.applyNoiseToMaterial(woodMaterial, 512, 0.2, 0.5, 0.5);
        
        // Create bar counter
        const barGeometry = new THREE.BoxGeometry(barWidth, barHeight, barLength);
        const barCounter = new THREE.Mesh(barGeometry, noisyWoodMaterial.clone());
        barCounter.position.set(wallX + barWidth/2 + offsetFromWall, floorY + barHeight/2, barStartZ + barLength/2);
        barCounter.castShadow = true;
        barCounter.receiveShadow = true;
        this.scene.add(barCounter);
        this.objects.push(barCounter); // Add to collidable objects
        this.occluderObjects.push(barCounter);
        
        // Create bar top (slightly larger than the base)
        const barTopGeometry = new THREE.BoxGeometry(barWidth + 0.1, 0.1, barLength);
        const barTopMaterial = new THREE.MeshStandardMaterial({
            color: 0x220f00, // Darker finish for top
            roughness: 0.5,
            metalness: 0.4
        });
        const noisyBarTopMaterial = this.applyNoiseToMaterial(barTopMaterial, 512, 0.1, 0.6, 0.4);
        
        const barTop = new THREE.Mesh(barTopGeometry, noisyBarTopMaterial);
        barTop.position.set(wallX + barWidth/2 + offsetFromWall, floorY + barHeight + 0.05, barStartZ + barLength/2);
        barTop.castShadow = true;
        barTop.receiveShadow = true;
        this.scene.add(barTop);
        this.occluderObjects.push(barTop);
        
        // Create stools
        const stoolCount = 6;
        const stoolSpacing = barLength / (stoolCount + 1);
        
        for (let i = 1; i <= stoolCount; i++) {
            this.createBarStool(
                wallX + barWidth + offsetFromWall + 0.6, 
                floorY, 
                barStartZ + (i * stoolSpacing)
            );
        }
        
        // Create liquor shelf
        this.createLiquorShelf(wallX + 0.1, floorY + 1.6, barStartZ + 1, barLength - 2);
    }
    
    createBarStool(x, y, z) {
        // Stool materials
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.4,
            metalness: 0.8
        });
        const noisyMetalMaterial = this.applyNoiseToMaterial(metalMaterial, 256, 0.1, 0.5, 0.6);
        
        const seatMaterial = new THREE.MeshStandardMaterial({
            color: 0x990000, // Red leather
            roughness: 0.9,
            metalness: 0.1
        });
        const noisySeatMaterial = this.applyNoiseToMaterial(seatMaterial, 256, 0.3, 0.6, 0.5);
        
        // Create seat
        const seatGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16);
        const seat = new THREE.Mesh(seatGeometry, noisySeatMaterial);
        seat.position.set(x, y + 0.8, z);
        seat.castShadow = true;
        seat.receiveShadow = true;
        this.scene.add(seat);
        this.occluderObjects.push(seat);
        
        // Create central pole
        const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
        const pole = new THREE.Mesh(poleGeometry, noisyMetalMaterial.clone());
        pole.position.set(x, y + 0.4, z);
        pole.castShadow = true;
        pole.receiveShadow = true;
        this.scene.add(pole);
        this.occluderObjects.push(pole);
        
        // Create base
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16);
        const base = new THREE.Mesh(baseGeometry, noisyMetalMaterial.clone());
        base.position.set(x, y + 0.025, z);
        base.castShadow = true;
        base.receiveShadow = true;
        this.scene.add(base);
        this.occluderObjects.push(base);
        
        // Create footrest ring
        const ringGeometry = new THREE.TorusGeometry(0.25, 0.02, 8, 16);
        const ring = new THREE.Mesh(ringGeometry, noisyMetalMaterial.clone());
        ring.position.set(x, y + 0.25, z);
        ring.castShadow = true;
        ring.receiveShadow = true;
        this.scene.add(ring);
        this.occluderObjects.push(ring);
    }
    
    createLiquorShelf(wallX, y, z, length) {
        // Shelf materials
        const shelfMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d1506, // Dark wood
            roughness: 0.7,
            metalness: 0.2
        });
        const noisyShelfMaterial = this.applyNoiseToMaterial(shelfMaterial, 512, 0.15, 0.5, 0.5);
        
        // Create back panel
        const backPanelGeometry = new THREE.BoxGeometry(0.1, 3.5, length);
        const backPanel = new THREE.Mesh(backPanelGeometry, noisyShelfMaterial.clone());
        backPanel.position.set(wallX - 0.05, y + 1.75, z + length/2);
        backPanel.castShadow = true;
        backPanel.receiveShadow = true;
        this.scene.add(backPanel);
        this.occluderObjects.push(backPanel);
        
        // Create shelves (3 levels)
        const shelfWidth = 0.8;
        const shelfHeight = 0.06;
        const shelfCount = 3;
        const shelfSpacing = 1.5; // Increased from 1.0 to space shelves more evenly
        
        for (let i = 0; i < shelfCount; i++) {
            const shelfY = y + (i * shelfSpacing);
            const shelfGeometry = new THREE.BoxGeometry(shelfWidth, shelfHeight, length);
            const shelf = new THREE.Mesh(shelfGeometry, noisyShelfMaterial.clone());
            shelf.position.set(wallX + (shelfWidth / 2), shelfY, z + length/2);
            shelf.castShadow = true;
            shelf.receiveShadow = true;
            this.scene.add(shelf);
            this.occluderObjects.push(shelf);
            
            // Add bottles to this shelf
            this.addBottlesToShelf(wallX + (shelfWidth / 2), shelfY + shelfHeight/2, z, length, 6 + i);
        }
        
        // Removed the mirror panel that was here
    }
    
    addBottlesToShelf(shelfX, shelfY, shelfZ, shelfLength, bottleCount) {
        const bottleSpacing = shelfLength / (bottleCount + 1);
        const bottleColors = [
            0x7a3300, // Whiskey
            0xaa8800, // Rum
            0x336699, // Gin
            0xcc5500, // Tequila
            0x446600, // Chartreuse
            0x660033, // Red Wine
            0x007733, // Absinthe
            0xcc00cc, // Purple liqueur
            0x0099aa  // Blue Curaçao
        ];
        
        for (let i = 1; i <= bottleCount; i++) {
            const bottleZ = shelfZ + (i * bottleSpacing);
            const bottleColor = bottleColors[Math.floor(Math.random() * bottleColors.length)];
            
            // Randomize bottle parameters with better proportions
            const bottleHeight = 0.5 + Math.random() * 0.4;
            const bottleRadius = 0.08 + Math.random() * 0.04;
            const neckRadius = bottleRadius * (0.3 + Math.random() * 0.2);
            const neckHeight = bottleHeight * (0.3 + Math.random() * 0.2);
            
            // Create bottle group
            const bottleGroup = new THREE.Group();
            bottleGroup.position.set(shelfX, shelfY + bottleHeight/2, bottleZ);
            
            // --- Improved bottle body with shoulder taper ---
            // Create bottle body (slightly tapered at top for more realistic shape)
            const bodyHeight = bottleHeight - neckHeight;
            const shoulderRadius = bottleRadius * 0.6 + neckRadius * 0.4; // Blend between bottle and neck
            
            const bodyShape = new THREE.Shape();
            const segments = 8;
            const bodyPoints = [];
            
            // Create bottle body points (tapered cylinder)
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                // Quadratic interpolation for nice shoulder curve
                const radius = bottleRadius * (1 - t * t) + shoulderRadius * (t * t);
                bodyPoints.push(new THREE.Vector2(radius, bodyHeight * t));
            }
            
            // Create the body by rotating the points around Y axis
            const bodyGeometry = new THREE.LatheGeometry(bodyPoints, 16);
            bodyGeometry.translate(0, -bodyHeight/2, 0); // Center at origin
            
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: bottleColor,
                transparent: true,
                opacity: 0.8,
                roughness: 0.1,
                metalness: 0.1
            });
            
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial.clone());
            body.castShadow = true;
            body.receiveShadow = true;
            bottleGroup.add(body);
            
            // --- Create neck with proper connection to body ---
            const neckShape = new THREE.Shape();
            const neckPoints = [];
            
            // Make neck slightly curved (tapered cylinder)
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                // Linear interpolation from shoulder to top
                const radius = shoulderRadius * (1 - t) + neckRadius * t;
                neckPoints.push(new THREE.Vector2(radius, neckHeight * t));
            }
            
            const neckGeometry = new THREE.LatheGeometry(neckPoints, 16);
            // Position to connect with body
            neckGeometry.translate(0, bodyHeight/2, 0);
            
            const neck = new THREE.Mesh(neckGeometry, bodyMaterial.clone());
            neck.castShadow = true;
            neck.receiveShadow = true;
            bottleGroup.add(neck);
            
            // --- Create cap that properly sits on the neck ---
            const capRadius = neckRadius * 1.1; // Slightly wider than neck
            const capHeight = neckHeight * 0.15;
            const capGeometry = new THREE.CylinderGeometry(capRadius, capRadius, capHeight, 16);
            const capMaterial = new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.5,
                metalness: 0.2
            });
            
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            // Position cap directly on top of the neck
            cap.position.y = bodyHeight/2 + neckHeight;
            cap.castShadow = true;
            cap.receiveShadow = true;
            bottleGroup.add(cap);
            
            // Add bottle to scene
            this.scene.add(bottleGroup);
            this.occluderObjects.push(bottleGroup);
            
            // Rotate bottle slightly for variety
            bottleGroup.rotation.y = Math.random() * Math.PI * 2;
            bottleGroup.rotation.z = (Math.random() - 0.5) * 0.1;
        }
    }

    createNoiseTexture(width, height, scale = 0.1, contrast = 0.5, brightness = 0.5, tiled = false) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        const blockSize = tiled ? Math.max(1, Math.floor(width / 16)) : Math.max(1, Math.floor(width / 64));

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let noiseX = x;
                let noiseY = y;
                if (tiled) {
                    noiseX = Math.floor(x / blockSize);
                    noiseY = Math.floor(y / blockSize);
                }

                const value = this.noise2D(noiseX * scale, noiseY * scale); 

                const normalizedValue = (value + 1) / 2;
                let adjustedValue = (normalizedValue - 0.5) * (contrast * 2) + 0.5 + (brightness - 0.5);
                adjustedValue = Math.max(0, Math.min(1, adjustedValue));

                const colorValue = Math.floor(adjustedValue * 255);

                const index = (y * width + x) * 4;
                data[index] = colorValue;     
                data[index + 1] = colorValue; 
                data[index + 2] = colorValue; 
                data[index + 3] = 255;        
            }
        }

        ctx.putImageData(imageData, 0, 0);
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true; 
        return texture;
    }

    applyNoiseToMaterial(material, textureSize = 1024, scale = 0.05, contrast = 0.7, brightness = 0.5, tiledFloor = false) {
        const noiseTexture = this.createNoiseTexture(textureSize, textureSize, scale, contrast, brightness, tiledFloor);
        noiseTexture.wrapS = THREE.RepeatWrapping; 
        noiseTexture.wrapT = THREE.RepeatWrapping; 
        const repeatFactor = tiledFloor ? 8 : 2; 
        noiseTexture.repeat.set(repeatFactor, repeatFactor);

        const bumpTexture = this.createNoiseTexture(textureSize, textureSize, scale * 0.5, contrast * 1.2, brightness, tiledFloor);
        bumpTexture.wrapS = THREE.RepeatWrapping;
        bumpTexture.wrapT = THREE.RepeatWrapping;
        bumpTexture.repeat.set(repeatFactor, repeatFactor);

        const roughnessTexture = this.createNoiseTexture(textureSize, textureSize, scale * 1.5, contrast, brightness * 0.9, tiledFloor);
        roughnessTexture.wrapS = THREE.RepeatWrapping;
        roughnessTexture.wrapT = THREE.RepeatWrapping;
        roughnessTexture.repeat.set(repeatFactor, repeatFactor);

        const originalSide = material.side; 

        if (!(material instanceof THREE.MeshStandardMaterial)) {
            const color = material.color ? material.color.clone() : new THREE.Color(0xffffff);
            const roughness = material.roughness !== undefined ? material.roughness : 0.8;
            const metalness = material.metalness !== undefined ? material.metalness : 0.2;

            material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: roughness,
                metalness: metalness,
                side: originalSide 
            });
        } else {
            material.side = originalSide;
            const hsl = {};
            material.color.getHSL(hsl);
            hsl.s *= 0.95 + Math.random() * 0.1; 
            hsl.l *= 0.95 + Math.random() * 0.1;
            material.color.setHSL(hsl.h, hsl.s, hsl.l);
        }

        material.map = noiseTexture; 
        material.bumpMap = bumpTexture; 
        material.bumpScale = 0.01 + Math.random() * 0.02; 
        material.roughnessMap = roughnessTexture; 
        material.needsUpdate = true; 

        return material; 
    }

    createFirstPersonArms() {
        const armsGroup = new THREE.Group(); 

        const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 6); 
        let hash = 0;
        const clientId = this.room.clientId || 'default'; 
        for (let i = 0; i < clientId.length; i++) {
            hash = clientId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const armColor = new THREE.Color().setHSL((hash % 360) / 360, 0.6 + (hash % 40) / 100, 0.4 + (hash % 30) / 100);

        const armMaterial = new THREE.MeshLambertMaterial({ color: armColor });
        const noisyArmMaterial = this.applyNoiseToMaterial(armMaterial, 256, 0.15, 0.4, 0.6);

        const leftArm = new THREE.Mesh(armGeometry, noisyArmMaterial.clone());
        leftArm.position.set(0.6, -0.4, -0.5);
        leftArm.rotation.x = Math.PI / 6; 
        armsGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, noisyArmMaterial.clone());
        rightArm.position.set(-0.6, -0.4, -0.5);
        rightArm.rotation.x = Math.PI / 6; 
        armsGroup.add(rightArm);

        this.camera.add(armsGroup); 

        this.player.firstPersonArms = {
            group: armsGroup,
            left: leftArm,
            right: rightArm,
            baseLeftPos: leftArm.position.clone(), 
            baseRightPos: rightArm.position.clone() 
        };
    }

    createMultiplierWheel() {
        this.multiplierValues = [2, 3, 2, 5, 2, 3, 10, 2, 3, 2, 5, 3];
    }

    spinMultiplierWheel() {
        return new Promise(resolve => {
            const slotMachine = this.slotMachines[this.currentFreeSpinMachine];
            if (!slotMachine || !slotMachine.messageElement) {
                resolve(2); // Default multiplier if we can't find the machine
                return;
            }
            
            // Store original message to restore later
            const originalMessage = slotMachine.messageElement.textContent;
            
            // Display on the slot machine GUI
            slotMachine.messageElement.classList.add('winning');
            
            // Pick a random multiplier (weighted slightly to favor lower values)
            const randomIndex = Math.floor(Math.pow(Math.random(), 1.2) * this.multiplierValues.length);
            const finalMultiplier = this.multiplierValues[randomIndex];
            
            // Start cycling through numbers
            let currentIndex = 0;
            const allMultipliers = [...this.multiplierValues];
            
            // Add some extra values for more variety
            allMultipliers.push(15, 20, 4, 8);
            
            // Shuffle the array for more random cycling
            allMultipliers.sort(() => Math.random() - 0.5);
            
            let speed = 40; // Start faster (was 80)
            const maxSpeed = 300; // End faster (was 500)
            const speedIncrement = 20; // Faster acceleration (was 15)
            const speedThreshold = 200; // Lower threshold (was 300)
            
            const cycleNumbers = () => {
                slotMachine.messageElement.textContent = `Multiplier: ${allMultipliers[currentIndex]}x`;
                currentIndex = (currentIndex + 1) % allMultipliers.length;
                
                // Make sure the final multiplier appears in later cycles
                if (speed > speedThreshold && Math.random() > 0.5) {
                    slotMachine.messageElement.textContent = `Multiplier: ${finalMultiplier}x`;
                }
                
                // Increase time between updates to simulate slowing down
                speed += speedIncrement;
                
                if (speed < maxSpeed) {
                    setTimeout(cycleNumbers, speed);
                } else {
                    // Final reveal of the multiplier
                    slotMachine.messageElement.textContent = `MULTIPLIER: ${finalMultiplier}x!`;
                    
                    // Add extra flash effect to the machine
                    const reels = slotMachine.reelElements;
                    if (reels) {
                        reels.forEach(reel => {
                            reel.classList.add('winning');
                            setTimeout(() => reel.classList.remove('winning'), 1000);
                        });
                    }
                    
                    // Hide and resolve after showing result
                    setTimeout(() => {
                        slotMachine.messageElement.textContent = `Free Spins with ${finalMultiplier}x Bonus!`;
                        setTimeout(() => {
                            // Only restore original message if it hasn't been changed elsewhere
                            if (slotMachine.messageElement.textContent === `Free Spins with ${finalMultiplier}x Bonus!`) {
                                slotMachine.messageElement.textContent = originalMessage;
                            }
                        }, 1500);
                        resolve(finalMultiplier);
                    }, 2000);
                }
            };
            
            // Start the animation
            cycleNumbers();
        });
    }

    updateFreeSpinsIndicator() {
        if (this.freeSpinsAvailable > 0) {
            this.freeSpinsIndicator.style.display = 'block';
            this.freeSpinsCount.textContent = this.freeSpinsAvailable;
        } else {
            this.freeSpinsIndicator.style.display = 'none';
        }
    }

    handleUiRaycastClick() {
        if (!this.controls.isLocked) return;

        this.uiRaycaster.setFromCamera(this.mousePosition, this.camera);

        // Find the closest intersected object (slot machine or mines game)
        let closestObject = null;
        let closestDistance = Infinity;
        let objectType = null;

        // Check slot machines
        for (const machineId in this.slotMachines) {
            const machine = this.slotMachines[machineId];
            if (!machine || !machine.model) continue;

            const intersects = this.uiRaycaster.intersectObject(machine.model, true);

            if (intersects.length > 0 && intersects[0].distance < 5) {
                 if (intersects[0].distance < closestDistance) {
                    closestDistance = intersects[0].distance;
                    closestObject = machine;
                    objectType = 'slot';
                }
            }
        }

        // Check mines games
        for (const gameId in this.minesGames) {
            const game = this.minesGames[gameId];
            if (!game || !game.model) continue;

            const intersects = this.uiRaycaster.intersectObject(game.model, true);

            if (intersects.length > 0 && intersects[0].distance < 5) {
                if (intersects[0].distance < closestDistance) {
                    closestDistance = intersects[0].distance;
                    closestObject = game;
                    objectType = 'mines';
                }
            }
        }

        // If a game object was hit, simulate click on its UI
        if (closestObject) {
            const uiElement = closestObject.uiElement;

            if (uiElement && uiElement.style.opacity !== '0') { // Check if UI is visible (not occluded)
                // Re-calculate intersection point for the closest object
                const intersects = this.uiRaycaster.intersectObject(closestObject.model, true);

                if (intersects.length > 0) {
                    const hitPoint = intersects[0].point;
                    const screenPos = this.worldToScreen(hitPoint);

                    const elementsAtPoint = document.elementsFromPoint(screenPos.x, screenPos.y);

                    for (const element of elementsAtPoint) {
                        let clickedElement = null;
                        let feedbackColor = '';

                        if (objectType === 'slot') {
                            const isSlotUI = element.closest('.slot-machine-ui');
                            if (isSlotUI && (element.classList.contains('slot-button') || element.classList.contains('bet-button'))) {
                                clickedElement = element;
                                feedbackColor = '#aa0000'; // Slot machine feedback color
                            }
                        } else if (objectType === 'mines') {
                            const isMinesUI = element.closest('.mines-game-ui-v2'); // Check for V2 UI
                            // Check for V2 buttons or tiles
                            if (isMinesUI && (element.classList.contains('mines-v2-button') || element.classList.contains('mines-v2-tile'))) {
                                clickedElement = element;
                                feedbackColor = '#0044aa'; // Mines game feedback color
                            }
                        }

                        // If a valid clickable element was found
                        if (clickedElement) {
                            // Only click enabled elements (especially important for mines tiles)
                             if (!clickedElement.disabled && !clickedElement.classList.contains('disabled')) {
                                clickedElement.click();

                                // Visual feedback
                                const originalBgColor = clickedElement.style.backgroundColor;
                                clickedElement.style.backgroundColor = feedbackColor;
                                setTimeout(() => {
                                    clickedElement.style.backgroundColor = originalBgColor;
                                }, 100);
                             }

                            break; // Stop checking elements once a valid one is clicked
                        }
                    }
                }
            }
            return; // Don't process further if a UI was interacted with
        }
    }

    simulateClickAtPosition(screenPos, containerElement) {
        // This function might be redundant with the improved handleUiRaycastClick
        const containerRect = containerElement.getBoundingClientRect();

        const relX = screenPos.x - containerRect.left;
        const relY = screenPos.y - containerRect.top;

        const elementsAtPoint = document.elementsFromPoint(screenPos.x, screenPos.y);

        for (const element of elementsAtPoint) {
             if (element.closest('.slot-machine-ui') &&
                (element.classList.contains('slot-button') ||
                 element.classList.contains('bet-button'))) {

                 element.click();

                 const originalBgColor = element.style.backgroundColor;
                 element.style.backgroundColor = '#aa0000';
                 setTimeout(() => {
                     element.style.backgroundColor = originalBgColor;
                 }, 100);

                 break;
             }
        }
    }

    worldToScreen(worldPosition) {
        const vector = worldPosition.clone();
        vector.project(this.camera);

        return {
            x: (vector.x * 0.5 + 0.5) * window.innerWidth,
            y: (-(vector.y * 0.5) + 0.5) * window.innerHeight
        };
    }

    createMinesGameModel(gameId, zPosition, wallX, floorY) {
        const gameGroup = new THREE.Group();
        gameGroup.userData.gameId = gameId;

        // Game dimensions
        const width = 1.2;
        const height = 2.2; // Kept height for the physical model
        const depth = 0.5;

        // Materials - Use V2 styling colors
        const frameColor = 0x282c34; // Dark background color
        const accentColor = 0x61dafb; // Neon cyan

        const frameMaterial = new THREE.MeshStandardMaterial({
            color: frameColor,
            roughness: 0.6,
            metalness: 0.4
        });
        const noisyFrameMaterial = this.applyNoiseToMaterial(frameMaterial, 256, 0.1, 0.5, 0.5);

        const screenMaterial = new THREE.MeshStandardMaterial({
            color: 0x1c1f25, // Slightly darker screen area
            roughness: 0.3,
            metalness: 0.2,
            emissive: accentColor, // Cyan emissive glow
            emissiveIntensity: 0.05 // Subtle glow
        });
        const noisyScreenMaterial = this.applyNoiseToMaterial(screenMaterial, 256, 0.05, 0.3, 0.4);

        // Create cabinet
        const cabinetGeometry = new THREE.BoxGeometry(width, height, depth);
        const cabinet = new THREE.Mesh(cabinetGeometry, noisyFrameMaterial);
        cabinet.position.y = height / 2;
        gameGroup.add(cabinet);

        // Create screen area (where CSS UI will sit)
        const screenWidth = width * 0.9; // Slightly wider screen area
        const screenHeight = height * 0.8; // Larger screen area
        const screenDepth = 0.05;
        const screenGeometry = new THREE.BoxGeometry(screenWidth, screenHeight, screenDepth);
        const screen = new THREE.Mesh(screenGeometry, noisyScreenMaterial);
        // Position screen higher to accommodate taller UI
        screen.position.y = height * 0.55;
        gameGroup.add(screen);

        // Create base
        const baseHeight = 0.1;
        const baseWidth = width * 1.1;
        const baseDepth = depth * 1.1;
        const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
        const base = new THREE.Mesh(baseGeometry, noisyFrameMaterial.clone());
        base.position.y = baseHeight / 2;
        gameGroup.add(base);

        // CSS3D UI for the mines game (V2)
        const element = document.createElement('div');
        element.className = 'mines-game-ui-v2'; // Use V2 class
        element.id = `mines-ui-${gameId}`;

        element.innerHTML = `
            <div class="mines-v2-title">MINES</div>
            <div class="mines-v2-info-bar">
                <div class="mines-v2-info-item">Bet: <span class="mines-v2-current-bet">$1.0</span></div>
                <div class="mines-v2-info-item">Mines: <span class="mines-v2-mine-count">3</span></div>
                <div class="mines-v2-info-item">Next: <span class="mines-v2-next-payout">$1.25</span></div>
                <div class="mines-v2-info-item">Mult: <span class="mines-v2-current-multiplier">1.00x</span></div>
            </div>
            <div class="mines-v2-grid"></div>
            <div class="mines-v2-controls-bottom">
                 <div class="mines-v2-message">Place your bet!</div>
                 <div class="mines-v2-controls-row">
                     <div class="mines-v2-bet-controls">
                        <button class="mines-v2-button mines-v2-bet-decrease">-</button>
                        <div class="mines-v2-bet-amount">$1.0</div>
                        <button class="mines-v2-button mines-v2-bet-increase">+</button>
                    </div>
                    <button class="mines-v2-button mines-v2-difficulty-btn">Mines: 3</button>
                 </div>
                 <div class="mines-v2-controls-row">
                    <button class="mines-v2-button control-button start-button mines-v2-start">Start</button>
                    <button class="mines-v2-button control-button cashout-button mines-v2-cashout" disabled>Cash Out</button>
                 </div>
            </div>
        `;

        const cssObject = new CSS3DObject(element);

        // Scale and position the CSS3D object
        const scale = 0.0020; // Adjusted scale for potentially larger UI
        cssObject.scale.set(scale, scale, scale);
        // Position slightly in front of the bezel position
        cssObject.position.copy(screen.position).add(new THREE.Vector3(0, 0, 0.03)); 

        gameGroup.add(cssObject); 

        // Create grid tiles
        const grid = element.querySelector('.mines-v2-grid');
        for (let i = 0; i < 25; i++) {
            const tile = document.createElement('div');
            tile.className = 'mines-v2-tile'; // Use V2 class
            tile.dataset.index = i;
            grid.appendChild(tile);
        }

        // Store UI elements and game state
        this.minesGames[gameId] = {
            id: gameId,
            model: gameGroup,
            cssObject: cssObject,
            uiElement: element,
            betAmount: 1,
            mineCount: 3,
            tiles: Array.from(element.querySelectorAll('.mines-v2-tile')),
            gameState: 'idle', // idle, active, ended, spectating
            revealed: [],
            minePositions: [],
            currentMultiplier: 1,
            // V2 UI element references
            startButton: element.querySelector('.mines-v2-start'),
            cashoutButton: element.querySelector('.mines-v2-cashout'),
            betDisplay: element.querySelector('.mines-v2-current-bet'),
            mineCountDisplay: element.querySelector('.mines-v2-mine-count'),
            nextPayoutDisplay: element.querySelector('.mines-v2-next-payout'),
            currentMultiplierDisplay: element.querySelector('.mines-v2-current-multiplier'),
            difficultyBtn: element.querySelector('.mines-v2-difficulty-btn'),
            messageDisplay: element.querySelector('.mines-v2-message'),
            betIncreaseButton: element.querySelector('.mines-v2-bet-increase'),
            betDecreaseButton: element.querySelector('.mines-v2-bet-decrease'),
            betAmountDisplay: element.querySelector('.mines-v2-bet-amount')
        };

        // Store element references
        gameGroup.userData.uiElement = element;
        gameGroup.userData.cssObject = cssObject;

        // Add event listeners
        this.setupMinesGameListeners(gameId); // This function should work if selectors are correct

        // Position the game
        gameGroup.position.set(wallX - depth / 2 - 0.1, floorY, zPosition);
        gameGroup.rotation.y = -Math.PI / 2; // Face away from the wall

        // Enable shadows
        gameGroup.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });

        // Initialize room state for this mines game if it doesn't exist
        const existingState = this.room.roomState?.minesGames?.[gameId];
        if (!existingState) {
            this.room.updateRoomState({
                minesGames: {
                    [gameId]: {
                        active: false,
                        clientId: null,
                        betAmount: 1,
                        mineCount: 3,
                        revealed: [],
                        currentMultiplier: 1, // Initialize multiplier in state
                        currentPayout: 0 // Reset payout
                        // Keep betAmount and mineCount as they were
                    }
                }
            });
        } else {
            // If state exists, update local UI on load
             this.minesGames[gameId].betAmount = existingState.betAmount || 1;
             this.minesGames[gameId].mineCount = existingState.mineCount || 3;
             this.updateMinesLocalUI(gameId); // Update display based on potentially loaded state
        }

        return gameGroup;
    }

    setupMinesGameListeners(gameId) {
        const game = this.minesGames[gameId];
        if (!game) return;

        // Start button listener
        game.startButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.startMinesGame(gameId);
        });

        // Cashout button listener
        game.cashoutButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.cashoutMinesGame(gameId);
        });

        // Tile click listeners
        game.tiles.forEach(tile => {
            tile.addEventListener('click', (event) => {
                event.stopPropagation();
                const index = parseInt(tile.dataset.index);
                this.revealMineTile(gameId, index);
            });
        });

        // Bet adjustment listeners
        game.betIncreaseButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.adjustMinesBet(gameId, 1);
        });

        game.betDecreaseButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.adjustMinesBet(gameId, -1);
        });

        // Difficulty adjustment listener
        game.difficultyBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            this.cycleMinesDifficulty(gameId);
        });
    }

    cycleMinesDifficulty(gameId) {
        const game = this.minesGames[gameId];
        if (!game || game.gameState !== 'idle') return;

        // Cycle through difficulty levels (3, 5, 8, 12, 16, 20)
        const difficulties = [3, 5, 8, 12, 16, 20]; // Kept the same difficulties
        const currentIndex = difficulties.indexOf(game.mineCount);
        const nextIndex = (currentIndex + 1) % difficulties.length;
        game.mineCount = difficulties[nextIndex];

        // Update local UI
        this.updateMinesLocalUI(gameId);

        // Update next payout display & state
        this.updateMinesNextPayout(gameId); // Calculate for first click

        // Update room state to signal difficulty change
        this.room.updateRoomState({
            minesGames: {
                [gameId]: {
                    betAmount: game.betAmount,
                    mineCount: game.mineCount,
                    currentMultiplier: 1, // Reset multiplier in state
                    currentPayout: 0 // Reset payout
                }
            }
        });
    }

    adjustMinesBet(gameId, change) {
        const game = this.minesGames[gameId];
        if (!game || game.gameState !== 'idle') return;

        // Calculate new bet amount based on current value
        let newBet = game.betAmount;

        // Use the same bet stepping logic
        if (change > 0) {
            if (newBet < 1) newBet += 0.1;
            else if (newBet < 10) newBet += 1;
            else if (newBet < 100) newBet += 10;
            else if (newBet < 1000) newBet += 100;
            else newBet += 1000;
        } else {
            if (newBet > 10000) newBet -= 10000; // Added higher step down
            else if (newBet > 1000) newBet -= 1000;
            else if (newBet > 100) newBet -= 100;
            else if (newBet > 10) newBet -= 10;
            else if (newBet > 1) newBet -= 1;
            else newBet -= 0.1;
        }

        // Ensure bet stays within limits and has 1 decimal place
        newBet = Math.max(0.1, Math.min(10000, parseFloat(newBet.toFixed(1))));

        if (newBet !== game.betAmount) {
            game.betAmount = newBet;

            // Update local UI
            this.updateMinesLocalUI(gameId);

            // Update next payout display & state
            this.updateMinesNextPayout(gameId); // Also updates room state
        }
    }

    updateMinesNextPayout(gameId) {
        const game = this.minesGames[gameId];
        if (!game) return;

        const gridSize = 25;
        const mines = game.mineCount;
        const revealedCount = game.revealed.length;
        const safetyFactor = 0.96; // Kept the same house edge

        // Calculate the multiplier for revealing just the *next* safe tile
        let nextStepMultiplier = 1;
        if (revealedCount < gridSize - mines) { // Make sure we don't divide by zero if all safe tiles are clicked
            const remainingTiles = gridSize - revealedCount;
            const remainingSafeTiles = gridSize - mines - revealedCount;

             if (remainingSafeTiles <= 0) {
                 nextStepMultiplier = 1; // Should not happen if logic is correct, but safeguard
             } else {
                const fairStepMultiplier = remainingTiles / remainingSafeTiles;
                // Dampen the increase using the same power
                const increaseFactor = fairStepMultiplier - 1;
                nextStepMultiplier = 1 + (increaseFactor > 0 ? Math.pow(increaseFactor, 0.65) : 0);
                nextStepMultiplier = Math.max(1, nextStepMultiplier);
            }
        } else {
            // All safe tiles already revealed, next multiplier is irrelevant
            nextStepMultiplier = 1;
        }

        // Update the "Next Payout" display
        const nextPayoutValue = game.betAmount * nextStepMultiplier * safetyFactor;

        if (isNaN(nextPayoutValue) || !isFinite(nextPayoutValue) || revealedCount >= gridSize - mines) {
            game.nextPayoutDisplay.textContent = `$---`; // Indicate no further payout
        } else {
            game.nextPayoutDisplay.textContent = `$${nextPayoutValue.toFixed(2)}`;
        }

        // Update the "Current Multiplier" display (reflects state *before* next click)
        game.currentMultiplierDisplay.textContent = `${game.currentMultiplier.toFixed(2)}x`;


        // If idle, update the shared state with the new bet/difficulty/payout potential
        if (game.gameState === 'idle') {
             this.room.updateRoomState({
                minesGames: {
                    [gameId]: {
                        // Only update non-gameplay state when idle
                        betAmount: game.betAmount,
                        mineCount: game.mineCount,
                        currentMultiplier: 1, // Reset multiplier in state when idle
                        currentPayout: nextPayoutValue // Reflect the potential payout of the *first* click
                    }
                }
            });
        }
    }

    startMinesGame(gameId) {
        const game = this.minesGames[gameId];
        if (!game || game.gameState === 'active' || game.gameState === 'spectating') return;

        // Check if player has enough money
        if (this.player.money < game.betAmount) {
            game.messageDisplay.textContent = "Insufficient funds!";
            game.messageDisplay.className = "mines-v2-message lose";
            setTimeout(() => {
                if (game.messageDisplay.textContent === "Insufficient funds!") {
                    game.messageDisplay.textContent = "Place your bet!";
                    game.messageDisplay.className = "mines-v2-message";
                }
            }, 1500);
            return;
        }

        // Check if game is already in use by someone else
        const currentState = this.room.roomState?.minesGames?.[gameId];
        if (currentState && currentState.active && currentState.clientId !== this.room.clientId) {
            game.messageDisplay.textContent = "Game in use!";
            game.messageDisplay.className = "mines-v2-message lose";
             setTimeout(() => {
                if (game.messageDisplay.textContent === "Game in use!") {
                    game.messageDisplay.textContent = "Place your bet!";
                    game.messageDisplay.className = "mines-v2-message";
                }
            }, 1500);
            return;
        }

        // Deduct bet amount
        this.player.money -= game.betAmount;
        // Use parseFloat to ensure calculations are correct if money was a string
        this.player.money = Math.max(0, parseFloat(this.player.money));
        this.room.updatePresence({ money: this.player.money });
        this.currencyDisplay.textContent = `$${this.player.money}`;
        // Update player list to reflect money change
        this.updatePlayerList();

        // Reset local game state
        game.gameState = 'active';
        game.revealed = [];
        game.minePositions = this.generateMinePositions(game.mineCount);
        game.currentMultiplier = 1; // Reset multiplier to 1 at the start

        // Update UI
        game.tiles.forEach(tile => {
            tile.className = 'mines-v2-tile'; // Reset classes
            tile.textContent = '';
            tile.disabled = false; // Enable tiles
        });

        game.startButton.disabled = true;
        game.cashoutButton.disabled = true; // Can't cash out before first click
        game.betIncreaseButton.disabled = true;
        game.betDecreaseButton.disabled = true;
        game.difficultyBtn.disabled = true;

        game.messageDisplay.textContent = "Find the gems!";
        game.messageDisplay.className = "mines-v2-message";

        // Initialize next payout display *after* resetting multipliers
        this.updateMinesNextPayout(gameId); // Calculate for first click

        // Update room state to signal game start
        this.room.updateRoomState({
            minesGames: {
                [gameId]: {
                    active: true,
                    clientId: this.room.clientId,
                    betAmount: game.betAmount,
                    mineCount: game.mineCount,
                    revealed: [],
                    currentMultiplier: game.currentMultiplier, // Start at 1x
                    currentPayout: 0 // Initial payout is 0
                }
            }
        });

        // Broadcast game start event
        this.room.send({
            type: 'minesGameStart',
            gameId: gameId,
            clientId: this.room.clientId,
            username: this.room.peers[this.room.clientId]?.username || 'Player',
            betAmount: game.betAmount,
            mineCount: game.mineCount
        });
    }

    generateMinePositions(count) {
        const positions = [];
        const gridSize = 25;

        while (positions.length < count) {
            const position = Math.floor(Math.random() * gridSize);
            if (!positions.includes(position)) {
                positions.push(position);
            }
        }

        return positions;
    }

    revealMineTile(gameId, index) {
        const game = this.minesGames[gameId];
        // Allow reveal only if active and not already revealed
        if (!game || game.gameState !== 'active' || game.revealed.includes(index)) return;

        // Make sure this is the client that owns this game
        const currentState = this.room.roomState?.minesGames?.[gameId];
        if (!currentState || !currentState.active || currentState.clientId !== this.room.clientId) return;

        const tile = game.tiles[index];
        if (!tile || tile.disabled) return; // Check if tile is already processed or disabled

        tile.disabled = true; // Disable tile immediately to prevent double clicks

        // Check if it's a mine
        if (game.minePositions.includes(index)) {
            // Game over - hit a mine
            tile.classList.add('revealed', 'mine');
            this.endMinesGame(gameId, false, index);

            // Broadcast mine hit event
            this.room.send({
                type: 'minesBust',
                gameId: gameId,
                clientId: this.room.clientId,
                username: this.room.peers[this.room.clientId]?.username || 'Player',
                betAmount: game.betAmount,
                revealedCount: game.revealed.length
            });

        } else {
            // Safe tile - reveal it
            game.revealed.push(index);
            tile.classList.add('revealed', 'gem');

            // Calculate the multiplier step for *this* reveal
            const gridSize = 25;
            const mines = game.mineCount;
            const revealedCount = game.revealed.length; // Now includes the just revealed tile (1-based index of step)
            const totalSafeTiles = gridSize - mines;
            const safetyFactor = 0.96;

            let currentStepMultiplier = 1;
             // Calculate multiplier for the step from (revealedCount - 1) to revealedCount
             if (revealedCount <= totalSafeTiles) {
                const remainingTiles = gridSize - (revealedCount - 1);
                const remainingSafeTiles = totalSafeTiles - (revealedCount - 1);
                if (remainingSafeTiles > 0) {
                    const fairStepMultiplier = remainingTiles / remainingSafeTiles;
                    const increaseFactor = fairStepMultiplier - 1;
                    currentStepMultiplier = 1 + (increaseFactor > 0 ? Math.pow(increaseFactor, 0.65) : 0);
                    currentStepMultiplier = Math.max(1, currentStepMultiplier);
                }
            }


            // Update the game's total current multiplier cumulatively
            game.currentMultiplier *= currentStepMultiplier * safetyFactor;
            // Round to avoid excessive floating point issues, but keep reasonable precision
            game.currentMultiplier = parseFloat(game.currentMultiplier.toFixed(4));

            // Display the achieved multiplier *after* this click on the tile (briefly?)
            //tile.textContent = `${game.currentMultiplier.toFixed(2)}x`;
            // We use the gem icon instead of text now

            // Enable cashout button after the first successful reveal
             if (game.revealed.length > 0) {
                 game.cashoutButton.disabled = false;
             }

            // Update the 'Next Payout' and 'Current Multiplier' display for the subsequent click
            this.updateMinesNextPayout(gameId);

            // Update room state with the new *total* payout potential if they cash out now
            const currentCashoutValue = game.betAmount * game.currentMultiplier;
            this.room.updateRoomState({
                minesGames: {
                    [gameId]: {
                        revealed: [...game.revealed], // Send a copy of the array
                        currentMultiplier: game.currentMultiplier,
                        // Reflect current cashout value, ensure it's a valid number
                        currentPayout: (isNaN(currentCashoutValue) || !isFinite(currentCashoutValue)) ? 0 : currentCashoutValue
                    }
                }
            });

            // Check if all non-mine tiles have been revealed (perfect game)
            if (game.revealed.length === totalSafeTiles) {
                 this.cashoutMinesGame(gameId, true); // Force cashout with perfect game bonus
            }

            // Broadcast reveal event - include the multiplier achieved
            this.room.send({
                type: 'minesReveal',
                gameId: gameId,
                clientId: this.room.clientId,
                index: index,
                isMine: false,
                safeCount: game.revealed.length,
                multiplier: game.currentMultiplier // Send the multiplier achieved *after* this reveal
            });
        }
    }

    cashoutMinesGame(gameId, isPerfectGame = false) {
        const game = this.minesGames[gameId];
        if (!game || game.gameState !== 'active') return;

        // Make sure this is the client that owns this game
        const currentState = this.room.roomState?.minesGames?.[gameId];
        if (!currentState || !currentState.active || currentState.clientId !== this.room.clientId) return;

        // Calculate payout based on the multiplier achieved *after* the last revealed tile
        let payout = game.betAmount * game.currentMultiplier;
        payout = isNaN(payout) || !isFinite(payout) ? 0 : payout; // Ensure payout is not NaN/Infinity

        // Apply perfect game bonus if applicable (very rare)
        const perfectGameBonusMultiplier = 1.1; // 10% bonus for perfect game
        if (isPerfectGame) {
            payout *= perfectGameBonusMultiplier;
            game.messageDisplay.textContent = `PERFECT! +10% Bonus! Cashed out $${payout.toFixed(2)}!`;
        } else {
            game.messageDisplay.textContent = `Cashed out $${payout.toFixed(2)}! (${game.currentMultiplier.toFixed(2)}x)`;
        }
        payout = parseFloat(payout.toFixed(2)); // Round to cents

        // Award money only if payout > 0
        if (payout > 0) {
            // Ensure money doesn't become NaN
            const currentMoney = parseFloat(this.player.money) || 0;
            this.player.money = currentMoney + payout;
            this.room.updatePresence({ money: this.player.money });
            this.currencyDisplay.textContent = `$${this.player.money}`;
        }

        // Update message style
        game.messageDisplay.className = "mines-v2-message win";
        game.cashoutButton.disabled = true; // Disable cashout after clicking

        // End the game with success state
        this.endMinesGame(gameId, true);

        // Broadcast cashout event
        this.room.send({
            type: 'minesCashout',
            gameId: gameId,
            clientId: this.room.clientId,
            username: this.room.peers[this.room.clientId]?.username || 'Player',
            payout: payout.toFixed(2),
            revealed: game.revealed.length,
            isPerfectGame: isPerfectGame
        });
    }

    endMinesGame(gameId, success, mineIndex = null) {
        const game = this.minesGames[gameId];
        if (!game) return;
        if (game.gameState === 'ended') return; // Already ended

        const wasActiveOwner = game.gameState === 'active';
        game.gameState = 'ended'; // Set state immediately

        // Only the owner should update room state and handle payout display logic
        const currentState = this.room.roomState?.minesGames?.[gameId];
        const isOwner = currentState && currentState.active && currentState.clientId === this.room.clientId;

        if (isOwner) {
            // Disable controls immediately for owner
            game.startButton.disabled = false; // Re-enable start for next game
            game.cashoutButton.disabled = true;
            game.betIncreaseButton.disabled = false;
            game.betDecreaseButton.disabled = false;
            game.difficultyBtn.disabled = false;

            // Display final message for owner
            if (!success) {
                game.messageDisplay.textContent = `BOOM! Lost $${game.betAmount.toFixed(1)}!`;
                game.messageDisplay.className = "mines-v2-message lose";
            } else if (!game.messageDisplay.textContent.includes("Cashed out")) { // Don't overwrite cashout message
                game.messageDisplay.textContent = `Game ended.`;
                game.messageDisplay.className = "mines-v2-message";
            }

             // Reveal all mines for the owner
             this.revealAllMines(gameId, mineIndex);

            // Update room state to signal game end
            this.room.updateRoomState({
                minesGames: {
                    [gameId]: {
                        active: false,
                        clientId: null,
                        revealed: [], // Clear revealed on end
                        currentMultiplier: 1,
                        currentPayout: 0 // Reset payout
                        // Keep betAmount and mineCount as they were
                    }
                }
            });

            // Reset UI after a delay for the owner
            setTimeout(() => {
                 // Check if still ended before resetting UI
                if (this.minesGames[gameId]?.gameState === 'ended') {
                    this.resetMinesUIAfterGame(gameId);
                }
            }, success ? 2000 : 3000); // Longer delay if lost to see mines

        } else {
             // Logic for spectators or if state mismatch
             // Just ensure controls are eventually re-enabled if the game ended
             if (game.gameState !== 'active') {
                  game.startButton.disabled = false;
                  game.cashoutButton.disabled = true;
                  game.betIncreaseButton.disabled = false;
                  game.betDecreaseButton.disabled = false;
                  game.difficultyBtn.disabled = false;
                  if (game.messageDisplay.textContent.includes('playing')) {
                       game.messageDisplay.textContent = "Place your bet!";
                       game.messageDisplay.className = "mines-v2-message";
                  }
             }
        }
    }
    
    // Helper to reveal all mines at the end of a game
    revealAllMines(gameId, hitMineIndex = null) {
        const game = this.minesGames[gameId];
        if (!game) return;

        game.minePositions.forEach(pos => {
            if (!game.revealed.includes(pos)) { // Don't re-reveal the one they clicked
                const tile = game.tiles[pos];
                if (tile) {
                    // Add 'revealed' and 'mine' but maybe a different style for unclicked mines
                    tile.classList.add('revealed', 'mine');
                    if (pos !== hitMineIndex) {
                        tile.style.opacity = '0.7'; // Make unclicked mines slightly faded
                    }
                    tile.disabled = true;
                }
            }
        });

        // Disable all remaining unrevealed tiles
        game.tiles.forEach((tile, index) => {
            if (!tile.classList.contains('revealed')) {
                 tile.disabled = true;
                 tile.classList.add('disabled'); // Add visual disabled state
            }
        });
    }
    
    // Helper to reset the Mines UI elements to idle state
    resetMinesUIAfterGame(gameId) {
        const game = this.minesGames[gameId];
        if (!game) return;

        game.tiles.forEach(tile => {
            tile.className = 'mines-v2-tile'; // Reset classes
            tile.textContent = '';
            tile.disabled = false;
            tile.style.opacity = '1'; // Reset opacity if faded
        });
        game.messageDisplay.textContent = "Place your bet!";
        game.messageDisplay.className = "mines-v2-message";
        game.currentMultiplier = 1;
        game.revealed = [];

        // Update displays
        this.updateMinesLocalUI(gameId);
        this.updateMinesNextPayout(gameId); // Calculate potential for first click

        // Ensure controls are enabled
        game.startButton.disabled = false;
        game.cashoutButton.disabled = true;
        game.betIncreaseButton.disabled = false;
        game.betDecreaseButton.disabled = false;
        game.difficultyBtn.disabled = false;
    }

    // Helper function to update local UI elements based on game state
    updateMinesLocalUI(gameId) {
        const game = this.minesGames[gameId];
        if (!game) return;

        game.betAmountDisplay.textContent = `$${game.betAmount.toFixed(1)}`;
        game.betDisplay.textContent = `$${game.betAmount.toFixed(1)}`;
        game.difficultyBtn.textContent = `Mines: ${game.mineCount}`;
        game.mineCountDisplay.textContent = game.mineCount;
        game.currentMultiplierDisplay.textContent = `${game.currentMultiplier.toFixed(2)}x`;
         // Next payout is updated separately by updateMinesNextPayout
    }


    updateMinesGamesFromRoomState(minesGamesState) {
        for (const gameId in minesGamesState) {
            const serverGame = minesGamesState[gameId];
            const localGame = this.minesGames[gameId];

            if (!localGame) continue;

            const isOwner = serverGame.active && serverGame.clientId === this.room.clientId;
            const isSpectator = serverGame.active && serverGame.clientId !== this.room.clientId;
            const isIdle = !serverGame.active;

            // Update local bet/difficulty if idle and different from server
            if (isIdle && localGame.gameState !== 'idle') {
                 localGame.betAmount = serverGame.betAmount || 1;
                 localGame.mineCount = serverGame.mineCount || 3;
                 // If transitioning from active/spectating to idle, reset the UI
                 this.resetMinesUIAfterGame(gameId);
                 localGame.gameState = 'idle';
            } else if (isIdle && (localGame.betAmount !== serverGame.betAmount || localGame.mineCount !== serverGame.mineCount)) {
                 localGame.betAmount = serverGame.betAmount || 1;
                 localGame.mineCount = serverGame.mineCount || 3;
                 this.updateMinesLocalUI(gameId);
                 this.updateMinesNextPayout(gameId);
            }


            // Handle spectator updates
            if (isSpectator) {
                if (localGame.gameState !== 'spectating') {
                    // Entering spectator mode
                    localGame.gameState = 'spectating';
                    localGame.betAmount = serverGame.betAmount; // Show spectator bet/mines
                    localGame.mineCount = serverGame.mineCount;
                    this.updateMinesLocalUI(gameId); // Update bet/mine count display
                    localGame.messageDisplay.textContent = `${this.room.peers[serverGame.clientId]?.username || 'Player'} is playing...`;
                    localGame.messageDisplay.className = "mines-v2-message";
                    localGame.startButton.disabled = true;
                    localGame.cashoutButton.disabled = true;
                    localGame.betIncreaseButton.disabled = true;
                    localGame.betDecreaseButton.disabled = true;
                    localGame.difficultyBtn.disabled = true;
                    localGame.tiles.forEach(tile => {
                        tile.className = 'mines-v2-tile disabled'; // Start fresh, disable all
                        tile.textContent = '';
                        tile.disabled = true;
                    });
                }

                // Update revealed tiles for spectator
                if (serverGame.revealed && serverGame.revealed.length > (localGame.revealed?.length || 0)) {
                     // Only update if new tiles are revealed on server
                     localGame.revealed = [...serverGame.revealed]; // Update local revealed cache
                     localGame.currentMultiplier = serverGame.currentMultiplier || 1; // Update multiplier

                     serverGame.revealed.forEach(index => {
                        const tile = localGame.tiles[index];
                        if (tile && !tile.classList.contains('gem')) {
                            tile.className = 'mines-v2-tile revealed gem'; // Add gem class
                            // Optionally show multiplier on tile briefly or use icon
                            // tile.textContent = `${localGame.currentMultiplier.toFixed(2)}x`;
                        }
                    });
                     // Update spectator's multiplier/payout display
                     localGame.currentMultiplierDisplay.textContent = `${localGame.currentMultiplier.toFixed(2)}x`;
                     const nextPayoutValue = serverGame.betAmount * localGame.currentMultiplier * 1.05 ; // Approximate next payout slightly
                     localGame.nextPayoutDisplay.textContent = `$${nextPayoutValue.toFixed(2)}`;
                }
            }
             // Handle ending a game locally if server state becomes inactive while we were active/spectating
             else if (isIdle && localGame.gameState !== 'idle') {
                  // If the game ended on the server, trigger the end sequence locally
                  // The 'success' parameter doesn't really matter here as payout is handled by owner/server event
                   this.endMinesGame(gameId, false);
                   localGame.gameState = 'idle'; // Ensure state becomes idle
                   // Reset might be handled inside endMinesGame, but ensure it happens
                   this.resetMinesUIAfterGame(gameId);
            }
        }
    }

    createMinesGames(wallX, floorY, wallZ) {
        const gameCount = 4; // Number of games to create
        const spacing = 8; // Spacing between games
        
        for (let i = 0; i < gameCount; i++) {
            const gameId = `mines_${i}`;
            const zPosition = -15 + (i * spacing); // Position along the Z axis
            
            // Create the mines game model and add it to the scene
            const minesGameModel = this.createMinesGameModel(gameId, zPosition, wallX, floorY);
            this.scene.add(minesGameModel);
            this.occluderObjects.push(minesGameModel);
        }
    }

    updatePlayerList() { 
        const presence = this.room.presence || {}; 
        const peers = this.room.peers || {}; 

        this.playerList.innerHTML = ''; 
        let ownMoney = this.player.money; 

        const sortedPeerIds = Object.keys(peers).sort((a, b) => {
            const userA = peers[a]?.username || '';
            const userB = peers[b]?.username || '';
            return userA.localeCompare(userB);
        });

        for (const clientId of sortedPeerIds) {
            const peer = peers[clientId];
            if (!peer) continue; 

            const presenceData = presence[clientId] || {}; 

            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';

            const avatar = document.createElement('img');
            avatar.className = 'player-avatar';
            avatar.src = peer.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(peer.username || '?')}&background=random&size=24`;
            avatar.alt = `${peer.username || 'Player'}'s avatar`; 
            playerItem.appendChild(avatar);

            // Create a container for name and money
            const playerDetails = document.createElement('div');
            playerDetails.className = 'player-details';

            const playerInfo = document.createElement('div');
            playerInfo.className = 'player-info'; // Added class
            playerInfo.textContent = `${peer.username || 'Connecting...'}`;

            if (clientId === this.room.clientId) {
                playerInfo.style.fontWeight = 'bold';
                playerInfo.style.color = '#aaffaa';
                if (presenceData.money !== undefined) {
                    ownMoney = presenceData.money;
                    // Keep local player money synced if server state changes
                    if (this.player.money !== ownMoney) {
                        this.player.money = ownMoney;
                    }
                }
            } else {
                playerInfo.style.color = '#ffffff';
            }

            playerDetails.appendChild(playerInfo); // Add name to details container

            const playerMoney = document.createElement('div');
            playerMoney.className = 'player-money';
            const moneyValue = presenceData.money !== undefined ? presenceData.money : '?';
            playerMoney.textContent = `$${typeof moneyValue === 'number' ? moneyValue.toLocaleString('en-US', {maximumFractionDigits: 0}) : moneyValue}`;
            playerDetails.appendChild(playerMoney); // Add money to details container

            playerItem.appendChild(playerDetails); // Add details container to the item

             // --- Add Give Button ---
             if (clientId !== this.room.clientId) { // Don't add button for self
                const giveButton = document.createElement('button');
                giveButton.className = 'give-money-button';
                giveButton.textContent = 'Give';
                giveButton.dataset.recipientId = clientId;
                giveButton.dataset.recipientName = peer.username || 'Player';

                // Prevent click propagation to pointer lock
                 giveButton.addEventListener('mousedown', (e) => e.stopPropagation());
                 giveButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Stop event from bubbling up further
                    this.promptAndGiveMoney(giveButton.dataset.recipientId, giveButton.dataset.recipientName);
                 });

                playerItem.appendChild(giveButton); // Append button as direct child of playerItem
             } else {
                 // Optional: Add a placeholder or adjust spacing if needed for self-item alignment
                 const placeholder = document.createElement('div');
                 placeholder.style.width = '40px'; // Approx width of button
                 placeholder.style.flexShrink = '0';
                 playerItem.appendChild(placeholder);
             }


            this.playerList.appendChild(playerItem);
        }

        // Update the main currency display (ensure it's always up-to-date)
         const displayMoney = typeof ownMoney === 'number' ? ownMoney.toLocaleString('en-US', {maximumFractionDigits: 0}) : ownMoney;
         if (this.currencyDisplay.textContent !== `$${displayMoney}`) {
            this.currencyDisplay.textContent = `$${displayMoney}`;
         }
    }


    promptAndGiveMoney(recipientId, recipientName) {
        if (!recipientId || !recipientName) {
            console.error("Missing recipient information for giving money.");
            return;
        }

        const amountString = prompt(`How much money do you want to give to ${recipientName}? (Enter a number)`);
        if (amountString === null) {
            return; // User cancelled
        }

        const amount = parseFloat(amountString);

        if (isNaN(amount) || amount <= 0) {
            this.addChatMessage('Invalid amount entered.', 'system-error');
            return;
        }

        const currentMoney = parseFloat(this.player.money) || 0;
        if (amount > currentMoney) {
             this.addChatMessage("You don't have enough money to give that amount.", 'system-error');
             return;
        }

        // --- Deduct money locally first ---
        this.player.money = currentMoney - amount;
        this.room.updatePresence({ money: this.player.money });
        this.currencyDisplay.textContent = `$${this.player.money}`;
        this.updatePlayerList(); // Update list to reflect own changed money

        // --- Send request to the recipient ---
        this.room.requestPresenceUpdate(recipientId, {
            type: 'giveMoney',
            amount: amount
        });

         // --- Send an event for chat feedback (optional but good) ---
         this.room.send({
             type: 'moneySent',
             senderId: this.room.clientId,
             recipientId: recipientId,
             recipientUsername: recipientName,
             amount: amount,
             echo: false // Don't send back to self immediately, use local feedback
         });

         // Provide immediate feedback to the sender
         this.addChatMessage(`You sent a request to give $${amount.toLocaleString('en-US', {maximumFractionDigits: 0})} to ${recipientName}.`, 'system');


        console.log(`Requested to give $${amount} to ${recipientName} (${recipientId})`);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = performance.now();
        const delta = Math.min(0.1, (time - this.prevTime) / 1000); 
        this.prevTime = time;

        if (this.player.firstPersonArms) {
            this.player.firstPersonArms.group.visible = true;
        }

        if (this.controls.isLocked) {
             // ... (Player movement and animation updates) ...
             const prevPosition = this.controls.getObject().position.clone(); 

            this.player.velocity.y -= 9.8 * 2 * delta; 

            this.player.direction.set(0, 0, 0);
            if (this.moveForward) this.player.direction.z += 1;
            if (this.moveBackward) this.player.direction.z -= 1;
            if (this.moveLeft) this.player.direction.x -= 1;
            if (this.moveRight) this.player.direction.x += 1;

            if (this.player.direction.lengthSq() > 0) {
                this.player.direction.normalize();
            }

            let speed = 5.0; 
            if (this.sprint) speed = 8.0; 
            if (this.crouch) speed = 2.0; 

            this.player.velocity.x = this.player.direction.x * speed;
            this.player.velocity.z = this.player.direction.z * speed;

            this.controls.moveRight(this.player.velocity.x * delta);
            this.controls.moveForward(this.player.velocity.z * delta);

            this.controls.getObject().position.y += this.player.velocity.y * delta;

            const defaultHeight = 1.8; // Player height
            const springFactor = 0.1; // Leg spring factor
            this.player.legStretch += (this.player.targetLegStretch - this.player.legStretch) * springFactor;
            const currentTargetHeight = defaultHeight + (this.player.legStretch - 1) * 1.5; 

            if (this.controls.getObject().position.y < currentTargetHeight && !this.jump) {
                this.player.velocity.y = 0; 
                this.controls.getObject().position.y = currentTargetHeight; 
                this.player.onGround = true; 
            } else {
                 this.player.onGround = false; 
                 if (this.controls.getObject().position.y > 10 - 0.1) {
                    this.player.velocity.y = Math.min(0, this.player.velocity.y); 
                    this.controls.getObject().position.y = 10 - 0.1; 
                 }
            }
             if (this.jump && this.player.velocity.y <= 0) {
                this.jump = false;
            }

            this.player.armStretch += (this.player.targetArmStretch - this.player.armStretch) * springFactor;
            this.player.chompAmount += (this.player.targetChompAmount - this.player.chompAmount) * 0.2; 

            if (this.player.firstPersonArms) {
                const leftArm = this.player.firstPersonArms.left;
                const rightArm = this.player.firstPersonArms.right;
                const baseLeftPos = this.player.firstPersonArms.baseLeftPos;
                const baseRightPos = this.player.firstPersonArms.baseRightPos;

                const currentStretchScale = 1 + this.player.armStretch * 2;
                const currentStretchOffset = -this.player.armStretch * 0.8;

                const targetLeftScaleY = this.leftArmRaised ? currentStretchScale : 1;
                const targetLeftPosZ = this.leftArmRaised ? baseLeftPos.z + currentStretchOffset : baseLeftPos.z;
                leftArm.scale.y += (targetLeftScaleY - leftArm.scale.y) * 0.2; 
                leftArm.position.z += (targetLeftPosZ - leftArm.position.z) * 0.2; 

                const targetRightScaleY = this.rightArmRaised ? currentStretchScale : 1;
                const targetRightPosZ = this.rightArmRaised ? baseRightPos.z + currentStretchOffset : baseRightPos.z;
                rightArm.scale.y += (targetRightScaleY - rightArm.scale.y) * 0.2;
                rightArm.position.z += (targetRightPosZ - rightArm.position.z) * 0.2; 

                const raisedAngle = -Math.PI / 2.2; 
                const loweredAngle = Math.PI / 7;   
                const armSpringFactor = 0.15;      

                const targetLeftRotX = this.leftArmRaised ? raisedAngle : loweredAngle;
                leftArm.rotation.x += (targetLeftRotX - leftArm.rotation.x) * armSpringFactor; 

                const targetRightRotX = this.rightArmRaised ? raisedAngle : loweredAngle;
                rightArm.rotation.x += (targetRightRotX - rightArm.rotation.x) * armSpringFactor; 
            }

            if (this.player.chompAmount > 0.01) { 
                this.chompIndicator.style.display = 'block';
                const chompPercentage = Math.min(100, this.player.chompAmount * 100); 
                this.chompIndicatorFill.style.width = `${chompPercentage}%`; 
            } else {
                this.chompIndicator.style.display = 'none'; 
            }

            if (!this.lastPresenceUpdateTime || time - this.lastPresenceUpdateTime > 50) { 
                const position = this.controls.getObject().position;
                const quaternion = this.camera.quaternion; 

                this.room.updatePresence({
                    position: { x: position.x, y: position.y, z: position.z },
                    quaternion: { x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w },
                    leftArmRaised: this.leftArmRaised,
                    rightArmRaised: this.rightArmRaised,
                    armStretch: this.player.armStretch,
                    legStretch: this.player.legStretch,
                    chompAmount: this.player.chompAmount,
                });
                this.lastPresenceUpdateTime = time;
            }
        } else {
            // ... (Reset velocity when not locked) ...
             this.player.velocity.x = 0;
            this.player.velocity.z = 0;
            if (this.player.velocity.y < 0) {
                 this.player.velocity.y = 0;
             }
        }

        // --- Enhanced UI Occlusion Logic with special dancer handling ---
        const processOcclusion = (gameObjects) => {
            // Camera position is our raycast origin
            const cameraPosition = this.controls.getObject().position.clone();
            
            // First, find all dancer models in the scene for special handling
            const dancerModels = [];
            this.scene.traverse(object => {
                // Look for any object whose name might suggest it's a dancer
                if (object.name && 
                    (object.name.toLowerCase().includes('dancer') || 
                     object.name.toLowerCase().includes('diamond') && object.position.z > 0)) {
                    dancerModels.push(object);
                }
            });
            
            for (const gameId in gameObjects) {
                const game = gameObjects[gameId];
                if (!game || !game.model || !game.cssObject || !game.uiElement) continue;

                const gameGroup = game.model;
                const uiObject = game.cssObject;
                const uiElement = game.uiElement;
                
                // Get UI world position
                const uiWorldPosition = new THREE.Vector3();
                uiObject.getWorldPosition(uiWorldPosition);

                // Vector from camera to UI element
                const cameraToUI = uiWorldPosition.clone().sub(cameraPosition);
                const distanceToUI = cameraToUI.length();
                const directionToUI = cameraToUI.clone().normalize();
                
                // Set up raycaster from camera toward UI
                this.raycaster.set(cameraPosition, directionToUI);
                this.raycaster.near = 0.1;
                this.raycaster.far = distanceToUI + 0.1;

                // Get all occluders except the current game object
                const currentOccluders = this.occluderObjects.filter(obj => obj !== gameGroup);
                
                // Cast ray to check for intersections with regular objects
                const intersects = this.raycaster.intersectObjects(currentOccluders, true);
                
                // Check if any normal object is occluding
                let isOccluded = intersects.length > 0 && intersects[0].distance < distanceToUI;
                
                // SPECIAL DANCER HANDLING: Do direct line-of-sight tests with all dancer models
                if (!isOccluded && dancerModels.length > 0) {
                    // For each dancer model, check if it's between the camera and UI
                    for (const dancer of dancerModels) {
                        // Create a bounding sphere for the dancer model
                        const dancerBox = new THREE.Box3().setFromObject(dancer);
                        const dancerSphere = new THREE.Sphere();
                        dancerBox.getBoundingSphere(dancerSphere);
                        
                        // Distance from camera to dancer center
                        const distanceToDancer = cameraPosition.distanceTo(dancerSphere.center);
                        
                        // If dancer is closer than UI
                        if (distanceToDancer < distanceToUI) {
                            // Create a vector from camera to dancer center
                            const dirToDancer = dancerSphere.center.clone().sub(cameraPosition).normalize();
                            
                            // Calculate angle between the two vectors (UI direction vs dancer direction)
                            const angleBetween = directionToUI.angleTo(dirToDancer);
                            
                            // Calculate the apparent radius of the dancer at its distance
                            const apparentRadius = Math.atan(dancerSphere.radius / distanceToDancer);
                            
                            // If the angle between vectors is less than the apparent radius,
                            // the dancer is blocking the view to the UI
                            if (angleBetween < apparentRadius * 1.5) { // Using 1.5x radius for wider occlusion
                                isOccluded = true;
                                break;
                            }
                        }
                    }
                }
                
                // Set visual properties based on occlusion
                const targetOpacity = isOccluded ? 0 : 1;
                const targetPointerEvents = isOccluded ? 'none' : 'auto';

                // Apply changes with smooth transition
                const currentOpacity = parseFloat(uiElement.style.opacity) || 1;
                const newOpacity = currentOpacity + (targetOpacity - currentOpacity) * 0.3; // Fast transition
                uiElement.style.opacity = newOpacity.toFixed(2);

                // Update pointer events immediately
                if (uiElement.style.pointerEvents !== targetPointerEvents) {
                    uiElement.style.pointerEvents = targetPointerEvents;
                }
            }
        };

        processOcclusion(this.slotMachines);
        processOcclusion(this.minesGames);
        // --- End UI Occlusion Logic ---

        this.renderer.render(this.scene, this.camera);
        this.cssRenderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix(); 

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    addPlayerFaceToCamera() {
        const overlay = document.getElementById('crosshair');
        overlay.style.display = 'block'; 
        overlay.innerHTML = ''; 
    }

    updateFreeSpinsIndicator() {
        if (this.freeSpinsAvailable > 0) {
            this.freeSpinsIndicator.style.display = 'block';
            this.freeSpinsCount.textContent = this.freeSpinsAvailable;
        } else {
            this.freeSpinsIndicator.style.display = 'none';
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const game = new SocialSpace();
});