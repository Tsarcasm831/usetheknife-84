// Manages the H.I.V.E. Unit Display Modal

export function initHiveModal() {
  const hiveBtn = document.getElementById('hive-btn');
  const modalsRoot = document.getElementById('modals-root');

  let hiveModal = document.getElementById('hive-modal');
  if (!hiveModal && modalsRoot) {
    hiveModal = document.createElement('div');
    hiveModal.id = 'hive-modal';
    hiveModal.innerHTML = `
      <div class="hive-modal-content">
        <span class="hive-modal-close-btn" id="close-hive-modal">&times;</span>
        <h2>Human Intervention Victory Enclave (H.I.V.E.) Units</h2>
        <div id="hive-units-list-container">
          <!-- Units will be populated here by JS -->
        </div>
      </div>
    `;
    modalsRoot.appendChild(hiveModal);
    hiveModal = document.getElementById('hive-modal'); // Re-fetch after appending
  }
  
  const closeHiveModalBtn = document.getElementById('close-hive-modal');
  const hiveUnitsListContainer = document.getElementById('hive-units-list-container');


  if (hiveBtn && hiveModal && closeHiveModalBtn && hiveUnitsListContainer) {
    hiveBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('/json/factions/hive.json'); // Fetching data from the correct path
        if (!response.ok) {
          throw new Error(`Failed to fetch hive.json: ${response.status} ${response.statusText}`);
        }
        const hiveData = await response.json();
        
        hiveUnitsListContainer.innerHTML = ''; 

        if (hiveData && hiveData.troops) {
          const versionOrder = { "Base": 1, "Superior": 2, "Elite": 3 };
          const sortedTroops = [...hiveData.troops].sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return (versionOrder[a.version] || 99) - (versionOrder[b.version] || 99);
          });

          sortedTroops.forEach(troop => {
            const unitNameForFile = troop.name.replace(/\./g, '').replace(/ /g, '_'); 
            const imageName = `${unitNameForFile}_${troop.version}.png`;
            const imagePath = `/assets/HIVE/${imageName}`; // Path already absolute

            const unitItem = document.createElement('div');
            unitItem.classList.add('fdg-unit-item'); 
            unitItem.classList.add(`hive-unit-version-${troop.version.toLowerCase()}`);

            const imageContainer = document.createElement('div');
            imageContainer.className = 'fdg-unit-image-container'; 

            const img = document.createElement('img');
            img.src = imagePath;
            img.alt = `${troop.name} ${troop.version}`;
            
            img.onerror = function() {
              if (this.parentElement) {
                while (this.parentElement.firstChild) {
                  this.parentElement.removeChild(this.parentElement.firstChild);
                }
                const errorText = document.createElement('p');
                errorText.className = 'image-not-found'; 
                errorText.textContent = 'Image Not Found';
                this.parentElement.appendChild(errorText);
              }
            };
            imageContainer.appendChild(img);

            const nameHeader = document.createElement('h3');
            nameHeader.textContent = troop.name;

            const versionPara = document.createElement('p');
            versionPara.className = 'unit-version'; 
            versionPara.textContent = `${troop.version} Version`;

            const statsDiv = document.createElement('div');
            statsDiv.className = 'unit-stats'; 
            
            const statsContent = `
              <p><strong>Health:</strong> <span>${troop.health || 'N/A'}</span></p>
              <p><strong>Initiative:</strong> <span>${troop.initiative || 'N/A'}</span></p>
              <p><strong>Range:</strong> <span>${troop.range || 'N/A'}</span></p>
              <p><strong>Hit Chance:</strong> <span>${troop.chance_to_hit || 'N/A'}%</span></p>
            `;
            statsDiv.innerHTML = statsContent;

            unitItem.appendChild(imageContainer);
            unitItem.appendChild(nameHeader);
            unitItem.appendChild(versionPara);
            unitItem.appendChild(statsDiv);
            
            hiveUnitsListContainer.appendChild(unitItem);
          });
        }
        hiveModal.classList.add('active'); 
      } catch (error) {
        console.error('Error loading or processing HIVE data:', error);
        hiveUnitsListContainer.innerHTML = '<p style="color:red; text-align:center;">Error loading unit data. Please try again later.</p>';
        hiveModal.classList.add('active');
      }
    });

    closeHiveModalBtn.addEventListener('click', () => {
      hiveModal.classList.remove('active');
    });

    window.addEventListener('click', (event) => {
      if (event.target === hiveModal) {
        hiveModal.classList.remove('active');
      }
    });
  } else {
    console.error('HIVE Modal UI elements not found. Check IDs and modal structure.');
    if (!hiveBtn) console.error('HIVE button ("hive-btn") not found.');
    if (!hiveModal) console.error('HIVE modal ("hive-modal") not found.');
    if (!closeHiveModalBtn) console.error('HIVE close button ("close-hive-modal") not found.');
    if (!hiveUnitsListContainer) console.error('HIVE units container ("hive-units-list-container") not found.');
  }
}