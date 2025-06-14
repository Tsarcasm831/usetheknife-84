// inventory/modal.js

export function createInventoryModal() {
  let modal = document.getElementById('inventory-view-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'inventory-view-modal';
  modal.className = 'iv-modal';
  modal.innerHTML = `
    <div class="iv-modal-content" style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/leather_background_texture') center/cover no-repeat;">
      <button class="iv-close-btn" id="iv-close-btn" title="Close Inventory">✕</button>
      <h2 class="iv-section-header">Character</h2>
      <div class="iv-container">
        <div class="iv-equipment-section">
          <h3 class="iv-sub-header">Equipment</h3>
          <div class="iv-gear-grid">
            <!-- gear slots (head, neck, shoulders, chest, mainHand, offHand, belt, gloves, shoes) -->
            <div class="iv-gear-slot" data-slot="head"><div class="iv-gear-label">Head</div><div class="iv-gear-item"></div></div>
            <!-- ...other gear-slot elements... -->
          </div>
          <div class="iv-stats-panel">
            <h3 class="iv-sub-header">Character Stats</h3>
            <div class="iv-stat-row"><span class="iv-stat-label">Defense:</span> <span class="iv-stat-value" id="iv-defense-value">0</span></div>
            <div class="iv-stat-row"><span class="iv-stat-label">Attack Power:</span> <span class="iv-stat-value" id="iv-attack-value">0</span></div>
            <div class="iv-stat-row"><span class="iv-stat-label">Mining Power:</span> <span class="iv-stat-value" id="iv-mining-power-value">0</span></div>
          </div>
        </div>
        <div class="iv-inventory-section">
          <h3 class="iv-sub-header">Inventory</h3>
          <div class="iv-category-filter">
            <button class="iv-category-btn active" data-category="all">All</button>
            <button class="iv-category-btn" data-category="resource">Resources</button>
            <button class="iv-category-btn" data-category="tool">Tools</button>
          </div>
          <div class="iv-inventory-scroll">
            <div class="iv-inventory-grid" id="iv-inventory-slots" style="justify-items:start; align-items:start;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}
