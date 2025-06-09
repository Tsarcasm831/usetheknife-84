// --- Item Data ---
// Store item position (top-left corner) along with other data
// Add 'slot' property for equipped items - NOW MANAGED IN equipmentData
window.inventoryData = {
    inventory: {
        items: [
            // Row 1
            { id: 'item-a', name: "Agate Amulet of the Whale", type: "Amulet", itemClass: "Amulet", rarity: 'Magic', width: 1, height: 1, icon: '💍', col: 1, row: 1, stats: { implicit: "+(16-24) to Strength and Intelligence", explicit: ["+85 to Maximum Life"]}, requirements: { level: 45 } },
            { id: 'item-b', name: "Tyrant's Vaal Axe", type: "Two-Handed Axe", itemClass: "Weapon", rarity: 'Magic', width: 2, height: 3, icon: '🪓', col: 3, row: 1, stats: { explicit: ["Deals 150-250 Physical Damage", "120% increased Physical Damage", "Adds 10-20 Fire Damage", "5% increased Attack Speed"] }, requirements: { level: 62, str: 150, dex: 70 } },
            { id: 'item-c', name: "Divine Life Flask", type: "Life Flask", itemClass: "Flask", rarity: 'Normal', width: 1, height: 2, icon: '💖', col: 1, row: 3, stats: { explicit: ["Recovers 2400 Life over 7.00 seconds", "Consumes 15 of 30 Charges on use"]}, requirements: { level: 60 } },
            { id: 'item-d', name: "Headhunter", type: "Leather Belt", itemClass: "Belt", rarity: 'Unique', width: 2, height: 1, icon: '🥇', col: 6, row: 5, stats: { implicit: "+(25-40) to maximum Life", explicit: ["+(50-70) to Strength", "+(50-70) to Dexterity", "+(40-55) to maximum Life", "30% increased Damage with Hits against Rare monsters", "When you Kill a Rare monster, you gain its Modifiers for 20 seconds"] }, requirements: { level: 40 }, flavorText: "A man's soul is defined by the sacrifices he is willing to make." },
            { id: 'item-a2', name: "Loath Bane", type: "Amethyst Ring", itemClass: "Ring", rarity: 'Rare', width: 1, height: 1, icon: '💍', col: 10, row: 1, stats: { implicit: "+(13-17)% to Chaos Resistance", explicit: ["+55 to maximum Life", "+12% to all Elemental Resistances", "+34 to Strength", "+26% to Cold Resistance"]}, requirements: { level: 57 } },
            { id: 'item-helm', name: "Lion Pelt", type: "Helmet", itemClass: "Helmet", rarity: 'Normal', width: 2, height: 2, col: 9, row: 3, stats: { implicit: "+25 to maximum Life", explicit: ["+50 to Armour Rating"]}, requirements: { level: 10 } },
            { id: 'item-body', name: "Astral Plate of Fortification", type: "Body Armour", itemClass: "Body Armour", rarity: 'Rare', width: 2, height: 3, col: 6, row: 1, stats: { implicit: "+12% to all Elemental Resistances", explicit: ["+120 to Maximum Life", "+800 to Armour", "+55 to Evasion Rating", "Gain 5% of Physical Damage as Extra Fire Damage", "Regenerate 1% of Life per second"] }, requirements: { level: 68, str: 180 } },
            { id: 'item-bow', name: "Thicket Bow", type: "Bow", itemClass: "Weapon", rarity: 'Normal', width: 2, height: 4, icon: '🏹', col: 1, row: 5, stats: { explicit: ["Deals 10-25 Physical Damage", "10% increased Attack Speed"] }, requirements: { level: 5, dex: 20 } },
            { id: 'item-wand', name: "Engraved Wand", type: "Wand", itemClass: "Weapon", rarity: 'Normal', width: 1, height: 3, col: 11, row: 2, stats: { implicit: "15% increased Spell Damage"}, requirements: { level: 12, int: 25 } },
            // Added Items
            { id: 'item-map1', name: "Strand Map", type: "Map", itemClass: "Map", rarity: 'Normal', width: 1, height: 1, icon: '🗺️', col: 8, row: 4, stats: { explicit: ["Map Tier: 3", "Item Quantity: +15%", "Monster Pack Size: +8%"] }, requirements: { level: 70 } },
            { id: 'item-jewel1', name: "Viridian Jewel", type: "Jewel", itemClass: "Jewel", rarity: 'Normal', width: 1, height: 1, icon: '💎', col: 9, row: 1, stats: {}, requirements: { level: 1 } },
            { id: 'item-quiver1', name: "Spike-Point Arrow Quiver", type: "Quiver", itemClass: "Quiver", rarity: 'Rare', width: 2, height: 3, icon: '🎯', col: 3, row: 4, stats: { implicit: "Adds 4-8 Physical Damage to Bow Attacks", explicit: ["+60 to maximum Life", "15% increased Attack Speed with Bows", "+30% to Fire Resistance", "20% increased Projectile Speed"]}, requirements: { level: 48, dex: 80 } },
            { id: 'item-glove1', name: "Sorcerer Gloves of Dexterity", type: "Gloves", itemClass: "Gloves", rarity: 'Magic', width: 2, height: 2, icon: '🧤', col: 11, row: 5, stats: { implicit: "+15 to maximum Energy Shield", explicit: ["+30 to Dexterity"]}, requirements: { level: 35, int: 50 } },
             { id: 'item-currency1', name: "Orb of Alteration", type: "Currency", itemClass: "Currency", rarity: 'Currency', width: 1, height: 1, icon: '🪙', col: 5, row: 5, stats: { explicit: ["Reforges a magic item with new random modifiers", "Stack Size: 13 / 20"] } },
             { id: 'item-currency2', name: "Jeweller's Orb", type: "Currency", itemClass: "Currency", rarity: 'Currency', width: 1, height: 1, icon: '💎', col: 5, row: 6, stats: { explicit: ["Reforges the number of sockets on an item", "Stack Size: 88 / 200"] } },
             { id: 'item-currency3', name: "Chromatic Orb", type: "Currency", itemClass: "Currency", rarity: 'Currency', width: 1, height: 1, icon: '🌈', col: 8, row: 6, stats: { explicit: ["Reforges the colours of sockets on an item", "Stack Size: 42 / 500"] } },
             { id: 'item-flask-mana', name: "Hallowed Mana Flask", type: "Mana Flask", itemClass: "Flask", rarity: 'Normal', width: 1, height: 2, icon: '💧', col: 12, row: 1, stats: { explicit: ["Recovers 700 Mana over 5.00 seconds", "Consumes 8 of 40 Charges on use"]}, requirements: { level: 42 } },
             { id: 'item-card', name: "The Gambler", type: "Divination Card", itemClass: "Divination Card", rarity: 'Normal', width: 1, height: 1, icon: '🃏', col: 10, row: 6, stats: { explicit: ["<Random Divination Card>", "Stack Size: 3 / 5"]} },

        ],
        gridState: null
    },
    stash1: {
        items: [
            { id: 'item-e', name: "Titan Greaves of Speed", type: "Boots", itemClass: "Boots", rarity: 'Rare', width: 2, height: 2, icon: '👢', col: 1, row: 1, stats: { explicit: ["+70 to Maximum Life", "30% increased Movement Speed", "+25% to Cold Resistance", "+30% to Lightning Resistance"] }, requirements: { level: 55, str: 90 } },
            { id: 'item-f', name: "Cobalt Jewel of Ire", type: "Jewel", itemClass: "Jewel", rarity: 'Magic', width: 1, height: 1, icon: '💎', col: 4, row: 1, stats: { explicit: ["10% increased Spell Damage", "Adds 4-8 Cold Damage to Spells"] } },
            { id: 'item-h2', name: "Ancient Orb", type: "Currency", itemClass: "Currency", rarity: 'Currency', width: 1, height: 1, icon: '🪙', col: 1, row: 4, stats: { explicit: ["Reforges a unique item as another item of the same item class", "Stack Size: 1 / 20"]} },
            { id: 'item-h3', name: "Orb of Annulment", type: "Currency", itemClass: "Currency", rarity: 'Currency', width: 1, height: 1, icon: '🪙', col: 2, row: 4, stats: { explicit: ["Removes a random modifier from a magic or rare item", "Stack Size: 3 / 20"]} },
            { id: 'item-h4', name: "Orb of Binding", type: "Currency", itemClass: "Currency", rarity: 'Currency', width: 1, height: 1, icon: '🪙', col: 3, row: 4, stats: { explicit: ["Upgrades a normal item to a rare item with up to four linked sockets", "Stack Size: 7 / 20"]} },
            { id: 'item-gloves', name: "Dragonscale Gauntlets", type: "Gloves", itemClass: "Gloves", rarity: 'Normal', width: 2, height: 2, col: 5, row: 3, requirements: { level: 30 } },
        ],
        gridState: null
    },
    currency: {
        items: [
            { id: 'item-g', name: "Chaos Orb", type: "Currency", itemClass: "Currency", rarity: 'Currency', width: 1, height: 1, icon: '🪙', col: 1, row: 1, stats: { explicit: ["Reforges a rare item with new random modifiers", "Stack Size: 10 / 10"] } },
            { id: 'item-h', name: "Exalted Orb", type: "Currency", itemClass: "Currency", rarity: 'Currency', width: 1, height: 1, icon: '🪙', col: 2, row: 1, stats: { explicit: ["Enchants a rare item with a new random modifier", "Stack Size: 5 / 10"] } },
            { id: 'item-i', name: "Divine Orb", type: "Currency", itemClass: "Currency", rarity: 'Currency', width: 1, height: 1, icon: '🪙', col: 3, row: 1, stats: { explicit: ["Randomises the numeric values of the random modifiers on an item", "Stack Size: 3 / 10"] } },
            { id: 'item-j', name: "Mirror of Kalandra", type: "Currency", itemClass: "Currency", rarity: 'Currency', width: 1, height: 1, icon: '🪞', col: 1, row: 3, stats: { explicit: ["Creates a mirrored copy of an equipable non-unique item", "Stack Size: 1 / 10"] }, flavorText: "The lure of great power is difficult to resist." },
            { id: 'item-k', name: "Orb of Alchemy", type: "Currency", itemClass: "Currency", rarity: 'Currency', width: 1, height: 1, icon: '🪙', col: 4, row: 1, stats: { explicit: ["Upgrades a normal item to a rare item", "Stack Size: 25 / 20"] } },
            { id: 'item-l', name: "Orb of Fusing", type: "Currency", itemClass: "Currency", rarity: 'Currency', width: 1, height: 1, icon: '🔗', col: 5, row: 1, stats: { explicit: ["Reforges the links between sockets on an item", "Stack Size: 150 / 200"] } }, // Adjusted max stack
             { id: 'item-m', name: "Scroll of Wisdom", type: "Currency", itemClass: "Currency", rarity: 'Normal', width: 1, height: 1, icon: '📜', col: 1, row: 2, stats: { explicit: ["Identifies an unidentified item", "Stack Size: 350 / 500"] } },
             { id: 'item-n', name: "Portal Scroll", type: "Currency", itemClass: "Currency", rarity: 'Normal', width: 1, height: 1, icon: '🌀', col: 2, row: 2, stats: { explicit: ["Creates a portal to town", "Stack Size: 40 / 40"] } },
        ],
        gridState: null
    }
};

// Stores items currently equipped, keyed by slot type
const equipmentData = {
    // Example: Start with an item equipped
    // Belt: { id: 'item-d', name: "Headhunter", type: "Leather Belt", itemClass: "Belt", rarity: 'Unique', width: 2, height: 1, icon: '🥇', slot: 'Belt', stats: { implicit: "+(25-40) to maximum Life", explicit: ["+50 to Strength", "+50 to Dexterity", "+40% to Damage", "When you Kill a Rare monster, you gain its Modifiers for 20 seconds"] }, requirements: { level: 40 }, flavorText: "A man's soul is defined by the sacrifices he is willing to make." },
};

window.initialTabId = 'inventory';

function findItemDataById(itemId, currentTabId) {
    let item = inventoryData[currentTabId]?.items.find(i => i.id === itemId);
    if (item) return item;

    for (const tabId in inventoryData) {
        if (tabId !== currentTabId) {
            item = inventoryData[tabId]?.items.find(i => i.id === itemId);
            if (item) return item;
        }
    }

    for (const slotType in equipmentData) {
        if (equipmentData[slotType]?.id === itemId) {
            return equipmentData[slotType];
        }
    }
    return null;
}

function findEquipmentSlotElement(slotKey) {
    if (slotKey === 'Ring1') return document.querySelector('.equipment-slot.ring1');
    if (slotKey === 'Ring2') return document.querySelector('.equipment-slot.ring2');
    if (slotKey === 'Weapon1') return document.querySelector('.equipment-slot.weapon1');
    if (slotKey === 'Weapon2') return document.querySelector('.equipment-slot.weapon2');
    if (slotKey.startsWith('Flask')) {
        const index = parseInt(slotKey.replace('Flask', ''), 10);
        return document.querySelectorAll('.equipment-slot.flask')[index - 1];
    }
    // Handle special slots like Body Armour, Belt using class names if data-slot-type doesn't work or is missing
    if (slotKey === 'Body Armour') return document.querySelector('.equipment-slot.body-armour');
    if (slotKey === 'Belt') return document.querySelector('.equipment-slot.belt');

    // Fallback to data-slot-type for remaining slots
    return document.querySelector(`.equipment-slot[data-slot-type="${slotKey}"]`);
}