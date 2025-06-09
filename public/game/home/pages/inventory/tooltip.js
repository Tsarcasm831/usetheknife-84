// All dependencies are loaded globally via script tags. No import/export/module syntax. Attach globally needed functions to window below.

let tooltipTimeout = null;
const tooltipElement = document.getElementById('tooltip');

// Attach globally needed functions to window for use in drag/drop handlers
window.getPrimarySlotType = getPrimarySlotType;
window.extractStatValue = extractStatValue;
window.formatComparison = formatComparison;
window.formatTooltipContent = formatTooltipContent;
window.showTooltip = showTooltip;
window.hideTooltip = hideTooltip;
window.positionTooltip = positionTooltip;
window.handleMouseEnter = handleMouseEnter;
window.handleMouseLeave = handleMouseLeave;

function getPrimarySlotType(item) {
    for (const slotType in slotCompatibility) {
        if (slotCompatibility[slotType].includes(item.itemClass) || slotCompatibility[slotType].includes(item.type)) {
            if (slotType === 'Weapon') {
                if (item.type.includes("Two-Handed") || item.type === "Bow") return 'Weapon1';
                return 'Weapon1';
            }
            if (slotType === 'Ring') return 'Ring1';
            if (slotType === 'Flask') return 'Flask1';
            return slotType;
        }
    }
    return null;
}

function extractStatValue(statString, statNameRegex) {
    const match = statString.match(statNameRegex);
    return match ? parseFloat(match[1]) : 0;
}

function formatComparison(hoveredItem, equippedItem) {
    let comparisonHtml = '<div class="tooltip-comparison">';
    comparisonHtml += `<div class="tooltip-comparison-header">Comparing with Equipped: ${equippedItem.name}</div>`;

    const statsToCompare = [
        { name: "Life", regex: /\+(\d+)\s+to\s+Maximum\s+Life/i },
        { name: "Armour", regex: /\+(\d+)\s+to\s+Armour/i },
        { name: "Evasion", regex: /\+(\d+)\s+to\s+Evasion\s+Rating/i },
        { name: "Energy Shield", regex: /\+(\d+)\s+to\s+Maximum\s+Energy\s+Shield/i },
        { name: "Movement Speed", regex: /(\d+)%\s+increased\s+Movement\s+Speed/i },
        { name: "All Elemental Resistances", regex: /\+(\d+)%\s+to\s+all\s+Elemental\s+Resistances/i },
        { name: "Fire Resistance", regex: /\+(\d+)%\s+to\s+Fire\s+Resistance/i },
        { name: "Cold Resistance", regex: /\+(\d+)%\s+to\s+Cold\s+Resistance/i },
        { name: "Lightning Resistance", regex: /\+(\d+)%\s+to\s+Lightning\s+Resistance/i },
        { name: "Chaos Resistance", regex: /\+(\d+)%\s+to\s+Chaos\s+Resistance/i },
    ];

    let hasComparison = false;

    statsToCompare.forEach(stat => {
        let hoveredValue = 0;
        let equippedValue = 0;

        const allHoveredStats = [hoveredItem.stats?.implicit || '', ...(hoveredItem.stats?.explicit || [])];
        const allEquippedStats = [equippedItem.stats?.implicit || '', ...(equippedItem.stats?.explicit || [])];

        allHoveredStats.forEach(s => { hoveredValue += extractStatValue(s, stat.regex); });
        allEquippedStats.forEach(s => { equippedValue += extractStatValue(s, stat.regex); });

        if (hoveredValue > 0 || equippedValue > 0) {
            hasComparison = true;
            const diff = hoveredValue - equippedValue;
            let diffClass = 'neutral';
            let diffSign = '';
            if (diff > 0) {
                diffClass = 'positive';
                diffSign = '+';
            } else if (diff < 0) {
                diffClass = 'negative';
            }

            comparisonHtml += `<div class="tooltip-comparison-stat">`;
            comparisonHtml += `<span class="stat-name">${stat.name}:</span> `;
            comparisonHtml += `<span class="stat-diff ${diffClass}">(${diffSign}${diff.toFixed(0)})</span>`;
            comparisonHtml += `</div>`;
        }
    });

    if (!hasComparison) {
        comparisonHtml += `<div class="tooltip-comparison-stat neutral">(No comparable stats found)</div>`;
    }

    comparisonHtml += '</div>';
    return comparisonHtml;
}

function formatTooltipContent(item, equippedItemToCompare = null) {
    if (!item) return '';

    let html = `<div class="tooltip-name rarity-${item.rarity || 'Normal'}">${item.name}</div>`;
    html += `<div class="tooltip-type">${item.type}</div>`;

    const hasSeparatorWorthStats = (item.stats && (item.stats.implicit || (item.stats.explicit && item.stats.explicit.length > 0))) || item.requirements?.level;
    const hasAnySeparatorWorthData = hasSeparatorWorthStats || (item.requirements && (item.requirements.str || item.requirements.dex || item.requirements.int)) || item.flavorText;

    if (hasAnySeparatorWorthData) {
        html += `<hr>`;
    }

    if (item.requirements && (item.requirements.level || item.requirements.str || item.requirements.dex || item.requirements.int)) {
        let reqStr = "Requires ";
        const reqs = [];
        if (item.requirements.level) reqs.push(`Level ${item.requirements.level}`);
        if (item.requirements.str) reqs.push(`${item.requirements.str} Str`);
        if (item.requirements.dex) reqs.push(`${item.requirements.dex} Dex`);
        if (item.requirements.int) reqs.push(`${item.requirements.int} Int`);
        html += `<div class="tooltip-requirements">${reqStr}${reqs.join(', ')}</div>`;
        if ((item.stats && (item.stats.implicit || item.stats.explicit?.length > 0)) || item.flavorText) {
            html += `<hr>`;
        }
    }

    if (item.stats) {
        const statsHtml = [];
        if (item.stats.implicit) {
            statsHtml.push(`<div class="tooltip-implicit">${item.stats.implicit}</div>`);
        }
        if (item.stats.explicit && item.stats.explicit.length > 0) {
            if (item.stats.implicit && statsHtml.length > 0 && item.stats.explicit.length > 0) {
                statsHtml.push(`<div style="height: 5px;"></div>`);
            }
            item.stats.explicit.forEach(mod => {
                let modClass = 'tooltip-explicit';
                if (item.rarity === 'Magic') modClass += ' magic-mod';
                statsHtml.push(`<div class="${modClass}">${mod}</div>`);
            });
        }
        if (statsHtml.length > 0) {
            html += `<div class="tooltip-stats">${statsHtml.join('')}</div>`;
        }
    }

    if (item.flavorText) {
        if ((item.stats && (item.stats.implicit || item.stats.explicit?.length > 0)) || (item.requirements && (item.requirements.level || item.requirements.str || item.requirements.dex || item.requirements.int))) {
            html += `<hr>`;
        }
        html += `<div class="tooltip-flavor">${item.flavorText}</div>`;
    }

    if (equippedItemToCompare) {
        html += formatComparison(item, equippedItemToCompare);
    }

    return html;
}

function showTooltip(event, targetElement) {
    // Don't show tooltip if we're in the middle of a drag operation
    if (window.isDragging) {
        return;
    }
    
    if (!tooltipElement || !targetElement || !targetElement.dataset.itemId) {
        hideTooltip();
        return;
    }

    const itemId = targetElement.dataset.itemId;
    const hoveredItem = findItemDataById(itemId, getCurrentTabId());

    if (!hoveredItem) {
        hideTooltip();
        return;
    }

    let equippedItemToCompare = null;

    if (targetElement.closest('.inventory-grid')) {
        const potentialSlotKey = getPrimarySlotType(hoveredItem);

        if (potentialSlotKey) {
            if (potentialSlotKey === 'Weapon1') {
                equippedItemToCompare = equipmentData['Weapon1'];
                if (!equippedItemToCompare && !hoveredItem.type.includes("Two-Handed") && hoveredItem.type !== "Bow") {
                    equippedItemToCompare = equipmentData['Weapon2'];
                } else if (equippedItemToCompare && (equippedItemToCompare.type.includes("Two-Handed") || equippedItemToCompare.type === "Bow") && !hoveredItem.type.includes("Two-Handed") && hoveredItem.type !== "Bow") {
                    equippedItemToCompare = null;
                }
            } else if (potentialSlotKey === 'Ring1') {
                equippedItemToCompare = equipmentData['Ring1'] || equipmentData['Ring2'];
            } else if (potentialSlotKey === 'Flask1') {
                equippedItemToCompare = equipmentData['Flask1'];
            } else {
                equippedItemToCompare = equipmentData[potentialSlotKey];
            }

            if (equippedItemToCompare && equippedItemToCompare.id === hoveredItem.id) {
                equippedItemToCompare = null;
            }
        }
    }

    tooltipElement.innerHTML = formatTooltipContent(hoveredItem, equippedItemToCompare);
    tooltipElement.style.opacity = '0';
    tooltipElement.style.display = 'block';
    positionTooltip(event);

    void tooltipElement.offsetHeight;

    tooltipElement.style.opacity = '1';
}

function hideTooltip() {
    // Don't hide tooltip if we're in the middle of a drag operation
    if (window.isDragging) {
        return;
    }
    
    clearTimeout(tooltipTimeout);
    tooltipTimeout = null;
    if (tooltipElement) {
        tooltipElement.style.opacity = '0';
        setTimeout(() => {
            if (tooltipElement.style.opacity === '0') {
                tooltipElement.style.display = 'none';
                tooltipElement.innerHTML = '';
            }
        }, 100);
    }
}

function positionTooltip(event) {
    if (!tooltipElement || tooltipElement.style.display !== 'block') return;

    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const padding = 15;

    let top = mouseY + padding;
    let left = mouseX + padding;

    if (left + tooltipRect.width > window.innerWidth) {
        left = mouseX - tooltipRect.width - padding;
    }
    if (top + tooltipRect.height > window.innerHeight) {
        top = mouseY - tooltipRect.height - padding;
    }
    if (left < padding) left = padding;
    if (top < padding) top = padding;

    tooltipElement.style.left = `${left}px`;
    tooltipElement.style.top = `${top}px`;
}

function handleMouseEnter(event) {
    // Don't show tooltip if we're dragging
    if (window.isDragging) {
        return;
    }
    
    let targetElement = event.target;
    if (!targetElement.classList.contains('item')) {
        targetElement = targetElement.closest('.item');
    }
    if (!targetElement || !targetElement.dataset.itemId) {
        if (targetElement && targetElement.classList.contains('equipment-slot') && !targetElement.classList.contains('occupied')) {
            return;
        } else if (!targetElement || !targetElement.dataset.itemId) {
            return;
        }
    }

    if (targetElement.classList.contains('dragging')) {
        return;
    }

    clearTimeout(tooltipTimeout);
    positionTooltip(event);
    tooltipTimeout = setTimeout(() => {
        showTooltip(event, targetElement);
    }, TOOLTIP_DELAY);
}

function handleMouseLeave() {
    clearTimeout(tooltipTimeout);
    tooltipTimeout = null;
    hideTooltip();
}