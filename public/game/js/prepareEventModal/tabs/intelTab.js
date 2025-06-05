// Intel Tab functionality
// getCurrentEventDetails can be imported from modalCore
import { getCurrentEventDetails } from '../core/modalCore.js';

export async function initIntelTab(tabElement) {
    if (!tabElement) return;

    // Initialize the intel tab HTML content
    tabElement.innerHTML = `
        <div class="intel-grid">
            <div class="intel-section enemy-analysis">
                <h4>Enemy Analysis</h4>
                <p>Local chatter suggests increased activity from the 'Scrap Kings' scavenger gang. Typically armed with makeshift ballistic weapons and light melee. Potential for one or two heavily mutated individuals.</p>
                <div id="enemy-units-preview"> 
                    <p><em>Known Enemy Units: Scavenger (Low Threat), Mutant Brute (Medium Threat)</em></p>
                </div>
            </div>
            <div class="intel-section known-threats">
                <h4>Known Threats & Hazards</h4>
                <ul>
                    <li>Reported sniper activity from derelict high-rises.</li>
                    <li>Unstable structures - risk of collapse.</li>
                    <li>Possible booby traps in high-value areas.</li>
                </ul>
            </div>
            <div class="intel-section environmental-factors">
                <h4>Environmental Factors</h4>
                <p><strong>Time of Day:</strong> <span id="intel-time-of-day">14:00 Local (Daylight)</span></p>
                <p><strong>Weather Forecast:</strong> <span id="intel-weather">Overcast, light drizzle expected.</span></p>
                <p><strong>Light Conditions:</strong> <span id="intel-light">Moderate. Reduced visibility in rain.</span></p>
            </div>
            <div class="intel-section subgrid-snapshot">
                <h4>Subgrid Tactical Snapshot</h4>
                <button id="import-subgrid-snapshot-btn" class="sidebar-button">Import Subgrid Snapshot</button>
                <div id="subgrid-snapshot-container">
                    <p><em>Click button above to import map snapshot. Requires a subgrid cell to be selected on the main map.</em></p>
                    <img id="subgrid-snapshot-img" src="#" alt="Subgrid Snapshot" style="display:none; max-width: 100%; border: 1px solid #555; margin-top: 10px;">
                </div>
            </div>
            <div class="intel-section intel-reports">
                <h4>Field Reports & Comms Intercepts</h4>
                <textarea id="intel-reports-display" readonly rows="6">
LAST KNOWN TRANSMISSION (UNIT 7B): "...ambush... heavy fire... need immediate... static..."
LOCAL INFORMANT: "Scrap Kings got bolder. Took over the old highway exchange. Watch your back."
FDG PATROL LOG (ALPHA-3): "Unusual energy readings detected sector 7-Gamma. Recommend caution."
                </textarea>
            </div>
        </div>
    `;

    // Setup snapshot button listener
    const importSnapshotBtn = tabElement.querySelector('#import-subgrid-snapshot-btn');
    if (importSnapshotBtn) {
        importSnapshotBtn.addEventListener('click', importSubgridSnapshot);
        importSnapshotBtn.dataset.listenerAttached = 'true';
    }
}

export async function importSubgridSnapshot() {
    const snapshotContainer = document.getElementById('subgrid-snapshot-container');
    const snapshotImg = document.getElementById('subgrid-snapshot-img');
    const importButton = document.getElementById('import-subgrid-snapshot-btn');

    if (!snapshotContainer || !snapshotImg || !importButton) {
        console.error("Snapshot elements not found in Intel tab.");
        return;
    }

    if (!window.mapInstance || !window.subgridModule) {
        snapshotContainer.querySelector('p').textContent = "Error: Map or Subgrid module not available.";
        return;
    }

    const subCellData = window.subgridModule.getSelectedSubCellData();
    if (!subCellData || !subCellData.bounds) {
        snapshotContainer.querySelector('p').textContent = "No subgrid cell selected. Please scan and select a cell on the map first.";
        return;
    }

    importButton.textContent = "Generating Snapshot...";
    importButton.disabled = true;
    snapshotContainer.querySelector('p').style.display = 'none'; // Hide initial message

    const map = window.mapInstance;
    const originalCenter = map.getCenter();
    const originalZoom = map.getZoom();

    // Hide controls that might overlap or look bad in snapshot
    const controlsToHide = ['.leaflet-control-zoom', '.leaflet-control-layers', '.leaflet-control-scale', '#toolbar', '#right-sidebar'];
    controlsToHide.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.style.visibility = 'hidden';
    });
    
    // Ensure map pane has a defined background
    const mapPane = map.getPane('mapPane');
    const originalMapPaneBg = mapPane.style.backgroundColor;
    mapPane.style.backgroundColor = '#f0f0f0'; // A light background

    map.fitBounds(subCellData.bounds, { 
        padding: [10, 10], // Minimal padding
        animate: false // No animation for faster capture
    });

    // Give map time to redraw after fitBounds
    setTimeout(() => {
        html2canvas(document.getElementById('map'), { 
            useCORS: true, 
            allowTaint: true,
            logging: false,
            backgroundColor: null
        }).then(canvas => {
            snapshotImg.src = canvas.toDataURL('image/png');
            snapshotImg.style.display = 'block';
            
            // Restore map view and UI elements
            map.setView(originalCenter, originalZoom, { animate: false });

            controlsToHide.forEach(selector => {
                const el = document.querySelector(selector);
                if (el) el.style.visibility = 'visible';
            });
            mapPane.style.backgroundColor = originalMapPaneBg;

            importButton.textContent = "Re-Import Snapshot";
            importButton.disabled = false;

        }).catch(error => {
            console.error("Error generating subgrid snapshot:", error);
            snapshotContainer.querySelector('p').textContent = "Error generating snapshot. See console for details.";
            snapshotContainer.querySelector('p').style.display = 'block';
            snapshotImg.style.display = 'none';
            
            // Restore map view and UI elements on error
            map.setView(originalCenter, originalZoom, { animate: false });
            controlsToHide.forEach(selector => {
                const el = document.querySelector(selector);
                if (el) el.style.visibility = 'visible';
            });
            mapPane.style.backgroundColor = originalMapPaneBg;
            
            importButton.textContent = "Import Subgrid Snapshot";
            importButton.disabled = false;
        });
    }, 500); // Increased delay for map rendering
}