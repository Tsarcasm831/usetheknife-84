// traitUtils.js
export function updateTraitPoints() {
  const traitCheckboxes = document.querySelectorAll(
    '#char-traits-list .char-sheet-checkbox-item input[type="checkbox"]'
  );
  let availablePoints = 10;
  traitCheckboxes.forEach(cb => {
    if (cb.checked) {
      availablePoints -= parseInt(cb.dataset.cost) || 0;
      availablePoints += parseInt(cb.dataset.bonusPoints) || 0;
    }
  });
  const display = document.getElementById('trait-points-total');
  if (display) display.textContent = availablePoints;
}
