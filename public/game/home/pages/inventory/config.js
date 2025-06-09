const GRID_COLS = 12;
const GRID_ROWS = 6;
const CELL_SIZE = 50; // Must match CSS --cell-size
const GRID_GAP = 1; // Must match CSS --grid-gap
const TOOLTIP_DELAY = 150; // Slightly faster tooltip

// Define item types compatible with equipment slots
const slotCompatibility = {
    Helmet: ["Helmet"],
    Weapon: ["Weapon", "One-Handed Axe", "Two-Handed Axe", "Bow", "Wand", "Claw", "Dagger", "One-Handed Mace", "Two-Handed Mace", "One-Handed Sword", "Two-Handed Sword", "Sceptre", "Staff", "Fishing Rod"], // Expand as needed
    Amulet: ["Amulet"],
    "Body Armour": ["Body Armour"], // Quote key with space
    Ring: ["Ring"],
    Gloves: ["Gloves"],
    Boots: ["Boots"],
    Belt: ["Belt"],
    Flask: ["Flask", "Life Flask", "Mana Flask", "Utility Flask", "Hybrid Flask"],
    Quiver: ["Quiver"] // Added Quiver compatibility (typically doesn't go in a slot, but needed for type check maybe)
};

// Default icons map (add more as needed)
const defaultIcons = {
    // Equipment types
    "Helmet": "🎓",
    "Weapon": "⚔️",
    "One-Handed Axe": "🪓",
    "Two-Handed Axe": "🪓",
    "Bow": "🏹",
    "Wand": "🪄",
    "Claw": "🤏",
    "Dagger": "🔪",
    "One-Handed Mace": "🔨",
    "Two-Handed Mace": "🔨",
    "One-Handed Sword": "🗡️",
    "Two-Handed Sword": "🗡️",
    "Sceptre": "🔱",
    "Staff": "⚕️",
    "Amulet": "💍", // Use ring as proxy
    "Body Armour": "🛡️",
    "Ring": "💍",
    "Gloves": "🧤",
    "Boots": "👢",
    "Belt": "🎗️",
    "Quiver": "🎯", // Added Quiver Icon
    // Flask types
    "Flask": "🧪",
    "Life Flask": "💖",
    "Mana Flask": "💧",
    "Utility Flask": "⚙️",
    "Hybrid Flask": "☯️",
    // Other common types
    "Currency": "🪙",
    "Jewel": "💎",
    "Map": "🗺️",
    "Divination Card": "🃏",
    "Scroll": "📜", // Added Scroll
    // Default fallback
    "Default": "❓"
};