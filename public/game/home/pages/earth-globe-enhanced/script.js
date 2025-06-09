// Earth Application - Main Script
// Wrap everything in an IIFE for isolation from React errors
(function() {
    // Enhanced safe call function with React error patterns detection
    function safeCall(fn, ...args) {
        try {
            return fn(...args);
        } catch (e) {
            // Check if this is a React-specific error to suppress verbose logging
            const isReactError = e && (
                (e.message && (
                    e.message.includes('React') ||
                    e.message.includes('invariant') ||
                    e.message.includes('Minified React error')
                )) ||
                (e.stack && (
                    e.stack.includes('index-DiA2R7Cl.js') ||
                    e.stack.includes('react-dom') ||
                    e.stack.includes('MessagePort')
                ))
            );
            
            if (!isReactError) {
                console.error(`Error in ${fn.name || 'anonymous function'}:`, e);
            } else {
                // Just log the function name for React errors to reduce console spam
                console.warn(`React error suppressed in ${fn.name || 'anonymous function'}`);
            }
            return null;
        }
    }

    let scene, camera, renderer, globe, controls;
    let atmosphere;
    let clock = new THREE.Clock();
    let isAtmosphereVisible = true;
    let isLoading = true;
    let directionalLight, ambientLight;
    let raycaster, mouse;
    let selectedLocation = null;
    let gridInitialized = false;
    let globalErrorCount = 0;
    let lastGridInitAttempt = -1;

    // Enhanced initialization with React error protection
    function init() {
        // Additional protection against React errors during initialization
        try {
            // Temporarily disable console.error to prevent React error spam during init
            const originalConsoleError = console.error;
            console.error = function(...args) {
                if (args[0] && typeof args[0] === 'string' && (
                    args[0].includes('React') || 
                    args[0].includes('Minified React error') ||
                    args[0].includes('index-DiA2R7Cl')
                )) {
                    // Suppress React errors during initialization
                    return;
                }
                originalConsoleError.apply(console, args);
            };
            
            // Start initialization in a separate try block
            try {
                // Create safety boundary for our app
                try {
                    // Create scene
                    scene = new THREE.Scene();
                    
                    // Make scene globally available for grid and other components
                    window.scene = scene;
                    
                    // Create camera
                    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                    camera.position.z = 2;
                    
                    // Create renderer with error handling
                    try {
                        renderer = new THREE.WebGLRenderer({ 
                            antialias: true, 
                            alpha: true,
                            preserveDrawingBuffer: true // Important for some effects
                        });
                        renderer.setSize(window.innerWidth, window.innerHeight);
                        renderer.setPixelRatio(window.devicePixelRatio);
                        renderer.setClearColor(0x000000, 0);
                        document.getElementById('container').appendChild(renderer.domElement);
                    } catch (e) {
                        console.error("WebGL renderer creation failed:", e);
                        const errorMessage = document.createElement('div');
                        errorMessage.style.position = 'fixed';
                        errorMessage.style.top = '50%';
                        errorMessage.style.left = '50%';
                        errorMessage.style.transform = 'translate(-50%, -50%)';
                        errorMessage.style.color = 'white';
                        errorMessage.style.background = 'rgba(255,0,0,0.7)';
                        errorMessage.style.padding = '20px';
                        errorMessage.style.borderRadius = '10px';
                        errorMessage.innerHTML = '<h2>WebGL Error</h2><p>Your browser does not support WebGL or it has been disabled. Please check your browser settings.</p>';
                        document.body.appendChild(errorMessage);
                        document.getElementById('loading').style.display = 'none';
                        return;
                    }
                    
                    // Add controls
                    controls = new THREE.OrbitControls(camera, renderer.domElement);
                    controls.enableDamping = true;
                    controls.dampingFactor = 0.05;
                    controls.rotateSpeed = 0.5;
                    controls.minDistance = 1.2;
                    controls.maxDistance = 10;
                    controls.autoRotate = false;
                    controls.autoRotateSpeed = 0.2;
                    
                    // Add ambient light
                    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
                    scene.add(ambientLight);
                    
                    // Add directional light (will be controlled by time.js)
                    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
                    directionalLight.position.set(5, 3, 5);
                    scene.add(directionalLight);
                    
                    // Make light available globally for time.js
                    window.directionalLight = directionalLight;
                    window.ambientLight = ambientLight;
                    
                    // Add starfield
                    createStarfield();
                    
                    // Create Earth
                    createEarth();
                    
                    // Initialize time display and simulation
                    if (typeof initTimeDisplay === 'function') {
                        safeCall(initTimeDisplay);
                    }
                    
                    // Initialize raycaster for globe interaction
                    raycaster = new THREE.Raycaster();
                    mouse = new THREE.Vector2();
                    
                    // Add event listeners for mouse interaction
                    renderer.domElement.addEventListener('click', onGlobeClick, false);
                    renderer.domElement.addEventListener('mousemove', onGlobeHover, false);
                    
                    // Add location info panel
                    createLocationInfoPanel();
                    
                    // Add day/night indicator
                    createDayNightIndicator();
                    
                    // Handle window resize
                    window.addEventListener('resize', onWindowResize, false);
                    
                    // Start animation loop
                    animate();
                    
                    // Initialize holographic grid after short delay to ensure scene is ready
                    setTimeout(() => {
                        if (typeof initHolographicGrid === 'function') {
                            console.log("Initializing grid via timeout");
                            const success = safeCall(initHolographicGrid);
                            gridInitialized = !!success;
                            if (gridInitialized) {
                                console.log("Grid initialized successfully via timeout");
                            } else {
                                console.warn("Grid initialization via timeout failed, will retry in animation loop");
                            }
                        }
                    }, 1000);
                    
                    // Schedule an additional delayed retry for grid initialization
                    setTimeout(() => {
                        if (!gridInitialized && typeof forceGridRefresh === 'function') {
                            console.log("Forcing grid refresh after 3 seconds");
                            forceGridRefresh();
                        }
                    }, 3000);
                    
                    // Add tooltip data for clarity
                    setTimeout(() => {
                        const gridToggle = document.getElementById('gridToggle');
                        if (gridToggle) gridToggle.setAttribute('data-tooltip', 'Toggle coordinate grid overlay');
                        
                        const atmosphereToggle = document.getElementById('atmosphereToggle');
                        if (atmosphereToggle) atmosphereToggle.setAttribute('data-tooltip', 'Toggle atmospheric effects');
                        
                        const resetCamera = document.getElementById('resetCamera');
                        if (resetCamera) resetCamera.setAttribute('data-tooltip', 'Reset to default view');
                    }, 1000);
                } catch (e) {
                    console.error("Critical initialization error:", e);
                    const errorMessage = document.createElement('div');
                    errorMessage.style.position = 'fixed';
                    errorMessage.style.top = '50%';
                    errorMessage.style.left = '50%';
                    errorMessage.style.transform = 'translate(-50%, -50%)';
                    errorMessage.style.color = 'white';
                    errorMessage.style.background = 'rgba(255,0,0,0.7)';
                    errorMessage.style.padding = '20px';
                    errorMessage.style.borderRadius = '10px';
                    errorMessage.innerHTML = `<h2>Application Error</h2><p>There was an error initializing the Earth Explorer: ${e.message}</p>`;
                    document.body.appendChild(errorMessage);
                    document.getElementById('loading').style.display = 'none';
                }
            } finally {
                // Restore console.error regardless of success/failure
                console.error = originalConsoleError;
            }
        } catch (e) {
            console.error("Safe init failed:", e);
            // Try once more with a longer delay
            setTimeout(() => {
                init();
                initPythonScriptButton();
            }, 1000);
        }
    }

    function createEarth() {
        // Load Earth texture with error handling
        const loadingManager = new THREE.LoadingManager();
        loadingManager.onLoad = () => {
            isLoading = false;
            document.getElementById('loading').style.display = 'none';
        };
        
        loadingManager.onError = (url) => {
            console.error('Error loading texture:', url);
            document.getElementById('loading').textContent = 'Error loading textures. Using fallback.';
            
            // Create a fallback texture if the image fails to load
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            // Draw a simple fallback Earth texture
            ctx.fillStyle = '#0077be'; // Ocean blue
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add some random green landmasses
            ctx.fillStyle = '#228B22'; // Forest green
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const size = 30 + Math.random() * 70;
                ctx.beginPath();
                ctx.ellipse(x, y, size, size * 0.7, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            
            const fallbackTexture = new THREE.CanvasTexture(canvas);
            createGlobeWithTexture(fallbackTexture, fallbackTexture);
        };
        
        const textureLoader = new THREE.TextureLoader(loadingManager);
        textureLoader.load('/earth_texture.jpg', 
            // Success callback
            function(earthTexture) {
                // Also load for bump map (same texture)
                textureLoader.load('/earth_texture.jpg', 
                    function(bumpTexture) {
                        createGlobeWithTexture(earthTexture, bumpTexture);
                    },
                    undefined, // Progress callback
                    function(error) {
                        console.error('Error loading bump texture:', error);
                        // Create globe with just the color texture
                        createGlobeWithTexture(earthTexture, null);
                    }
                );
            },
            undefined, // Progress callback
            function(error) {
                console.error('Error loading earth texture:', error);
                loadingManager.onError('/earth_texture.jpg'); // Trigger fallback
            }
        );
    }

    function createGlobeWithTexture(colorTexture, bumpTexture) {
        const globeGeometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Create material based on available textures
        const globeMaterial = new THREE.MeshPhongMaterial({
            map: colorTexture,
            // Only add these if bumpTexture is available
            bumpMap: bumpTexture || null,
            bumpScale: bumpTexture ? 0.02 : 0,
            specularMap: bumpTexture || null,
            specular: new THREE.Color(0x333333),
            shininess: 15,
            reflectivity: 0.2
        });
        
        globe = new THREE.Mesh(globeGeometry, globeMaterial);
        
        // Tilt the globe to match Earth's axial tilt
        globe.rotation.x = 0.41; // ~23.5 degrees in radians
        
        scene.add(globe);
        
        // Make globe globally available for other components
        window.globe = globe;
        
        // Add atmosphere
        createAtmosphere();
        
        // Initialize grid after Earth is created, but only if not already initialized
        if (!gridInitialized && typeof initHolographicGrid === 'function' && !window.gridOverlay) {
            try {
                console.log("Initializing grid after Earth creation");
                // First clean up any potential grid remnants
                if (typeof cleanupAllGrids === 'function') {
                    cleanupAllGrids();
                }
                
                // Initialize with a slight delay
                setTimeout(() => {
                    const success = initHolographicGrid();
                    gridInitialized = !!success;
                    
                    if (gridInitialized) {
                        console.log("Grid initialized successfully after Earth creation");
                    } else {
                        console.warn("Grid initialization failed after Earth creation");
                    }
                }, 500);
            } catch (e) {
                console.error("Grid initialization failed with error:", e);
            }
        }
        
        // Notify that Earth is ready
        console.log("Earth globe created and added to scene");
        showNotification("Earth loaded successfully", "success");
    }

    function createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(1.02, 64, 64);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0x0077ff) },
                sunPosition: { value: new THREE.Vector3(5, 3, 5) }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float time;
                uniform vec3 sunPosition;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    // Calculate view direction (from camera to fragment)
                    vec3 viewDir = normalize(-vPosition);
                    
                    // Calculate angle between surface normal and sun direction
                    vec3 normalizedSunPos = normalize(sunPosition);
                    float sunAngle = dot(vNormal, normalizedSunPos);
                    
                    // Fresnel effect - stronger at glancing angles
                    float fresnel = 1.0 - abs(dot(viewDir, vNormal));
                    fresnel = pow(fresnel, 3.0);
                    
                    // Atmospheric glow - enhanced by sun position
                    float glow = smoothstep(0.0, 1.0, fresnel) * 0.8;
                    
                    // Intensify glow on day side and reduce on night side
                    glow *= 0.7 + 0.3 * max(0.0, sunAngle);
                    
                    // Add some variation with time for a subtle shimmer
                    glow *= 0.8 + 0.2 * sin(time * 0.3 + gl_FragCoord.y * 0.05);
                    
                    // Adjust color based on sun position (bluer at night, whiter during day)
                    vec3 finalColor = mix(color, vec3(0.5, 0.7, 1.0), max(0.0, sunAngle * 0.5));
                    
                    gl_FragColor = vec4(finalColor, glow);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        
        atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphere);
    }

    function createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterials = [
            new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.8 }),
            new THREE.PointsMaterial({ color: 0xaaaaff, size: 0.05, transparent: true, opacity: 0.6 }),
            new THREE.PointsMaterial({ color: 0xffaaaa, size: 0.05, transparent: true, opacity: 0.7 })
        ];
        
        const starVertices = [];
        for (let i = 0; i < 15000; i++) {
            const x = THREE.MathUtils.randFloatSpread(2000);
            const y = THREE.MathUtils.randFloatSpread(2000);
            const z = THREE.MathUtils.randFloatSpread(2000);
            
            // Avoid stars inside Earth's vicinity
            if (Math.sqrt(x*x + y*y + z*z) < 20) continue;
            
            starVertices.push(x, y, z);
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        
        // Create multiple star clusters with different colors and sizes
        starMaterials.forEach((material, index) => {
            const stars = new THREE.Points(starGeometry, material);
            stars.rotation.x = Math.random() * Math.PI;
            stars.rotation.y = Math.random() * Math.PI;
            scene.add(stars);
        });
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Reposition UI elements when window is resized
        positionUIElements();
    }

    function resetCameraPosition() {
        try {
            // Avoid GSAP error by checking if it's available
            if (typeof gsap !== 'undefined') {
                gsap.to(camera.position, {
                    x: 0, y: 0, z: 2,
                    duration: 1.5,
                    ease: "power2.inOut"
                });
                
                gsap.to(controls.target, {
                    x: 0, y: 0, z: 0,
                    duration: 1.5,
                    ease: "power2.inOut",
                    onUpdate: function() {
                        controls.update();
                    }
                });
            } else {
                // Fallback to direct positioning without animation
                camera.position.set(0, 0, 2);
                controls.target.set(0, 0, 0);
                controls.update();
            }
            
            showNotification("View reset to default");
        } catch (e) {
            console.warn("Animation error, using direct positioning", e);
            camera.position.set(0, 0, 2);
            controls.target.set(0, 0, 0);
            controls.update();
        }
    }

    function toggleAtmosphere() {
        isAtmosphereVisible = !isAtmosphereVisible;
        if (atmosphere) {
            atmosphere.visible = isAtmosphereVisible;
            document.getElementById('atmosphereToggle').textContent = 
                isAtmosphereVisible ? 'Hide Atmosphere' : 'Show Atmosphere';
            
            showNotification(`Atmosphere ${isAtmosphereVisible ? 'visible' : 'hidden'}`);
        }
    }

    function createDayNightIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'dayNightIndicator';
        indicator.className = 'ui-panel';
        indicator.innerHTML = `
            <div class="indicator-label">
                <span>Midnight</span>
                <span>Noon</span>
                <span>Midnight</span>
            </div>
            <div class="day-night-bar">
                <div class="time-marker"></div>
            </div>
        `;
        document.body.appendChild(indicator);
        
        // Ensure correct initial positioning
        positionUIElements();
    }

    function positionUIElements() {
        const timeDisplay = document.getElementById('timeDisplay');
        const dayNightIndicator = document.getElementById('dayNightIndicator');
        
        if (timeDisplay && dayNightIndicator) {
            // Calculate the bottom position of the time display
            const timeRect = timeDisplay.getBoundingClientRect();
            const timeBottom = timeRect.bottom;
            
            // Position day/night indicator below time display with some margin
            dayNightIndicator.style.top = (timeBottom + 10) + 'px';
        }
    }

    function updateDayNightIndicator() {
        const timeHours = timeSimulation.getCurrentTimeHours();
        const percentage = (timeHours / 24) * 100;
        
        const marker = document.querySelector('.time-marker');
        if (marker) {
            marker.style.left = `${percentage}%`;
        }
    }

    function createLocationInfoPanel() {
        const panel = document.createElement('div');
        panel.id = 'locationInfo';
        panel.className = 'ui-panel';
        panel.innerHTML = `
            <div class="location-title">Location Info</div>
            <div class="location-details" id="locationCoords"></div>
            <div class="location-details" id="locationTime"></div>
            <div class="location-details" id="locationData"></div>
        `;
        document.body.appendChild(panel);
    }

    function onGlobeClick(event) {
        try {
            // Calculate mouse position in normalized device coordinates
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Show loading state in location panel
            const panel = document.getElementById('locationInfo');
            const coordsDisplay = document.getElementById('locationCoords');
            const timeDisplay = document.getElementById('locationTime');
            const dataDisplay = document.getElementById('locationData');
            
            coordsDisplay.textContent = 'Calculating...';
            coordsDisplay.classList.add('loading-text');
            timeDisplay.textContent = 'Loading time data...';
            timeDisplay.classList.add('loading-text');
            dataDisplay.textContent = 'Analyzing...';
            dataDisplay.classList.add('loading-text');
            
            // Raycast to the globe with a short delay to show loading state
            setTimeout(() => {
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObject(globe);
                
                if (intersects.length > 0) {
                    const intersectionPoint = intersects[0].point;
                    
                    // Calculate latitude and longitude from the intersection point
                    const lat = 90 - Math.acos(intersectionPoint.y) * 180 / Math.PI;
                    const lng = (Math.atan2(intersectionPoint.x, intersectionPoint.z) * 180 / Math.PI + 180) % 360 - 180;
                    
                    displayLocationInfo(lat, lng);
                    
                    // Find and highlight the corresponding grid cell
                    if (typeof getCellAtLatLong === 'function' && 
                        typeof highlightCellByCoordinates === 'function' && 
                        typeof highlightUserSelectedCell === 'function') {
                        
                        const cell = getCellAtLatLong(lat, lng);
                        if (cell) {
                            highlightCellByCoordinates(cell.x, cell.y);
                            highlightUserSelectedCell(cell.x, cell.y);
                            
                            // Show notification for better feedback
                            showNotification(`Selected location: ${lat.toFixed(1)}°, ${lng.toFixed(1)}°`);
                        } else {
                            console.warn("No grid cell found for coordinates:", lat, lng);
                        }
                    } else {
                        console.warn("Grid functions not available for location selection");
                        
                        // Try to force grid initialization if the grid functions are missing
                        if (!gridInitialized && typeof forceGridRefresh === 'function') {
                            console.log("Attempting to force grid refresh due to missing grid functions");
                            forceGridRefresh();
                        }
                    }
                    
                    // Store selected location
                    selectedLocation = { lat, lng };
                } else {
                    // Hide location info if click is not on globe
                    document.getElementById('locationInfo').classList.remove('visible');
                    selectedLocation = null;
                    
                    // Clear highlight
                    if (window.gridOverlay && window.gridOverlay.material && window.gridOverlay.material.uniforms) {
                        window.gridOverlay.material.uniforms.selectedCell.value.x = -1;
                        window.gridOverlay.material.uniforms.selectedCell.value.y = -1;
                    }
                }
                
                // Remove loading classes
                coordsDisplay.classList.remove('loading-text');
                timeDisplay.classList.remove('loading-text');
                dataDisplay.classList.remove('loading-text');
            }, 300);
        } catch (e) {
            console.error("Error handling globe click:", e);
            showNotification("Error selecting location", "error");
        }
    }

    function displayLocationInfo(lat, lng) {
        const panel = document.getElementById('locationInfo');
        const coordsDisplay = document.getElementById('locationCoords');
        const timeDisplay = document.getElementById('locationTime');
        const dataDisplay = document.getElementById('locationData');
        
        // Format coordinates
        const latDir = lat >= 0 ? 'N' : 'S';
        const lngDir = lng >= 0 ? 'E' : 'W';
        const latFormatted = `${Math.abs(lat).toFixed(2)}° ${latDir}`;
        const lngFormatted = `${Math.abs(lng).toFixed(2)}° ${lngDir}`;
        
        // Calculate local time based on longitude and simulation time
        const timeHours = timeSimulation.getCurrentTimeHours();
        const localTimeOffset = (lng / 15); // 15 degrees = 1 hour
        let localTime = (timeHours + localTimeOffset) % 24;
        if (localTime < 0) localTime += 24;
        
        // Format local time
        const localTimeFormatted = timeSimulation.formatTime(localTime);
        
        // Determine if it's day or night at this location
        const isDaytime = (localTime > 6 && localTime < 18);
        const isNoonish = (localTime > 10 && localTime < 14);
        const isMidnightish = (localTime < 3 || localTime > 21);
        const isDuskOrDawn = (localTime > 5 && localTime < 7) || (localTime > 17 && localTime < 19);
        
        let stateText = isDaytime ? 'Day' : 'Night';
        if (isDuskOrDawn) stateText = localTime < 12 ? 'Dawn' : 'Dusk';
        if (isNoonish) stateText = 'Solar Noon';
        if (isMidnightish) stateText = 'Night (Dark)';
        
        // Set the information
        coordsDisplay.textContent = `Coordinates: ${latFormatted}, ${lngFormatted}`;
        timeDisplay.textContent = `Local Time: ${localTimeFormatted}`;
        dataDisplay.textContent = `Current State: ${stateText}`;
        
        // Add region information from earth_regions.json if available
        try {
            // Use try-catch-finally instead of promises to handle the fetch
            const fetchRegions = () => {
                try {
                    // Use no-cors mode to avoid CORS errors
                    fetch('earth_regions.json', { mode: 'same-origin', credentials: 'same-origin' })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Earth regions data not available');
                            }
                            return response.json();
                        })
                        .then(data => processRegionData(data, lat, lng, panel))
                        .catch(error => {
                            console.warn('Could not fetch region data:', error);
                            addFallbackRegionInfo(lat, lng, panel);
                        });
                } catch (fetchError) {
                    console.warn('Fetch operation error:', fetchError);
                    addFallbackRegionInfo(lat, lng, panel);
                }
            };
            
            // Delay the fetch slightly to ensure DOM is ready
            setTimeout(fetchRegions, 50);
        } catch (e) {
            console.error("Error in region data retrieval:", e);
            addFallbackRegionInfo(lat, lng, panel);
        }
        
        // Show the panel
        panel.classList.add('visible');
    }
    
    // Break out the region data processing to a separate function
    function processRegionData(data, lat, lng, panel) {
        try {
            // Convert lat/lng to grid coordinates
            const gridWidth = data.grid_size.width; 
            const gridHeight = data.grid_size.height;
            
            // Calculate grid cell for these coordinates
            const x = Math.floor(((lng + 180) / 360) * gridWidth) % gridWidth;
            const y = Math.floor(((90 - lat) / 180) * gridHeight);
            
            // Get cell data
            const cellKey = `${x}_${y}`;
            const cellData = data.cells[cellKey];
            
            if (cellData) {
                // Create or update region info elements
                const regionInfo = document.createElement('div');
                regionInfo.className = 'location-details region-info';
                regionInfo.textContent = `Region: ${cellData.region}`;
                
                const featureInfo = document.createElement('div');
                featureInfo.className = 'location-details feature-info';
                
                // Format the top two features
                const topFeatures = Object.entries(cellData.features)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2);
                
                const featureText = topFeatures
                    .map(([feature, percentage]) => `${feature} (${percentage}%)`)
                    .join(', ');
                
                featureInfo.textContent = `Geography: ${featureText}`;
                
                // Replace existing elements or add new ones
                const existingRegion = panel.querySelector('.region-info');
                if (existingRegion) {
                    panel.replaceChild(regionInfo, existingRegion);
                } else {
                    panel.appendChild(regionInfo);
                }
                
                const existingFeature = panel.querySelector('.feature-info');
                if (existingFeature) {
                    panel.replaceChild(featureInfo, existingFeature);
                } else {
                    panel.appendChild(featureInfo);
                }
            } else {
                addFallbackRegionInfo(lat, lng, panel);
            }
        } catch (e) {
            console.error("Error processing region data:", e);
            addFallbackRegionInfo(lat, lng, panel);
        }
    }
    
    // Create a separate function for fallback region info
    function addFallbackRegionInfo(lat, lng, panel) {
        try {
            let region = "Unknown Region";
            
            // Very crude region estimation
            if (lat > 66) region = "Arctic";
            else if (lat < -66) region = "Antarctic";
            else if (lat > 23 && lat < 66) {
                if (lng > -11 && lng < 40) region = "Europe/Africa";
                else if (lng >= 40 && lng < 140) region = "Asia";
                else if (lng >= 140 || lng < -130) region = "North Pacific";
                else region = "North America";
            }
            else if (lat < -23 && lat > -66) {
                if (lng > -80 && lng < 20) region = "South Atlantic";
                else if (lng >= 20 && lng < 140) region = "Australia/Oceania";
                else region = "South Pacific";
            }
            else { // Tropical
                if (lng > -80 && lng < 15) region = "Central Africa";
                else if (lng >= 15 && lng < 140) region = "South Asia";
                else if (lng >= 140 || lng < -130) region = "Pacific Islands";
                else region = "Central/South America";
            }
            
            const regionInfo = document.createElement('div');
            regionInfo.className = 'location-details region-info';
            regionInfo.textContent = `Region: ${region}`;
            
            // Replace existing region info if it exists, otherwise append
            const existingRegion = panel.querySelector('.region-info');
            if (existingRegion) {
                panel.replaceChild(regionInfo, existingRegion);
            } else {
                panel.appendChild(regionInfo);
            }
        } catch (e) {
            console.error("Error adding fallback region info:", e);
        }
    }

    function onGlobeHover(event) {
        // Add subtle hover effect if needed
    }

    // Enhanced animate function with better error handling for React conflicts
    function animate() {
        // Request next frame first to keep animation loop running even if there's an error
        const animationId = requestAnimationFrame(animate);
        
        try {
            // Wrap each animation step in its own try-catch to isolate errors
            // This prevents a single React error from breaking the entire animation loop
            
            // Auto-rotate the globe slowly
            try {
                if (globe) {
                    globe.rotation.y += 0.0005;
                }
            } catch (e) {
                if (!e.message || !e.message.includes('React')) {
                    console.warn("Globe rotation error:", e);
                }
            }
            
            // Update atmosphere shader
            try {
                if (atmosphere && atmosphere.material && atmosphere.material.uniforms) {
                    atmosphere.material.uniforms.time.value = clock.getElapsedTime();
                    
                    // Pass sun position to atmosphere shader
                    if (directionalLight) {
                        atmosphere.material.uniforms.sunPosition.value = directionalLight.position;
                    }
                }
            } catch (e) {
                if (!e.message || !e.message.includes('React')) {
                    console.warn("Atmosphere update error:", e);
                }
            }
            
            // Update holographic grid
            try {
                const elapsedTime = clock.getElapsedTime();
                
                // Check if grid is initialized
                if (!gridInitialized) {
                    // Only attempt initialization once every few seconds
                    if (typeof initHolographicGrid === 'function' && window.globe && window.scene) {
                        // Only try every 3 seconds to avoid spamming initializations
                        if (Math.floor(elapsedTime) % 3 === 0 && Math.floor(elapsedTime) !== lastGridInitAttempt) {
                            console.log("Attempting to initialize grid during animation...");
                            // Store last attempt time
                            lastGridInitAttempt = Math.floor(elapsedTime);
                            const success = safeCall(initHolographicGrid);
                            gridInitialized = !!success;
                        }
                    }
                } else {
                    // Grid is initialized, update it
                    if (typeof updateHolographicGrid === 'function') {
                        safeCall(updateHolographicGrid, elapsedTime);
                    }
                }
            } catch (e) {
                if (!e.message || !e.message.includes('React')) {
                    console.warn("Grid update error:", e);
                    globalErrorCount++;
                    
                    // If we get too many errors, clean all grids and try again
                    if (globalErrorCount > 30 && typeof cleanupAllGrids === 'function' && typeof initHolographicGrid === 'function') {
                        console.log("Too many grid errors, cleaning up all grids...");
                        cleanupAllGrids();
                        setTimeout(() => {
                            initHolographicGrid();
                        }, 1000);
                        globalErrorCount = 0;
                    }
                }
            }
            
            // Update time simulation and sun position
            try {
                if (typeof updateTimeDisplay === 'function') {
                    safeCall(updateTimeDisplay);
                }
                
                if (typeof updateSunPosition === 'function') {
                    // Make sure directionalLight is defined first
                    if (window.directionalLight !== undefined) {
                        safeCall(updateSunPosition);
                    } else if (directionalLight !== undefined) {
                        // If window.directionalLight is undefined but local is defined, fix the reference
                        window.directionalLight = directionalLight;
                        safeCall(updateSunPosition);
                    }
                }
            } catch (e) {
                if (!e.message || !e.message.includes('React')) {
                    console.warn("Time update error:", e);
                }
            }
            
            // Update day/night indicator
            try {
                safeCall(updateDayNightIndicator);
            } catch (e) {
                console.error("Day/night indicator update error:", e);
            }
            
            // Update location info if a location is selected
            try {
                if (selectedLocation) {
                    safeCall(displayLocationInfo, selectedLocation.lat, selectedLocation.lng);
                }
            } catch (e) {
                console.error("Error updating location info:", e);
            }
            
            // Final rendering is separate to ensure it always happens
            try {
                if (controls) controls.update();
                if (renderer && scene && camera) renderer.render(scene, camera);
            } catch (e) {
                console.error("Rendering error:", e);
            }
        } catch (e) {
            console.error("Animation loop error:", e);
            // Don't cancel animation to keep trying
        }
    }

    // Enhanced network request interceptor with specific React error patterns
    function interceptNetworkRequests() {
        // Add more safety against WebSim network requests
        const originalXMLHttpRequestOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            if (typeof url === 'string' && (
                url.includes('websim.ai') ||
                url.includes('project-screenshots') ||
                url.includes('images.websim')
            )) {
                console.warn('Intercepted WebSim XMLHttpRequest:', url);
                url = 'data:application/json,{"success":false,"blocked":true}';
            }
            return originalXMLHttpRequestOpen.call(this, method, url, ...args);
        };
        
        // Add protection for dynamic image creation
        const originalObjectDefineProperty = Object.defineProperty;
        Object.defineProperty = function(obj, prop, descriptor) {
            // Check if this is defining a src property on an HTMLImageElement
            if (obj instanceof HTMLImageElement && prop === 'src' && descriptor && descriptor.set) {
                const originalSet = descriptor.set;
                descriptor.set = function(url) {
                    if (typeof url === 'string' && (
                        url.includes('websim.ai') || 
                        url.includes('project-screenshots') ||
                        url.includes('images.websim')
                    )) {
                        console.warn('Blocked WebSim image load from property descriptor:', url);
                        url = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                    }
                    return originalSet.call(this, url);
                };
            }
            return originalObjectDefineProperty.call(this, obj, prop, descriptor);
        };
        
        // Add additional protection against React-specific service worker errors
        if (window.navigator && window.navigator.serviceWorker) {
            try {
                // Check if we're in WebSim or other environment that doesn't support blob: URLs for service workers
                const isWebSim = window.location.hostname.includes('websim.ai');
                const isRestrictedEnvironment = isWebSim || 
                                              window.location.protocol === 'blob:' || 
                                              window.location.hostname.includes('.websim.ai');
                
                if (!isRestrictedEnvironment) {
                    // Only try to register a service worker in appropriate environments
                    if ('serviceWorker' in navigator) {
                        window.addEventListener('load', function() {
                            navigator.serviceWorker.register('/sw-earth-app.js')
                                .then(function() {
                                    console.log('Service worker registered');
                                })
                                .catch(function(error) {
                                    console.log('Service worker registration failed, using alternative protection:', error);
                                });
                        });
                    }
                } else {
                    console.log('Skipping service worker registration in restricted environment');
                }
            } catch (e) {
                console.warn('Could not create service worker:', e);
            }
        }
        
        // Specific React error #418 protection (message port related)
        if (window.MessagePort && window.MessagePort.prototype) {
            try {
                const originalAddEventListener = window.MessagePort.prototype.addEventListener;
                window.MessagePort.prototype.addEventListener = function(type, listener, options) {
                    try {
                        // Wrap the listener in a try-catch to prevent React errors
                        const wrappedListener = function(event) {
                            try {
                                return listener.call(this, event);
                            } catch (e) {
                                if (e && e.message && (
                                    e.message.includes('React') ||
                                    e.message.includes('Minified React error #418') ||
                                    e.message.includes('index-DiA2R7Cl.js')
                                )) {
                                    console.warn('Suppressed React MessagePort error');
                                    return;
                                }
                                throw e; // Re-throw non-React errors
                            }
                        };
                        return originalAddEventListener.call(this, type, wrappedListener, options);
                    } catch (e) {
                        console.warn('Error in MessagePort addEventListener:', e);
                        // Continue without the listener rather than crashing
                        return false;
                    }
                };
                
                // Also protect the postMessage function
                const originalPostMessage = window.MessagePort.prototype.postMessage;
                window.MessagePort.prototype.postMessage = function(...args) {
                    try {
                        return originalPostMessage.apply(this, args);
                    } catch (e) {
                        console.warn('Error in MessagePort postMessage, suppressed:', e);
                        return undefined;
                    }
                };
            } catch (e) {
                console.warn('Could not patch MessagePort:', e);
            }
        }
    }

    function initPythonScriptButton() {
        const runScriptButton = document.createElement('button');
        runScriptButton.id = 'runPythonScript';
        runScriptButton.textContent = 'Analyze Earth Texture';
        runScriptButton.setAttribute('data-tooltip', 'Run Python script to analyze geographical features');
        runScriptButton.addEventListener('click', runPythonAnalysis);
        
        // Add it to controls, before the gridToggle button
        const controls = document.getElementById('controls');
        const gridToggle = document.getElementById('gridToggle');
        if (controls && gridToggle) {
            controls.insertBefore(runScriptButton, gridToggle);
        }
    }
    
    function runPythonAnalysis() {
        const button = document.getElementById('runPythonScript');
        const originalText = button.textContent;
        button.textContent = 'Running Analysis...';
        button.disabled = true;
        
        // Simulate running the Python script instead of fetching, to avoid CORS errors
        try {
            setTimeout(() => {
                // Directly handle the simulated completion
                button.textContent = 'Analysis Complete!';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 3000);
                
                // Show success notification
                showNotification('Earth texture analysis simulated! In a real environment, run "python analyze_earth_texture.py" locally.');
                
                // Create simulated earth_regions.json from the Python script analysis
                simulateEarthRegionsData();
                
                // Force grid refresh to use the new data
                if (typeof forceGridRefresh === 'function') {
                    setTimeout(forceGridRefresh, 500);
                }
            }, 2000);
        } catch (error) {
            console.error('Error in simulated Python script:', error);
            button.textContent = 'Analysis Failed';
            
            // Show fallback message
            showNotification('Could not run Python script in browser. Please run "python analyze_earth_texture.py" locally.', 'error');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 3000);
        }
    }
    
    // Generate simulated region data instead of relying on actual Python output
    function simulateEarthRegionsData() {
        try {
            // Create a simplified version of what the Python script would generate
            const gridWidth = 48;
            const gridHeight = 24;
            const cells = {};
            
            // Generate basic region data for each cell
            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    // Calculate geographic coordinates
                    const longitude = (x / gridWidth * 360) - 180;
                    const latitude = 90 - (y / gridHeight * 180);
                    
                    // Determine region based on coordinates (simplified)
                    let region = "Unknown";
                    let primaryFeature = "land";
                    let features = {
                        land: 80,
                        ocean: 20
                    };
                    
                    // Very simplified region detection
                    if (latitude > 66) {
                        region = "Arctic";
                        primaryFeature = "ice";
                        features = { ice: 90, land: 10 };
                    } else if (latitude < -66) {
                        region = "Antarctica";
                        primaryFeature = "ice";
                        features = { ice: 95, land: 5 };
                    } else if (longitude < -30 && longitude > -170 && latitude > 15) {
                        region = "North America";
                        features = { land: 70, vegetation: 20, water: 10 };
                    } else if (longitude < -30 && longitude > -90 && latitude < 15 && latitude > -60) {
                        region = "South America";
                        features = { vegetation: 60, land: 30, water: 10 };
                    } else if (longitude > -10 && longitude < 40 && latitude > 35) {
                        region = "Europe";
                        features = { land: 60, vegetation: 30, water: 10 };
                    } else if (longitude > -20 && longitude < 55 && latitude < 35 && latitude > -35) {
                        region = "Africa";
                        if (latitude < 5 && latitude > -5) {
                            features = { vegetation: 80, land: 15, water: 5 };
                        } else {
                            features = { desert: 70, land: 25, water: 5 };
                        }
                    } else if (longitude > 40 && longitude < 150 && latitude > 0) {
                        region = "Asia";
                        features = { land: 65, vegetation: 25, water: 10 };
                    } else if (longitude > 110 && longitude < 155 && latitude < 0 && latitude > -40) {
                        region = "Australia";
                        features = { desert: 60, land: 35, water: 5 };
                    } else if ((longitude > 150 || longitude < -120) && latitude < 50 && latitude > -50) {
                        region = "Pacific Ocean";
                        primaryFeature = "ocean";
                        features = { ocean: 95, water: 5 };
                    } else if (longitude > -60 && longitude < 0 && latitude < 50 && latitude > -50) {
                        region = "Atlantic Ocean";
                        primaryFeature = "ocean";
                        features = { ocean: 90, water: 10 };
                    } else if (longitude > 40 && longitude < 110 && latitude < 20 && latitude > -50) {
                        region = "Indian Ocean";
                        primaryFeature = "ocean";
                        features = { ocean: 93, water: 7 };
                    }
                    
                    // Store cell data
                    cells[`${x}_${y}`] = {
                        cell_id: `${x}_${y}`,
                        grid_x: x,
                        grid_y: y,
                        longitude: Number(longitude.toFixed(2)),
                        latitude: Number(latitude.toFixed(2)),
                        primary_feature: primaryFeature,
                        features: features,
                        region: region
                    };
                }
            }
            
            // Store the data in window object for access by other functions
            window.simulatedEarthRegions = {
                grid_size: { width: gridWidth, height: gridHeight },
                cells: cells
            };
            
            console.log("Simulated Earth regions data created with", Object.keys(cells).length, "cells");
        } catch (e) {
            console.error("Error creating simulated region data:", e);
        }
    }
    
    // Modify displayLocationInfo to use simulated data when available
    const originalDisplayLocationInfo = displayLocationInfo;
    displayLocationInfo = function(lat, lng) {
        try {
            // Call original function
            originalDisplayLocationInfo(lat, lng);
            
            // Check if we have simulated data and use it immediately
            if (window.simulatedEarthRegions) {
                const panel = document.getElementById('locationInfo');
                // Convert lat/lng to grid coordinates
                const gridWidth = window.simulatedEarthRegions.grid_size.width; 
                const gridHeight = window.simulatedEarthRegions.grid_size.height;
                
                // Calculate grid cell for these coordinates
                const x = Math.floor(((lng + 180) / 360) * gridWidth) % gridWidth;
                const y = Math.floor(((90 - lat) / 180) * gridHeight);
                
                // Get cell data
                const cellKey = `${x}_${y}`;
                const cellData = window.simulatedEarthRegions.cells[cellKey];
                
                if (cellData && panel) {
                    // Create region data elements
                    const regionInfo = document.createElement('div');
                    regionInfo.className = 'location-details region-info';
                    regionInfo.textContent = `Region: ${cellData.region} (Simulated)`;
                    
                    const featureInfo = document.createElement('div');
                    featureInfo.className = 'location-details feature-info';
                    
                    // Format features
                    const featureText = Object.entries(cellData.features)
                        .slice(0, 2)
                        .map(([feature, percentage]) => `${feature} (${percentage}%)`)
                        .join(', ');
                    
                    featureInfo.textContent = `Geography: ${featureText}`;
                    
                    // Replace existing elements or add new ones
                    const existingRegion = panel.querySelector('.region-info');
                    if (existingRegion) {
                        panel.replaceChild(regionInfo, existingRegion);
                    } else {
                        panel.appendChild(regionInfo);
                    }
                    
                    const existingFeature = panel.querySelector('.feature-info');
                    if (existingFeature) {
                        panel.replaceChild(featureInfo, existingFeature);
                    } else {
                        panel.appendChild(featureInfo);
                    }
                }
            }
        } catch (e) {
            console.error("Error in enhanced displayLocationInfo:", e);
        }
    };

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    }

    function updateSunPosition() {
        try {
            // Check if directionalLight exists in window object first
            if (!window.directionalLight) {
                // If directionalLight is not defined globally but is defined locally, fix the reference
                if (directionalLight) {
                    window.directionalLight = directionalLight;
                } else {
                    console.warn("Directional light not found, cannot update sun position");
                    return;
                }
            }
            
            // Rest of sun position update code...
            const timeHours = timeSimulation.getCurrentTimeHours();
            
            // Convert time to angle (24 hours = 360 degrees)
            const angle = (timeHours / 24) * Math.PI * 2;
            
            // Calculate sun position (opposite to time, as sun rises in east)
            const x = Math.sin(-angle) * 5;
            const y = 2; // Slight elevation
            const z = Math.cos(-angle) * 5;
            
            // Update light position
            window.directionalLight.position.set(x, y, z);
            
            // Calculate light intensity based on time of day
            let intensity = 0;
            
            // Night (0-5 and 19-24): low intensity
            if (timeHours < 5 || timeHours > 19) {
                intensity = 0.2;
            } 
            // Dawn/dusk transition (5-7 and 17-19): gradually change
            else if (timeHours < 7) {
                intensity = 0.2 + (timeHours - 5) * 0.4; // 0.2 to 1.0
            }
            else if (timeHours > 17) {
                intensity = 0.2 + (19 - timeHours) * 0.4; // 1.0 to 0.2
            }
            // Day (7-17): full intensity
            else {
                intensity = 1.0;
            }
            
            // Set light intensity
            window.directionalLight.intensity = intensity;
            
            // Also adjust ambient light
            if (window.ambientLight) {
                window.ambientLight.intensity = 0.2 + intensity * 0.3;
            }
        } catch (e) {
            // Only log this error once to prevent console spam
            if (!window.sunPositionErrorShown) {
                console.warn("Error updating sun position:", e);
                window.sunPositionErrorShown = true;
                
                // Try to recover by creating a directional light if it's missing
                if (!window.directionalLight && window.scene) {
                    try {
                        window.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
                        window.directionalLight.position.set(5, 3, 5);
                        window.scene.add(window.directionalLight);
                        console.log("Created recovery directional light");
                        window.sunPositionErrorShown = false; // Allow future errors to show
                    } catch (err) {
                        // Silently fail recovery attempt
                    }
                }
                
                setTimeout(() => { window.sunPositionErrorShown = false; }, 5000);
            }
        }
    }

    // Export functions to window object to make them accessible
    // from HTML event handlers but protect from global scope pollution
    window.toggleGrid = toggleGrid;
    window.toggleAtmosphere = toggleAtmosphere;
    window.resetCameraPosition = resetCameraPosition;
    window.showNotification = showNotification;
    window.updateSunPosition = updateSunPosition;
    
    // Run initialization with delay to avoid React conflicts
    function safeInit() {
        try {
            // Call the network request interceptor
            interceptNetworkRequests();
            
            // Check if document is ready first
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                init();
                // Initialize Python script button after main init
                initPythonScriptButton();
            } else {
                console.log("Document not ready, waiting...");
                setTimeout(safeInit, 100);
            }
        } catch (e) {
            console.error("Safe init failed:", e);
            // Try once more with a longer delay
            setTimeout(() => {
                init();
                initPythonScriptButton();
            }, 1000);
        }
    }
    
    // Register DOMContentLoaded event with error handling
    try {
        document.addEventListener('DOMContentLoaded', function() {
            // Use setTimeout to run outside the event context
            setTimeout(safeInit, 50);
        });
        
        // Fallback initialization if DOMContentLoaded fails
        setTimeout(function() {
            if (!scene) {
                console.warn("Fallback initialization");
                safeInit();
            }
        }, 2000);
    } catch (e) {
        console.error("Error setting up initialization:", e);
        // Last resort initialization
        setTimeout(safeInit, 2000);
    }
})(); // End IIFE