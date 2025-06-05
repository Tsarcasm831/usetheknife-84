export function initAuthModal() {
  const authModal = document.getElementById('auth-modal');
  const closeBtn = document.getElementById('close-auth-modal-btn');
  const signInBtn = document.getElementById('sign-in-btn');
  const authForm = document.getElementById('auth-form');
  const switchLink = document.getElementById('auth-switch-link');
  const title = document.getElementById('auth-modal-title');
  const actionButton = document.getElementById('auth-action-button');
  const errorMessage = document.getElementById('auth-error-message');
  const aiMessage = document.getElementById('auth-ai-message');

  if (!authModal || !closeBtn || !signInBtn || !authForm) {
    console.error('Auth modal elements missing');
    return;
  }

  let isRegisterMode = false;

  function openModal() {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
    errorMessage.textContent = '';
    aiMessage.style.display = 'none';
  }

  signInBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  window.addEventListener('click', e => {
    if (e.target === authModal) closeModal();
  });

  switchLink.addEventListener('click', e => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    if (isRegisterMode) {
      title.textContent = 'Register Operative';
      actionButton.textContent = 'Register';
      switchLink.textContent = 'Have an account? Sign In';
    } else {
      title.textContent = 'Access Network Terminal';
      actionButton.textContent = 'Sign In';
      switchLink.textContent = 'No account? Register Operative';
    }
  });

  authForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('auth-username').value.trim();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;

    errorMessage.textContent = '';

    if (isRegisterMode) {
      if (!username || !email || !password) {
        errorMessage.textContent = 'All fields required';
        return;
      }
      localStorage.setItem('authUser', JSON.stringify({ username, email, password }));
      aiMessage.textContent = `Operative ${username} registered.`;
      aiMessage.style.display = 'block';
      setTimeout(closeModal, 1500);
    } else {
      const stored = localStorage.getItem('authUser');
      if (!stored) {
        errorMessage.textContent = 'No registered user';
        return;
      }
      const user = JSON.parse(stored);
      if (user.email === email && user.password === password) {
        aiMessage.textContent = `Welcome back, ${user.username}!`;
        aiMessage.style.display = 'block';
        setTimeout(closeModal, 1500);
      } else {
        errorMessage.textContent = 'Invalid credentials';
      }
    }
  });
}
