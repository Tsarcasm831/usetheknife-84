import * as THREE from 'three';
import { npcData, npcPortraits } from './npcs.js';
import { scene, camera } from './scene.js';
import { snapToGridCenter } from './grid.js';

let npcs = [];
let interactableObjects = [];
let interactionTarget = null;
// Increase interaction distance slightly
const interactionDistance = 2.5;

// NPCs associated with dining tables (by index corresponding to furniture.js tablePositions)
// Remove 'bard' so she doesn't get assigned to a chair
const diningTableNpcIds = ['mercenary', /*'bard',*/ 'scholar', 'merchant', 'rogues'];

/**
 * Creates NPCs, positioning them at chairs if chairData is provided.
 * @param {Array<Array<{position: {x: number, y: number, z: number}, rotation: number}>>} [chairData] - Optional chair data from createFurniture.
 */
export function createNPCs(chairData = []) {
    const charactersData = [
        // Original positions used only if chairData is missing or for NPCs not at tables
        {
            id: 'mercenary',
            name: 'Gruff Mercenary',
            originalPosition: { x: 2, y: 0, z: -2 }, // Keep original as fallback/reference
            originalRotation: Math.PI / 4,
            color: 0x555555,
            collidable: true
        },
        {
            id: 'bard',
            name: 'Lyra the Half-Elf',
            // New position based on grid (16, 5) -> world (6.5, -4.5)
            originalPosition: { x: 6.5, y: 0, z: -4.5 },
            originalRotation: -Math.PI / 1.5, // Face slightly outwards/towards center
            color: 0x9370DB,
            collidable: true
        },
        {
            id: 'scholar',
            name: 'Eldrin the Scholar',
            originalPosition: { x: 0, y: 0, z: 1 },
            originalRotation: Math.PI,
            color: 0x8B4513,
            collidable: true
        },
        {
            id: 'merchant',
            name: 'Pock the Merchant',
            originalPosition: { x: -2, y: 0, z: 2 },
            originalRotation: -Math.PI / 2,
            color: 0xDAA520,
            collidable: true
        },
        {
            id: 'rogues',
            name: 'Shady Rogues',
            originalPosition: { x: -4, y: 0, z: 0 },
            originalRotation: Math.PI / 3,
            color: 0x2F4F4F,
            collidable: true
        },
        { // Martha remains in her original spot
            id: 'martha',
            name: 'Martha',
            originalPosition: { x: -4.5, y: 0, z: -4.5 },
            originalRotation: Math.PI,
            color: 0xCD853F,
            collidable: true
        }
    ];

    charactersData.forEach((charData, index) => {
        const npcInfo = npcData.find(npc => npc.id === charData.id);
        if (npcInfo) {
            let finalPosition = { ...charData.originalPosition }; // Default to original
            let finalRotation = charData.originalRotation;

            // Check if this NPC should be at a dining table and if data exists
            const tableIndex = diningTableNpcIds.indexOf(charData.id); // Will be -1 for 'bard' now
            if (tableIndex !== -1 && chairData && chairData.length > tableIndex && chairData[tableIndex].length > 0) {
                // Assign to the first chair of the corresponding table
                const assignedChair = chairData[tableIndex][0];
                finalPosition = { ...assignedChair.position };
                finalRotation = assignedChair.rotation;
                // Lower the NPC slightly to simulate sitting
                finalPosition.y -= 0.1;
                console.log(`Positioning ${charData.name} at chair for table ${tableIndex}:`, finalPosition, `Rotation: ${finalRotation.toFixed(2)}`);
            } else if (tableIndex !== -1) {
                // This warning should no longer trigger for 'bard'
                console.warn(`Chair data missing or insufficient for ${charData.name} at table index ${tableIndex}. Using original position.`);
            } else {
                 // Log for NPCs not assigned to chairs (including bard)
                 console.log(`Using original/specified position for ${charData.name}:`, finalPosition, `Rotation: ${finalRotation.toFixed(2)}`);
            }

            const npc = createNPC({
                ...charData,
                ...npcInfo,
                position: finalPosition, // Use the calculated final position
                rotation: finalRotation // Use the calculated final rotation
            });
            npcs.push(npc);
            addInteractable(npc);
        }
    });
}

export function addInteractable(object) {
    if (object && object.userData && object.userData.id && object.position) {
        interactableObjects.push(object);
        // console.log(`Added interactable: ${object.userData.id}`); // Less verbose logging
    } else {
        console.warn("Attempted to add invalid interactable object:", object);
    }
}

function createNPC(data) {
    const npc = new THREE.Group();
    npc.userData = { ...data };
    npc.userData.isNPCGroup = true;
    npc.userData.collidable = data.collidable;
    npc.userData.type = 'npc';

    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.7,
        metalness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75; // Keep body relative position within group
    body.castShadow = true;
    body.userData.collidable = true;
    body.name = `${data.id}_body`; // Give body a name for potential collision debugging
    npc.add(body);

    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0xE0AC69,
        roughness: 0.7,
        metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.65; // Keep head relative position within group
    head.castShadow = true;
    npc.add(head);

    // Set the group's position and rotation
    npc.position.set(data.position.x, data.position.y, data.position.z);
    npc.rotation.y = data.rotation;

    scene.add(npc);

    return npc;
}

export function initializeInteractionSystem() {
    window.addEventListener('animation-frame', updateInteraction);

    window.addEventListener('interaction-key-pressed', () => {
        if (interactionTarget) {
            interact();
        }
    });

    window.addEventListener('escape-key-pressed', () => {
        const dialogVisible = !document.getElementById('dialog-container').classList.contains('hidden');
        const tradeVisible = !document.getElementById('trade-ui').classList.contains('hidden');

        if (dialogVisible || tradeVisible) {
            document.getElementById('dialog-container').classList.add('hidden');
            document.getElementById('trade-ui').classList.add('hidden');
            window.dispatchEvent(new CustomEvent('enable-movement'));
        }
    });

    document.querySelector('.dialog-close').addEventListener('click', () => {
        document.getElementById('dialog-container').classList.add('hidden');
        window.dispatchEvent(new CustomEvent('enable-movement'));
    });

    document.querySelector('.trade-close').addEventListener('click', () => {
        document.getElementById('trade-ui').classList.add('hidden');
        window.dispatchEvent(new CustomEvent('enable-movement'));
    });
}

function updateInteraction() {
    const dialogVisible = !document.getElementById('dialog-container').classList.contains('hidden');
    const tradeVisible = !document.getElementById('trade-ui').classList.contains('hidden');
    if (dialogVisible || tradeVisible) {
        document.getElementById('interaction-prompt').classList.add('hidden');
        interactionTarget = null;
        return;
    }

    const playerPosition = camera.position.clone();
    interactionTarget = null;
    let closestDistance = Infinity;

    interactableObjects.forEach(obj => {
        // Calculate distance to the object's world position
        const objWorldPosition = new THREE.Vector3();
        obj.getWorldPosition(objWorldPosition); // Get world position for groups/nested objects

        const distance = playerPosition.distanceTo(objWorldPosition);

        if (distance < interactionDistance && distance < closestDistance) {
            interactionTarget = obj;
            closestDistance = distance;
        }
    });

    const prompt = document.getElementById('interaction-prompt');
    if (interactionTarget) {
        prompt.classList.remove('hidden');
    } else {
        prompt.classList.add('hidden');
    }
}

function interact() {
    if (!interactionTarget) return;

    const targetData = interactionTarget.userData;

    if (typeof targetData.interact === 'function') {
        targetData.interact();
    } else if (targetData.type === 'npc') {
        showNpcDialog(targetData);
    }
}

function showNpcDialog(npcData) {
    const dialogContainer = document.getElementById('dialog-container');
    const dialogName = document.querySelector('.dialog-name');
    const dialogText = document.querySelector('.dialog-text');
    const dialogOptions = document.querySelector('.dialog-options');
    const dialogPortrait = document.querySelector('.dialog-portrait');

    dialogOptions.innerHTML = '';

    dialogName.textContent = npcData.name;

    if (npcPortraits[npcData.id]) {
        dialogPortrait.innerHTML = npcPortraits[npcData.id];
    } else {
        dialogPortrait.innerHTML = '';
    }

    const randomLine = npcData.dialog[Math.floor(Math.random() * npcData.dialog.length)];
    dialogText.textContent = randomLine;

    if (npcData.isInteractive && npcData.options) {
        npcData.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'dialog-option';
            button.textContent = option.text;
            button.addEventListener('click', () => handleNpcOption(option.action, npcData));
            dialogOptions.appendChild(button);
        });
    }

    dialogContainer.classList.remove('hidden');
    window.dispatchEvent(new CustomEvent('disable-movement'));
}

function handleNpcOption(action, npcData) {
    const dialogText = document.querySelector('.dialog-text');
    const dialogOptions = document.querySelector('.dialog-options');

    switch(action) {
        case 'talk':
            const talkOption = npcData.options.find(opt => opt.action === 'talk');
            if (talkOption && talkOption.responses && talkOption.responses.length > 0) {
                const randomResponse = talkOption.responses[Math.floor(Math.random() * talkOption.responses.length)];
                dialogText.textContent = randomResponse;
            } else {
                dialogText.textContent = "Martha thinks for a moment. 'Not much else to report right now.'";
            }
            dialogOptions.innerHTML = '';
            break;

        case 'trade':
            document.getElementById('dialog-container').classList.add('hidden');
            document.getElementById('trade-ui').classList.remove('hidden');
            populateTradeItems(npcData);
            break;

        case 'work':
            const workOption = npcData.options.find(opt => opt.action === 'work');
            dialogOptions.innerHTML = '';

            if (workOption && workOption.jobs && workOption.jobs.length > 0) {
                dialogText.textContent = "Martha considers. 'Alright, which job interests you?'";
                workOption.jobs.forEach(job => {
                    const jobButton = document.createElement('button');
                    jobButton.className = 'dialog-option';
                    jobButton.textContent = `${job.name} (${job.reward})`;
                    jobButton.title = job.description;
                    jobButton.addEventListener('click', () => {
                        dialogText.textContent = `Okay, get started on the ${job.name.toLowerCase()}. Let me know when you're done.`;
                        dialogOptions.innerHTML = '';
                    });
                    dialogOptions.appendChild(jobButton);
                });
                const backButton = document.createElement('button');
                backButton.className = 'dialog-option';
                backButton.textContent = "Nevermind";
                backButton.addEventListener('click', () => {
                    showNpcDialog(npcData); // Go back to main dialog
                });
                dialogOptions.appendChild(backButton);
            } else {
                dialogText.textContent = "Martha shakes her head. 'No work available right now, sorry.'";
                dialogOptions.innerHTML = '';
            }
            break;
    }
}

function populateTradeItems(npcData) {
    const provisions = document.querySelector('#provisions .trade-items');
    const weapons = document.querySelector('#weapons .trade-items');
    const trinkets = document.querySelector('#trinkets .trade-items');

    provisions.innerHTML = '';
    weapons.innerHTML = '';
    trinkets.innerHTML = '';

    const tradeOption = npcData.options.find(opt => opt.action === 'trade');

    function createItemElements(items, container) {
        if (!items || items.length === 0) {
            container.innerHTML = '<div class="no-items">None in stock.</div>';
            return;
        }
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'trade-item';
            itemElement.title = item.description || '';

            const icon = getIconForItem(item.name);

            itemElement.innerHTML = `
                <div class="trade-item-icon">${icon}</div>
                <div class="trade-item-details">
                    <div class="trade-item-name">${item.name}</div>
                    <div class="trade-item-price">${item.price}</div>
                </div>
            `;
            itemElement.addEventListener('click', () => {
                console.log(`Clicked on ${item.name} - Buy action needed`);
                // Placeholder for buy logic
            });

            container.appendChild(itemElement);
        });
    }

    if (tradeOption && tradeOption.items) {
        createItemElements(tradeOption.items.provisions, provisions);
        createItemElements(tradeOption.items.weapons, weapons);
        createItemElements(tradeOption.items.trinkets, trinkets);
    } else {
        provisions.innerHTML = '<div class="no-items">Martha has nothing to trade right now.</div>';
        weapons.innerHTML = '<div class="no-items"></div>';
        trinkets.innerHTML = '<div class="no-items"></div>';
    }
}

function getIconForItem(itemName) {
    const iconMap = {
        "Loaf of Bread": "🍞",
        "Wheel of Cheese": "🧀",
        "Dried Meat": "🥩",
        "Ale Tankard": "🍺",
        "Wine Bottle": "🍷",
        "Rusty Dagger": "🗡️",
        "Battered Crossbow": "🏹",
        "Iron Buckler": "🛡️",
        "Hunter's Bow": "🏹",
        "Lucky Rabbit's Foot": "🐇",
        "Ancient Coin": "🪙",
        "Strange Rune": "🔮",
        "Traveler's Map": "🗺️",
        "Mysterious Key": "🔑"
    };

    return iconMap[itemName] || "📦";
}