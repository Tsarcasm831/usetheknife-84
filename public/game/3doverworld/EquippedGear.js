export class EquippedGear {
  constructor() {
    // Dictionary to store equipped gear by slot
    // e.g. { head: null, body: null, legs: null, weapon: null, accessory: null }
    this.gearSlots = {
      head: null,
      body: null,
      legs: null,
      weapon: null,
      accessory: null
    };
    this.createOverlay();
  }

  // Equips an item to a specific slot (head, body, legs, weapon, accessory)
  equip(slot, item) {
    if (this.gearSlots.hasOwnProperty(slot)) {
      this.gearSlots[slot] = item;
      this.updateOverlay();
      console.log(`Equipped ${item.name} to ${slot}`);
    } else {
      console.warn(`Slot ${slot} does not exist`);
    }
  }

  // Unequip an item from a slot.
  unequip(slot) {
    if (this.gearSlots.hasOwnProperty(slot)) {
      const removed = this.gearSlots[slot];
      this.gearSlots[slot] = null;
      this.updateOverlay();
      console.log(`Unequipped ${removed ? removed.name : "nothing"} from ${slot}`);
    }
  }

  // Toggles gear in a slot if given item is already equipped then unequips.
  toggleEquip(slot, item) {
    if (this.gearSlots[slot] && this.gearSlots[slot].id === item.id) {
      this.unequip(slot);
    } else {
      this.equip(slot, item);
    }
  }

  // Returns the current equipped gear.
  getEquippedGear() {
    return this.gearSlots;
  }

  // Creates a small on-screen overlay to display equipped gear.
  createOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.id = "equippedGearOverlay";
    Object.assign(this.overlay.style, {
      position: "fixed",
      bottom: "80px",
      left: "10px",
      background: "rgba(0, 0, 0, 0.7)",
      color: "#fff",
      fontFamily: "sans-serif",
      padding: "10px",
      border: "2px solid #fff",
      borderRadius: "5px",
      zIndex: "1000",
      fontSize: "12px"
    });
    document.body.appendChild(this.overlay);
    this.updateOverlay();
  }

  // Update the overlay text content.
  updateOverlay() {
    let html = "<strong>Equipped Gear</strong><br/>";
    for (const slot in this.gearSlots) {
      const item = this.gearSlots[slot];
      html += `${slot[0].toUpperCase()+slot.slice(1)}: ${item ? item.name : "None"}<br/>`;
    }
    this.overlay.innerHTML = html;
  }
}

// Create a global instance for easy access in other modules.
window.equippedGear = new EquippedGear();