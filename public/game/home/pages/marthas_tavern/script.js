import { initScene, animate, setFireUpdateFunction } from './scene.js';
import { createTavernStructure } from './tavern.js';
import { createNPCs, initializeInteractionSystem } from './characters.js';
import { setupUI } from './ui.js';
import { setupSounds } from './sound.js';
import { setupCollision } from './collision.js';

let gameInitialized = false;

function initializeGame() {
    if (gameInitialized) return;
    gameInitialized = true;
    console.log("Initializing game systems...");

    // Initialize core systems
    const scene = initScene();
    // Get both fire update function and chair data
    const { updateFireFn, chairData } = createTavernStructure();
    setFireUpdateFunction(updateFireFn);
    // Pass chair data to NPC creation
    createNPCs(chairData);

    setupCollision(scene);

    setupSounds();
    setupUI();
    initializeInteractionSystem();

    console.log("Game systems initialized.");

    // Hide loading screen and show start button
    const loadingText = document.querySelector('.loading-text');
    const progressBar = document.querySelector('.progress-bar');
    const startButton = document.getElementById('start-button');

    // Simulate loading progress
    progressBar.style.width = '100%';
    loadingText.textContent = "Ready to enter.";
    startButton.classList.remove('hidden');

    // Attach event listener to the start button
    startButton.addEventListener('click', startGame);

    // Start the animation loop immediately after init, even before clicking "Start"
    // to ensure the scene is rendered. Movement/interaction are disabled until Start.
    animate();
}

function startGame() {
    console.log("Starting game...");
    // Hide loading screen completely
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.pointerEvents = 'none'; // Prevent interaction

        // Use a timeout to ensure the transition completes before removing
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.remove();
            }
        }, 1000); // Match CSS transition duration
    }

    // Signal that the game has *actually* started for sounds etc.
    window.dispatchEvent(new CustomEvent('game-started'));

    // Movement is enabled in scene.js via the 'game-started' event.
    // Pointer lock is requested via click on the canvas in scene.js.
    console.log("Game started. Click on the scene to look around.");
}

// Exit Tavern button listener
const exitBtn = document.getElementById('exit-button');
if (exitBtn) {
    exitBtn.addEventListener('click', () => window.parent.postMessage('exitTavern', '*'));
}

// Start the initialization process when the script loads
initializeGame();