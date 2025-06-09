const numStrings = 6;
const samples = 200;
const waveSpeed = 1.0;
const damping = 0.98;
const numFrets = 20;                        // number of frets on the neck
const effectiveFretboardRatio = 1.0;        // ratio of fretboard length (for pitch bend)
const maxPitchMultiplier = 2.0;             // max pitch multiplier at the nut
const stringThickness = Array(numStrings).fill(2);

// --- Keyboard control mappings and last pointer tracking ---
let keyBindings = {};
let lastPointerX = window.innerWidth / 2;

function loadKeyBindings() {
  const stored = localStorage.getItem('keyBindings');
  if (stored) {
    try { keyBindings = JSON.parse(stored); }
    catch { keyBindings = { KeyQ:0, KeyW:1, KeyE:2, KeyR:3, KeyT:4, KeyY:5 }; }
  } else {
    keyBindings = { KeyQ:0, KeyW:1, KeyE:2, KeyR:3, KeyT:4, KeyY:5 };
  }
}
function saveKeyBindings() {
  localStorage.setItem('keyBindings', JSON.stringify(keyBindings));
}

const displacements = [];
const velocities = [];
let baselines = [];
const tuningAdjustments = Array(numStrings).fill(1.0);

const tuningControlElements = [];
const stringAudioBuffers = Array(numStrings).fill(null);
let globalAudioBuffer = null;

const activeDrags = {};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let stringBuffer = null; 
let inputGainNode = null; 
let distortionNode = null; 
let distortionAmount = 0; 
let bassFilter = null;
let midFilter = null;   
let trebleFilter = null;
let reverbNode = null;  
let reverbDryGain = null; 
let reverbWetGain = null; 
let volumeNode = null; 
let limiterNode = null;  
let chorusDelayNode, chorusWetGainNode, delayNode, delayWetGainNode;
let overdriveNode, boostNode;
let overdriveAmount = 0;
let boostAmount     = 100;

const MAX_FILTER_GAIN = 40; 

function makeDistortionCurve(amount) {
  const k = typeof amount === 'number' ? amount : 0;
  const n_samples = 44100; 
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  let i = 0;
  let x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  if (k > 0) {
     curve[0] = curve[0] * (1 + k/100);
     curve[n_samples-1] = curve[n_samples-1] * (1 + k/100);
  }
  return curve;
};

function makeOverdriveCurve(amount) {
  const n = audioCtx.sampleRate;
  const curve = new Float32Array(n);
  const drive = 1 + amount / 20;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = Math.tanh(x * drive);
  }
  return curve;
}

function setupAudioNodes() {
    inputGainNode = audioCtx.createGain();
    const initialInputGainPercent = parseFloat(document.getElementById('gain-value-input').value); 
    inputGainNode.gain.value = initialInputGainPercent / 100; 

    overdriveNode = audioCtx.createWaveShaper();
    overdriveAmount = parseFloat(document.getElementById('overdrive-value-input').value);
    overdriveNode.curve = makeOverdriveCurve(overdriveAmount);
    overdriveNode.oversample = '4x';

    distortionNode = audioCtx.createWaveShaper();
    distortionAmount = parseFloat(document.getElementById('distortion-value-input').value); 
    distortionNode.curve = makeDistortionCurve(distortionAmount);
    distortionNode.oversample = '4x'; 

    boostNode = audioCtx.createGain();
    boostAmount = parseFloat(document.getElementById('boost-value-input').value);
    boostNode.gain.value = boostAmount / 100;

    bassFilter = audioCtx.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 250; 
    bassFilter.gain.value = parseFloat(document.getElementById('bass-value-input').value); 

    midFilter = audioCtx.createBiquadFilter();
    midFilter.type = 'peaking';
    midFilter.frequency.value = 1000; 
    midFilter.Q.value = 1; 
    midFilter.gain.value = parseFloat(document.getElementById('mid-value-input').value); 

    trebleFilter = audioCtx.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 4000; 
    trebleFilter.gain.value = parseFloat(document.getElementById('treble-value-input').value); 

    reverbNode = audioCtx.createConvolver();
    
    reverbDryGain = audioCtx.createGain();
    reverbWetGain = audioCtx.createGain();
    const initialReverbPercent = parseFloat(document.getElementById('reverb-value-input').value); 
    const initialReverbMix = initialReverbPercent / 100;
    reverbDryGain.gain.value = Math.cos(initialReverbMix * 0.5 * Math.PI); 
    reverbWetGain.gain.value = Math.cos((1.0 - initialReverbMix) * 0.5 * Math.PI); 

    volumeNode = audioCtx.createGain();
    const initialVolumePercent = parseFloat(document.getElementById('volume-value-input').value); 
    volumeNode.gain.value = initialVolumePercent / 100; 

    limiterNode = audioCtx.createDynamicsCompressor();
    limiterNode.threshold.value = parseFloat(document.getElementById('limiter-value-input').value); 
    limiterNode.knee.value = 0; 
    limiterNode.ratio.value = 20; 
    limiterNode.attack.value = 0.003; 
    limiterNode.release.value = 0.05; 

    inputGainNode.connect(overdriveNode);
    overdriveNode.connect(distortionNode);
    distortionNode.connect(boostNode);
    boostNode.connect(bassFilter);
    bassFilter.connect(midFilter);
    midFilter.connect(trebleFilter);

    trebleFilter.connect(reverbDryGain); 
    trebleFilter.connect(reverbWetGain);   
    reverbWetGain.connect(reverbNode);   

    reverbDryGain.connect(volumeNode); 
    reverbNode.connect(volumeNode);    

    volumeNode.connect(limiterNode); 
    limiterNode.connect(audioCtx.destination); 

    chorusDelayNode = audioCtx.createDelay(0.05);
    chorusDelayNode.delayTime.value = 0.03;
    const chorusLFO = audioCtx.createOscillator();
    const chorusLFOGain = audioCtx.createGain();
    chorusLFO.frequency.value = 1.5;
    chorusLFOGain.gain.value = 0.015;
    chorusLFO.connect(chorusLFOGain);
    chorusLFOGain.connect(chorusDelayNode.delayTime);
    chorusLFO.start();
    chorusWetGainNode = audioCtx.createGain();
    chorusWetGainNode.gain.value = parseFloat(document.getElementById('chorus-value-input').value) / 100;
    limiterNode.connect(chorusDelayNode);
    chorusDelayNode.connect(chorusWetGainNode);
    chorusWetGainNode.connect(audioCtx.destination);

    delayNode = audioCtx.createDelay(5.0);
    delayNode.delayTime.value = 0.25;
    delayWetGainNode = audioCtx.createGain();
    delayWetGainNode.gain.value = parseFloat(document.getElementById('delay-value-input').value) / 100;
    limiterNode.connect(delayNode);
    delayNode.connect(delayWetGainNode);
    delayWetGainNode.connect(audioCtx.destination);

    setupDialInteraction(document.getElementById('distortion-dial'), document.getElementById('distortion-value-input'), updateDistortion);
    setupDialInteraction(document.getElementById('treble-dial'), document.getElementById('treble-value-input'), updateTreble);
    setupDialInteraction(document.getElementById('bass-dial'), document.getElementById('bass-value-input'), updateBass);
    setupDialInteraction(document.getElementById('volume-dial'), document.getElementById('volume-value-input'), updateVolume);
    setupDialInteraction(document.getElementById('limiter-dial'), document.getElementById('limiter-value-input'), updateLimiter);
    setupDialInteraction(document.getElementById('gain-dial'), document.getElementById('gain-value-input'), updateGain);
    setupDialInteraction(document.getElementById('mid-dial'), document.getElementById('mid-value-input'), updateMid);
    setupDialInteraction(document.getElementById('reverb-dial'), document.getElementById('reverb-value-input'), updateReverb);
    setupDialInteraction(document.getElementById('chorus-dial'), document.getElementById('chorus-value-input'), updateChorus);
    setupDialInteraction(document.getElementById('delay-dial'), document.getElementById('delay-value-input'), updateDelay);
    setupDialInteraction(document.getElementById('overdrive-dial'), document.getElementById('overdrive-value-input'), updateOverdrive);
    setupDialInteraction(document.getElementById('boost-dial'), document.getElementById('boost-value-input'), updateBoost);
}

function updateDistortion(value) {
    distortionAmount = value;
    if (distortionNode) {
        distortionNode.curve = makeDistortionCurve(distortionAmount);
    }
}

function updateTreble(value) {
    if (trebleFilter) {
        trebleFilter.gain.value = value;
    }
}

function updateBass(value) {
    if (bassFilter) {
        bassFilter.gain.value = value;
    }
}

function updateVolume(value) { 
    if (volumeNode) {
        volumeNode.gain.value = value / 100; 
    }
}

function updateLimiter(value) {
    if (limiterNode) {
        limiterNode.threshold.value = value;
    }
}

function updateGain(value) { 
    if (inputGainNode) {
        inputGainNode.gain.value = value / 100; 
    }
}

function updateMid(value) {
    if (midFilter) {
        midFilter.gain.value = value;
    }
}

function updateReverb(value) { 
    if (reverbDryGain && reverbWetGain) {
        const mixValue = value / 100; 
        reverbDryGain.gain.value = Math.cos(mixValue * 0.5 * Math.PI);
        reverbWetGain.gain.value = Math.cos((1.0 - mixValue) * 0.5 * Math.PI);
    }
}

function updateChorus(value) {
    if (chorusWetGainNode) chorusWetGainNode.gain.value = value / 100;
}

function updateDelay(value) {
    if (delayWetGainNode)  delayWetGainNode.gain.value = value / 100;
}

function updateOverdrive(value) {
  overdriveAmount = value;
  if (overdriveNode) overdriveNode.curve = makeOverdriveCurve(overdriveAmount);
}
function updateBoost(value) {
  boostAmount = value;
  if (boostNode) boostNode.gain.value = boostAmount / 100;
}

function generateKSBuffer(frequency, duration = 2.5, decay = 0.996) {
  const sampleRate = audioCtx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  const N = Math.floor(sampleRate / frequency);
  const ring = new Float32Array(N);
  // initialize ring buffer with noise
  for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
  let ptr = 0;
  // fill output & update ring buffer with simple averaging decay
  for (let i = 0; i < length; i++) {
    data[i] = ring[ptr];
    const next = (ptr + 1) % N;
    ring[ptr] = decay * 0.5 * (ring[ptr] + ring[next]);
    ptr = next;
  }
  return buffer;
}

function setupArrays() {
  displacements.length = velocities.length = 0;
  for (let s = 0; s < numStrings; s++) {
    displacements[s] = new Float32Array(samples);
    velocities[s] = new Float32Array(samples);
  }
}

function drawFrets(neckWidth, neckHeight) {
    const fretsGroup = document.getElementById('frets');
    const fretMarkersGroup = document.getElementById('fret-markers');
    fretsGroup.innerHTML = '';
    fretMarkersGroup.innerHTML = '';

    const fretboardLengthRatio = 1.0;
    const nutWidth = neckWidth * 0.015;
    const fretWidth = neckWidth * 0.005;
    const fretColor = 'url(#fretShine)';
    const markerRadius = neckHeight * 0.05;
    const markerFill = 'rgba(200, 200, 200, 0.5)';

    const nut = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    nut.setAttribute('x', 0);
    nut.setAttribute('y', 0);
    nut.setAttribute('width', nutWidth);
    nut.setAttribute('height', neckHeight);
    nut.setAttribute('fill', '#DDDDDD');
    nut.setAttribute('stroke', '#888');
    nut.setAttribute('stroke-width', '0.5');
    fretsGroup.appendChild(nut);

    const usableNeckWidth = neckWidth * fretboardLengthRatio - nutWidth;
    const fretSpacing = usableNeckWidth / (numFrets + 1);
    const standardMarkerFrets = [3, 5, 7, 9];

    for (let i = 1; i <= numFrets; i++) {
        const fretPosition = nutWidth + (i * fretSpacing) - (fretWidth / 2);

        if (fretPosition + fretWidth < neckWidth) {
             const fret = document.createElementNS("http://www.w3.org/2000/svg", "rect");
             fret.setAttribute('x', fretPosition);
             fret.setAttribute('y', 0);
             fret.setAttribute('width', fretWidth);
             fret.setAttribute('height', neckHeight);
             fret.setAttribute('fill', fretColor);
             fretsGroup.appendChild(fret);

             if (standardMarkerFrets.includes(i)) {
                 const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                 marker.setAttribute('cx', fretPosition + fretSpacing / 2);
                 marker.setAttribute('cy', neckHeight / 2);
                 marker.setAttribute('r', markerRadius);
                 marker.setAttribute('fill', markerFill);
                 fretMarkersGroup.appendChild(marker);
             }
        }
    }
}

function positionTuningControls() {
  const controlsContainer = document.getElementById('controls-container');
  const uploadControlsDiv = controlsContainer.querySelector('.upload-controls');
  const canvas = document.getElementById('strings');
  const guitarNeckDiv = document.getElementById('guitar-neck'); 
  const neckSvg = document.getElementById('neck-svg'); 

  const controlWidth = 150;

  canvas.width = Math.max(100, window.innerWidth - controlWidth);
  canvas.style.width = `${canvas.width}px`;

  const availableHeightForSim = window.innerHeight;
  canvas.height = Math.max(100, availableHeightForSim);
  canvas.style.height = `${canvas.height}px`;

  let neckTopY = 0;
  let neckHeight = 0;
  const neckPadding = canvas.height * 0.05;

  baselines = [];
  const spacing = canvas.height * 0.04;
  const verticalMargin = canvas.height * 0.15;
  const usableHeight = canvas.height - 2 * verticalMargin;
  const startY = verticalMargin;

  if (numStrings > 1) {
    const totalSpacing = (numStrings - 1) * spacing;
    const scaleFactor = Math.min(1, usableHeight / totalSpacing);
    const scaledSpacing = spacing * scaleFactor;
    const totalHeight = (numStrings - 1) * scaledSpacing;
    const adjustedStartY = startY + (usableHeight - totalHeight) / 2;

    for (let s = 0; s < numStrings; s++) {
      baselines[s] = adjustedStartY + s * scaledSpacing;
    }
  } else if (numStrings === 1) {
    baselines[0] = canvas.height / 2;
  } else {
    baselines = [];
  }

  if (numStrings > 0 && baselines.length > 0) { 
    const topStringY = baselines[0];
    const bottomStringY = baselines[numStrings - 1];
    neckTopY = Math.max(0, topStringY - neckPadding);
    const neckBottomY = Math.min(canvas.height, bottomStringY + neckPadding);
    neckHeight = Math.max(20, neckBottomY - neckTopY);
  } else {
    neckTopY = canvas.height * 0.4;
    neckHeight = canvas.height * 0.2;
  }

  guitarNeckDiv.style.top = `${neckTopY}px`;
  guitarNeckDiv.style.height = `${neckHeight}px`;
  guitarNeckDiv.style.width = `${canvas.width}px`;

  neckSvg.setAttribute('viewBox', `0 0 ${canvas.width} ${neckHeight}`);
  neckSvg.setAttribute('width', canvas.width);
  neckSvg.setAttribute('height', neckHeight);

  const neckRect = document.getElementById('neck-rect');
  if (neckRect) {
      neckRect.setAttribute('width', canvas.width);
      neckRect.setAttribute('height', neckHeight);
      neckRect.setAttribute('y', 0);
  }

  drawFrets(canvas.width, neckHeight);

  tuningControlElements.forEach((control, s) => {
        if (control?.div && baselines.length > s) {
            control.div.style.top = `${baselines[s]}px`;
        }
    });

  controlsContainer.style.width = `${controlWidth}px`;
  controlsContainer.style.right = '0px';
  controlsContainer.style.top = '0px';
  controlsContainer.style.height = `${canvas.height}px`;

  // Move the global upload-button down so it sits just above the tuning controls
  if (uploadControlsDiv) {
    const firstBaseline = baselines[0] || 0;
    uploadControlsDiv.style.position = 'absolute';
    uploadControlsDiv.style.left = '10px';
    uploadControlsDiv.style.right = '10px';
    const uploadH = uploadControlsDiv.getBoundingClientRect().height;
    const margin = 15; // increased to lift default sound button higher
    const topPos = Math.max(0, firstBaseline - uploadH - margin);
    uploadControlsDiv.style.top = `${topPos}px`;
  }
}

function resize() {
  positionTuningControls();

  // Always keep warning message just above bottom controls, even on resize
  const warning = document.getElementById('warning-message');
  const bottomControls = document.getElementById('bottom-controls-container');
  if (warning && bottomControls && warning.style.display !== 'none') {
    // get bottom controls height
    const bcRect = bottomControls.getBoundingClientRect();
    const docHeight = document.documentElement.clientHeight;
    // Place warning just above bottom controls (adjust for scrolled, etc)
    let offset = bcRect.height + 5;
    warning.style.bottom = offset + 'px';
  }
}

function setupTuningControls() {
  tuningControlElements.forEach(el => el?.div?.remove());
  tuningControlElements.length = 0;

  const minTune = 0.75;
  const maxTune = 1.25;
  const stepTune = 0.005;
  const minVal = minTune.toFixed(3);
  const maxVal = maxTune.toFixed(3);
  const stepVal = stepTune.toFixed(3);

  for (let s = 0; s < numStrings; s++) {
    const controlDiv = document.createElement('div');
    controlDiv.className = 'tuning-control';

    const label = document.createElement('label');
    label.textContent = `S${s + 1} Tuning`;
    label.htmlFor = `tuning-slider-${s}`; 
    label.title = `String ${s + 1} Tuning Adjustment`;

    const uploadLabel = document.createElement('label');
    uploadLabel.htmlFor = `string-audio-upload-${s}`;
    uploadLabel.textContent = `S${s + 1} Snd`;
    uploadLabel.className = 'upload-button string-upload-button';
    uploadLabel.title = `Upload Sound for String ${s + 1}`;
    if (stringAudioBuffers[s]) {
         uploadLabel.textContent = `S${s+1} ✓`;
         uploadLabel.classList.add('sound-loaded');
    }
    const stringInput = document.createElement('input');
    stringInput.type = 'file';
    stringInput.id = `string-audio-upload-${s}`;
    stringInput.accept = 'audio/*';
    stringInput.style.display = 'none';
    stringInput.dataset.stringIndex = s;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = `tuning-slider-${s}`;
    slider.min = minVal;
    slider.max = maxVal;
    slider.step = stepVal;
    slider.value = tuningAdjustments[s];

    const numberInput = document.createElement('input');
    numberInput.type = 'number';
    numberInput.id = `tuning-input-${s}`;
    numberInput.className = 'control-value-input tuning-value-input';
    numberInput.min = minVal;
    numberInput.max = maxVal;
    numberInput.step = stepVal;
    numberInput.value = tuningAdjustments[s].toFixed(3);

    slider.addEventListener('input', (e) => {
      const newTuneValue = parseFloat(e.target.value);
      tuningAdjustments[s] = newTuneValue;
      numberInput.value = newTuneValue.toFixed(3);
    });

    numberInput.addEventListener('change', (e) => {
        let newTuneValue = parseFloat(e.target.value);
        newTuneValue = Math.max(minTune, Math.min(maxTune, newTuneValue));

        e.target.value = newTuneValue.toFixed(3);
        tuningAdjustments[s] = newTuneValue;
        slider.value = newTuneValue;
    });

    stringInput.addEventListener('change', handleStringAudioUpload);

    controlDiv.appendChild(label);        
    controlDiv.appendChild(uploadLabel);    
    controlDiv.appendChild(stringInput);    
    controlDiv.appendChild(slider);       
    controlDiv.appendChild(numberInput);  

    document.getElementById('controls-container').appendChild(controlDiv);

    tuningControlElements[s] = {
      div: controlDiv,
      slider: slider,
      input: numberInput,
      uploadLabel: uploadLabel,
      fileInput: stringInput
    };
  }
}

function handleStringAudioUpload(event) {
  const file = event.target.files[0];
  const stringIndex = parseInt(event.target.dataset.stringIndex, 10);

  if (!file || isNaN(stringIndex)) return;

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    const arrayBuffer = e.target.result;
    audioCtx.decodeAudioData(arrayBuffer).then(buffer => {
      stringAudioBuffers[stringIndex] = buffer;
      const uploadLabel = tuningControlElements[stringIndex]?.uploadLabel;
      if (uploadLabel) {
        uploadLabel.textContent = `S${stringIndex+1} ✓`;
        uploadLabel.classList.add('sound-loaded');
      }
    }).catch(err => {
      console.error("Audio decode error:", err);
      alert(`Error decoding audio for string ${stringIndex+1}.`);
    });
  };

  reader.onerror = (e) => {
    console.error("FileReader error:", e);
    alert(`Error reading the audio file for string ${stringIndex + 1}.`);
  };

  reader.readAsArrayBuffer(file);
  event.target.value = null;
}

document.getElementById('global-audio-upload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        audioCtx.decodeAudioData(arrayBuffer).then(buffer => {
            globalAudioBuffer = buffer;
            const globalUploadButton = document.querySelector('label[for="global-audio-upload"]');
            if (globalUploadButton) {
                globalUploadButton.textContent = 'Default Sound ✓';
                globalUploadButton.classList.add('sound-loaded');
            }
        }).catch(err => {
            console.error("Audio decode error:", err);
            alert("Error decoding default audio file.");
        });
    };

    reader.onerror = (e) => {
        console.error("FileReader error:", e);
        alert("Error reading the default audio file.");
    };

    reader.readAsArrayBuffer(file);
    event.target.value = null;
});

document.getElementById('warning-understood-button').addEventListener('click', () => {
    document.getElementById('warning-message').style.display = 'none'; 
    resize(); 
});

// Track mouse position for keyboard strumming
document.getElementById('strings').addEventListener('pointermove', e => {
  lastPointerX = e.clientX;
});

// Strum functions
function strumString(s) {
  if (s < 0 || s >= numStrings || baselines.length <= s) return;
  const canvasRect = document.getElementById('strings').getBoundingClientRect();
  const pointerX = lastPointerX;
  const fretModifier = calculateFretModifier(pointerX);
  const maxDisp = document.getElementById('strings').height * 0.05;
  const pointerY = canvasRect.top + baselines[s] + maxDisp;
  applyDisplacement(s, pointerX, pointerY);
  playStringSound(s, fretModifier);
}
function strumAll() {
  for (let s = 0; s < numStrings; s++) {
    setTimeout(() => strumString(s), s * 70);
  }
}

// Keyboard event handling (skip when key-bind menu is open)
document.addEventListener('keydown', e => {
  const keybindingOverlay = document.getElementById('keybinding-overlay');
  // If overlay is showing, don't trigger any strum
  if (keybindingOverlay && !keybindingOverlay.classList.contains('hidden')) {
    e.preventDefault();
    return;
  }
  // Don't strum when typing in inputs or textareas
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
  if (e.code === 'Space') {
    e.preventDefault();
    strumAll();
  } else if (keyBindings.hasOwnProperty(e.code)) {
    e.preventDefault();
    strumString(keyBindings[e.code]);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // BUTTON/ELEMENT GRABBING (MUST BE INSIDE DOMContentLoaded)
  const keybindingsButton = document.getElementById('keybindings-button');
  const keybindingOverlay = document.getElementById('keybinding-overlay');
  const keybindingInstructions = document.getElementById('keybinding-instructions');
  const keybindingsList = document.getElementById('keybindings-list');
  const closeKeybindingsButton = document.getElementById('close-keybindings-button');

  let currentKeyListener = null;

  function populateKeybindingsList() {
    keybindingsList.innerHTML = '';
    for (let s = 0; s < numStrings; s++) {
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = `String ${s+1}:`;
      const keySpan = document.createElement('span');
      keySpan.className = 'key-name';
      // Show first key assigned to string s, or '-'
      let foundCode = null;
      for (const code in keyBindings) {
        if (keyBindings[code] === s) {
          foundCode = code;
          break;
        }
      }
      keySpan.textContent = foundCode ? foundCode.replace('Key','') : '-';
      const changeBtn = document.createElement('button');
      changeBtn.textContent = 'Change';
      changeBtn.type = 'button';
      changeBtn.addEventListener('click', () => {
        keybindingInstructions.textContent = `Press a key for String ${s+1}`;
        // Remove previous listener
        if (currentKeyListener) {
          document.removeEventListener('keydown', currentKeyListener);
        }
        function onKeyListener(e) {
          if (e.code) {
            // Remove key previously assigned to this string or to this code
            for (const k in keyBindings) {
              if (keyBindings[k] === s || k === e.code) delete keyBindings[k];
            }
            keyBindings[e.code] = s;
            saveKeyBindings();
            populateKeybindingsList();
            keybindingInstructions.textContent = '';
            document.removeEventListener('keydown', onKeyListener);
            currentKeyListener = null;
            e.preventDefault();
            return false;
          }
        }
        currentKeyListener = onKeyListener;
        document.addEventListener('keydown', onKeyListener);
      });
      li.appendChild(label);
      li.appendChild(keySpan);
      li.appendChild(changeBtn);
      keybindingsList.appendChild(li);
    }
  }

  if (keybindingsButton) {
    keybindingsButton.addEventListener('click', (e) => {
      e.preventDefault();
      populateKeybindingsList();
      keybindingInstructions.textContent = '';
      keybindingOverlay.classList.remove('hidden');
    });
  }

  if (closeKeybindingsButton) {
    closeKeybindingsButton.addEventListener('click', (e) => {
      e.preventDefault();
      keybindingOverlay.classList.add('hidden');
      keybindingInstructions.textContent = '';
      if (currentKeyListener) {
        document.removeEventListener('keydown', currentKeyListener);
        currentKeyListener = null;
      }
    });
  }
}); // END DOMContentLoaded WRAPPER

document.getElementById('strings').addEventListener('pointerdown', e => {
  if (e.target !== document.getElementById('strings')) return;
  audioCtx.resume(); 

  if (e.pointerId in activeDrags) return;

  document.getElementById('strings').setPointerCapture(e.pointerId);

  const s = findNearestString(e.clientY); 

  activeDrags[e.pointerId] = { currentString: s, lastString: -1 }; 

  applyDisplacement(s, e.clientX, e.clientY); 
});

function calculateFretModifier(pointerX) {
    const canvasRect = document.getElementById('strings').getBoundingClientRect();
    let fretModifier = 1.0; 

    if (pointerX >= canvasRect.left && pointerX <= canvasRect.right) {
        const relativeX = pointerX - canvasRect.left;
        const normalizedX = Math.max(0, Math.min(1.0, relativeX / document.getElementById('strings').width)); 

        if (normalizedX < effectiveFretboardRatio) {
            const positionInFretArea = normalizedX / effectiveFretboardRatio;
            fretModifier = 1.0 + (1.0 - positionInFretArea) * (maxPitchMultiplier - 1.0);
        }
    }

    return fretModifier;
}

document.getElementById('strings').addEventListener('pointermove', e => {
  const pointerId = e.pointerId;
  if (!(pointerId in activeDrags)) return;

  e.preventDefault(); 

  const dragInfo = activeDrags[pointerId];
  const previousString = dragInfo.currentString;
  const x = e.clientX;
  const y = e.clientY;

  const currentClosestString = findNearestString(y);

  const canvasRect = document.getElementById('strings').getBoundingClientRect();
  const currentBaseline = (previousString >= 0 && previousString < baselines.length) ? baselines[previousString] : y - canvasRect.top; 
  const currentRawDisp = y - (canvasRect.top + currentBaseline);
  const maxDisp = document.getElementById('strings').height * 0.05;


  if (x > canvasRect.right) {
    const fretModifier = calculateFretModifier(x); 
    playStringSound(previousString, fretModifier);
    document.getElementById('strings').releasePointerCapture(pointerId);
    delete activeDrags[pointerId];
    return;
  }

  if (previousString >= 0 && Math.abs(currentRawDisp) > maxDisp * 1.5) {
    const fretModifier = calculateFretModifier(x); 
    playStringSound(previousString, fretModifier);
    document.getElementById('strings').releasePointerCapture(pointerId);
    delete activeDrags[pointerId];
    return;
  }

  if (currentClosestString !== previousString && previousString !== -1) {
    const fretModifier = calculateFretModifier(x);
    playStringSound(previousString, fretModifier);

    dragInfo.lastString = previousString;
    dragInfo.currentString = currentClosestString;

    applyDisplacement(currentClosestString, x, y); 

  } else if (currentClosestString !== -1) { 
    applyDisplacement(currentClosestString, x, y);
  }

  activeDrags[pointerId] = dragInfo;

});

function handlePointerEnd(e) {
    const pointerId = e.pointerId;
    if (pointerId in activeDrags) {
        const dragInfo = activeDrags[pointerId];
        const finalString = dragInfo.currentString;
        const pointerX = e.clientX; 

        const fretModifier = calculateFretModifier(pointerX);

        if (finalString !== -1) { 
             playStringSound(finalString, fretModifier);
        }


        delete activeDrags[pointerId];
        if (document.getElementById('strings').hasPointerCapture(pointerId)) {
             document.getElementById('strings').releasePointerCapture(pointerId);
        }
    }
}

document.getElementById('strings').addEventListener('pointerup', handlePointerEnd);
document.getElementById('strings').addEventListener('pointercancel', handlePointerEnd);
document.getElementById('strings').addEventListener('pointerleave', handlePointerEnd);

window.addEventListener('resize', resize);

function findNearestString(y) {
  let nearestString = -1; 
  let minDist = Infinity;
  const tolerance = document.getElementById('strings').height * 0.04; 
  const canvasRect = document.getElementById('strings').getBoundingClientRect();
  const relativeY = y - canvasRect.top;

  for (let i = 0; i < numStrings; i++) {
    if (baselines.length <= i) continue;

    const d = Math.abs(relativeY - baselines[i]);
    if (d < minDist && d < tolerance) {
      minDist = d;
      nearestString = i;
    }
  }

  if (nearestString === -1 && numStrings > 0 && baselines.length === numStrings) {
      minDist = Infinity;
      for (let i = 0; i < numStrings; i++) {
          const d = Math.abs(relativeY - baselines[i]);
          if (d < minDist) {
              minDist = d;
              nearestString = i;
          }
      }
  }

  return nearestString;
}

function applyDisplacement(stringIndex, pointerX, pointerY) {
  const s = stringIndex;
  const x = pointerX;
  const y = pointerY;

  if (s < 0 || s >= numStrings || baselines.length <= s) {
      return;
  }

  const canvasRect = document.getElementById('strings').getBoundingClientRect();
  const relativeX = x - canvasRect.left;
  const relativeY = y - canvasRect.top;

  const i = Math.max(0, Math.min(samples - 1, Math.round((relativeX / document.getElementById('strings').width) * (samples - 1))));

  let disp = relativeY - baselines[s];
  const maxDisp = document.getElementById('strings').height * 0.05; 
  const clampedVisualDisp = Math.max(-maxDisp, Math.min(maxDisp, disp));

  if (relativeX >= 0 && relativeX <= document.getElementById('strings').width) {
    displacements[s][i] = clampedVisualDisp;
    velocities[s][i] = 0; 

    if (i > 0) {
        displacements[s][i - 1] = clampedVisualDisp * 0.8; 
        velocities[s][i-1] = 0;
    }
    if (i < samples - 1) {
        displacements[s][i + 1] = clampedVisualDisp * 0.8; 
        velocities[s][i+1] = 0;
    }

     if (i > 1) velocities[s][i-2] = 0;
     if (i < samples - 2) velocities[s][i+2] = 0;
  }
}

function simulate() {
  const draggingStrings = new Set();
  for (const pointerId in activeDrags) {
      if (activeDrags.hasOwnProperty(pointerId)) {
        const stringIndex = activeDrags[pointerId].currentString;
        if (stringIndex >= 0 && stringIndex < numStrings) {
             draggingStrings.add(stringIndex);
        }
      }
  }

  for (let s = 0; s < numStrings; s++) {
    if (!draggingStrings.has(s)) {
      const u = displacements[s];
      const v = velocities[s];
      if (!u || u.length !== samples) continue;

      for (let i = 1; i < samples - 1; i++) {
        const accel = waveSpeed * (u[i - 1] + u[i + 1] - 2 * u[i]);
        v[i] = (v[i] + accel) * damping;
      }
      for (let i = 1; i < samples - 1; i++) {
        u[i] += v[i];
        u[i] *= (1 - Math.abs(u[i]) * 0.002);
      }
      u[0] = u[samples - 1] = 0;
      v[0] = v[samples - 1] = 0;

       for (let i = 1; i < samples - 1; i++) {
            v[i] *= 0.999; 
            u[i] *= 0.9999;
       }
    } else {
       const v = velocities[s];
        if(v){
           for (let i = 0; i < samples; i++) {
               if (Math.abs(v[i]) > 0.01) { 
                 v[i] *= 0.5; 
               }
           }
        }
    }
  }
}

function playStringSound(s, fretModifier = 1.0) {
  if (s < 0 || s >= numStrings) {
    console.log(`Attempted to play invalid string index: ${s}`);
    return;
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  if (!inputGainNode) {
    setupAudioNodes();
  }
  // calculate the target frequency
  const freq = baseFrequencies[s] * tuningAdjustments[s] * fretModifier;
  // if a custom buffer is loaded, play that with pitch adjustment
  const customBuffer = stringAudioBuffers[s] || globalAudioBuffer;
  if (customBuffer) {
    try {
      const src = audioCtx.createBufferSource();
      src.buffer = customBuffer;
      src.playbackRate.value = freq / baseFrequencies[s];
      src.connect(inputGainNode);
      src.start();
    } catch (e) {
      console.error("Error playing custom sound:", e);
      audioCtx.resume().catch(err => console.error("Resume failed:", err));
    }
    return;
  }
  // fallback to Karplus-Strong
  const ksBuffer = generateKSBuffer(freq);
  try {
    const src = audioCtx.createBufferSource();
    src.buffer = ksBuffer;
    src.connect(inputGainNode);
    src.start();
  } catch (e) {
    console.error("Error playing Karplus-Strong sound:", e);
    audioCtx.resume().catch(err => console.error("Resume failed:", err));
  }
}

function draw() {
  const ctx = document.getElementById('strings').getContext('2d');
  ctx.clearRect(0, 0, document.getElementById('strings').width, document.getElementById('strings').height);

  for (let s = 0; s < numStrings; s++) {
    const u = displacements[s];
    if (baselines.length <= s) continue;
    const y0 = baselines[s];
    if (!u || u.length !== samples) continue;

    ctx.beginPath();
    ctx.lineWidth = stringThickness[s];
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; 
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; 
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;

    ctx.moveTo(0, y0 + u[0]); 
    for (let i = 1; i < samples; i++) {
      const x = (i / (samples - 1)) * document.getElementById('strings').width;
      ctx.lineTo(x, y0 + u[i]);
    }
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
}

function loop() {
  simulate();
  draw();
  requestAnimationFrame(loop);
}

function start() {
  setupAudioNodes(); 
  setupArrays();
  setupTuningControls(); 
  resize();
  requestAnimationFrame(loop);
}

document.getElementById('clear-sounds-button').addEventListener('click', () => {
  globalAudioBuffer = null;
  stringAudioBuffers.fill(null);
  tuningControlElements.forEach((ctrl, idx) => {
    if (ctrl?.uploadLabel) {
      ctrl.uploadLabel.textContent = `S${idx+1} Snd`;
      ctrl.uploadLabel.classList.remove('sound-loaded');
    }
  });
  const globalUploadButton = document.querySelector('label[for="global-audio-upload"]');
  if (globalUploadButton) {
    globalUploadButton.textContent = 'Upload Default Sound';
    globalUploadButton.classList.remove('sound-loaded');
  }
});

const baseFrequencies = [329.63, 246.94, 196.00, 146.83, 110.00, 82.41];

function setupDialInteraction(dialElement, valueInput, onChange) {
    // Initial drawing
    function updateDialVisual(value) {
        const min = parseFloat(dialElement.dataset.min);
        const max = parseFloat(dialElement.dataset.max);
        // Dial range: 225deg (-135deg) to -45deg -- like classic knobs
        // (so top dead center is max, bottom left is min)
        const angleRange = 270;
        const startAngle = 135;
        const endAngle = -135;

        // Clamp value to [min, max]
        value = Math.max(min, Math.min(max, value));
        dialElement.dataset.value = value;

        const norm = (value - min) / (max - min);
        const angle = startAngle - (angleRange * norm);
        const dialIndicator = dialElement.querySelector('.dial-indicator');
        if (dialIndicator) {
            dialIndicator.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        }
    }

    // Initial set
    let value = typeof dialElement.dataset.value !== "undefined" ? parseFloat(dialElement.dataset.value) : 0;
    updateDialVisual(value);

    // Sync valueInput with initial
    if (valueInput) {
        valueInput.value = value;
    }

    // Mouse/touch drag logic for rotary knob
    let isDragging = false;
    let dragStartY = 0;
    let dragStartValue = 0;

    function onPointerDown(e) {
        isDragging = true;
        dragStartY = e.type.startsWith("touch") ? e.touches[0].clientY : e.clientY;
        dragStartValue = parseFloat(dialElement.dataset.value);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.body.style.userSelect = "none";
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        const clientY = e.type.startsWith("touch") ? e.touches[0].clientY : e.clientY;
        const deltaY = dragStartY - clientY;
        const min = parseFloat(dialElement.dataset.min);
        const max = parseFloat(dialElement.dataset.max);
        const step = parseFloat(dialElement.dataset.step);

        // ~120 px vertical motion for the full range
        let range = max - min;
        let sensitivity = 0.5 * range; // tweakable
        let newValue = dragStartValue + (deltaY / 120) * sensitivity;
        // Round to step
        newValue = Math.round(newValue / step) * step;
        // Clamp
        newValue = Math.max(min, Math.min(max, newValue));
        dialElement.dataset.value = newValue;

        updateDialVisual(newValue);
        if (valueInput) valueInput.value = newValue;
        if (onChange) onChange(newValue);
    }

    function onPointerUp() {
        isDragging = false;
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.body.style.userSelect = "";
    }

    dialElement.addEventListener('pointerdown', onPointerDown);

    // Also update when valueInput changes (direct text entry)
    if (valueInput) {
        valueInput.addEventListener('input', function() {
            let v = parseFloat(this.value);
            const min = parseFloat(dialElement.dataset.min);
            const max = parseFloat(dialElement.dataset.max);
            const step = parseFloat(dialElement.dataset.step);
            if (isNaN(v)) v = min;
            v = Math.max(min, Math.min(max, v));
            v = Math.round(v / step) * step;
            dialElement.dataset.value = v;
            updateDialVisual(v);
            this.value = v;
            if (onChange) onChange(v);
        });
    }
}

loadKeyBindings();
start();