// attributeUtils.js
export function getAttributeDerivedStats(attributeName, score, attributesData) {
  const attributeInfo = attributesData.find(
    attr => attr.name.toLowerCase() === attributeName.toLowerCase()
  );
  if (!attributeInfo || isNaN(score)) return {};

  const modifierTier = attributeInfo.modifiers.find(
    mod => score >= mod.min_score && score <= mod.max_score
  );
  if (!modifierTier) return {};

  const { min_score, max_score, ...derivedStats } = modifierTier;
  return derivedStats;
}

export function updateAttributeDisplay(attrName, score, attributesData) {
  const container = document.getElementById(
    `derived-${attrName.toLowerCase()}`
  );
  if (!container || !attributesData) return;
  const stats = getAttributeDerivedStats(attrName, score, attributesData);
  container.innerHTML = Object.entries(stats)
    .map(
      ([key, val]) =>
        `<p class="derived-stat-item"><strong>${key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())}:</strong> ${val}</p>`
    )
    .join('');
}
