// Handles the Bestiary Modal functionality, now focused on Mutants

export function initBestiaryModal() {
    const bestiaryBtn = document.getElementById('bestiary-btn');
    const bestiaryModal = document.getElementById('bestiary-modal'); // This is the main modal element
    const closeBestiaryModalBtn = document.getElementById('close-bestiary-modal');
    const mutantsUnitsListContainer = document.getElementById('mutants-units-list-container'); // Target new container

    if (bestiaryBtn && bestiaryModal && closeBestiaryModalBtn && mutantsUnitsListContainer) {
        bestiaryBtn.textContent = "Mutants"; 
        
        bestiaryBtn.addEventListener('click', async () => {
            mutantsUnitsListContainer.innerHTML = `<p class="loading-message">Loading mutant units...</p>`; // Use a class for styling
            bestiaryModal.classList.add('active');
            
            try {
                const response = await fetch('/json/mutants.json'); // Use absolute path
                if (!response.ok) {
                    throw new Error(`Failed to fetch mutants.json: ${response.status}`);
                }
                
                const mutantsData = await response.json();
                mutantsUnitsListContainer.innerHTML = ''; // Clear loading message
                
                if (mutantsData.troops && mutantsData.troops.length > 0) {
                    const versionOrder = { "Base": 1, "Superior": 2, "Elite": 3 };
                    const sortedTroops = [...mutantsData.troops].sort((a, b) => {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;
                        return (versionOrder[a.version] || 99) - (versionOrder[b.version] || 99);
                    });
                    
                    sortedTroops.forEach(troop => {
                        const unitNameForFile = troop.name.replace(/ /g, '_');
                        const imageName = `${unitNameForFile}_${troop.version}.png`;
                        const imagePath = `/assets/mutants/${imageName}`; // Use absolute path

                        const unitItem = document.createElement('div');
                        unitItem.classList.add('fdg-unit-item'); // Reusing fdg styling for cards
                        unitItem.classList.add(`mutant-unit-version-${troop.version.toLowerCase()}`); // Specific class for version

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
                        
                        mutantsUnitsListContainer.appendChild(unitItem);
                    });
                } else {
                    mutantsUnitsListContainer.innerHTML = '<p class="error-message">No mutant unit data found.</p>';
                }
                
            } catch (err) {
                console.error(`Error loading mutants data:`, err);
                mutantsUnitsListContainer.innerHTML = `<p class="error-message" style="color:red;">Error loading mutant data: ${err.message}</p>`;
            }
        });

        closeBestiaryModalBtn.addEventListener('click', () => {
            bestiaryModal.classList.remove('active');
            mutantsUnitsListContainer.innerHTML = ''; // Clear content on close
        });

        window.addEventListener('click', (event) => {
            if (event.target === bestiaryModal) {
                bestiaryModal.classList.remove('active');
                mutantsUnitsListContainer.innerHTML = ''; // Clear content on close
            }
        });

    } else {
        console.error("Mutants modal elements not found. Initialization failed.");
        if (!bestiaryBtn) console.error("Mutants button (bestiary-btn) not found.");
        if (!bestiaryModal) console.error("Mutants modal (bestiary-modal) not found.");
        if (!closeBestiaryModalBtn) console.error("Mutants close button (close-bestiary-modal) not found.");
        if (!mutantsUnitsListContainer) console.error("Mutants units container (mutants-units-list-container) not found.");
    }
}