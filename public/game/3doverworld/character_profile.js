export class CharacterProfile {
  constructor() {
    this.profile = {
      Name: "John Doe",
      Age: 30,
      Ethnicity: "Undefined",
      Height: "6ft",
      Weight: "180lbs",
      Hometown: "Nowhere",
      "Skin Color": "Pale",
      Markings: "None",
      Tattoos: "None",
      Affiliations: "None",
      Rank: "Rookie",
      Archetype: "Warrior",
      Residence: "Unknown",
      "Easter Egg Points": 0
    };
    this.isVisible = false;
    this.createOverlay();
    this.addEventListeners();
  }

  createOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.id = "characterProfileOverlay";
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
      width: "350px",
      maxHeight: "90%",
      overflowY: "auto",
      display: "none"
    });
    this.updateOverlay();
    document.body.appendChild(this.overlay);
  }

  updateOverlay() {
    let html = '<h2>Character Profile</h2><ul>';
    for (const key in this.profile) {
      html += `<li>${key}: <span>${this.profile[key]}</span></li>`;
    }
    html += '</ul><p>Press "p" to close.</p>';
    this.overlay.innerHTML = html;
  }

  toggleOverlay() {
    this.isVisible = !this.isVisible;
    this.overlay.style.display = this.isVisible ? "block" : "none";
  }

  addEventListeners() {
    window.addEventListener("keydown", (event) => {
      if (event.code === "KeyP" && !event.repeat) {
        this.toggleOverlay();
        event.preventDefault();
      }
    });
  }
}

new CharacterProfile();