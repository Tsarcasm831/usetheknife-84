export class Hotbar {
  constructor(slotCount = 5) {
    this.slotCount = slotCount;
    this.activeSlotIndex = 0;
    this.createHotbar();
    this.addSlotListeners();
    this.addKeyboardListeners();
  }

  createHotbar() {
    this.hotbar = document.createElement("div");
    this.hotbar.id = "hotbar";
    Object.assign(this.hotbar.style, {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: "10px",
      padding: "10px",
      background: "rgba(0, 0, 0, 0.5)",
      border: "2px solid white",
      borderRadius: "5px",
      zIndex: "1000"
    });

    this.slots = [];
    for (let i = 0; i < this.slotCount; i++) {
      const slot = document.createElement("div");
      slot.className = "hotbar-slot";
      Object.assign(slot.style, {
        width: "50px",
        height: "50px",
        background: "rgba(255, 255, 255, 0.2)",
        border: "2px solid white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        fontSize: "14px",
        color: "#fff",
        cursor: "pointer",
        userSelect: "none"
      });
      // For slot index 4 (i.e., slot 5), always show the flashlight image.
      if (i === 4) {
        const img = document.createElement("img");
        img.src = "https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/flashlight.webp";
        Object.assign(img.style, {
          width: "100%",
          height: "100%",
          objectFit: "contain"
        });
        slot.appendChild(img);
      } else {
        slot.textContent = i + 1;
      }
      this.slots.push(slot);
      this.hotbar.appendChild(slot);
    }
    document.body.appendChild(this.hotbar);
    // Highlight the first slot by default.
    this.selectSlot(0);
  }

  addSlotListeners() {
    this.slots.forEach((slot, index) => {
      slot.addEventListener("click", () => {
        this.selectSlot(index);
      });
    });
  }

  addKeyboardListeners() {
    window.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      // Check for keys Digit1-Digit5
      switch (e.code) {
        case "Digit1":
          this.selectSlot(0);
          break;
        case "Digit2":
          this.selectSlot(1);
          break;
        case "Digit3":
          this.selectSlot(2);
          break;
        case "Digit4":
          this.selectSlot(3);
          break;
        case "Digit5":
          this.selectSlot(4);
          break;
        default:
          break;
      }
    });
  }

  selectSlot(selectedIndex) {
    this.activeSlotIndex = selectedIndex;
    this.slots.forEach((slot, index) => {
      if (index === selectedIndex) {
        slot.style.background = "rgba(255, 255, 255, 0.5)";
        // Mark active visually by a thicker border.
        slot.style.border = "3px solid yellow";
      } else {
        slot.style.background = "rgba(255, 255, 255, 0.2)";
        slot.style.border = "2px solid white";
      }
    });
    // Additional logic can be added here to mark the selected object as "active".
    console.log(`Hotbar slot ${selectedIndex + 1} is active`);
  }
}

// Create a global reference to the hotbar instance so that other modules (like flashlight.js) can access it.
window.hotbar = new Hotbar();