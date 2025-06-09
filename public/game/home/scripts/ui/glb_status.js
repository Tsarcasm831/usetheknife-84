/**
 * Creates and manages the GLB loading status UI.
 * Now supports showing progress for ALL animation GLBs, not just idle models.
 */

let statusContainer = null;
let progressBar = null;
let statusText = null;
let startButton = null;
let onStartCallback = null;
let bgAudio = null;
let statusList = null;

// Track last shown progress and message to avoid flashing
let lastStatus = { progress: null, message: null, loadedShown: false };

// Build-time unused assets filter (reads unused_list.txt served at root)
const unusedAssetsPromise = fetch('/unused_list.txt')
  .then(res => res.ok ? res.text() : '')
  .then(text => text.split('\n').map(l => l.trim()).filter(Boolean))
  .then(lines => new Set(lines.map(l => l.split(/[/\\]/).pop())));

/**
 * Initializes the status UI elements.
 * @param {HTMLElement} parentElement - The HTML element to append the UI to.
 */
export function initStatusUI(parentElement) {
    if (statusContainer) return; // Already initialized

    // Initialize background audio for loading screen
    bgAudio = new Audio("assets/sounds/Shadow's Whisper.mp3");
    bgAudio.loop = true;
    bgAudio.volume = 1.0;

    statusContainer = document.createElement('div');
    statusContainer.id = 'glb-status-container';

    const progressBarContainer = document.createElement('div');
    progressBarContainer.id = 'glb-progress-bar-container';

    progressBar = document.createElement('div');
    progressBar.id = 'glb-progress-bar';

    statusText = document.createElement('div');
    statusText.id = 'glb-status-text';
    statusText.textContent = 'Initializing...';

    progressBarContainer.appendChild(progressBar);
    statusContainer.appendChild(progressBarContainer);
    statusContainer.appendChild(statusText);

    // add file list UI
    statusList = document.createElement('ul');
    statusList.id = 'glb-status-list';
    statusContainer.appendChild(statusList);

    parentElement.appendChild(statusContainer);

    // Start hidden
    statusContainer.style.display = 'none';

    // Create Start Game button
    startButton = document.createElement('button');
    startButton.id = 'start-button';
    startButton.textContent = 'Start Game';
    startButton.disabled = true;
    statusContainer.appendChild(startButton);
    startButton.addEventListener('click', async () => {
        // Fade out background audio then start game (loading screen)
        if (bgAudio) {
            await fadeOutAudio(1000);
        }
        if (onStartCallback) onStartCallback();
    });

    console.log("GLB Status UI Initialized.");
}

/**
 * Updates the progress bar and text.
 * Progress should be based on the total number of GLB animation assets, not just idle models.
 * @param {number} progress - A value between 0 and 1.
 * @param {string} message - The text to display.
 */
export function updateStatus(progress, message) {
    if (!statusContainer || !progressBar || !statusText) {
        console.warn("Attempted to update GLB status UI before initialization.");
        return;
    }
    const percentage = Math.max(0, Math.min(100, Math.round(progress * 100)));
    progressBar.style.width = `${percentage}%`;

    // Only show 'Loaded!' or similar once, and don't revert to 'loading' after complete
    if (progress >= 1) {
        if (!lastStatus.loadedShown) {
            statusText.textContent = 'Loaded!';
            lastStatus.loadedShown = true;
        }
    } else {
        // Only update if message or progress changed
        if (lastStatus.progress !== progress || lastStatus.message !== message) {
            statusText.textContent = message;
            lastStatus.loadedShown = false;
        }
    }
    lastStatus.progress = progress;
    lastStatus.message = message;

    // Enable start button when loading complete
    if (progress >= 1 && startButton && startButton.disabled) {
        startButton.disabled = false;
        startButton.classList.add('ready');
    }
}

/**
 * Makes the status UI visible.
 */
export function showStatus() {
    if (statusContainer) {
        statusContainer.style.display = 'block';
        // Enter loading state: add class to body
        document.body.classList.add('loading');
        console.log("GLB Status UI Shown.");
        // Play background audio on loading screen
        if (bgAudio) {
            bgAudio.play().catch(err => console.warn('Audio play failed:', err));
        }
    }
}

/**
 * Hides the status UI.
 */
export function hideStatus() {
    if (statusContainer) {
        statusContainer.style.display = 'none';
        // Exit loading state: remove class from body
        document.body.classList.remove('loading');
        console.log("GLB Status UI Hidden.");
    }
}

/**
 * Register callback when Start Game is clicked.
 * @param {function} callback
 */
export function onStartGame(callback) {
    onStartCallback = callback;
}

// Add static building assets to status tracker
export const STATIC_BUILDING_ASSETS = [
    '/assets/static/fdg_building.glb',
    '/assets/static/Spyders_Workshop.glb'
];

// Utility to track loading of multiple GLB assets and update the status UI
// Usage: trackGLBAssetsLoading(loader, [url1, url2, ...], (assets) => { ... });
export async function trackGLBAssetsLoading(loader, assetUrls, onAllLoaded) {
    if (!assetUrls || assetUrls.length === 0) {
        updateStatus(1, 'No assets to load');
        if (onAllLoaded) onAllLoaded([]);
        return;
    }

    const unusedBase = await unusedAssetsPromise;
    assetUrls = assetUrls.filter(url => !unusedBase.has(url.split('/').pop()));
    if (!assetUrls || assetUrls.length === 0) {
        updateStatus(1, 'No assets to load');
        if (onAllLoaded) onAllLoaded([]);
        return;
    }
    showStatus();

    // initialize file list
    if (statusList) {
        statusList.innerHTML = '';
        assetUrls.forEach((url, idx) => {
            const li = document.createElement('li');
            li.id = `glb-status-item-${idx}`;
            const filename = url.split('/').pop();
            
            // Highlight fauna models for easier tracking
            const isFaunaModel = url.includes('/fauna/') || 
                               filename.includes('rad_bear') || 
                               filename.includes('radcow') || 
                               filename.includes('rad_chicken') || 
                               filename.includes('undead_fox');
            
            if (isFaunaModel) {
                li.innerHTML = `<span class="fauna-model">${filename}</span>`;
                li.classList.add('fauna-item');
            } else {
                li.textContent = filename;
            }
            
            statusList.appendChild(li);
        });
        
        // Add style for fauna items if not already in the document
        if (!document.getElementById('fauna-style')) {
            const style = document.createElement('style');
            style.id = 'fauna-style';
            style.textContent = `
                .fauna-item { background-color: rgba(50, 150, 50, 0.2); }
                .fauna-model { color: #2ecc71; font-weight: bold; }
                .fauna-item.loaded { background-color: rgba(50, 150, 50, 0.4); }
            `;
            document.head.appendChild(style);
        }
    }

    let loadedCount = 0;
    const loadedAssets = [];
    assetUrls.forEach((url, idx) => {
        loader.load(
            url,
            (gltf) => {
                loadedCount++;
                loadedAssets[idx] = gltf;
                // mark file loaded
                const item = document.getElementById(`glb-status-item-${idx}`);
                if (item) item.classList.add('loaded');
                updateStatus(loadedCount / assetUrls.length, `Loading assets... (${loadedCount}/${assetUrls.length})`);
                if (loadedCount === assetUrls.length) {
                    updateStatus(1, 'All assets loaded!');
                    if (onAllLoaded) onAllLoaded(loadedAssets);
                }
            },
            (xhr) => {
                // Optionally, update progress per asset here
                // Could combine xhr.loaded/xhr.total per asset if needed
            },
            (error) => {
                loadedCount++;
                loadedAssets[idx] = null;
                // mark file error
                const itemErr = document.getElementById(`glb-status-item-${idx}`);
                if (itemErr) itemErr.classList.add('error');
                updateStatus(loadedCount / assetUrls.length, `Error loading: ${url}`);
                if (loadedCount === assetUrls.length) {
                    updateStatus(1, 'All assets loaded (with errors)');
                    if (onAllLoaded) onAllLoaded(loadedAssets);
                }
            }
        );
    });
}

// Fade out background audio over given duration (ms)
function fadeOutAudio(duration = 1000) {
    if (!bgAudio) return Promise.resolve();
    const step = 50;
    const steps = duration / step;
    const volStep = bgAudio.volume / steps;
    return new Promise(resolve => {
        const fade = setInterval(() => {
            if (bgAudio.volume > volStep) {
                bgAudio.volume = Math.max(0, bgAudio.volume - volStep);
            } else {
                bgAudio.volume = 0;
                bgAudio.pause();
                bgAudio.currentTime = 0;
                clearInterval(fade);
                resolve();
            }
        }, step);
    });
}