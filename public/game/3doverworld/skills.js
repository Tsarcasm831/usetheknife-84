export class Skills {
  constructor() {
    // Define some starting skills
    this.skills = {
      mining: { level: 1, xp: 0, nextLevel: 100 },
      woodcutting: { level: 1, xp: 0, nextLevel: 100 },
      building: { level: 1, xp: 0, nextLevel: 100 },
      combat: { level: 1, xp: 0, nextLevel: 100 }
    };

    this.isVisible = false;
    this.createOverlay();
    this.addEventListeners();
  }

  createOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.id = "skillsOverlay";
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
      width: "400px",
      maxHeight: "90%",
      overflowY: "auto",
      display: "none"
    });
    this.updateOverlay();
    document.body.appendChild(this.overlay);
  }

  updateOverlay() {
    let html = `<h2>Skill Tree</h2>`;
    html += `<ul style="list-style: none; padding: 0;">`;
    for (const skill in this.skills) {
      const skillName = skill.charAt(0).toUpperCase() + skill.slice(1);
      const { level, xp, nextLevel } = this.skills[skill];
      html += `<li style="margin-bottom: 10px;">
                 <strong>${skillName}:</strong> Level ${level} <br>
                 XP: ${xp} / ${nextLevel}
               </li>`;
    }
    html += `</ul>`;
    html += `<p style="font-size: 0.9em;">Press "K" to close.</p>`;
    this.overlay.innerHTML = html;
  }

  addEventListeners() {
    window.addEventListener("keydown", (event) => {
      if (event.code === "KeyK" && !event.repeat) {
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

new Skills();