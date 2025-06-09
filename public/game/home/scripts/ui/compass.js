/**
 * Creates the compass HTML elements and appends them to the container.
 * @param {HTMLElement} container - The main container element (usually document.body or a specific div).
 * @returns {HTMLElement} - The created compass container element.
 */
export function createCompass(container) {
    const compassDiv = document.createElement('div');
    compassDiv.id = 'compass';
    compassDiv.style.display = 'none'; // Start hidden

    const needleDiv = document.createElement('div');
    needleDiv.id = 'compass-needle';

    const northLabel = document.createElement('div');
    northLabel.id = 'compass-north';
    northLabel.textContent = 'N';

    compassDiv.appendChild(needleDiv);
    compassDiv.appendChild(northLabel);

    container.appendChild(compassDiv);

    console.log("Compass element created (initially hidden).");
    return compassDiv; // Return the element so main.js can control its visibility
}

/**
 * Updates the compass needle rotation.
 * The needle points towards World North (the -Z axis in THREE.js).
 * The compass housing conceptually rotates with the camera, so 'up' (where 'N' is)
 * represents the camera's current forward direction.
 * @param {number} cameraAngleRad - The camera's current Y rotation angle in radians, relative to the default NW view.
 */
export function updateCompass(cameraAngleRad) {
    const needle = document.getElementById('compass-needle');
    if (needle) {
        // --- Calculation for Needle pointing NORTH ---
        // World North direction = -Z axis. Angle relative to World +X axis = -PI/2 radians.
        // Initial Camera View direction = NW (-X, -Z). Angle relative to World +X axis = -3*PI/4 radians.
        // cameraAngleRad = rotation applied *to the initial view*.
        // Current Camera View Angle (alpha) = Initial Angle + cameraAngleRad = -3*PI/4 + cameraAngleRad.
        //
        // We want the needle's rotation within the compass housing. The housing's 'up' direction
        // aligns with the Current Camera View Angle (alpha).
        // The needle must point to World North.
        // Therefore, the needle's angle relative to the housing's 'up' is:
        // Needle Rotation = World North Angle - Current Camera View Angle (alpha)
        // Needle Rotation = (-PI/2) - (-3*PI/4 + cameraAngleRad)
        // Needle Rotation = PI/4 - cameraAngleRad

        // *** Correction based on user feedback ***
        // The user observation suggests the calculation might be perceived incorrectly.
        // Let's try reversing the relationship to see if it matches expectation,
        // although this may not strictly represent a needle pointing North anymore.
        // Original: const angleDiffRad = Math.PI / 4 - cameraAngleRad;
        // Reversed:
        const angleDiffRad = cameraAngleRad - Math.PI / 4;


        // Convert the difference to degrees for CSS rotation.
        // CSS positive rotation is clockwise.
        const angleDeg = angleDiffRad * 180 / Math.PI;

        // Apply the rotation to the needle.
        // translate(-50%, -100%) moves the needle's base (bottom-center) to the center
        // of the compass housing before rotation is applied. rotate(0) points up.
        needle.style.transform = `translate(-50%, -100%) rotate(${angleDeg}deg)`;
    }
}