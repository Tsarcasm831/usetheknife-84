export class PlayerStats {
  constructor(initialHealth = 100) {
    // Base stats
    this.health = initialHealth;
    this.psi = 100;
    this.physicalStrength = 10;
    this.physicalAgility = 10;
    this.physicalCombat = 10;
    this.firearmAiming = 10;
    this.thrownAccuracy = 10;
    this.physicalHealth = 10;
    this.mentalAffinity = 10;
    this.sensoryPerception = 10;
    this.personalCharm = 10;
    this.psychicAbility = 10;
    this.luck = 10;
    // Existing properties
    this.wood = 0;
    this.treesChopped = 0;
    this.runSpeedMultiplier = 1; // 1 = normal, 2 = running

    // Create the player stats overlay for detailed info.
    this.createOverlay();
    this.updateUI();

    // Make this instance globally accessible for the "C" key toggle.
    window.playerStatsInstance = this;
  }

  createOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.id = "playerStatsOverlay";
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
      display: "none",
      maxWidth: "90%",
      maxHeight: "90%",
      overflowY: "auto"
    });
    this.overlay.innerHTML = `
      <h2>Player Stats</h2>
      <ul id="playerStatsList">
        <li>Health: <span id="statHealth">${this.health}</span></li>
        <li>Psi: <span id="statPsi">${this.psi}</span></li>
        <li>Physical Strength: <span id="statPhysicalStrength">${this.physicalStrength}</span></li>
        <li>Physical Agility: <span id="statPhysicalAgility">${this.physicalAgility}</span></li>
        <li>Physical Combat: <span id="statPhysicalCombat">${this.physicalCombat}</span></li>
        <li>Firearm Aiming: <span id="statFirearmAiming">${this.firearmAiming}</span></li>
        <li>Thrown Accuracy: <span id="statThrownAccuracy">${this.thrownAccuracy}</span></li>
        <li>Physical Health: <span id="statPhysicalHealth">${this.physicalHealth}</span></li>
        <li>Mental Affinity: <span id="statMentalAffinity">${this.mentalAffinity}</span></li>
        <li>Sensory Perception: <span id="statSensoryPerception">${this.sensoryPerception}</span></li>
        <li>Personal Charm: <span id="statPersonalCharm">${this.personalCharm}</span></li>
        <li>Psychic Ability: <span id="statPsychicAbility">${this.psychicAbility}</span></li>
        <li>Luck: <span id="statLuck">${this.luck}</span></li>
      </ul>
      <p>Press "C" to close.</p>
    `;
    document.body.appendChild(this.overlay);
  }

  toggleOverlay() {
    if (this.overlay.style.display === "none" || this.overlay.style.display === "") {
      this.overlay.style.display = "block";
      this.updateUI();
    } else {
      this.overlay.style.display = "none";
    }
  }

  updateUI() {
    document.getElementById("statHealth").textContent = this.health;
    document.getElementById("statPsi").textContent = this.psi;
    document.getElementById("statPhysicalStrength").textContent = this.physicalStrength;
    document.getElementById("statPhysicalAgility").textContent = this.physicalAgility;
    document.getElementById("statPhysicalCombat").textContent = this.physicalCombat;
    document.getElementById("statFirearmAiming").textContent = this.firearmAiming;
    document.getElementById("statThrownAccuracy").textContent = this.thrownAccuracy;
    document.getElementById("statPhysicalHealth").textContent = this.physicalHealth;
    document.getElementById("statMentalAffinity").textContent = this.mentalAffinity;
    document.getElementById("statSensoryPerception").textContent = this.sensoryPerception;
    document.getElementById("statPersonalCharm").textContent = this.personalCharm;
    document.getElementById("statPsychicAbility").textContent = this.psychicAbility;
    document.getElementById("statLuck").textContent = this.luck;
  }

  addWood(amount) {
    this.wood += amount;
    // Existing wood UI update code can be integrated here if needed.
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
    this.updateUI();
  }

  incrementTreesChopped() {
    this.treesChopped++;
  }

  setRunning(isRunning) {
    this.runSpeedMultiplier = isRunning ? 2 : 1;
  }
}

// Toggle the player stats overlay on "C" key press.
window.addEventListener("keydown", (event) => {
  if (event.code === "KeyC" && !event.repeat) {
    if (window.playerStatsInstance) {
      window.playerStatsInstance.toggleOverlay();
    }
    event.preventDefault();
  }
});