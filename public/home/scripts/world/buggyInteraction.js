// Reference to the buggy object
let buggyObject = null;

// Will be set by the game when initializing
let showPopup = null;

// Distance within which the player can interact with the buggy
const BUGGY_INTERACTION_DISTANCE = 3.0;

/**
 * Initialize the buggy interaction system
 * @param {THREE.Object3D} buggy - The buggy object to interact with
 */
// Function declarations
export function initBuggyInteraction(buggy, popupFunction) {
    buggyObject = buggy;
    showPopup = popupFunction || window.showPopup; // Use provided function or fallback to global
    console.log('Buggy interaction system initialized', {
        buggyPosition: buggy ? buggy.position : 'no buggy',
        hasPopupFn: !!showPopup
    });
}



/**
 * Check if player is near the buggy
 * @param {THREE.Object3D} player - The player object
 * @returns {boolean} True if player is close enough to interact with the buggy
 */
function isPlayerNearBuggy(player) {
    if (!buggyObject || !player) {
        console.log('isPlayerNearBuggy: Missing buggy or player', { hasBuggy: !!buggyObject, hasPlayer: !!player });
        return false;
    }
    
    const distance = player.position.distanceTo(buggyObject.position);
    const isNear = distance <= BUGGY_INTERACTION_DISTANCE;
    console.log('Player distance to buggy:', { 
        distance, 
        threshold: BUGGY_INTERACTION_DISTANCE,
        isNear,
        buggyPos: buggyObject.position,
        playerPos: player.position
    });
    return isNear;
}

/**
 * Handle the buggy interaction
 * @param {THREE.Object3D} player - The player object
 * @returns {Promise<boolean>} True if interaction was handled
 */
export async function interactWithBuggy(player) {
    console.log('interactWithBuggy called', { 
        buggyObject: !!buggyObject, 
        showPopup: !!showPopup,
        player: !!player
    });
    
    if (!buggyObject || !player) {
        console.warn('Buggy interaction missing required objects', { 
            hasBuggy: !!buggyObject, 
            hasPlayer: !!player 
        });
        return false;
    }
    
    // Show popup to enter the buggy
    const response = await showPopup({
        title: 'Dune Buggy',
        html: 'Would you like to enter the dune buggy?',
        buttons: [
            { label: 'No', value: 'no' },
            { label: 'Yes', value: 'yes' }
        ]
    });

    if (response === 'yes') {
        enterBuggy();
        return true;
    }
    
    return false;
}

/**
 * Handle entering the buggy
 */
function enterBuggy() {
    console.log('Player entered the buggy');
    // TODO: Implement buggy entry logic
    // This will be expanded later to handle camera changes, controls, etc.
}

// Make functions globally available when this module is loaded
if (typeof window !== 'undefined') {
    window.initBuggyInteraction = initBuggyInteraction;
    window.interactWithBuggy = interactWithBuggy;
    window.canInteractWithBuggy = canInteractWithBuggy;
    console.log('Buggy interaction functions registered globally');
}

/**
 * Check if the player can interact with the buggy
 * @param {THREE.Object3D} player - The player object
 * @returns {boolean} True if the player can interact with the buggy
 */
export function canInteractWithBuggy(player) {
    if (!buggyObject || !player) {
        console.log('canInteractWithBuggy: Missing buggy or player', { 
            hasBuggy: !!buggyObject, 
            hasPlayer: !!player 
        });
        return false;
    }
    return isPlayerNearBuggy(player);
}
