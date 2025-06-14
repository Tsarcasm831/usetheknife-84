// inventory/tooltip.js

export function showTooltip(item, x, y) {
  let tooltip = document.getElementById('iv-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'iv-tooltip';
    tooltip.className = 'iv-tooltip';
    document.body.appendChild(tooltip);
  }
  tooltip.innerHTML = `
    <div class="iv-tooltip-image" style="display:block;text-align:center;margin-bottom:6px;width:48px;height:48px;margin:0 auto;">
      ${item.icon}
    </div>
    <div class="iv-tooltip-title" style="text-align:center;font-weight:bold;margin-bottom:6px;">
      ${item.name}
    </div>
    <div class="iv-tooltip-description" style="margin-bottom:4px;">${item.description}</div>
    <div class="iv-tooltip-cost" style="margin-bottom:4px;">Cost: ${item.cost}</div>
    <div class="iv-tooltip-quantity">Quantity: ${item.quantity}</div>
  `;
  tooltip.style.left = `${x + 10}px`;
  tooltip.style.top = `${y + 10}px`;
  tooltip.style.display = 'block';
}

export function hideTooltip() {
  const tooltip = document.getElementById('iv-tooltip');
  if (tooltip) tooltip.style.display = 'none';
}