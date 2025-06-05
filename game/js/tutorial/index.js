const tutorialSteps = [
  { title: 'Welcome & Home Base', text: 'Click the home marker to open the Home Base Command Center.' },
  { title: 'Toolbar Overview', text: 'Use the toolbar to access factions, rules, grid scanning and more.' },
  { title: 'Map Interaction', text: 'Double-click anywhere on the map to see coordinates and address.' },
  { title: 'Grid Toggle', text: 'Press the G key to toggle the map grid overlay.' },
  { title: 'Scanning', text: 'Select a grid cell and click Scan to inspect a 5x5 subgrid.' },
  { title: 'Mapping Roads', text: 'After scanning, click Map to retrieve major roads in the selected area.' },
  { title: 'Finding Events', text: 'With roads mapped, click Find Events to generate encounter points.' },
  { title: 'Preparing for Events', text: 'Select Prepare on an event marker to configure your team and loadout.' }
];

let currentStep = 0;
let modalEl = null;

export function initTutorial() {
  const root = document.getElementById('modals-root');
  if (!root) return;

  modalEl = document.createElement('div');
  modalEl.id = 'tutorial-modal';
  modalEl.innerHTML = `
    <div class="tutorial-content">
      <span class="tutorial-close" id="tutorial-close">&times;</span>
      <h2 class="tutorial-step-title" id="tutorial-title"></h2>
      <p id="tutorial-text"></p>
      <div class="tutorial-nav">
        <button id="tutorial-prev">Prev</button>
        <button id="tutorial-next">Next</button>
      </div>
    </div>`;

  root.appendChild(modalEl);

  modalEl.querySelector('#tutorial-close').addEventListener('click', closeTutorial);
  modalEl.querySelector('#tutorial-prev').addEventListener('click', prevStep);
  modalEl.querySelector('#tutorial-next').addEventListener('click', nextStep);

  updateStep();
}

function updateStep() {
  const step = tutorialSteps[currentStep];
  modalEl.querySelector('#tutorial-title').textContent = step.title;
  modalEl.querySelector('#tutorial-text').textContent = step.text;
  modalEl.classList.add('active');

  modalEl.querySelector('#tutorial-prev').disabled = currentStep === 0;
  modalEl.querySelector('#tutorial-next').textContent = currentStep === tutorialSteps.length - 1 ? 'Done' : 'Next';
}

export function startTutorial() {
  if (!modalEl) initTutorial();
  currentStep = 0;
  updateStep();
}

function nextStep() {
  if (currentStep < tutorialSteps.length - 1) {
    currentStep++;
    updateStep();
  } else {
    closeTutorial();
  }
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    updateStep();
  }
}

function closeTutorial() {
  if (modalEl) modalEl.classList.remove('active');
}

// Expose startTutorial globally for toolbar button
window.startTutorial = startTutorial;
