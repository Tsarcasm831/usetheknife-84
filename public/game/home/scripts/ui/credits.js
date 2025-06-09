/**
 * Creates and manages the Credits button and modal popup.
 */

// Ensure global bgAudio and track name function are defined
if (typeof window.bgAudio === 'undefined') {
    window.bgAudio = document.getElementById('bgAudio') || new Audio();
}
if (typeof window.getCurrentTrackName !== 'function') {
    window.getCurrentTrackName = function() { return ''; };
}

let creditsButton = null;
let modalContainer = null;
let modalBackground = null;
let modalContent = null;
let closeModalButton = null;

/**
 * Initializes the credits UI elements.
 * @param {HTMLElement} parentElement - The HTML element to append the UI to.
 */
export function initCredits(parentElement) {
    if (creditsButton) return; // Already initialized

    // --- Background Music Controls ---
    const bgmContainer = document.createElement('div');
    bgmContainer.id = 'bgm-control-container';
    // Now Playing label
    const nowPlaying = document.createElement('span');
    nowPlaying.id = 'now-playing';
    nowPlaying.textContent = 'Now Playing: ' + (typeof window.getCurrentTrackName === 'function' ? window.getCurrentTrackName() : '');
    // Prev, Play/Pause, Next buttons
    const prevBtn = document.createElement('button');
    prevBtn.id = 'bgm-prev-button';
    prevBtn.textContent = '⏮';
    const playBtn = document.createElement('button');
    playBtn.id = 'bgm-play-button';
    playBtn.textContent = window.bgAudio && window.bgAudio.paused ? '▶️' : '⏸️';
    const nextBtn = document.createElement('button');
    nextBtn.id = 'bgm-next-button';
    nextBtn.textContent = '⏭';
    // Append controls
    bgmContainer.append(nowPlaying, prevBtn, playBtn, nextBtn);
    parentElement.appendChild(bgmContainer);
    // UI update helper
    function updateBgmUI() {
        playBtn.textContent = window.bgAudio && window.bgAudio.paused ? '▶️' : '⏸️';
        nowPlaying.textContent = 'Now Playing: ' + (typeof window.getCurrentTrackName === 'function' ? window.getCurrentTrackName() : '');
    }
    // Wire up buttons
    prevBtn.addEventListener('click', () => { window.prevTrack(); updateBgmUI(); });
    playBtn.addEventListener('click', () => { window.togglePlay(); updateBgmUI(); });
    nextBtn.addEventListener('click', () => { window.nextTrack(); updateBgmUI(); });

    // --- Create Button ---
    creditsButton = document.createElement('button');
    creditsButton.id = 'credits-button';
    creditsButton.textContent = 'Credits';
    creditsButton.addEventListener('click', showCreditsModal);
    parentElement.appendChild(creditsButton);

    // --- Create Modal Structure (initially hidden) ---
    modalContainer = document.createElement('div');
    modalContainer.id = 'credits-modal-container';
    modalContainer.style.display = 'none'; // Start hidden

    modalBackground = document.createElement('div');
    modalBackground.id = 'credits-modal-background';
    modalBackground.addEventListener('click', hideCreditsModal); // Close on background click
    modalContainer.appendChild(modalBackground);

    modalContent = document.createElement('div');
    modalContent.id = 'credits-modal-content';
    modalContainer.appendChild(modalContent);

    // --- Populate Modal Content ---
    const title = document.createElement('h2');
    title.textContent = 'Credits';
    modalContent.appendChild(title);

    const description = document.createElement('p');
    description.textContent = 'This is a framework of a 3D Diablo-Style Isometric RPG I am building for a longer term project. Feel free to fork or modify.';
    modalContent.appendChild(description);

    const creatorLabel = document.createElement('p');
    creatorLabel.innerHTML = '<strong>Creator:</strong> Lord Tsarcasm';
    modalContent.appendChild(creatorLabel);

    const toolsLabel = document.createElement('p');
    toolsLabel.innerHTML = '<strong>Tools Used:</strong>';
    modalContent.appendChild(toolsLabel);

    const toolsList = document.createElement('ul');
    const tools = ['Meshy', 'ChatGPT', 'Deepseek', 'Ollama', 'Grok', 'Gemini'];
    tools.forEach(tool => {
        const li = document.createElement('li');
        li.textContent = tool;
        toolsList.appendChild(li);
    });
    modalContent.appendChild(toolsList);

    // --- Close Button ---
    closeModalButton = document.createElement('button');
    closeModalButton.id = 'credits-modal-close';
    closeModalButton.textContent = 'Close';
    closeModalButton.addEventListener('click', hideCreditsModal);
    modalContent.appendChild(closeModalButton);

    // --- Append Modal to Parent ---
    parentElement.appendChild(modalContainer);

    console.log("Credits UI Initialized.");
}

/**
 * Shows the credits modal.
 */
function showCreditsModal() {
    if (modalContainer) {
        modalContainer.style.display = 'flex'; // Use flex to center content
    }
}

/**
 * Hides the credits modal.
 */
function hideCreditsModal() {
    if (modalContainer) {
        modalContainer.style.display = 'none';
    }
}