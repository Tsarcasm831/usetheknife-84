// inventory/grid.js

export function updateInventoryGrid(modal, items, currentCategory, showTooltip, hideTooltip) {
  const inventoryGrid = modal.querySelector('#iv-inventory-slots');
  if (!inventoryGrid) return;
  inventoryGrid.innerHTML = '';
  
  const filteredItems = items.filter(item =>
    item && (currentCategory === 'all' || item.type === currentCategory || item.type === 'potion')
  );
  
  for (let i = 0; i < 100; i++) {
    const slot = document.createElement('div');
    slot.className = 'iv-inventory-item';
    slot.style.width = '40px';
    slot.style.height = '40px';
    
    if (i < filteredItems.length) {
      const item = filteredItems[i];
      const iconContainer = document.createElement('div');
      iconContainer.className = 'iv-item-icon';
      iconContainer.style.cssText = 'width:100%;height:70%;display:flex;align-items:center;justify-content:center';
      iconContainer.innerHTML = item.icon;
      const img = iconContainer.querySelector('img');
      if (img) {
        img.style.width = '32px';
        img.style.height = '32px';
      }
      slot.appendChild(iconContainer);
      const quantityLabel = document.createElement('div');
      quantityLabel.className = 'iv-item-quantity';
      quantityLabel.textContent = item.quantity;
      slot.appendChild(quantityLabel);
      slot.addEventListener('mouseenter', e => showTooltip(item, e.clientX, e.clientY));
      slot.addEventListener('mouseleave', () => hideTooltip());
    } else {
      slot.innerHTML = '<div class="iv-empty-slot"></div>';
    }
    inventoryGrid.appendChild(slot);
  }
}

export function updateEquipmentGrid(modal, equippedGear, showTooltip, hideTooltip) {
  const gearSlots = modal.querySelectorAll('.iv-gear-slot');
  gearSlots.forEach(slot => {
    const slotType = slot.dataset.slot;
    const gearItem = equippedGear[slotType];
    const itemContainer = slot.querySelector('.iv-gear-item');
    itemContainer.innerHTML = '';
    slot.classList.remove('iv-equipped');
    if (gearItem) {
      const icon = document.createElement('div');
      icon.className = 'iv-gear-icon';
      icon.innerHTML = gearItem.icon;
      itemContainer.appendChild(icon);
      slot.classList.add('iv-equipped');
    }
    slot.addEventListener('mouseenter', e => {
      if (gearItem) showTooltip(gearItem, e.clientX, e.clientY);
    });
    slot.addEventListener('mouseleave', () => hideTooltip());
    slot.addEventListener('click', () => {
      // TODO: equip/unequip logic
    });
  });
}

export function updateStats(modal) {
  modal.querySelector('#iv-defense-value').textContent = '10';
  modal.querySelector('#iv-attack-value').textContent = '5';
  modal.querySelector('#iv-mining-power-value').textContent = '3';
}