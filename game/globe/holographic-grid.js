// Holographic Grid System - Isolated from React errors
(function() {
    const GRID_DEBUG = false; // Set to true to enable verbose grid debugging

    function safeGridCall(fn, ...args) {
        try {
            return fn(...args);
        } catch (e) {
            if (GRID_DEBUG) {
                console.error(`Grid error in ${fn.name || 'anonymous function'}:`, e);
            } else {
                console.warn(`Grid function error suppressed. Enable GRID_DEBUG for details.`);
            }
            return null;
        }
    }

    let gridOverlay, isGridVisible = true;
    let gridCells = [];

    function initHolographicGrid() {
        if (!window.scene || !window.globe) {
            console.warn("Scene or globe not ready for grid initialization");
            return;
        }
        
        console.log("Initializing holographic grid...");
        
        try {
            // Create holographic grid overlay
            const radius = 1.05; // Slightly larger than the Earth
            const segments = 24; // Number of segments (cells) per dimension
            const gridGeometry = new THREE.SphereGeometry(radius, segments*2, segments);
            
            // Create wireframe material with holographic effect
            const gridMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0.0 },
                    color: { value: new THREE.Color(0x00ffff) },
                    intensity: { value: 0.8 },
                    cellHighlight: { value: new THREE.Vector2(-1, -1) }, // Default no highlight
                    totalCells: { value: new THREE.Vector2(segments*2, segments) },
                    selectedCell: { value: new THREE.Vector2(-1, -1) } // For user selections
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
                        // Grid lines based on latitude and longitude
                        float latLine = abs(sin(vUv.y * 30.0));
                        float longLine = abs(sin(vUv.x * 30.0));
                        
                        // Cell ID colors for visual identification
                        vec3 cellColor = color;
                        // Use cell ID to create subtle color variations
                        cellColor.r += mod(vCellId.x, 5.0) / 20.0;
                        cellColor.g += mod(vCellId.y, 5.0) / 20.0;
                        cellColor.b += mod(vCellId.x + vCellId.y, 7.0) / 20.0;
                        
                        // Check if cell is highlighted by system
                        bool isCellHighlighted = (cellHighlight.x >= 0.0) && 
                                                (vCellId.x == cellHighlight.x) && 
                                                (vCellId.y == cellHighlight.y);
                        
                        // Check if cell is selected by user
                        bool isCellSelected = (selectedCell.x >= 0.0) && 
                                             (vCellId.x == selectedCell.x) && 
                                             (vCellId.y == selectedCell.y);
                        
                        if (isCellHighlighted) {
                            cellColor = vec3(1.0, 0.8, 0.4); // System highlight color
                        }
                        
                        if (isCellSelected) {
                            cellColor = vec3(0.0, 1.0, 0.8); // User selection color
                            // Add pulse effect for selected cell
                            cellColor *= 0.8 + 0.4 * sin(time * 3.0);
                        }
                        
                        // Display cell ID numbers (subtle effect)
                        float cellIdEffect = 0.0;
                        if (abs(fract(vUv.x * totalCells.x) - 0.5) < 0.2 && 
                            abs(fract(vUv.y * totalCells.y) - 0.5) < 0.2) {
                            cellIdEffect = 0.4; // Brightness in center of cells
                        }
                        
                        // Pulse effect
                        float pulse = 0.6 + 0.4 * sin(time * 0.5);
                        
                        // Data scanning effect
                        float scanLine = step(0.98, sin(vUv.y * 100.0 - time * 2.0));
                        
                        // Edge intensity for grid lines with varying thickness
                        float latThickness = 0.97 + 0.02 * sin(time * 0.2 + vUv.x * 5.0);
                        float longThickness = 0.97 + 0.02 * cos(time * 0.3 + vUv.y * 5.0);
                        
                        float latEdge = step(latThickness, latLine);
                        float longEdge = step(longThickness, longLine);
                        float edge = max(latEdge, longEdge);
                        
                        // Add equator and prime meridian emphasis
                        float equator = smoothstep(0.98, 1.0, abs(sin(vUv.y * 3.14159)));
                        float meridian = smoothstep(0.98, 1.0, abs(sin(vUv.x * 3.14159)));
                        float majorLines = max(equator, meridian) * 1.5;
                        
                        // Combine effects
                        float alpha = (edge * intensity * (0.6 + 0.4 * pulse) + scanLine * 0.5 + majorLines + cellIdEffect) * 0.8;
                        
                        // Increase alpha for highlighted or selected cells
                        if (isCellHighlighted) {
                            alpha = min(alpha + 0.3, 1.0);
                        }
                        
                        if (isCellSelected) {
                            alpha = min(alpha + 0.5, 1.0);
                        }
                        
                        // Transparency gradient based on angle to camera
                        float viewFactor = abs(dot(normalize(vPosition), vec3(0.0, 0.0, 1.0)));
                        alpha *= pow(1.0 - viewFactor, 1.5) * 2.0;
                        
                        // Discard nearly transparent pixels for better performance
                        if (alpha < 0.01) discard;
                        
                        // Color variations based on position
                        vec3 finalColor = cellColor;
                        finalColor.g += 0.2 * sin(time * 0.1 + vUv.y * 10.0);
                        finalColor.b += 0.1 * cos(time * 0.2 + vUv.x * 10.0);
                        
                        gl_FragColor = vec4(finalColor, alpha);
                    }
                `,
                transparent: true,
                wireframe: false,
                side: THREE.FrontSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            
            gridOverlay = new THREE.Mesh(gridGeometry, gridMaterial);
            window.scene.add(gridOverlay);
            
            // Create cell ID mapping
            const cellCount = segments * 2 * segments;
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
            console.log("Holographic grid initialized with", gridCells.length, "cells");
            
            // Update the grid toggle button text to reflect current state
            const gridToggleBtn = document.getElementById('gridToggle');
            if (gridToggleBtn) {
                gridToggleBtn.textContent = isGridVisible ? 'Hide Grid' : 'Show Grid';
            }
            
            // Make grid available globally
            window.gridOverlay = gridOverlay;
            
            // Highlight random cells periodically to demonstrate the feature
            setInterval(highlightRandomCell, 3000);
        } catch (e) {
            console.error("Error creating holographic grid:", e);
            // Try simplified grid as fallback
            try {
                createSimplifiedGrid();
            } catch (err) {
                console.error("Could not create fallback grid either:", err);
            }
        }
    }

    function createSimplifiedGrid() {
        console.log("Creating simplified fallback grid...");
        const radius = 1.05;
        const wireframe = new THREE.WireframeGeometry(
            new THREE.SphereGeometry(radius, 24, 12)
        );
        const material = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3
        });
        gridOverlay = new THREE.LineSegments(wireframe, material);
        window.scene.add(gridOverlay);
        isGridVisible = true;
        console.log("Simplified grid created");
    }

    function updateHolographicGrid(elapsedTime) {
        if (gridOverlay && gridOverlay.material.uniforms) {
            // Update time for animation
            gridOverlay.material.uniforms.time.value = elapsedTime;
            
            // Match Earth's rotation
            if (window.globe) {
                gridOverlay.rotation.y = window.globe.rotation.y;
                gridOverlay.rotation.x = window.globe.rotation.x;
            }
        }
    }

    function toggleGrid() {
        if (gridOverlay) {
            isGridVisible = !isGridVisible;
            gridOverlay.visible = isGridVisible;
            document.getElementById('gridToggle').textContent = isGridVisible ? 'Hide Grid' : 'Show Grid';
            console.log("Grid visibility:", isGridVisible);
        } else {
            console.warn("Grid overlay not initialized yet");
        }
    }

    function highlightRandomCell() {
        if (gridOverlay && gridOverlay.material.uniforms && isGridVisible) {
            // Either select a random cell or clear the highlight
            if (Math.random() > 0.3) {
                const randomCell = gridCells[Math.floor(Math.random() * gridCells.length)];
                gridOverlay.material.uniforms.cellHighlight.value.x = randomCell.x;
                gridOverlay.material.uniforms.cellHighlight.value.y = randomCell.y;
                
                // Add cell identification tooltip
                showCellTooltip(randomCell);
            } else {
                // Clear highlight
                gridOverlay.material.uniforms.cellHighlight.value.x = -1;
                gridOverlay.material.uniforms.cellHighlight.value.y = -1;
                
                // Remove tooltip
                hideCellTooltip();
            }
        }
    }

    function showCellTooltip(cell) {
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
        if (gridOverlay && gridOverlay.material.uniforms) {
            gridOverlay.material.uniforms.cellHighlight.value.x = x;
            gridOverlay.material.uniforms.cellHighlight.value.y = y;
        }
    }

    function highlightUserSelectedCell(x, y) {
        if (gridOverlay && gridOverlay.material.uniforms) {
            gridOverlay.material.uniforms.selectedCell.value.x = x;
            gridOverlay.material.uniforms.selectedCell.value.y = y;
        }
    }

    function getCellAtLatLong(latitude, longitude) {
        if (!gridOverlay || !gridOverlay.material.uniforms) return null;
        
        const segments = gridOverlay.material.uniforms.totalCells.value;
        const x = Math.floor(((longitude + 180) / 360) * segments.x) % segments.x;
        const y = Math.floor(((90 - latitude) / 180) * segments.y);
        
        const cell = gridCells.find(c => c.x === x && c.y === y);
        
        // Add lat/long info to cell data
        if (cell) {
            cell.latitude = latitude;
            cell.longitude = longitude;
        }
        
        return cell;
    }

    // Expose functions to global scope if needed
    window.toggleGrid = toggleGrid;
    window.getCellAtLatLong = getCellAtLatLong;
    window.highlightCellByCoordinates = highlightCellByCoordinates;
    window.highlightUserSelectedCell = highlightUserSelectedCell;
    window.initHolographicGrid = initHolographicGrid;
    window.updateHolographicGrid = updateHolographicGrid;
    
    // Make sure gridCells is available for other scripts
    window.gridCells = gridCells;

    // Don't initialize here - we'll call this from script.js after scene is ready
    console.log("Holographic grid module loaded and protected from React errors");
})(); // End IIFE for isolation