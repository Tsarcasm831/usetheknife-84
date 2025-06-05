// Manages the Slingers Unit Display Modal

export function initSlingersModal() {
  const slingersBtn = document.getElementById('slingers-btn');
  const modalsRoot = document.getElementById('modals-root');
  
  let slingersModal = document.getElementById('slingers-modal');

  if (!slingersModal) {
    if (modalsRoot) {
      slingersModal = document.createElement('div');
      slingersModal.id = 'slingers-modal';
      modalsRoot.appendChild(slingersModal);
    } else {
      console.error("#modals-root not found. Cannot create Slingers modal.");
      return;
    }
  }
  
  slingersModal.innerHTML = `
    <div class="slingers-modal-content">
      <span class="slingers-modal-close-btn" id="close-slingers-modal">&times;</span>
      <h2>Slingers Units</h2>
      <div id="slingers-units-list-container">
        <!-- Units will be populated here by JS -->
      </div>
    </div>
  `;
  
  const closeSlingersModalBtn = slingersModal.querySelector('#close-slingers-modal');
  const slingersUnitsListContainer = slingersModal.querySelector('#slingers-units-list-container');

  if (slingersBtn && slingersModal && closeSlingersModalBtn && slingersUnitsListContainer) {
    slingersBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('/json/factions/slingers_units.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch slingers_units.json: ${response.status} ${response.statusText}`);
        }
        const slingersData = await response.json();
        
        slingersUnitsListContainer.innerHTML = ''; // Clear previous content
        
        // The JSON is an array of objects, not an object with a "troops" property.
        const troopsArray = Array.isArray(slingersData) ? slingersData : (slingersData.troops || []);

        if (troopsArray.length > 0) {
          // Slingers don't have 'version', so sort by name. Using a placeholder for version sort compatibility.
          const versionOrder = { "N/A": 1 }; 
          const sortedTroops = [...troopsArray].sort((a, b) => {
            const nameA = a.name; 
            const nameB = b.name;
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            // If version existed, it would be: return (versionOrder[a.version] || 99) - (versionOrder[b.version] || 99);
            return 0; 
          });

          sortedTroops.forEach(troop => {
            const unitNameForFile = troop.name.replace(/\./g, '').replace(/ /g, '_');
            // Slingers don't have versions in their data, image names might just be the name.
            const imageName = `${unitNameForFile}.png`; 
            const imagePath = `/assets/factions/heroes/slingers/${imageName}`;


            const unitItem = document.createElement('div');
            unitItem.classList.add('fdg-unit-item'); 
            // No specific version class if not applicable, or use a default
            unitItem.classList.add(`slingers-unit-version-unique`);


            const imageContainer = document.createElement('div');
            imageContainer.className = 'fdg-unit-image-container'; 

            const img = document.createElement('img');
            img.src = imagePath;
            img.alt = `${troop.name}`; // No version here
            
            img.onerror = function() {
              if (this.parentElement) {
                this.parentElement.innerHTML = `<p class="image-not-found">Image Not Found</p>`;
              }
            };
            imageContainer.appendChild(img);

            const nameHeader = document.createElement('h3');
            nameHeader.textContent = troop.name;

            // No version paragraph if not applicable
            // const versionPara = document.createElement('p');
            // versionPara.className = 'unit-version';
            // versionPara.textContent = `Unique Operative`; 
            // unitItem.appendChild(versionPara);


            const infoDiv = document.createElement('div');
            infoDiv.className = 'unit-stats'; // Reuse class for consistency
            
            let infoContent = `<p><strong>Role:</strong> <span>${troop.role || 'N/A'}</span></p>`;
            infoContent += `<p><strong>Suit:</strong> <span>${troop.bodysuit_color || 'N/A'}</span></p>`;
            infoContent += `<p><strong>Status:</strong> <span>${troop.status || 'N/A'}</span></p>`;
            if(troop.description) {
                 infoContent += `<p class="slingers-bio"><strong>Bio:</strong> ${troop.description}</p>`;
            }
            infoDiv.innerHTML = infoContent;


            unitItem.appendChild(imageContainer);
            unitItem.appendChild(nameHeader);
            unitItem.appendChild(infoDiv);
            
            slingersUnitsListContainer.appendChild(unitItem);
          });
        } else {
            slingersUnitsListContainer.innerHTML = '<p style="color:yellow; text-align:center;">No Slingers units found in data.</p>';
        }
        
        slingersModal.classList.add('active');
      } catch (error) {
        console.error('Error loading or processing Slingers data:', error);
        slingersUnitsListContainer.innerHTML = '<p style="color:red; text-align:center;">Error loading unit data. Please try again later.</p>';
        if(slingersModal) slingersModal.classList.add('active');
      }
    });

    closeSlingersModalBtn.addEventListener('click', () => {
      slingersModal.classList.remove('active');
    });

    window.addEventListener('click', (event) => {
      if (event.target === slingersModal) {
        slingersModal.classList.remove('active');
      }
    });
  } else {
    console.error('Slingers Modal UI elements not found. Check IDs.');
  }
}