// crosshair.js
// This script creates a simple crosshair overlay at the center of the viewport.
(() => {
  const crosshair = document.createElement("div");
  crosshair.id = "crosshair";
  Object.assign(crosshair.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    zIndex: "1000"
  });

  // Create an inline SVG crosshair
  crosshair.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40">
      <line x1="20" y1="0" x2="20" y2="10" stroke="red" stroke-width="2"/>
      <line x1="20" y1="40" x2="20" y2="30" stroke="red" stroke-width="2"/>
      <line x1="0" y1="20" x2="10" y2="20" stroke="red" stroke-width="2"/>
      <line x1="40" y1="20" x2="30" y2="20" stroke="red" stroke-width="2"/>
    </svg>
  `;

  document.body.appendChild(crosshair);
})();