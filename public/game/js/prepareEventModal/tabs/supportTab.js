// Support Tab functionality
// getCurrentEventDetails can be imported from modalCore
import { getCurrentEventDetails } from '../core/modalCore.js';

export async function initSupportTab(tabElement) {
    if (!tabElement) return;

    // Initialize the support tab HTML content
    tabElement.innerHTML = `
        <div class="support-assets-grid">
            <!-- Artillery Strike -->
            <div class="support-asset-item" id="support-artillery">
                <div class="support-asset-header">
                    <img src="/icon_artillery_support.png" alt="Artillery" class="support-asset-icon">
                    <h4>Artillery Strike</h4>
                </div>
                <p class="support-asset-description">Call in an off-map artillery barrage. Effective against clustered enemies and light structures. High collateral damage risk.</p>
                <div class="support-asset-controls">
                    <label for="artillery-target-coords">Target Coordinates:</label>
                    <input type="text" id="artillery-target-coords" placeholder="e.g., R1C2-SubR3C4 or Lat/Lng">
                    <label for="artillery-strike-type">Strike Type:</label>
                    <select id="artillery-strike-type">
                        <option value="he">High Explosive (1 Salvo)</option>
                        <option value="he_3">High Explosive (3 Salvos)</option>
                        <option value="smoke">Smoke Screen</option>
                        <option value="emp">EMP Burst</option>
                    </select>
                    <button class="support-request-btn sidebar-button" data-support-type="artillery">Request Strike</button>
                </div>
                <div class="support-asset-status">Status: <span class="status-text">Available</span> <span class="cooldown-timer"></span></div>
            </div>
            <!-- Drone Reconnaissance -->
            <div class="support-asset-item" id="support-drone-recon">
                <div class="support-asset-header">
                    <img src="/icon_drone_recon.png" alt="Drone Recon" class="support-asset-icon">
                    <h4>Drone Reconnaissance</h4>
                </div>
                <p class="support-asset-description">Deploy a stealth drone to scout the target area. Reveals enemy positions and points of interest for a limited time.</p>
                <div class="support-asset-controls">
                    <label for="drone-recon-area">Target Area (Grid ID):</label>
                    <input type="text" id="drone-recon-area" placeholder="e.g., R1C2-SubR3C4">
                    <label for="drone-recon-duration">Scan Duration:</label>
                    <select id="drone-recon-duration">
                        <option value="short">Short (5 mins)</option>
                        <option value="medium">Medium (10 mins)</option>
                        <option value="long">Long (15 mins)</option>
                    </select>
                    <button class="support-request-btn sidebar-button" data-support-type="drone-recon">Deploy Drone</button>
                </div>
                <div class="support-asset-status">Status: <span class="status-text">Available</span> <span class="cooldown-timer"></span></div>
            </div>
            <!-- Air Strike -->
            <div class="support-asset-item" id="support-air-strike">
                <div class="support-asset-header">
                    <img src="/icon_air_strike.png" alt="Air Strike" class="support-asset-icon">
                    <h4>Close Air Support</h4>
                </div>
                <p class="support-asset-description">Request a fast-mover for a precision strike or strafing run. Requires clear line of sight to target area.</p>
                <div class="support-asset-controls">
                    <label for="air-strike-target-coords">Target Coordinates:</label>
                    <input type="text" id="air-strike-target-coords" placeholder="e.g., Lat/Lng">
                    <label for="air-strike-type">Attack Type:</label>
                    <select id="air-strike-type">
                        <option value="strafing">Strafing Run (Anti-Personnel)</option>
                        <option value="bombing">Precision Bombing (Anti-Structure/Vehicle)</option>
                    </select>
                    <button class="support-request-btn sidebar-button" data-support-type="air-strike">Request Air Support</button>
                </div>
                <div class="support-asset-status">Status: <span class="status-text">Unavailable</span> <span class="cooldown-timer"></span></div>
            </div>
            <!-- Resupply Drop -->
            <div class="support-asset-item" id="support-resupply">
                <div class="support-asset-header">
                    <img src="/icon_resupply_drop.png" alt="Resupply" class="support-asset-icon">
                    <h4>Resupply Drop</h4>
                </div>
                <p class="support-asset-description">Request an airdrop of essential supplies to a designated safe location.</p>
                <div class="support-asset-controls">
                    <label for="resupply-drop-location">Drop Zone Coordinates:</label>
                    <input type="text" id="resupply-drop-location" placeholder="e.g., Lat/Lng (Safe Zone)">
                    <label for="resupply-package-type">Package Type:</label>
                    <select id="resupply-package-type">
                        <option value="ammo">Ammunition Pack</option>
                        <option value="medical">Medical Supplies</option>
                        <option value="general">General Purpose Gear</option>
                    </select>
                    <button class="support-request-btn sidebar-button" data-support-type="resupply">Request Resupply</button>
                </div>
                <div class="support-asset-status">Status: <span class="status-text">Available</span> <span class="cooldown-timer"></span></div>
            </div>
            <!-- Medevac -->
            <div class="support-asset-item" id="support-medevac">
                <div class="support-asset-header">
                    <img src="/icon_medevac.png" alt="Medevac" class="support-asset-icon">
                    <h4>Medevac Extraction</h4>
                </div>
                <p class="support-asset-description">Request emergency medical evacuation for critically wounded personnel. Requires secure LZ.</p>
                <div class="support-asset-controls">
                    <label for="medevac-pickup-location">Pickup LZ Coordinates:</label>
                    <input type="text" id="medevac-pickup-location" placeholder="e.g., Lat/Lng (Secure LZ)">
                    <label for="medevac-priority">Priority Level:</label>
                    <select id="medevac-priority">
                        <option value="urgent">Urgent (Life Threatening)</option>
                        <option value="priority">Priority (Serious Injury)</option>
                    </select>
                    <button class="support-request-btn sidebar-button" data-support-type="medevac">Request Medevac</button>
                </div>
                <div class="support-asset-status">Status: <span class="status-text">Unavailable</span> <span class="cooldown-timer"></span></div>
            </div>
        </div>
    `;

    // Setup support request buttons
    tabElement.querySelectorAll('.support-request-btn').forEach(btn => {
        if (!btn.dataset.listenerAttached) {
            btn.addEventListener('click', handleSupportRequest);
            btn.dataset.listenerAttached = 'true';
        }
    });
}

export function handleSupportRequest(event) {
    const button = event.target;
    const supportType = button.dataset.supportType;
    const supportItem = button.closest('.support-asset-item');
    const statusTextElement = supportItem.querySelector('.status-text');
    const cooldownTimerElement = supportItem.querySelector('.cooldown-timer');

    if (statusTextElement.textContent === 'On Cooldown' || statusTextElement.textContent === 'Unavailable') {
        alert(`${supportType.replace('-', ' ')} support is currently unavailable or on cooldown.`);
        return;
    }

    // Simulate request and cooldown
    console.log(`Support request: ${supportType}`);
    statusTextElement.textContent = 'Requested...';
    button.disabled = true;

    setTimeout(() => {
        statusTextElement.textContent = 'On Cooldown';
        let cooldown = 60; // 60 seconds cooldown
        if (supportType === 'air-strike' || supportType === 'medevac') { // Longer cooldown for heavy assets
            cooldown = 120;
        }
        cooldownTimerElement.textContent = `(${cooldown}s)`;
        
        const intervalId = setInterval(() => {
            cooldown--;
            cooldownTimerElement.textContent = `(${cooldown}s)`;
            if (cooldown <= 0) {
                clearInterval(intervalId);
                statusTextElement.textContent = 'Available';
                cooldownTimerElement.textContent = '';
                button.disabled = false;
            }
        }, 1000);
    }, 2000); // Simulate API call delay
}