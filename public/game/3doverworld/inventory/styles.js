// inventory/styles.js

export function injectInventoryStyles() {
  const style = document.createElement("style");
  style.innerHTML = `
/* Modal */
.iv-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
}
.iv-modal.iv-active {
  display: flex;
  justify-content: center;
  align-items: center;
}
.iv-modal-content {
  background: #1a1a1a;
  color: #fff;
  width: 900px;
  max-width: 95%;
  height: 80vh;
  border-radius: 8px;
  position: relative;
  padding: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}
.iv-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  transition: color 0.3s;
}
.iv-close-btn:hover {
  color: #ff4444;
}
.iv-section-header {
  text-align: center;
  margin: 0 0 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #333;
  color: #fff;
  font-size: 24px;
}
.iv-sub-header {
  color: #ccc;
  font-size: 18px;
  margin: 10px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid #333;
}
.iv-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: calc(100% - 60px);
  overflow: hidden;
}

/* Equipment Section */
.iv-equipment-section {
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}
.iv-gear-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 15px;
}
.iv-gear-slot {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #444;
  border-radius: 4px;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}
.iv-gear-slot:hover {
  border-color: #666;
  background: rgba(255, 255, 255, 0.1);
}
.iv-gear-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
}
.iv-gear-item {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.2);
  border: 1px dashed #444;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.iv-gear-icon {
  font-size: 24px;
}
.iv-stats-panel {
  margin-top: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}
.iv-stat-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #333;
}
.iv-stat-label {
  color: #888;
}
.iv-stat-value {
  color: #4CAF50;
  font-weight: bold;
}

/* Inventory Section */
.iv-inventory-section {
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}
.iv-category-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
.iv-category-btn {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #444;
  color: #fff;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}
.iv-category-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
.iv-category-btn.active {
  background: #4CAF50;
  border-color: #4CAF50;
}
.iv-inventory-scroll {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 10px;
}
.iv-inventory-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 5px;
  padding: 5px;
}
.iv-inventory-item {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #444;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.iv-inventory-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #666;
}
.iv-item-icon {
  font-size: 24px;
  margin-bottom: 5px;
}
.iv-item-quantity {
  font-size: 11px;
  color: #888;
}

/* Tooltip */
.iv-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #444;
  border-radius: 4px;
  padding: 10px;
  pointer-events: none;
  z-index: 1100;
  display: none;
}
.iv-tooltip-title {
  color: #fff;
  font-weight: bold;
  margin-bottom: 5px;
}
.iv-tooltip-description {
  color: #ccc;
  font-size: 12px;
  margin-bottom: 5px;
}
.iv-tooltip-cost,
.iv-tooltip-quantity {
  color: #4CAF50;
  font-size: 12px;
  margin-bottom: 4px;
}

/* Scrollbar Styling */
.iv-inventory-scroll::-webkit-scrollbar {
  width: 8px;
}
.iv-inventory-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}
.iv-inventory-scroll::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}
.iv-inventory-scroll::-webkit-scrollbar-thumb:hover {
  background: #555;
}
  `;
  document.head.appendChild(style);
}