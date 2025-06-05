export function initWelcomeModal() {
  const welcomeModal = document.getElementById('welcome-modal');
  const closeBtn = document.getElementById('close-welcome-modal');

  if (!welcomeModal || !closeBtn) {
    console.error('Welcome modal elements missing');
    return;
  }

  closeBtn.addEventListener('click', () => {
    welcomeModal.classList.remove('active');
  });

  window.addEventListener('click', e => {
    if (e.target === welcomeModal) {
      welcomeModal.classList.remove('active');
    }
  });
}

export function openWelcomeModal() {
  const welcomeModal = document.getElementById('welcome-modal');
  if (welcomeModal) {
    welcomeModal.classList.add('active');
  } else {
    console.error('Welcome modal not found.');
  }
}

window.openWelcomeModal = openWelcomeModal;
