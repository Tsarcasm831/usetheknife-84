// Access the Howl constructor and Howler global object from the window
const Howl = window.Howl; 
const GlobalHowler = window.Howler; 

let tavernAmbience, fireplaceCrackle, luteMusic;

export function setupSounds() {
    // Check if Howl constructor is available globally
    if (!Howl) {
        console.error("Howl constructor not found globally (window.Howl). Cannot initialize sounds.");
        showAudioPrompt("Audio system error. Click to try enabling audio.");
        return;
    }
    // Also check if the global Howler object is available
    if (!GlobalHowler) {
        console.error("Global Howler object not found globally (window.Howler). Cannot initialize sounds fully.");
        showAudioPrompt("Audio system error. Click to try enabling audio.");
        return;
    }

    try {
        tavernAmbience = new Howl({
            src: ['https://freesound.org/data/previews/124/124886_33068-lq.mp3'],
            loop: true,
            volume: 0.5,
            html5: true // Often helps with browser compatibility/autoplay
        });

        fireplaceCrackle = new Howl({
            src: ['https://freesound.org/data/previews/17/17476_27343-lq.mp3'],
            loop: true,
            volume: 0.3,
            html5: true
        });

        luteMusic = new Howl({
            src: ['https://freesound.org/data/previews/382/382824_7089547-lq.mp3'],
            loop: true,
            volume: 0.2,
            html5: true
        });

    } catch (e) {
        console.error("Error initializing Howl sounds:", e);
        showAudioPrompt("Error initializing audio. Click to try again.");
        return;
    }

    window.addEventListener('game-started', () => {
        console.log("Attempting to play background sounds on game start...");
        resumeAudioContext(); // Attempt to resume context first
        try {
            // Use a small delay to ensure context might be resumed by user interaction trigger
            setTimeout(() => {
                if (GlobalHowler.ctx && GlobalHowler.ctx.state === 'running') {
                    if (tavernAmbience && !tavernAmbience.playing()) tavernAmbience.play();
                    if (fireplaceCrackle && !fireplaceCrackle.playing()) fireplaceCrackle.play();
                    if (luteMusic && !luteMusic.playing()) luteMusic.play();
                    hideAudioPrompt(); // Hide if successfully played
                } else {
                     console.warn("Audio context not running after attempt. Showing prompt.");
                     showAudioPrompt(); // Show prompt if context isn't running
                }
            }, 100); // Small delay
        } catch (e) {
            console.error("Error trying to play sounds:", e);
            showAudioPrompt();
        }
    });

    // Setup context state change listener using the global Howler object
    if (GlobalHowler.ctx) {
        GlobalHowler.ctx.onstatechange = () => {
            console.log("Audio context state changed:", GlobalHowler.ctx.state);
            if (GlobalHowler.ctx.state === 'running') {
                console.log("Audio context is running. Attempting to play sounds.");
                if (tavernAmbience && !tavernAmbience.playing()) tavernAmbience.play();
                if (fireplaceCrackle && !fireplaceCrackle.playing()) fireplaceCrackle.play();
                if (luteMusic && !luteMusic.playing()) luteMusic.play();
                hideAudioPrompt();
            } else if (GlobalHowler.ctx.state === 'suspended') {
                console.warn("Audio context suspended. Waiting for user interaction.");
                showAudioPrompt();
            }
        };
    } else {
        // Attempt to initialize Howler's context if not already done
        console.warn("Howler audio context not initialized yet. Setting volume to initialize.");
        GlobalHowler.volume(1.0); // This often triggers context creation
        if (GlobalHowler.ctx) {
            console.log("Howler context initialized after setting volume.");
            GlobalHowler.ctx.onstatechange = () => {
                 console.log("Audio context state changed:", GlobalHowler.ctx.state);
                 if (GlobalHowler.ctx.state === 'running') {
                     console.log("Audio context is running. Attempting to play sounds.");
                     if (tavernAmbience && !tavernAmbience.playing()) tavernAmbience.play();
                     if (fireplaceCrackle && !fireplaceCrackle.playing()) fireplaceCrackle.play();
                     if (luteMusic && !luteMusic.playing()) luteMusic.play();
                     hideAudioPrompt();
                 } else if (GlobalHowler.ctx.state === 'suspended') {
                     console.warn("Audio context suspended. Waiting for user interaction.");
                     showAudioPrompt();
                 }
             };
             // Check initial state after potential initialization
             if (GlobalHowler.ctx.state === 'suspended') {
                showAudioPrompt();
             }
        } else {
            console.error("Howler context failed to initialize even after setting volume.");
            showAudioPrompt("Audio failed to initialize. Click to try enabling audio.");
        }
    }

    // Initial check in case context is already suspended
    if (GlobalHowler.ctx && GlobalHowler.ctx.state === 'suspended') {
        showAudioPrompt();
    }
}

export function resumeAudioContext() {
    if (!GlobalHowler || !GlobalHowler.ctx) {
        console.warn("Attempting to resume audio, but Howler context does not exist.");
        // Try initializing by setting volume
        if (GlobalHowler) {
            GlobalHowler.volume(1.0);
        } else {
             showAudioPrompt("Audio system unavailable. Click to try enabling audio.");
             return;
        }
        // If context still doesn't exist, show prompt
        if (!GlobalHowler.ctx) {
             showAudioPrompt("Audio context failed to initialize. Click to try enabling audio.");
             return;
        }
    }

    // Now attempt resume if context exists and is not running
    if (GlobalHowler.ctx.state !== 'running') {
        console.log("Attempting to resume audio context...");
        GlobalHowler.ctx.resume().then(() => {
            console.log("Audio context resumed successfully.");
            // Try playing sounds immediately after successful resume
            if (tavernAmbience && !tavernAmbience.playing()) tavernAmbience.play();
            if (fireplaceCrackle && !fireplaceCrackle.playing()) fireplaceCrackle.play();
            if (luteMusic && !luteMusic.playing()) luteMusic.play();
            hideAudioPrompt();
        }).catch(e => {
            console.error("Error resuming audio context:", e);
            // Don't show prompt again here if resume fails, it might be shown by state change
        });
    } else {
        // If already running, ensure prompt is hidden
        hideAudioPrompt();
    }
}

function showAudioPrompt(message = 'Click here to enable audio') {
    let prompt = document.getElementById('audio-prompt');
    // Ensure the prompt exists in the DOM (it's added in index.html now)
    if (!prompt) {
        console.error("Audio prompt element not found in DOM!");
        return;
    }
    prompt.textContent = message;
    prompt.style.display = 'block'; // Make it visible
    // Add click listener if it doesn't exist (or re-add to be safe)
    prompt.onclick = () => {
        resumeAudioContext();
    };
}

function hideAudioPrompt() {
    const prompt = document.getElementById('audio-prompt');
    if (prompt) {
        prompt.style.display = 'none'; // Hide it
    }
}