// Improved aliens modal implementation
export function initAliensModal() {
  const aliensBtn = document.getElementById('aliens-btn');
  // Modals are now expected to be in index.html and initialized by modals.js
  // This function will primarily handle event listeners for the *main* aliens modal (species selection)
  // and dynamically populate content.

  const aliensModal = document.getElementById('aliens-modal');
  const closeAliensModalBtn = document.getElementById('close-aliens-modal');
  const aliensGridContainer = document.getElementById('aliens-grid-container');
  
  const speciesDetailModal = document.getElementById('species-detail-modal');
  const closeSpeciesDetailBtn = document.getElementById('close-species-detail-modal');

  if (!aliensBtn || !aliensModal || !closeAliensModalBtn || !aliensGridContainer || !speciesDetailModal || !closeSpeciesDetailBtn) {
    console.error("One or more Aliens modal elements not found. Check IDs: aliens-btn, aliens-modal, close-aliens-modal, aliens-grid-container, species-detail-modal, close-species-detail-modal");
    return;
  }
  
  // Alien species configuration - Using absolute paths for JSON and image folders
  const alienSpecies = [
    { 
      id: 'anthromorph', 
      name: 'Anthromorphs', 
      jsonPath: '/json/anthromorph.json', 
      description: 'Genetically modified creatures that combine animal and humanoid traits, created for various specialized tasks.',
      defaultUnit: 'Grunt',
      folderName: 'anthromorphs' 
    },
    { 
      id: 'avianos', 
      name: 'Avianos', 
      jsonPath: '/json/avianos.json', 
      description: 'Bird-like predatory race from the dark side of Warnix planetoid. They once had wings but lost them when conquered by the Shal\'Rah.',
      defaultUnit: 'Sky_Guard',
      folderName: 'avianos' 
    },
    { 
      id: 'behemoth', 
      name: 'Behemoths', 
      jsonPath: '/json/behemoth.json', 
      description: 'Massive pack animals from a grassland world near the Phallon Nebula, prized for their immense carrying capacity.',
      defaultUnit: 'Goliath',
      folderName: 'behemoth'
    },
    { 
      id: 'chiropteran', 
      name: 'Chiropterans', 
      jsonPath: '/json/chiropteran.json', 
      description: 'Bat-like species, mechanically gifted, who lived on space stations around their shattered homeworld.',
      defaultUnit: 'Fury',
      folderName: 'chiropteran'
    },
    { 
      id: 'dengar', 
      name: 'Dengar', 
      jsonPath: '/json/dengar.json', 
      description: 'Humanoid race with tentacles instead of hair, black eyes, and a threatening appearance. Often employed as guards.',
      defaultUnit: 'Fang',
      folderName: 'dengar'
    },
    { 
      id: 'kilrathi', 
      name: 'Kilrathi', 
      jsonPath: '/json/kilrathi.json', 
      description: 'Feline race from Kilrah Prime with brown/green fur. Nomadic warriors with high-tech weapons but primitive clothing.',
      defaultUnit: 'Warrior',
      folderName: 'kilrathi'
    },
    { 
      id: 'shalrah_p', 
      name: 'Shal\'Rah Prime', 
      jsonPath: '/json/shalrah_p.json', 
      description: 'Hostile insectoid race known for their aggressive expansion and conquest of other species.',
      defaultUnit: 'Drone',
      folderName: 'shalrah_p'
    },
    { 
      id: 't_ana_rhe', 
      name: 'T\'ana\'rhe', 
      jsonPath: '/json/t_ana_rhe.json', 
      description: 'Bird-like psionically gifted species known for their trading networks and mental abilities.',
      defaultUnit: 'Merchant',
      folderName: 't_ana_rhe'
    },
    { 
      id: 'tal_ehn', 
      name: 'Tal\'Ehn', 
      jsonPath: '/json/tal_ehn.json', 
      description: 'Mystic aliens focused on arcane arts and the manipulation of energy and matter.',
      defaultUnit: 'Acolyte',
      folderName: 'tal_ehn'
    },
    { 
      id: 'talorian', 
      name: 'Talorian', 
      jsonPath: '/json/talorian.json', 
      description: 'Diplomatic species with keen intellect, often serving as negotiators between disparate factions.',
      defaultUnit: 'Diplomat',
      folderName: 'talorian'
    },
    { 
      id: 'vyraxus', 
      name: 'Vyraxus', 
      jsonPath: '/json/vyraxus.json', 
      description: 'Reptilian species known for their tactical skills and predatory instincts.',
      defaultUnit: 'Reptoid',
      folderName: 'vyraxus'
    },
    { 
      id: 'xithrian', 
      name: 'Xithrian', 
      jsonPath: '/json/xithrian.json', 
      description: 'Highly intellectual aliens devoted to knowledge, research, and scientific discovery.',
      defaultUnit: 'Scholar',
      folderName: 'xithrian'
    }
  ];

  // Event handlers
  aliensBtn.addEventListener('click', () => {
    populateAlienSpecies(aliensGridContainer, alienSpecies);
    aliensModal.classList.add('active');
  });

  closeAliensModalBtn.addEventListener('click', () => {
    aliensModal.classList.remove('active');
  });

  window.addEventListener('click', (event) => {
    if (event.target === aliensModal) {
      aliensModal.classList.remove('active');
    }
  });

  closeSpeciesDetailBtn.addEventListener('click', () => {
    speciesDetailModal.classList.remove('active');
  });

  window.addEventListener('click', (event) => {
    if (event.target === speciesDetailModal) {
      speciesDetailModal.classList.remove('active');
    }
  });


  function populateAlienSpecies(container, speciesList) {
    container.innerHTML = ''; 
    
    speciesList.forEach(species => {
      const speciesCard = document.createElement('div');
      speciesCard.className = 'alien-species-card';
      
      const folderPath = species.folderName || species.id; 
      const representativeImagePath = `/assets/aliens/${folderPath}/${species.defaultUnit}_Base.png`;
      
      speciesCard.innerHTML = `
        <div class="alien-species-image-container">
          <img src="${representativeImagePath}" alt="${species.name}" 
               onerror="this.src='/icons/flag-cursor.png'; this.classList.add('fallback-icon');">
        </div>
        <h3>${species.name}</h3>
        <p>${species.description}</p>
        <button class="view-species-btn" data-species-id="${species.id}">View Units</button>
      `;
      
      container.appendChild(speciesCard);
    });
    
    const viewSpeciesBtns = document.querySelectorAll('.view-species-btn');
    viewSpeciesBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const speciesId = btn.getAttribute('data-species-id');
        const species = speciesList.find(s => s.id === speciesId);
        if (species) {
          openSpeciesDetailModal(species);
        }
      });
    });
  }

  async function openSpeciesDetailModal(species) {
    const speciesDetailTitle = document.getElementById('species-detail-title');
    const speciesDetailContainer = document.getElementById('species-detail-container');
    
    if (speciesDetailTitle && speciesDetailContainer && speciesDetailModal) {
      speciesDetailTitle.textContent = species.name;
      speciesDetailContainer.innerHTML = '<p class="loading-message">Loading units data...</p>';
      speciesDetailModal.classList.add('active');
      
      try {
        const response = await fetch(species.jsonPath); 
        if (!response.ok) {
          throw new Error(`Failed to fetch ${species.jsonPath}: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        speciesDetailContainer.innerHTML = ''; 
        
        if (data.troops && data.troops.length > 0) {
          const versionOrder = { "Base": 1, "Superior": 2, "Elite": 3 };
          const sortedTroops = [...data.troops].sort((a, b) => {
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
          
          const descriptionElement = document.createElement('p');
          descriptionElement.className = 'species-description';
          descriptionElement.textContent = species.description;
          speciesDetailContainer.appendChild(descriptionElement);
          
          const unitsGrid = document.createElement('div');
          unitsGrid.className = 'units-grid';
          speciesDetailContainer.appendChild(unitsGrid);
          
          const folderPath = species.folderName || species.id;
          
          Object.keys(groupedTroops).forEach(unitName => {
            const unitCard = document.createElement('div');
            unitCard.className = 'unit-type-card';
            
            const unitVariants = groupedTroops[unitName];
            const baseUnit = unitVariants.find(variant => variant.version === 'Base') || unitVariants[0];
            
            const imageNameBase = unitName.replace(/ /g, '_');
            const basePath = `/assets/aliens/${folderPath}/${imageNameBase}_Base.png`;
            const superiorPath = `/assets/aliens/${folderPath}/${imageNameBase}_Superior.png`;
            const elitePath = `/assets/aliens/${folderPath}/${imageNameBase}_Elite.png`;
            
            unitCard.innerHTML = `
              <h3>${unitName}</h3>
              <div class="unit-variants">
                <div class="unit-variant">
                  <div class="unit-image-container">
                    <img src="${basePath}" alt="${unitName} Base" 
                      onerror="this.parentElement.innerHTML = '<p>Image not available</p>';">
                  </div>
                  <p>Base</p>
                </div>
                <div class="unit-variant">
                  <div class="unit-image-container">
                    <img src="${superiorPath}" alt="${unitName} Superior" 
                      onerror="this.parentElement.innerHTML = '<p>Image not available</p>';">
                  </div>
                  <p>Superior</p>
                </div>
                <div class="unit-variant">
                  <div class="unit-image-container">
                    <img src="${elitePath}" alt="${unitName} Elite" 
                      onerror="this.parentElement.innerHTML = '<p>Image not available</p>';">
                  </div>
                  <p>Elite</p>
                </div>
              </div>
              <div class="unit-stats">
                <p><strong>Health:</strong> ${baseUnit.health}</p>
                <p><strong>Move:</strong> ${baseUnit.move}</p>
                <p><strong>Range:</strong> ${baseUnit.range}</p>
                <p><strong>Hit Chance:</strong> ${baseUnit.chance_to_hit}%</p>
              </div>
            `;
            
            unitsGrid.appendChild(unitCard);
          });
          
        } else {
          speciesDetailContainer.innerHTML = '<p class="error-message">No units data found for this species.</p>';
        }
        
      } catch (error) {
        console.error(`Error loading species data for ${species.name}:`, error);
        speciesDetailContainer.innerHTML = `<p class="error-message">Error loading species data: ${error.message}</p>`;
      }
    }
  }
}