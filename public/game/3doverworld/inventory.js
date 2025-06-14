// inventory.js

import { injectInventoryStyles } from './inventory/styles.js';
import { createInventoryModal } from './inventory/modal.js';
import { updateInventoryGrid, updateEquipmentGrid, updateStats } from './inventory/grid.js';
import { showTooltip, hideTooltip } from './inventory/tooltip.js';
import { INITIAL_ITEMS } from './inventory/data.js';

export class Inventory {
  constructor() {
    injectInventoryStyles();
    this.isVisible = false;
    // Populate 100 slots with the initial data
    this.items = Array(100).fill(null).map((_, i) => INITIAL_ITEMS[i] || null);
    this.equippedGear = {
      head: null, neck: null, shoulders: null, chest: null,
      mainHand: null, offHand: null, belt: null, gloves: null, shoes: null
    };
    this.currentCategory = 'all';
    this.modal = createInventoryModal();
    this.setupEventListeners();
    this.updateUI();
  }

  setupEventListeners() {
    const closeBtn = this.modal.querySelector('#iv-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggle());
    }

    this.modal.querySelectorAll('.iv-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.modal.querySelectorAll('.iv-category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category;
        this.updateUI();
      });
    });

    window.addEventListener('keydown', e => {
      if (e.code === 'KeyI' && !e.repeat) {
        this.toggle();
        e.preventDefault();
      }
    });

    this.modal.addEventListener('click', e => {
      if (e.target.id === 'inventory-view-modal') this.toggle();
    });

    this.modal.querySelector('.iv-modal-content').addEventListener('click', e => {
      e.stopPropagation();
    });

    this.modal.querySelectorAll('.iv-gear-slot').forEach(slot => {
      const slotType = slot.dataset.slot;
      slot.addEventListener('click', () => {
        // TODO: implement equip/unequip
        this.updateUI();
      });
      slot.addEventListener('mouseenter', e => {
        const gearItem = this.equippedGear[slotType];
        if (gearItem) showTooltip(gearItem, e.clientX, e.clientY);
      });
      slot.addEventListener('mouseleave', () => hideTooltip());
    });
  }

  toggle() {
    this.isVisible = !this.isVisible;
    this.modal.classList.toggle('iv-active', this.isVisible);

    if (this.isVisible) {
      document.body.style.cursor = 'default';
      if (document.pointerLockElement) document.exitPointerLock();
      this.updateUI();
    } else {
      document.body.style.cursor = 'none';
      document.body.requestPointerLock();
    }
  }

  updateUI() {
    updateInventoryGrid(this.modal, this.items, this.currentCategory, showTooltip, hideTooltip);
    updateEquipmentGrid(this.modal, this.equippedGear, showTooltip, hideTooltip);
    updateStats(this.modal);
  }

  // tombstones for removed methods from the old monolithic file:
  // removed function injectStyles() {}
  // removed function createModal() {}
  // removed function updateInventoryGrid() {}
  // removed function updateEquipmentGrid() {}
  // removed function updateStats() {}
  // removed function showTooltip() {}
  // removed function hideTooltip() {}
}

new Inventory();