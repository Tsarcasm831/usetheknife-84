// Handles the Core Rules Modal functionality
import { initCharacterSheet } from './characterSheet.js'; // Import the new module

export function initCoreRulesModal() {
    const coreRulesBtn = document.getElementById('core-rules-btn');
    const coreRulesModal = document.getElementById('core-rules-modal');
    const closeCoreRulesModalBtn = document.getElementById('close-core-rules-modal');
    // coreRulesCategoryButtons will be selected after creation or handled by delegation
    const coreRulesContentArea = document.getElementById('core-rules-content-area');
    const coreRulesCategorySelectionArea = document.getElementById('core-rules-category-selection');
    const coreRulesDynamicContent = document.getElementById('core-rules-dynamic-content');
    const coreRulesBackBtn = document.getElementById('core-rules-back-btn');

    let characterDataCache = null; // Cache for loaded character data

    async function loadCharacterCreationData() {
        if (characterDataCache) return characterDataCache;

        const dataSources = {
            weapons: '/json/data/weapons.json',
            armor: '/json/data/armor.json',
            blades: '/json/data/blades.json',
            archetypes: '/json/character_creation/archetypes.json',
            attributes: '/json/character_creation/attributes.json',
            traits: '/json/character_creation/traits.json',
            mutations: '/json/character_creation/mutations.json',
            mutations_effects: '/json/character_creation/mutations_effects.json',
            mutations_colors: '/json/character_creation/mutations_colors.json',
            psionics: '/json/character_creation/psionics.json',
            game_mechanics: '/json/character_creation/game_mechanics.json'
        };
        const loadedData = {};
        try {
            const promises = Object.entries(dataSources).map(async ([key, path]) => {
                const response = await fetch(path);
                if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
                loadedData[key] = await response.json();
            });
            await Promise.all(promises);
            characterDataCache = loadedData;
            return loadedData;
        } catch (error) {
            console.error("Error loading character creation data:", error);
            if(coreRulesDynamicContent) coreRulesDynamicContent.innerHTML = `<p class="error-message">Error loading character data: ${error.message}. Please try again.</p>`;
            return null;
        }
    }

    function displayGeneralRules(gameMechanicsData) {
        if (!coreRulesDynamicContent) return;
        let html = '<h3>General Game Mechanics</h3>';
        if (gameMechanicsData && gameMechanicsData.length > 0) {
            gameMechanicsData.forEach(rule => {
                html += `<h4>${rule.name}</h4>`;
                html += `<p>${rule.description}</p>`;
                if (rule.rules && rule.rules.length > 0) {
                    html += '<ul>';
                    rule.rules.forEach(r => {
                        html += `<li>${r}</li>`;
                    });
                    html += '</ul>';
                }
            });
        } else {
            html += '<p>No general rules data found or an error occurred.</p>';
        }
        coreRulesDynamicContent.innerHTML = html;
    }

    function createCategoryButtons() {
        if (!coreRulesCategorySelectionArea) return;
        coreRulesCategorySelectionArea.innerHTML = ''; // Clear existing, if any

        const categories = [
            { name: "Character Creation", id: "character_creation" },
            { name: "General Rules", id: "general_rules" },
            { name: "Combat", id: "combat_rules" },
            { name: "Skills & Checks", id: "skills_checks" },
            { name: "Psionics", id: "psionics_rules" },
            { name: "Equipment", id: "equipment_rules" },
            { name: "Rulebook (PDF)", id: "rulebook_pdf" }
        ];

        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'core-rules-category-btn';
            button.textContent = category.name;
            button.dataset.category = category.id;
            coreRulesCategorySelectionArea.appendChild(button);
        });
    }


    if (coreRulesBtn && coreRulesModal && closeCoreRulesModalBtn) {
        createCategoryButtons(); // Create buttons on init

        coreRulesBtn.addEventListener('click', () => {
            coreRulesModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent body scroll
            if(coreRulesContentArea) coreRulesContentArea.style.display = 'none';
            if(coreRulesCategorySelectionArea) coreRulesCategorySelectionArea.style.display = 'flex';
            if(coreRulesDynamicContent) coreRulesDynamicContent.innerHTML = ''; 
        });

        closeCoreRulesModalBtn.addEventListener('click', () => {
            coreRulesModal.classList.remove('active');
            document.body.style.overflow = ''; // Restore body scroll
        });

        window.addEventListener('click', (event) => {
            if (event.target === coreRulesModal) {
                coreRulesModal.classList.remove('active');
                document.body.style.overflow = ''; // Restore body scroll
            }
        });
        
        if (coreRulesCategorySelectionArea) {
            coreRulesCategorySelectionArea.addEventListener('click', async (event) => {
                const button = event.target.closest('.core-rules-category-btn');
                if (!button) return;

                const category = button.dataset.category;
                if (!coreRulesDynamicContent || !coreRulesCategorySelectionArea || !coreRulesContentArea) return;
                
                coreRulesDynamicContent.innerHTML = `<p class="loading-message">Loading rules...</p>`;
                coreRulesCategorySelectionArea.style.display = 'none';
                coreRulesContentArea.style.display = 'flex'; // Ensure this is flex to respect align-self on back button

                if (category === 'character_creation') {
                    const charData = await loadCharacterCreationData();
                    if (charData) {
                        initCharacterSheet(coreRulesDynamicContent, charData);
                    } else {
                         coreRulesDynamicContent.innerHTML = `<p class="error-message">Error loading character data. Please try again.</p>`;
                    }
                } else if (category === 'rulebook_pdf') {
                    coreRulesDynamicContent.innerHTML = `<h3>Rulebook (PDF)</h3><iframe src="/assets/Remnants_of_Destruction_Core_Rulebook.pdf" style="width:100%; height: 60vh; border:1px solid orange;"><p>Your browser does not support PDFs. Please download the PDF to view it: <a href="/assets/Remnants_of_Destruction_Core_Rulebook.pdf">Download PDF</a>.</p></iframe>`;
                } else if (category === 'general_rules') {
                    const charData = await loadCharacterCreationData(); 
                    if (charData && charData.game_mechanics) {
                        displayGeneralRules(charData.game_mechanics);
                    } else {
                        coreRulesDynamicContent.innerHTML = `<p class="error-message">Error loading general rules data.</p>`;
                    }
                } else {
                    coreRulesDynamicContent.innerHTML = `<h3>${category.replace(/_/g, ' ').toUpperCase()}</h3><p>Detailed rules for ${category.replace(/_/g, ' ')} will be shown here. This section is under construction.</p>`;
                }
            });
        }


        if (coreRulesBackBtn && coreRulesContentArea && coreRulesCategorySelectionArea && coreRulesDynamicContent) {
            coreRulesBackBtn.addEventListener('click', () => {
                coreRulesContentArea.style.display = 'none';
                coreRulesCategorySelectionArea.style.display = 'flex';
                coreRulesDynamicContent.innerHTML = '';
            });
        }
    } else {
        console.error("Core Rules modal elements not found. Initialization failed.");
    }
}