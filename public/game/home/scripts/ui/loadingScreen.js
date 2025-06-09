/*
 * Creates and manages the GLB loading status UI.
 */

let statusContainer = null;
let progressBar = null;
let statusText = null;
let startButton = null;
let onStartCallback = null;
let loadingVideo = null;
let videoPlayed = false;
let isVideoReady = false;

/**
 * Initializes the loading screen UI elements.
 * @param {HTMLElement} parentElement - The HTML element to append the UI to.
 */
export function initStatusUI(parentElement) {
    if (statusContainer) return;

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

    parentElement.appendChild(statusContainer);
    statusContainer.style.display = 'none';

    startButton = document.createElement('button');
    startButton.id = 'start-button';
    startButton.textContent = 'Start Game';
    startButton.disabled = true;
    // Hide start-button until loading completes
    startButton.style.display = 'none';
    statusContainer.appendChild(startButton);
    startButton.addEventListener('click', async () => {
        if (onStartCallback) onStartCallback();
    });

    // Get the pre-created video element
    loadingVideo = document.getElementById('menu-video');
    loadingVideo.id = 'loading-video'; // Change ID for styling
    loadingVideo.loop = true;
    loadingVideo.autoplay = true;
    loadingVideo.style.display = 'block';
    loadingVideo.style.position = 'fixed';
    loadingVideo.style.top = '0';
    loadingVideo.style.left = '0';
    loadingVideo.style.width = '100%';
    loadingVideo.style.height = '100%';
    loadingVideo.style.objectFit = 'cover';
    loadingVideo.style.zIndex = '-1';
    loadingVideo.style.opacity = '0';
    loadingVideo.style.transition = 'opacity 1s ease-in';
    
    // When video can play, start it
    const startVideoPlayback = () => {
        loadingVideo.play().then(() => {
            isVideoReady = true;
            loadingVideo.style.opacity = '1';
            console.log('Menu video started playing');
        }).catch(err => {
            console.warn('Autoplay failed, will try again after user interaction:', err);
        });
    };
    
    // If video is already loaded, start it immediately
    if (loadingVideo.readyState >= 3) {
        startVideoPlayback();
    } else {
        // Otherwise wait for it to load
        loadingVideo.oncanplay = startVideoPlayback;
    }
    
    // If autoplay was blocked, try again on first user interaction
    const handleFirstInteraction = () => {
        if (!isVideoReady && loadingVideo.paused) {
            loadingVideo.play().then(() => {
                isVideoReady = true;
                loadingVideo.style.opacity = '1';
                console.log('Menu video started after user interaction');
            }).catch(console.warn);
        }
    };
    
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });

    console.log("Loading Screen UI Initialized.");
}

/**
 * Updates the progress bar and text.
 * @param {number} progress - A value between 0 and 1.
 * @param {string} message - The text to display.
 */
export function updateStatus(progress, message) {
    if (!statusContainer || !progressBar || !statusText) {
        console.warn("Attempted to update loading UI before initialization.");
        return;
    }
    const percentage = Math.max(0, Math.min(100, Math.round(progress * 100)));
    progressBar.style.width = `${percentage}%`;
    statusText.textContent = message;

    if (progress >= 1 && startButton && startButton.disabled) {
        startButton.disabled = false;
        startButton.classList.add('ready');
        // Show button once ready
        startButton.style.display = 'block';
    }
}

/**
 * Makes the loading screen UI visible.
 */
export function showStatus() {
    if (statusContainer) {
        statusContainer.style.display = 'block';
        document.body.classList.add('loading');
        
        // Show and play the video if not already playing
        if (loadingVideo && !videoPlayed) {
            loadingVideo.classList.add('playing');
            if (loadingVideo.paused) {
                loadingVideo.play().then(() => {
                    loadingVideo.classList.add('playing');
                }).catch(err => {
                    console.warn('Video play failed:', err);
                    // Try again on next user interaction
                    const playOnInteraction = () => {
                        loadingVideo.play()
                            .then(() => loadingVideo.classList.add('playing'))
                            .catch(console.warn);
                        document.removeEventListener('click', playOnInteraction);
                        document.removeEventListener('keydown', playOnInteraction);
                    };
                    document.addEventListener('click', playOnInteraction, { once: true });
                    document.addEventListener('keydown', playOnInteraction, { once: true });
                });
            }
            videoPlayed = true;
        }
        console.log("Loading Screen UI Shown.");
    }
}

/**
 * Hides the loading screen UI.
 */
export function hideStatus() {
    if (statusContainer) {
        statusContainer.style.display = 'none';
        document.body.classList.remove('loading');
        // Pause background video
        if (loadingVideo) loadingVideo.pause();
        console.log("Loading Screen UI Hidden.");
    }
}

/**
 * Register callback when Start Game is clicked.
 * @param {function} callback
 */
export function onStartGame(callback) {
    onStartCallback = callback;
}
