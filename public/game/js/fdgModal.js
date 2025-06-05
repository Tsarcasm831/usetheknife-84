// Manages the FDG Unit Display Modal

export function initFdgModal() {
  const fdgBtn = document.getElementById('fdg-btn');
  const modalsRoot = document.getElementById('modals-root');
  
  // Check if modal exists, create it if not
  let fdgModal = document.getElementById('fdg-modal');
  if (!fdgModal && modalsRoot) {
    // Create modal structure if it doesn't exist
    fdgModal = document.createElement('div');
    fdgModal.id = 'fdg-modal';
    fdgModal.innerHTML = `
      <div class="fdg-modal-content">
        <span class="fdg-modal-close-btn" id="close-fdg-modal">&times;</span>
        <h2>Federal Democratic Government (F.D.G.) Units</h2>
        <div id="fdg-units-list-container">
          <!-- Units will be populated here by JS -->
        </div>
      </div>
    `;
    modalsRoot.appendChild(fdgModal);
  }
  
  // Now get references to elements (they should exist now)
  fdgModal = document.getElementById('fdg-modal');
  const closeFdgModalBtn = document.getElementById('close-fdg-modal');
  const fdgUnitsListContainer = document.getElementById('fdg-units-list-container');

  if (fdgBtn && fdgModal && closeFdgModalBtn && fdgUnitsListContainer) {
    fdgBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('/json/factions/fdg.json'); // Fetching data from the correct path
        if (!response.ok) {
          throw new Error(`Failed to fetch fdg.json: ${response.status} ${response.statusText}`);
        }
        const fdgData = await response.json();
        
        fdgUnitsListContainer.innerHTML = ''; // Clear previous content

        if (fdgData && fdgData.troops) {
          const versionOrder = { "Base": 1, "Superior": 2, "Elite": 3 };
          const sortedTroops = [...fdgData.troops].sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return (versionOrder[a.version] || 99) - (versionOrder[b.version] || 99);
          });

          sortedTroops.forEach(troop => {
            const imageName = troop.name.replace(/ /g, '_') + '_' + troop.version + '.png';
            const imagePath = `/assets/FDG/${imageName}`; // Path already absolute

            const unitItem = document.createElement('div');
            unitItem.classList.add('fdg-unit-item');
            unitItem.classList.add(`fdg-unit-version-${troop.version.toLowerCase()}`);

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
              <p><strong>Move:</strong> <span>${troop.move || 'N/A'}</span></p>
              <p><strong>Range:</strong> <span>${troop.range || 'N/A'}</span></p>
              <p><strong>Hit Chance:</strong> <span>${troop.chance_to_hit || 'N/A'}%</span></p>
            `;
            statsDiv.innerHTML = statsContent;

            unitItem.appendChild(imageContainer);
            unitItem.appendChild(nameHeader);
            unitItem.appendChild(versionPara);
            unitItem.appendChild(statsDiv);
            
            fdgUnitsListContainer.appendChild(unitItem);
          });
        }
        
        fdgModal.classList.add('active');
      } catch (error) {
        console.error('Error loading or processing FDG data:', error);
        fdgUnitsListContainer.innerHTML = '<p style="color:red; text-align:center;">Error loading unit data. Please try again later.</p>';
        fdgModal.classList.add('active');
      }
    });

    closeFdgModalBtn.addEventListener('click', () => {
      fdgModal.classList.remove('active');
    });

    window.addEventListener('click', (event) => {
      if (event.target === fdgModal) {
        fdgModal.classList.remove('active');
      }
    });
  } else {
    console.error('FDG Modal UI elements not found. Check IDs and modal structure.');
  }
}