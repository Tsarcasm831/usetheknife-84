// Manages the Prometheus Unit Display Modal

export function initPrometheusModal() {
  const prometheusBtn = document.getElementById('prometheus-btn');
  const modalsRoot = document.getElementById('modals-root');
  
  let prometheusModal = document.getElementById('prometheus-modal');
  
  // Ensure the modal container div exists
  if (!prometheusModal) {
    if (modalsRoot) {
      prometheusModal = document.createElement('div');
      prometheusModal.id = 'prometheus-modal';
      modalsRoot.appendChild(prometheusModal);
    } else {
      console.error("#modals-root not found. Cannot create Prometheus modal.");
      return;
    }
  }
  
  // Always define or redefine the inner structure of the modal.
  // This ensures that even if #prometheus-modal exists but is empty or has placeholder comments,
  // it gets the correct internal structure.
  prometheusModal.innerHTML = `
    <div class="prometheus-modal-content">
      <span class="prometheus-modal-close-btn" id="close-prometheus-modal">&times;</span>
      <h2>Prometheus I.A.I. Units</h2>
      <div id="prometheus-units-list-container">
        <!-- Units will be populated here by JS -->
      </div>
    </div>
  `;
  
  // Get references to elements querySelector scoped to the modal for safety
  const closePrometheusModalBtn = prometheusModal.querySelector('#close-prometheus-modal');
  const prometheusUnitsListContainer = prometheusModal.querySelector('#prometheus-units-list-container');

  if (prometheusBtn && prometheusModal && closePrometheusModalBtn && prometheusUnitsListContainer) {
    prometheusBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('/json/factions/prometheus_units.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch prometheus_units.json: ${response.status} ${response.statusText}`);
        }
        const prometheusData = await response.json();
        
        prometheusUnitsListContainer.innerHTML = ''; // Clear previous content

        // The JSON is an array of objects, not an object with a "troops" property.
        // Directly use prometheusData if it's the array.
        // Assuming the structure from provided prometheus_units.json is an array.
        const troopsArray = Array.isArray(prometheusData) ? prometheusData : (prometheusData.troops || []);


        if (troopsArray.length > 0) {
          const versionOrder = { "Base": 1, "Superior": 2, "Elite": 3 };
          // Ensure troop objects have a 'name' property for sorting, not 'Troop'
          const sortedTroops = [...troopsArray].sort((a, b) => {
            const nameA = a.name || a.Troop; // Handle potential 'Troop' key
            const nameB = b.name || b.Troop;
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return (versionOrder[a.version || a.Version] || 99) - (versionOrder[b.version || b.Version] || 99);
          });

          sortedTroops.forEach(troop => {
            const troopName = troop.name || troop.Troop;
            const troopVersion = troop.version || troop.Version;

            const unitNameForFile = troopName.replace(/\./g, '').replace(/ /g, '_');
            const imageName = `${unitNameForFile}_${troopVersion}.png`;
            // Corrected path to use 'prometheus' (lowercase) as per existing assets.
            const imagePath = `/assets/factions/prometheus/${imageName}`;


            const unitItem = document.createElement('div');
            unitItem.classList.add('fdg-unit-item'); 
            unitItem.classList.add(`prometheus-unit-version-${troopVersion.toLowerCase()}`);

            const imageContainer = document.createElement('div');
            imageContainer.className = 'fdg-unit-image-container'; 

            const img = document.createElement('img');
            img.src = imagePath;
            img.alt = `${troopName} ${troopVersion}`;
            
            img.onerror = function() {
              if (this.parentElement) {
                // Clear parent and add error text
                this.parentElement.innerHTML = `<p class="image-not-found">Image Not Found</p>`;
              }
            };
            imageContainer.appendChild(img);

            const nameHeader = document.createElement('h3');
            nameHeader.textContent = troopName;

            const versionPara = document.createElement('p');
            versionPara.className = 'unit-version';
            versionPara.textContent = `${troopVersion} Version`;

            const statsDiv = document.createElement('div');
            statsDiv.className = 'unit-stats';
            
            const statsContent = `
              <p><strong>Health:</strong> <span>${troop.Health || troop.health || 'N/A'}</span></p>
              <p><strong>Initiative:</strong> <span>${troop.Initiative || troop.initiative || 'N/A'}</span></p>
              <p><strong>Range:</strong> <span>${troop.Range || troop.range || 'N/A'}</span></p>
              <p><strong>Hit Chance:</strong> <span>${troop.Chance_to_Hit || troop.chance_to_hit || 'N/A'}%</span></p>
            `;
            statsDiv.innerHTML = statsContent;

            unitItem.appendChild(imageContainer);
            unitItem.appendChild(nameHeader);
            unitItem.appendChild(versionPara);
            unitItem.appendChild(statsDiv);
            
            prometheusUnitsListContainer.appendChild(unitItem);
          });
        } else {
            prometheusUnitsListContainer.innerHTML = '<p style="color:yellow; text-align:center;">No Prometheus units found in data.</p>';
        }
        
        prometheusModal.classList.add('active');
      } catch (error) {
        console.error('Error loading or processing Prometheus data:', error);
        prometheusUnitsListContainer.innerHTML = '<p style="color:red; text-align:center;">Error loading unit data. Please try again later.</p>';
        if(prometheusModal) prometheusModal.classList.add('active'); // Ensure modal shows even on error
      }
    });

    closePrometheusModalBtn.addEventListener('click', () => {
      prometheusModal.classList.remove('active');
    });

    window.addEventListener('click', (event) => {
      if (event.target === prometheusModal) {
        prometheusModal.classList.remove('active');
      }
    });
  } else {
    console.error('Prometheus Modal UI elements (button, close button, or container) not found after setting innerHTML. Check IDs.');
    if (!prometheusBtn) console.error("Prometheus button ('prometheus-btn') not found.");
    if (!closePrometheusModalBtn) console.error("Close button ('close-prometheus-modal') within modal not found.");
    if (!prometheusUnitsListContainer) console.error("Units container ('prometheus-units-list-container') within modal not found.");
  }
}