import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

export class DayNightCycle {
  constructor(directionalLight, ambientLight, scene, options = {}) {
    this.directionalLight = directionalLight;
    this.ambientLight = ambientLight;
    this.scene = scene;
    this.cycleDuration = options.cycleDuration || 120; // Cycle duration in seconds

    // Define sky colors for day and night.
    this.daySkyColor = new THREE.Color(0x87CEEB); // Light sky blue
    this.nightSkyColor = new THREE.Color(0x0d1b2a); // Dark blue
  }

  update(elapsedSeconds) {
    let t = (elapsedSeconds % this.cycleDuration) / this.cycleDuration; // Normalized time [0, 1]
    // Using a cosine to simulate a smooth day-night transition:
    // At t = 0, cos(0)=1 => maximum brightness; at t = 0.5, cos(pi)=-1 => minimum brightness.
    let cosValue = Math.cos(2 * Math.PI * t);
    // Increase brightness range: maximum intensity during day is higher.
    let directionalIntensity = 0.5 + 1.0 * ((cosValue + 1) / 2); // Ranges from 0.5 to 1.5
    this.directionalLight.intensity = directionalIntensity;

    let ambientIntensity = 0.7 + 0.3 * ((cosValue + 1) / 2); // Ranges from 0.7 to 1.0
    this.ambientLight.intensity = ambientIntensity;

    // Optionally update the directional light's position to simulate the sun's movement.
    let angle = 2 * Math.PI * t;
    let radius = 50;
    let x = radius * Math.cos(angle);
    let y = radius * Math.sin(angle);
    // Preserve the original Z value for consistency
    this.directionalLight.position.set(x, y, this.directionalLight.position.z);

    // Update the sky color based on the cycle.
    let dayFactor = (cosValue + 1) / 2; // 1 at full day, 0 at full night.
    let skyColor = this.daySkyColor.clone().lerp(this.nightSkyColor, 1 - dayFactor);
    this.scene.background = skyColor;

    if (this.scene.fog) {
      this.scene.fog.color.copy(skyColor);
    }
  }
}