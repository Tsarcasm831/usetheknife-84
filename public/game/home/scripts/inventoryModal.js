// inventoryModal.js
// Dynamically loads and displays the inventory modal as an iframe overlay

let inventoryModal = null;

export function showInventoryModal() {
  if (inventoryModal && inventoryModal.style.display === 'block') {
    hideInventoryModal();
    return;
  }
  if (inventoryModal) {
    inventoryModal.style.display = 'block';
  } else {
    inventoryModal = document.createElement('iframe');
    inventoryModal.id = 'inventoryModal';
    inventoryModal.src = 'pages/inventory/index.html';
    // Centered popup styling
    inventoryModal.style.position = 'fixed';
    inventoryModal.style.top = '50%';
    inventoryModal.style.left = '50%';
    inventoryModal.style.transform = 'translate(-50%, -50%)';
    inventoryModal.style.width = '95vw';
    inventoryModal.style.maxWidth = '1050px';
    inventoryModal.style.height = '100vh';
    inventoryModal.style.maxHeight = '975px';
    inventoryModal.style.zIndex = '2000';
    inventoryModal.style.background = 'transparent';
    inventoryModal.style.border = '1px solid #555';
    inventoryModal.style.borderRadius = '8px';
    inventoryModal.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    inventoryModal.style.display = 'block';
    inventoryModal.allow = 'clipboard-read; clipboard-write';
    document.body.appendChild(inventoryModal);
  }
  window.addEventListener('keydown', hideOnEscape);
}

export function isInventoryModalOpen() {
  return inventoryModal && inventoryModal.style.display === 'block';
}

function hideOnEscape(e) {
  if (e.code === 'Escape' && inventoryModal && inventoryModal.style.display === 'block') {
    hideInventoryModal();
  }
}

export function hideInventoryModal() {
  if (inventoryModal) {
    inventoryModal.style.display = 'none';
  }
  window.removeEventListener('keydown', hideOnEscape);
}

// Optional: expose for direct close from iframe
window.addEventListener('message', (event) => {
  if (event.data === 'closeInventoryModal') {
    hideInventoryModal();
  }
});
