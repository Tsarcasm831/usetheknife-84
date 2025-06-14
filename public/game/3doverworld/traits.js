export class Traits {
  constructor(initialTraits = { psy: 100, fame: 0, karma: 0, reputation: 0 }) {
    this.traits = initialTraits;
    this.isVisible = false;
    this.createOverlay();
    this.addEventListeners();
  }

  createOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.id = "traitsOverlay";
    Object.assign(this.overlay.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "rgba(0, 0, 0, 0.85)",
      color: "#fff",
      fontFamily: "sans-serif",
      padding: "20px",
      border: "2px solid #fff",
      borderRadius: "5px",
      zIndex: "1001",
      width: "300px",
      maxHeight: "90%",
      overflowY: "auto",
      display: "none"
    });
    this.updateOverlay();
    document.body.appendChild(this.overlay);
  }

  updateOverlay() {
    this.overlay.innerHTML = `
      <h2>Traits</h2>
      <ul>
        <li>Psy: <span id="traitPsy">${this.traits.psy}</span></li>
        <li>Fame: <span id="traitFame">${this.traits.fame}</span></li>
        <li>Karma: <span id="traitKarma">${this.traits.karma}</span></li>
        <li>Reputation: <span id="traitReputation">${this.traits.reputation}</span></li>
      </ul>
      <p>Press "u" to close.</p>
    `;
  }

  addEventListeners() {
    window.addEventListener("keydown", (event) => {
      // Toggle overlay when "u" is pressed
      if (event.code === "KeyU" && !event.repeat) {
        this.toggleOverlay();
        event.preventDefault();
      }
    });
  }

  toggleOverlay() {
    this.isVisible = !this.isVisible;
    this.overlay.style.display = this.isVisible ? "block" : "none";
    if (this.isVisible) {
      this.updateOverlay();
    }
  }
}

new Traits();