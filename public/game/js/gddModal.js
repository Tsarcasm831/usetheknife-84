// Handles the Game Development Document (GDD) Modal functionality

const gameplayFunctionalities = [
    { name: "Interactive Map Display", description: "Leaflet-based map with multiple base layers (Street, Satellite, Topo) and side-by-side view." },
    { name: "Grid System", description: "Dynamic main grid overlay with selectable cells, and a subgrid system for detailed area scanning and selection." },
    { name: "Road Mapping", description: "Fetches and displays road networks from OpenStreetMap for selected map areas." },
    { name: "Event Generation", description: "Dynamically finds and places interactive events on the map within road networks." },
    { name: "Geolocation & Home Base", description: "Displays user's or a fixed 'Home Base' location on the map." },
    { name: "POI Placement & Geocoding", description: "Allows users to place Points of Interest (POIs) on the map with reverse geocoded addresses." },
    { name: "Sidebar Navigation", description: "Right sidebar for accessing various tools and external content via iframes." },
    { name: "Street View Integration", description: "Google Street View display for selected map locations, integrated into a panel." },
    { name: "Terra Incognita Overlay", description: "Dynamic map overlay that blacks out non-US countries, emphasizing the game's focus area." },
    { name: "Regional Overlays", description: "Visual overlays for Western US, Eastern US, and a DMZ (Central states)." },
    { name: "Device Camera Access", description: "Allows users to take photos using their device's camera at specific map locations." },
    { name: "Screen & Face Recording", description: "Functionality to record the screen and user's face camera simultaneously." },
    { name: "3D Terrain & Street View Modal", description: "Modal for viewing procedurally generated 3D terrain or Google Street View for selected subgrid cells." },
    { name: "Faction Unit Browsers", description: "Modals to view detailed information and artwork for various game factions (FDG, H.I.V.E., Prometheus, C.R.O.S.S., Slingers)." },
    { name: "Mutant Bestiary", description: "Modal displaying information and artwork for various Mutant types." },
    { name: "Alien Species Browser", description: "Modal to browse different alien species and their respective unit types." },
    { name: "Core Rules & Character Sheet", description: "Modal for accessing core game rules, including an interactive D&D-style character sheet for creation and management (attributes, skills, traits, mutations, psionics, equipment)." },
    { name: "Game Development Document (GDD) Viewer", description: "This modal, for viewing and editing core game design information." },
    { name: "Home Base Command Center", description: "Placeholder modal for future home base management features." },
    { name: "Event Preparation System", description: "Multi-tabbed modal for team configuration, unit loadouts, mission briefing, intel review, tactical map view, and support asset requests before starting an event." },
    { name: "Team Management", description: "System for selecting and managing a team of units for events, including drag-and-drop assignment." },
    { name: "Loadout Management", description: "Interface for equipping selected team units with weapons from an available arsenal." }
];

const playerActions = [
    { name: "Navigate Map", description: "Pan and zoom the main world map, switch between Street, Satellite, and Topographic views." },
    { name: "Toggle Grid", description: "Activate or deactivate a grid overlay on the map to define operational areas." },
    { name: "Select Grid Cell", description: "Click on a main grid cell to highlight it for further actions." },
    { name: "Scan Subgrid", description: "Initiate a scan within a selected main grid cell to reveal smaller subgrid cells." },
    { name: "Select Subgrid Cell", description: "Choose a specific subgrid cell to focus actions like road mapping or event finding." },
    { name: "Map Roads in Subgrid", description: "Fetch and display road networks from OpenStreetMap for the selected subgrid cell." },
    { name: "Find Events", description: "Generate interactive events within a subgrid cell that has mapped roads. Click event markers to prepare for them." },
    { name: "View 3D Terrain/Street View", description: "Open a modal to see a 3D terrain visualization or Google Street View of a selected subgrid cell." },
    { name: "Place Point of Interest (POI)", description: "Add custom markers (POIs) to the map with titles, descriptions, and categories." },
    { name: "Use Device Camera", description: "Capture photos using the device's camera at specified map locations (via popups)." },
    { name: "Record Gameplay", description: "Activate screen and (optionally) face camera recording." },
    { name: "Browse Faction Units", description: "Open modals to view detailed information and artwork for FDG, H.I.V.E., Prometheus, C.R.O.S.S., and Slingers factions." },
    { name: "View Mutant Bestiary", description: "Explore a catalog of different Mutant types with their stats and artwork." },
    { name: "Explore Alien Species", description: "Browse various alien species, viewing their lore and unit types." },
    { name: "Access Core Rules & Character Sheet", description: "View game rules and create/manage a character using an interactive sheet." },
    { name: "Prepare for Event", description: "Open a multi-tab modal for an event to: <ul><li>Assemble a team of units.</li><li>Equip units with weapons.</li><li>Review mission briefing and objectives.</li><li>Check intel, including importing a subgrid map snapshot.</li><li>View a (placeholder) tactical map.</li><li>Request (placeholder) support assets.</li><li>(Placeholder) Launch the mission.</li></ul>" },
    { name: "Manage Team", description: "Select and assign units to an active team roster via drag-and-drop." },
    { name: "Manage Loadouts", description: "Equip selected team units with available weapons via drag-and-drop." },
    { name: "View/Edit GDD (Meta)", description: "Interact with this Game Development Document modal to see project structure and features." },
    { name: "Access External Tools (via Sidebar)", description: "Open various external web pages or tools within an iframe in the sidebar." },
    { name: "View Home Base (Placeholder)", description: "Open a modal for the Home Base Command Center (currently a placeholder with static info and a non-interactive 3D view loading text)." }
];

const defaultGameOverview = `
Project Overview: "Remnants of Earth" (Working Title)

Purpose & Vision:
This project is an interactive web-based experience designed as a homage to the classic post-apocalyptic game "Remnants of Destruction" (RoD). It aims to recreate and expand upon the core concepts of RoD's world, factions, and strategic gameplay within a modern, accessible browser-based environment. The vision is to build a dynamic "living map" that serves as a central hub for players to explore, interact with game elements, and eventually engage in strategic scenarios. This is not a direct port, but rather an inspired re-imagining, leveraging modern web technologies like Leaflet.js for mapping, and integrating various data sources to create a rich, evolving world.

Homage to Remnants of Destruction:
"Remnants of Destruction" was known for its gritty atmosphere, diverse factions, detailed unit types, and engaging tactical combat. This project seeks to honor that legacy by:
1.  Factions: Reintroducing key factions such as the Federal Democratic Government (FDG), the bio-engineered Human Intervention Victory Enclave (H.I.V.E.), the enigmatic C.R.O.S.S. cult, the rogue AI Prometheus, the genetically modified Slingers, various alien species, and mutant hordes. Each faction will have its lore, units, and distinct visual style represented.
2.  World Setting: The game is set in a post-apocalyptic Earth, primarily focusing on a fractured United States. Overlays like "Terra Incognita" and regional divisions (West, East, DMZ) highlight the fragmented nature of the world and the areas of operation.
3.  Gameplay Elements: While full tactical combat is a long-term goal, current features like grid-based map interaction, event generation, POI placement, and unit browsing lay the groundwork for future strategic layers. The character sheet and core rules system are also being developed with RoD's RPG elements in mind.
4.  Atmosphere: The visual style, unit descriptions, and overall design aim to capture the "gritty" and "remnants" feel of the original.

Key Features & Goals:
*   Interactive World Map: A central Leaflet map with dynamic overlays, POIs, and interactive elements.
*   Faction & Unit Showcase: Detailed modals for browsing units from various factions, including stats and artwork.
*   Dynamic Event System: Procedurally generated events based on map data and road networks, leading to (future) tactical encounters.
*   Strategic Grid System: A multi-level grid for defining operational areas and subgrid scanning for detailed reconnaissance.
*   Core RPG Mechanics: Development of a character creation system, core rules, and attributes inspired by tabletop RPGs, adaptable for future gameplay.
*   Modular Design: Built with JavaScript modules for better organization and maintainability, allowing for incremental feature development.
*   Community & Tool Integration: Sidebar for accessing external tools and community platforms.
*   Future Vision: Potential expansion into turn-based tactical combat, resource management, and persistent player progression on the "living map".

Technology Stack (Highlights):
*   Frontend: HTML, CSS, JavaScript (ES Modules)
*   Mapping: Leaflet.js, OpenStreetMap, Google Maps API (for Street View)
*   3D Visualization: Three.js (for terrain and future elements)
*   Data: JSON files for game data (units, items, rules, etc.)
*   Styling: Tailwind CSS for utility classes, custom CSS for specific components.

This project is an ongoing effort to create a rich, interactive experience that celebrates the spirit of "Remnants of Destruction" while exploring new possibilities with web technologies.
`.trim();

function populateGddList(containerId, listData, listTitle) {
    const listContainer = document.getElementById(containerId);
    if (!listContainer) {
        console.error(`GDD container with ID '${containerId}' not found.`);
        return;
    }

    listContainer.innerHTML = ''; // Clear previous content
    const ul = document.createElement('ul');
    ul.classList.add('functionality-items-list'); // Re-use styling

    listData.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.name}:</strong> ${item.description}`;
        ul.appendChild(li);
    });
    listContainer.appendChild(ul);
}

export function initGddModal() {
    const gddBtn = document.getElementById('gdd-btn');
    const gddModal = document.getElementById('gdd-modal');
    const closeGddModalBtn = document.getElementById('close-gdd-modal');
    const saveGddBtn = document.getElementById('save-gdd-btn');
    const gddOverviewTextarea = document.getElementById('gdd-overview');

    if (gddBtn && gddModal && closeGddModalBtn) {
        gddBtn.addEventListener('click', () => {
            gddModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent body scroll
            if (gddOverviewTextarea) {
                const savedOverview = localStorage.getItem('gdd-overview');
                gddOverviewTextarea.value = savedOverview || defaultGameOverview;
            }

            populateGddList('gdd-gameplay-list', gameplayFunctionalities, 'Gameplay Mechanics');
            populateGddList('gdd-player-actions-list', playerActions, 'Player Actions');

        });

        closeGddModalBtn.addEventListener('click', () => {
            gddModal.classList.remove('active');
            document.body.style.overflow = ''; // Restore body scroll
        });

        window.addEventListener('click', (event) => {
            if (event.target === gddModal) {
                gddModal.classList.remove('active');
                document.body.style.overflow = ''; // Restore body scroll
            }
        });

        if (saveGddBtn && gddOverviewTextarea) {
            saveGddBtn.addEventListener('click', () => {
                localStorage.setItem('gdd-overview', gddOverviewTextarea.value);
                alert('G.D.D. Overview saved to local storage!');
            });
        }
    } else {
        console.error("GDD Modal elements not found. Initialization failed.");
    }
}