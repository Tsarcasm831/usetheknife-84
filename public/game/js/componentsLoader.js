export async function loadComponent(selector, url) {
  const container = document.querySelector(selector);
  if (!container) return;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    container.innerHTML = await response.text();
  } catch (err) {
    console.error(err);
  }
}

export function initComponents() {
  loadComponent("#toolbar-container", "components/toolbar.html");
  loadComponent("#sidebar-container", "components/sidebar.html");
  loadComponent("#poi-modal-container", "components/poi-modal.html");
  loadComponent("#popup-module-container", "components/popup-module.html");
  loadComponent("#threeD-modal-container", "components/threeD-modal.html");
  loadComponent("#bestiary-modal-container", "components/bestiary-modal.html");
  loadComponent("#fdg-modal-container", "components/fdg-modal.html");
  loadComponent("#hive-modal-container", "components/hive-modal.html");
  loadComponent("#aliens-modal-container", "components/aliens-modal.html");
  loadComponent("#species-detail-modal-container", "components/species-detail-modal.html");
  loadComponent("#welcome-modal-container", "components/welcome-modal.html");
  loadComponent("#home-modal-container", "components/home-modal.html");
  loadComponent("#gdd-modal-container", "components/gdd-modal.html");
  loadComponent("#core-rules-modal-container", "components/core-rules-modal.html");
  loadComponent("#faction-modals-container", "components/faction-modals.html");
  loadComponent("#auth-modal-container", "components/auth-modal.html");
}

document.addEventListener('DOMContentLoaded', initComponents);
