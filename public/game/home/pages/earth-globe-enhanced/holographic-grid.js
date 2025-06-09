// Holographic Grid System - Enhanced for better visibility and reliability
(function() {
    const GRID_DEBUG = true; // Enable debugging to help diagnose issues
    console.log("Grid module loading...");

    // Global references
    let gridOverlay, isGridVisible = true;
    let gridCells = [];
    let gridInitialized = false;
    let initAttempts = 0;
    const MAX_INIT_ATTEMPTS = 5;
    
    // Track all grid instances to ensure proper cleanup
    const allGridInstances = [];

    function safeGridCall(fn, ...args) {
        try {
            return fn(...args);
        } catch (e) {
            console.error(`Grid error in ${fn.name || 'anonymous function'}:`, e);
            return null;
        }
    }
    
    // New function to clean up all existing grids
    function cleanupAllGrids() {
        console.log("Cleaning up all existing grids...");
        
        if (!window.scene) {
            console.warn("No scene available for grid cleanup");
            return;
        }
        
        // Find and remove all grid objects from the scene
        const gridsToRemove = [];
        
        // Look for objects that match our grid characteristics
        window.scene.traverse(object => {
            // Check if this object is likely a grid
            const isLikelyGrid = (
                // Check material properties typical for our grid
                (object.material && (
                    (object.material.isShaderMaterial && object.material.uniforms && object.material.uniforms.time) ||
                    object.material.color && object.material.color.getHexString() === "00ffff"
                )) ||
                // Check for grid in name
                (object.name && object.name.toLowerCase().includes('grid')) ||
                // Check for grid in our tracking array
                allGridInstances.includes(object)
            );
            
            if (isLikelyGrid) {
                gridsToRemove.push(object);
            }
        });
        
        // Remove all identified grids
        for (const grid of gridsToRemove) {
            console.log("Removing grid:", grid);
            window.scene.remove(grid);
            
            // Dispose of resources
            if (grid.geometry) grid.geometry.dispose();
            if (grid.material) {
                if (Array.isArray(grid.material)) {
                    grid.material.forEach(m => m.dispose());
                } else {
                    grid.material.dispose();
                }
            }
            
            // Remove from tracking array
            const index = allGridInstances.indexOf(grid);
            if (index !== -1) {
                allGridInstances.splice(index, 1);
            }
        }
        
        // Clear the current reference
        gridOverlay = null;
        console.log(`Cleaned up ${gridsToRemove.length} grid instance(s)`);
        
        // Reset initialization flag (important!)
        gridInitialized = false;
    }

    function initHolographicGrid() {
        console.log("Attempting to initialize holographic grid...");
        
        // Always clean up existing grids first
        cleanupAllGrids();
        
        // Check if dependencies exist
        if (!window.THREE) {
            console.error("THREE.js not available for grid initialization");
            return false;
        }
        
        if (!window.scene || !window.globe) {
            initAttempts++;
            console.warn(`Scene or globe not ready for grid initialization (attempt ${initAttempts}/${MAX_INIT_ATTEMPTS})`);
            
            // Schedule retry with increasing delay
            if (initAttempts < MAX_INIT_ATTEMPTS) {
                setTimeout(initHolographicGrid, 500 * initAttempts);
            } else {
                console.error("Failed to initialize grid after maximum attempts - scene or globe not available");
                // Try creating a simplified grid instead
                return createSimplifiedGrid();
            }
            return false;
        }
        
        try {
            console.log("Creating holographic grid overlay...");
            
            // Create holographic grid overlay
            const radius = 1.01; // Slightly larger than the Earth for better visibility
            const segments = 24; // Number of segments (cells) per dimension
            const gridGeometry = new THREE.SphereGeometry(radius, segments*2, segments);
            
            // Create wireframe material with enhanced holographic effect
            const gridMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0.0 },
                    color: { value: new THREE.Color(0x00ffff) },
                    intensity: { value: 1.0 }, // Increased from 0.8 for better visibility
                    cellHighlight: { value: new THREE.Vector2(-1, -1) },
                    totalCells: { value: new THREE.Vector2(segments*2, segments) },
                    selectedCell: { value: new THREE.Vector2(-1, -1) }
                },
                vertexShader: `
                    varying vec3 vPosition;
                    varying vec2 vUv;
                    varying vec2 vCellId;
                    uniform vec2 totalCells;
                    
                    void main() {
                        vPosition = position;
                        vUv = uv;
                        // Calculate cell ID based on UV coordinates
                        vCellId = vec2(
                            floor(vUv.x * totalCells.x),
                            floor(vUv.y * totalCells.y)
                        );
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec3 color;
                    uniform float intensity;
                    uniform vec2 cellHighlight;
                    uniform vec2 totalCells;
                    uniform vec2 selectedCell;
                    
                    varying vec3 vPosition;
                    varying vec2 vUv;
                    varying vec2 vCellId;
                    
                    void main() {
                        // Enhanced grid lines for better visibility
                        float lineWidth = 0.02; // Increased line width
                        float latLine = smoothstep(1.0-lineWidth, 1.0, abs(sin(vUv.y * 30.0)));
                        float longLine = smoothstep(1.0-lineWidth, 1.0, abs(sin(vUv.x * 30.0)));
                        
                        // Brighter base color
                        vec3 cellColor = color * 1.5;
                        
                        // Check if cell is highlighted by system
                        bool isCellHighlighted = (cellHighlight.x >= 0.0) && 
                                                (vCellId.x == cellHighlight.x) && 
                                                (vCellId.y == cellHighlight.y);
                        
                        // Check if cell is selected by user
                        bool isCellSelected = (selectedCell.x >= 0.0) && 
                                             (vCellId.x == selectedCell.x) && 
                                             (vCellId.y == selectedCell.y);
                        
                        if (isCellHighlighted) {
                            cellColor = vec3(1.0, 0.8, 0.4) * 1.5; // Brighter highlight color
                        }
                        
                        if (isCellSelected) {
                            cellColor = vec3(0.0, 1.0, 0.8) * 1.5; // Brighter selection color
                            // Add pulse effect for selected cell
                            cellColor *= 0.8 + 0.6 * sin(time * 3.0); // Enhanced pulse
                        }
                        
                        // Enhanced edge detection
                        float edge = max(latLine, longLine);
                        
                        // Add equator and prime meridian emphasis with thicker lines
                        float equator = smoothstep(0.96, 1.0, abs(sin(vUv.y * 3.14159)));
                        float meridian = smoothstep(0.96, 1.0, abs(sin(vUv.x * 3.14159)));
                        float majorLines = max(equator, meridian) * 2.0; // More prominent
                        
                        // Pulse effect
                        float pulse = 0.7 + 0.5 * sin(time * 0.8); // Enhanced pulse
                        
                        // Data scanning effect
                        float scanLine = step(0.98, sin(vUv.y * 100.0 - time * 3.0));
                        
                        // Combine effects with stronger opacity
                        float alpha = (edge * intensity * pulse + scanLine * 0.7 + majorLines) * 1.2;
                        
                        // Increase alpha for highlighted or selected cells
                        if (isCellHighlighted) {
                            alpha = min(alpha + 0.5, 1.0);
                        }
                        
                        if (isCellSelected) {
                            alpha = min(alpha + 0.7, 1.0);
                        }
                        
                        // Transparency gradient based on angle to camera (less fade-out)
                        float viewFactor = abs(dot(normalize(vPosition), vec3(0.0, 0.0, 1.0)));
                        alpha *= pow(1.0 - viewFactor, 1.3) * 3.0; // Less fade at edges
                        
                        // Discard nearly transparent pixels for better performance
                        if (alpha < 0.01) discard;
                        
                        // Enhanced color variations
                        vec3 finalColor = cellColor;
                        finalColor.g += 0.3 * sin(time * 0.1 + vUv.y * 10.0);
                        finalColor.b += 0.2 * cos(time * 0.2 + vUv.x * 10.0);
                        
                        gl_FragColor = vec4(finalColor, alpha);
                    }
                `,
                transparent: true,
                wireframe: false,
                side: THREE.FrontSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                depthTest: true // Ensure proper depth testing
            });
            
            gridOverlay = new THREE.Mesh(gridGeometry, gridMaterial);
            gridOverlay.name = "EarthGrid"; // Add name for easier identification
            window.scene.add(gridOverlay);
            
            // Add to tracking array
            allGridInstances.push(gridOverlay);
            
            // Create cell ID mapping
            const cellCount = segments * 2 * segments;
            gridCells = []; // Clear any previous cells
            for (let y = 0; y < segments; y++) {
                for (let x = 0; x < segments * 2; x++) {
                    gridCells.push({
                        id: y * segments * 2 + x,
                        x: x,
                        y: y,
                        name: `Cell ${x}-${y}`,
                        data: `Grid section ${x}-${y}`
                    });
                }
            }
            
            // Ensure grid is visible initially
            gridOverlay.visible = isGridVisible;
            console.log("Holographic grid successfully initialized with", gridCells.length, "cells");
            
            // Update the grid toggle button text to reflect current state
            const gridToggleBtn = document.getElementById('gridToggle');
            if (gridToggleBtn) {
                gridToggleBtn.textContent = isGridVisible ? 'Hide Grid' : 'Show Grid';
            }
            
            // Make grid available globally
            window.gridOverlay = gridOverlay;
            gridInitialized = true;
            initAttempts = 0; // Reset attempts counter
            
            // Highlight random cells periodically to demonstrate the feature
            setInterval(highlightRandomCell, 3000);
            
            // Return success
            return true;
        } catch (e) {
            console.error("Error creating holographic grid:", e);
            // Try simplified grid as fallback
            return createSimplifiedGrid();
        }
    }

    function createSimplifiedGrid() {
        console.log("Creating simplified fallback grid...");
        
        // Always clean up existing grids first
        cleanupAllGrids();
        
        try {
            if (!window.scene) {
                console.error("Scene not available for simplified grid");
                return false;
            }
            
            const radius = 1.01; // Slightly larger than Earth
            const wireframe = new THREE.WireframeGeometry(
                new THREE.SphereGeometry(radius, 24, 12)
            );
            const material = new THREE.LineBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.7, // Increased opacity for better visibility
                linewidth: 2 // Note: This only works in some browsers
            });
            gridOverlay = new THREE.LineSegments(wireframe, material);
            gridOverlay.name = "SimplifiedEarthGrid"; // Add name for easier identification
            window.scene.add(gridOverlay);
            
            // Add to tracking array
            allGridInstances.push(gridOverlay);
            
            isGridVisible = true;
            gridInitialized = true;
            initAttempts = 0; // Reset attempts counter
            window.gridOverlay = gridOverlay;
            
            // Create simplified cell mapping
            const segments = 24;
            gridCells = [];
            for (let y = 0; y < segments/2; y++) {
                for (let x = 0; x < segments; x++) {
                    gridCells.push({
                        id: y * segments + x,
                        x: x,
                        y: y,
                        name: `Cell ${x}-${y}`,
                        data: `Grid section ${x}-${y}`
                    });
                }
            }
            
            console.log("Simplified grid created successfully");
            return true;
        } catch (e) {
            console.error("Failed to create simplified grid:", e);
            return false;
        }
    }

    function updateHolographicGrid(elapsedTime) {
        if (!gridInitialized) {
            // If grid isn't initialized yet, try to initialize it
            if (window.scene && window.globe && initAttempts < MAX_INIT_ATTEMPTS) {
                initHolographicGrid();
                return;
            }
        }
        
        if (gridOverlay) {
            try {
                // Update time for animation if it's a shader material
                if (gridOverlay.material && gridOverlay.material.uniforms && gridOverlay.material.uniforms.time) {
                    gridOverlay.material.uniforms.time.value = elapsedTime;
                }
                
                // Match Earth's rotation
                if (window.globe) {
                    gridOverlay.rotation.y = window.globe.rotation.y;
                    gridOverlay.rotation.x = window.globe.rotation.x;
                    gridOverlay.rotation.z = window.globe.rotation.z;
                }
            } catch (e) {
                console.warn("Error updating grid:", e);
            }
        }
    }

    function toggleGrid() {
        if (!gridInitialized && window.scene && window.globe) {
            // Try to initialize the grid if it hasn't been yet
            console.log("Grid not initialized, attempting to initialize now...");
            initHolographicGrid();
        }
        
        if (gridOverlay) {
            isGridVisible = !isGridVisible;
            gridOverlay.visible = isGridVisible;
            const btn = document.getElementById('gridToggle');
            if (btn) {
                btn.textContent = isGridVisible ? 'Hide Grid' : 'Show Grid';
                // Add visual feedback when toggled
                btn.style.backgroundColor = isGridVisible ? 'rgba(40, 120, 160, 0.8)' : 'rgba(30, 60, 90, 0.7)';
                setTimeout(() => {
                    btn.style.backgroundColor = '';
                }, 300);
            }
            
            console.log("Grid visibility toggled:", isGridVisible);
            
            // Show a notification for better user feedback
            if (typeof showNotification === 'function') {
                showNotification(`Grid ${isGridVisible ? 'enabled' : 'disabled'}`);
            }
        } else {
            console.warn("Grid overlay not initialized yet, cannot toggle");
            if (typeof showNotification === 'function') {
                showNotification("Grid not available yet, please try again in a moment", "error");
            }
        }
    }

    function highlightRandomCell() {
        if (gridOverlay && gridOverlay.material && gridOverlay.material.uniforms && isGridVisible && gridInitialized) {
            try {
                // Either select a random cell or clear the highlight
                if (Math.random() > 0.3) {
                    const randomCell = gridCells[Math.floor(Math.random() * gridCells.length)];
                    if (randomCell && gridOverlay.material.uniforms.cellHighlight) {
                        gridOverlay.material.uniforms.cellHighlight.value.x = randomCell.x;
                        gridOverlay.material.uniforms.cellHighlight.value.y = randomCell.y;
                        
                        // Add cell identification tooltip
                        showCellTooltip(randomCell);
                    }
                } else {
                    // Clear highlight
                    if (gridOverlay.material.uniforms.cellHighlight) {
                        gridOverlay.material.uniforms.cellHighlight.value.x = -1;
                        gridOverlay.material.uniforms.cellHighlight.value.y = -1;
                    }
                    
                    // Remove tooltip
                    hideCellTooltip();
                }
            } catch (e) {
                console.warn("Error in highlightRandomCell:", e);
            }
        }
    }

    function showCellTooltip(cell) {
        if (!cell) return;
        
        let tooltip = document.getElementById('cellTooltip');
        
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'cellTooltip';
            tooltip.className = 'cell-tooltip';
            document.body.appendChild(tooltip);
        }
        
        // Add data and cell ID
        tooltip.innerHTML = `
            <div><strong>Cell ID: ${cell.x}-${cell.y}</strong></div>
            <div>${cell.data || 'No data available'}</div>
            ${cell.latitude ? `<div>Approx: ${cell.latitude.toFixed(1)}°, ${cell.longitude.toFixed(1)}°</div>` : ''}
        `;
        
        // Position randomly within the viewport to avoid obscuring the grid
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        tooltip.style.left = `${Math.random() * viewportWidth * 0.6 + viewportWidth * 0.2}px`;
        tooltip.style.top = `${Math.random() * viewportHeight * 0.5 + viewportHeight * 0.2}px`;
        tooltip.classList.add('visible');
        
        // Set timeout to hide tooltip
        setTimeout(hideCellTooltip, 4000);
    }

    function hideCellTooltip() {
        const tooltip = document.getElementById('cellTooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
        }
    }

    function highlightCellByCoordinates(x, y) {
        if (gridOverlay && gridOverlay.material && gridOverlay.material.uniforms && gridInitialized) {
            try {
                gridOverlay.material.uniforms.cellHighlight.value.x = x;
                gridOverlay.material.uniforms.cellHighlight.value.y = y;
            } catch (e) {
                console.warn("Error in highlightCellByCoordinates:", e);
            }
        }
    }

    function highlightUserSelectedCell(x, y) {
        if (gridOverlay && gridOverlay.material && gridOverlay.material.uniforms && gridInitialized) {
            try {
                gridOverlay.material.uniforms.selectedCell.value.x = x;
                gridOverlay.material.uniforms.selectedCell.value.y = y;
                
                // Make sure grid is visible when cell is selected
                if (!isGridVisible) {
                    toggleGrid(); // Show grid when selecting a cell
                }
            } catch (e) {
                console.warn("Error in highlightUserSelectedCell:", e);
            }
        }
    }

    function getCellAtLatLong(latitude, longitude) {
        if (!gridInitialized) return null;
        
        try {
            const segments = gridOverlay && gridOverlay.material && gridOverlay.material.uniforms ? 
                gridOverlay.material.uniforms.totalCells.value : 
                { x: 48, y: 24 }; // Fallback values if uniforms not available
            
            const x = Math.floor(((longitude + 180) / 360) * segments.x) % segments.x;
            const y = Math.floor(((90 - latitude) / 180) * segments.y);
            
            const cell = gridCells.find(c => c.x === x && c.y === y);
            
            // Add lat/long info to cell data
            if (cell) {
                cell.latitude = latitude;
                cell.longitude = longitude;
            }
            
            return cell;
        } catch (e) {
            console.warn("Error in getCellAtLatLong:", e);
            return null;
        }
    }

    function forceGridRefresh() {
        console.log("Forcing grid refresh...");
        
        // Clean up all existing grids first
        cleanupAllGrids();
        
        // Try to create a new grid
        return initHolographicGrid();
    }

    // Expose functions to global scope
    window.toggleGrid = toggleGrid;
    window.getCellAtLatLong = getCellAtLatLong;
    window.highlightCellByCoordinates = highlightCellByCoordinates;
    window.highlightUserSelectedCell = highlightUserSelectedCell;
    window.initHolographicGrid = initHolographicGrid;
    window.updateHolographicGrid = updateHolographicGrid;
    window.forceGridRefresh = forceGridRefresh;
    window.cleanupAllGrids = cleanupAllGrids; // Export cleanup function
    
    // Make gridCells available for other scripts
    window.gridCells = gridCells;

    console.log("Holographic grid module loaded and ready");
})(); // End IIFE for isolation