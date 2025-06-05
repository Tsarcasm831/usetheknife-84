// Manages the C.R.O.S.S. Unit Display Modal

export function initCrossModal() {
  const crossBtn = document.getElementById('cross-btn');
  const modalsRoot = document.getElementById('modals-root');
  
  let crossModal = document.getElementById('cross-modal');

  if (!crossModal) {
    if (modalsRoot) {
      crossModal = document.createElement('div');
      crossModal.id = 'cross-modal';
      modalsRoot.appendChild(crossModal);
    } else {
      console.error("#modals-root not found. Cannot create C.R.O.S.S. modal.");
      return;
    }
  }
  
  crossModal.innerHTML = `
    <div class="cross-modal-content">
      <span class="cross-modal-close-btn" id="close-cross-modal">&times;</span>
      <h2>C.R.O.S.S. Units</h2>
      <div id="cross-units-list-container">
        <!-- Units will be populated here by JS -->
      </div>
    </div>
  `;
  
  const closeCrossModalBtn = crossModal.querySelector('#close-cross-modal');
  const crossUnitsListContainer = crossModal.querySelector('#cross-units-list-container');

  if (crossBtn && crossModal && closeCrossModalBtn && crossUnitsListContainer) {
    crossBtn.addEventListener('click', async () => {
      try {
        const urls = [
          '/json/factions/cross_units/base.json',
          '/json/factions/cross_units/superior.json',
          '/json/factions/cross_units/elite.json'
        ];
        const dataArrays = await Promise.all(
          urls.map(async url => {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
            }
            return response.json();
          })
        );
        const crossData = dataArrays.flat();
        
        crossUnitsListContainer.innerHTML = ''; // Clear previous content
        
        // The JSON is an array of objects, not an object with a "troops" property.
        const troopsArray = Array.isArray(crossData) ? crossData : (crossData.troops || []);


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
            const imagePath = `/assets/factions/cross/${imageName}`;


            const unitItem = document.createElement('div');
            unitItem.classList.add('fdg-unit-item'); 
            unitItem.classList.add(`cross-unit-version-${troopVersion.toLowerCase()}`);

            const imageContainer = document.createElement('div');
            imageContainer.className = 'fdg-unit-image-container';

            const img = document.createElement('img');
            img.src = imagePath;
            img.alt = `${troopName} ${troopVersion}`;
            
            img.onerror = function() {
              if (this.parentElement) {
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
              <p><strong>Initiative:</strong> <span>${troop.Move || troop.move || 'N/A'}</span></p> <!-- Assuming Move maps to Initiative -->
              <p><strong>Range:</strong> <span>${troop.Range || troop.range || 'N/A'}</span></p>
              <p><strong>Hit Chance:</strong> <span>${troop.Chance_to_Hit || troop.chance_to_hit || 'N/A'}%</span></p>
            `;
            statsDiv.innerHTML = statsContent;

            unitItem.appendChild(imageContainer);
            unitItem.appendChild(nameHeader);
            unitItem.appendChild(versionPara);
            unitItem.appendChild(statsDiv);
            
            crossUnitsListContainer.appendChild(unitItem);
          });
        } else {
            crossUnitsListContainer.innerHTML = '<p style="color:yellow; text-align:center;">No C.R.O.S.S. units found in data.</p>';
        }
        
        crossModal.classList.add('active');
      } catch (error) {
        console.error('Error loading or processing C.R.O.S.S. data:', error);
        crossUnitsListContainer.innerHTML = '<p style="color:red; text-align:center;">Error loading unit data. Please try again later.</p>';
        if(crossModal) crossModal.classList.add('active');
      }
    });

    closeCrossModalBtn.addEventListener('click', () => {
      crossModal.classList.remove('active');
    });

    window.addEventListener('click', (event) => {
      if (event.target === crossModal) {
        crossModal.classList.remove('active');
      }
    });
  } else {
    console.error('C.R.O.S.S. Modal UI elements not found. Check IDs.');
  }
}