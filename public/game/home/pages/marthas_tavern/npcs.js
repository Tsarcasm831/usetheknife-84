// This file contains NPC dialog and behavior data
export const npcData = [
    {
        id: 'mercenary',
        name: 'Gruff Mercenary',
        description: 'A grizzled mercenary in dented chainmail, keeping an eye on the tavern with his one good eye.',
        portrait: 'mercenary',
        dialog: [
            "Keep yer distance, stranger. I'm not one for idle chatter.",
            "Seen things that'd turn your blood cold. Lost me eye to a basilisk in the southern swamps.",
            "If you're lookin' for work with a blade, talk to Martha. She knows who needs... problems solved."
        ]
    },
    {
        id: 'bard',
        name: 'Lyra the Half-Elf',
        description: 'A half-elf bard in an embroidered velvet doublet, gently strumming a scratched lute.',
        portrait: 'bard',
        dialog: [
            "Well met, traveler! Care to hear a tale of heroes past?",
            "I've collected stories from every corner of the realm. Some true, most... embellished.",
            "This lute? A gift from the Duchess of Silvershore. The scratch? That's from when I had to use it as a weapon against a very angry dwarf."
        ]
    },
    {
        id: 'scholar',
        name: 'Eldrin the Scholar',
        description: 'A hooded scholar with ink-stained fingers, poring over ancient alchemical symbols.',
        portrait: 'scholar',
        dialog: [
            "Hmm? Oh, don't mind me. Just translating these symbols... if I can keep the wine from ruining my notes.",
            "These markings suggest a formula for transmuting... well, not gold exactly, but something far more valuable.",
            "Looking for knowledge? The temple library in town might serve you better than my ramblings."
        ]
    },
    {
        id: 'merchant',
        name: 'Pock the Merchant',
        description: 'A shifty traveling merchant with a crate of glowing pickled peppers beside him.',
        portrait: 'merchant',
        dialog: [
            "Psst! Yes, you! Care to sample the finest pickled fire peppers this side of the Crimson Desert?",
            "Got these from a most unusual garden. The glow? Oh, completely natural. Mostly natural. Safe, definitely safe.",
            "Three copper for a jar. A bargain! They'll keep wolves away and light your path at night!"
        ]
    },
    {
        id: 'rogues',
        name: 'Shady Rogues',
        description: 'A pair of rogues in patched leather armor, laughing quietly and flipping coins.',
        portrait: 'rogues',
        dialog: [
            "We're just having a friendly wager here. Nothing that concerns you.",
            "Unless you've got coin to lose? We could always make room for another player.",
            "Word of advice: don't ask about the missing town guard. And don't look too closely at that wanted poster."
        ]
    },
    {
        id: 'martha',
        name: 'Martha',
        description: 'The tavern owner, a sturdy woman with graying hair and calculating eyes.',
        portrait: 'martha',
        dialog: [
            "Welcome to my establishment. What'll it be?",
            "Been running this place for thirty years. Seen it all, heard it all.",
            "Need something stronger than ale? I might have special stock... for the right price."
        ],
        isInteractive: true,
        options: [
            {
                text: "Talk",
                action: "talk",
                responses: [
                    "Word is, something strange has been happening in the old mines. Folk going in, not coming out. Guard captain's offering coin for information.",
                    "That merchant with the glowing peppers? Don't trust him. Last customer who ate one was hiccuping sparks for a week.",
                    "The two rogues by the corner have been here three days. Watching the road through the window. Waiting for someone, I reckon."
                ]
            },
            {
                text: "Trade",
                action: "trade",
                items: {
                    provisions: [
                        { name: "Loaf of Bread", price: "2 copper", description: "A crusty loaf, still warm from the oven." },
                        { name: "Wheel of Cheese", price: "5 copper", description: "Sharp and pungent, aged in the cellar." },
                        { name: "Dried Meat", price: "8 copper", description: "Tough but flavorful, will keep for weeks." },
                        { name: "Ale Tankard", price: "3 copper", description: "Martha's own brew, dark and hearty." },
                        { name: "Wine Bottle", price: "12 copper", description: "Sweet red from the eastern vineyards." }
                    ],
                    weapons: [
                        { name: "Rusty Dagger", price: "15 copper", description: "Has seen better days, but still sharp enough." },
                        { name: "Battered Crossbow", price: "2 silver", description: "Trigger sticks occasionally, but shoots true." },
                        { name: "Iron Buckler", price: "1 silver", description: "Dented but serviceable small shield." },
                        { name: "Hunter's Bow", price: "3 silver", description: "Well-crafted bow of flexible yew." }
                    ],
                    trinkets: [
                        { name: "Lucky Rabbit's Foot", price: "7 copper", description: "Previous owner ran out of luck. Might work for you." },
                        { name: "Ancient Coin", price: "1 silver", description: "Marked with symbols of a forgotten kingdom." },
                        { name: "Strange Rune", price: "3 silver", description: "Warm to the touch, faintly glowing at night." },
                        { name: "Traveler's Map", price: "5 copper", description: "Showing local roads and landmarks, stained with ale." },
                        { name: "Mysterious Key", price: "2 silver", description: "Heavy iron key. What it unlocks, Martha won't say." }
                    ]
                }
            },
            {
                text: "Offer to Work",
                action: "work",
                jobs: [
                    { name: "Wash Dishes", reward: "5 copper", description: "Kitchen's piled high with dirty dishes. Simple work, fair pay." },
                    { name: "Deliver Message", reward: "8 copper", description: "Take a sealed note to the blacksmith across town. Don't read it." },
                    { name: "Clear Cellar Rats", reward: "15 copper", description: "Something's gotten into the cellar stores. Bigger than normal rats, I'd wager." }
                ]
            }
        ]
    }
];

export const npcPortraits = {
    mercenary: createPortrait('#555555', 'scars', 'eyepatch'),
    bard: createPortrait('#9370DB', 'long_hair', 'earrings'),
    scholar: createPortrait('#8B4513', 'hood', 'glasses'),
    merchant: createPortrait('#DAA520', 'mustache', 'hat'),
    rogues: createPortrait('#2F4F4F', 'hood', 'scar'),
    martha: createPortrait('#CD853F', 'gray_hair', 'apron')
};

function createPortrait(baseColor, feature1, feature2) {
    // This would generate SVG for NPC portraits
    // In a real implementation, we would draw detailed SVG portraits here
    return `
        <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="120" fill="#333" />
            <circle cx="50" cy="40" r="30" fill="${baseColor}" />
            <text x="50" y="100" text-anchor="middle" fill="white">${feature1}</text>
            <text x="50" y="115" text-anchor="middle" fill="white">${feature2}</text>
        </svg>
    `;
}

