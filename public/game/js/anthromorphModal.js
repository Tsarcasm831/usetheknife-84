// This function is called by aliensModal.js to populate and show the anthromorph details
export async function displayAnthromorphUnits() {
    const speciesDetailContainer = document.getElementById('species-detail-container');
    const speciesDetailModal = document.getElementById('species-detail-modal');
    
    let targetContainer;
    let modalToShow;

    if (speciesDetailContainer && speciesDetailModal && speciesDetailModal.classList.contains('active')) {
        // If species detail modal is active, we're in the aliensModal flow
        targetContainer = speciesDetailContainer;
        modalToShow = speciesDetailModal; // We are already in this modal
    } 
    else {
        console.error("Cannot display anthromorph units: species-detail-modal is not active or elements are missing.");
        // If species-detail-modal isn't active, then this function shouldn't be called in the current flow.
        return; 
    }
    
    targetContainer.innerHTML = `<p class="loading-message">Loading Anthromorph units...</p>`;
    // No need to explicitly add 'active' to modalToShow if it's already expected to be active.


    try {
        const response = await fetch('/json/anthromorph.json'); 
        if (!response.ok) {
          throw new Error(`Failed to fetch anthromorph.json: ${response.status} ${response.statusText}`);
        }
        const anthromorphData = await response.json();
        
        targetContainer.innerHTML = ''; // Clear previous content

        if (anthromorphData && anthromorphData.troops) {
          const versionOrder = { "Base": 1, "Superior": 2, "Elite": 3 };
          const sortedTroops = [...anthromorphData.troops].sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return (versionOrder[a.version] || 99) - (versionOrder[b.version] || 99);
          });
          
          const groupedTroops = {};
          sortedTroops.forEach(troop => {
            if (!groupedTroops[troop.name]) {
              groupedTroops[troop.name] = [];
            }
            groupedTroops[troop.name].push(troop);
          });
          
          const speciesDescription = 'Genetically modified creatures that combine animal and humanoid traits, created for various specialized tasks.';
          const descriptionElement = document.createElement('p');
          descriptionElement.className = 'species-description';
          descriptionElement.textContent = speciesDescription;
          targetContainer.appendChild(descriptionElement);
            
          const unitsGrid = document.createElement('div');
          unitsGrid.className = 'units-grid'; 
          targetContainer.appendChild(unitsGrid);


          Object.keys(groupedTroops).forEach(unitName => {
            const unitCard = document.createElement('div');
            unitCard.className = 'unit-type-card';
            
            const unitVariants = groupedTroops[unitName];
            const baseUnit = unitVariants.find(variant => variant.version === 'Base') || unitVariants[0];
            
            const imageNameBase = unitName.replace(/ /g, '_');
            const basePath = `/assets/aliens/anthromorphs/${imageNameBase}_Base.png`;
            const superiorPath = `/assets/aliens/anthromorphs/${imageNameBase}_Superior.png`;
            const elitePath = `/assets/aliens/anthromorphs/${imageNameBase}_Elite.png`;
            
            unitCard.innerHTML = `
                <h3>${unitName}</h3>
                <div class="unit-variants">
                <div class="unit-variant">
                    <div class="unit-image-container"><img src="${basePath}" alt="${unitName} Base" onerror="this.parentElement.innerHTML = '<p>Image not available</p>';"></div><p>Base</p>
                </div>
                <div class="unit-variant">
                    <div class="unit-image-container"><img src="${superiorPath}" alt="${unitName} Superior" onerror="this.parentElement.innerHTML = '<p>Image not available</p>';"></div><p>Superior</p>
                </div>
                <div class="unit-variant">
                    <div class="unit-image-container"><img src="${elitePath}" alt="${unitName} Elite" onerror="this.parentElement.innerHTML = '<p>Image not available</p>';"></div><p>Elite</p>
                </div>
                </div>
                <div class="unit-stats">
                <p><strong>Health:</strong> ${baseUnit.health}</p><p><strong>Move:</strong> ${baseUnit.move}</p>
                <p><strong>Range:</strong> ${baseUnit.range}</p><p><strong>Hit Chance:</strong> ${baseUnit.chance_to_hit}%</p>
                </div>
            `;
            unitsGrid.appendChild(unitCard);
          });
        } else {
            targetContainer.innerHTML = '<p class="error-message">No Anthromorph unit data found.</p>';
        }
      } catch (error) {
        console.error('Error loading or processing Anthromorph data for display:', error);
        targetContainer.innerHTML = `<p class="error-message" style="color:red;">Error loading Anthromorph data: ${error.message}</p>`;
      }
}