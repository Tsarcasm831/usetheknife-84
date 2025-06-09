// Time simulation for Earth
// Isolated from React errors with IIFE
(function() {
    // Add global scope protection for directionalLight
    try {
        // If directionalLight exists in any scope, make sure it's globally available
        if (typeof directionalLight !== 'undefined' && typeof window.directionalLight === 'undefined') {
            window.directionalLight = directionalLight;
            console.log("Saved directionalLight reference to window object");
        }
    } catch (e) {
        // Silently fail - we'll handle this when needed
    }

    let timeSimulation = {
        // Add backup initialization flag
        initialized: false,
        
        // Default values
        speed: 1,         // Default time speed (1 = real time, higher = faster)
        paused: false,    // Whether simulation is paused
        timeOffset: 0,    // Starting time offset in hours (0 = midnight at prime meridian)
        startDate: new Date(2012, 9, 15), // October 15, 2012 (months are 0-indexed)
        date: new Date(2012, 9, 15), // Current simulation date
        elapsedDays: 0,  // Days elapsed since start date
        
        // Safely initialize time simulation
        initialize: function() {
            try {
                this.date = new Date(this.startDate);
                this.initialized = true;
                console.log("Time simulation initialized");
            } catch (e) {
                console.error("Time simulation initialization error:", e);
                // Set minimal working defaults
                this.date = new Date();
                this.startDate = new Date();
                this.initialized = true;
            }
            return this;
        },
        
        // Format time as HH:MM
        formatTime: function(hours) {
            try {
                const h = Math.floor(hours);
                const m = Math.floor((hours - h) * 60);
                return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            } catch (e) {
                console.warn("Error in formatTime:", e);
                // Return a reasonable default
                return "00:00";
            }
        },
        
        // Get current simulation time in hours (0-24)
        getCurrentTimeHours: function() {
            try {
                const realSeconds = Date.now() / 1000;
                const simulationSeconds = realSeconds * this.speed;
                const hourOffset = (this.paused ? this.timeOffset : (simulationSeconds / 3600) % 24 + this.timeOffset) % 24;
                return hourOffset;
            } catch (e) {
                console.warn("Error in getCurrentTimeHours:", e);
                // Return a reasonable default
                return (new Date().getHours() + new Date().getMinutes()/60) % 24;
            }
        },
        
        // Update the date object based on current simulation time
        updateDate: function() {
            try {
                // Calculate elapsed time since initialization
                const startTime = this.startDate.getTime();
                const realElapsedMs = Date.now() - startTime;
                const simulatedElapsedMs = this.paused ? 
                    this.elapsedDays * 86400000 : 
                    realElapsedMs * this.speed;
                
                // Calculate new date by adding simulated elapsed time to start date
                this.date = new Date(this.startDate.getTime() + simulatedElapsedMs);
                
                // Update elapsed days for when paused
                this.elapsedDays = simulatedElapsedMs / 86400000;
                
                // Set time of day based on getCurrentTimeHours
                const simulationHours = this.getCurrentTimeHours();
                const hours = Math.floor(simulationHours);
                const minutes = Math.floor((simulationHours - hours) * 60);
                const seconds = Math.floor(((simulationHours - hours) * 60 - minutes) * 60);
                
                this.date.setHours(hours, minutes, seconds);
                return this.date;
            } catch (e) {
                console.warn("Error in updateDate:", e);
                // Return a reasonable default
                return new Date();
            }
        },
        
        // Get formatted time string with AM/PM
        getTimeString: function() {
            try {
                const hours = this.getCurrentTimeHours();
                const h = Math.floor(hours);
                const m = Math.floor((hours - h) * 60);
                const ampm = h >= 12 ? 'PM' : 'AM';
                const hour12 = h % 12 || 12;
                return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
            } catch (e) {
                console.warn("Error in getTimeString:", e);
                // Return a reasonable default
                return new Date().toLocaleTimeString();
            }
        },
        
        // Toggle pause state
        togglePause: function() {
            try {
                if (!this.paused) {
                    // Store current time when pausing
                    this.timeOffset = this.getCurrentTimeHours();
                    // Store current elapsed days
                    this.elapsedDays = (this.date.getTime() - this.startDate.getTime()) / 86400000;
                }
                this.paused = !this.paused;
                return this.paused;
            } catch (e) {
                console.warn("Error in togglePause:", e);
                // Return a reasonable default
                return false;
            }
        },
        
        // Change simulation speed
        setSpeed: function(newSpeed) {
            try {
                // Store current time when changing speed to prevent jumps
                const currentHours = this.getCurrentTimeHours();
                this.timeOffset = currentHours;
                
                // Store current date progress
                this.elapsedDays = (this.date.getTime() - this.startDate.getTime()) / 86400000;
                
                this.speed = newSpeed;
                return this.speed;
            } catch (e) {
                console.warn("Error in setSpeed:", e);
                // Return a reasonable default
                return 1;
            }
        },
        
        // Get sun position based on time (returns direction vector)
        getSunPosition: function() {
            try {
                // Convert time to angle (24 hours = 360 degrees)
                const timeHours = this.getCurrentTimeHours();
                const angle = (timeHours / 24) * Math.PI * 2;
                
                // Calculate sun position (opposite to time, as sun rises in east)
                const x = Math.sin(-angle) * 5;
                const y = 2; // Slight elevation
                const z = Math.cos(-angle) * 5;
                
                return { x, y, z };
            } catch (e) {
                console.warn("Error in getSunPosition:", e);
                // Return a reasonable default
                return { x: 0, y: 0, z: 0 };
            }
        },
        
        // Get formatted date string with more details
        getDateString: function() {
            try {
                const date = this.updateDate();
                const options = { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                };
                return date.toLocaleDateString(undefined, options);
            } catch (e) {
                console.warn("Error in getDateString:", e);
                // Return a reasonable default
                return new Date().toLocaleDateString();
            }
        },
        
        // Get month and year for simple display
        getMonthYearString: function() {
            try {
                const date = this.updateDate();
                const options = { 
                    month: 'short', 
                    year: 'numeric'
                };
                return date.toLocaleDateString(undefined, options);
            } catch (e) {
                console.warn("Error in getMonthYearString:", e);
                // Return a reasonable default
                return new Date().toLocaleDateString();
            }
        },
        
        // Reset to a specific date
        setDate: function(year, month, day) {
            try {
                this.startDate = new Date(year, month, day);
                this.date = new Date(year, month, day);
                this.elapsedDays = 0;
                this.timeOffset = this.getCurrentTimeHours();
                return this.date;
            } catch (e) {
                console.warn("Error in setDate:", e);
                // Return a reasonable default
                return new Date();
            }
        }
    };

    // Enhanced updateSunPosition with better error handling for directionalLight
    function updateSunPosition() {
        try {
            // Check multiple paths for directionalLight to ensure it's found
            let lightRef = null;
            
            // Try different possible locations
            if (typeof window.directionalLight !== 'undefined') {
                lightRef = window.directionalLight;
            } else if (typeof directionalLight !== 'undefined') {
                lightRef = directionalLight;
                // Also store it globally for future use
                window.directionalLight = directionalLight;
            } else if (typeof window.scene !== 'undefined' && window.scene.children) {
                // Try to find it in the scene children
                for (let i = 0; i < window.scene.children.length; i++) {
                    if (window.scene.children[i].type === 'DirectionalLight') {
                        lightRef = window.scene.children[i];
                        window.directionalLight = lightRef;
                        break;
                    }
                }
                
                // If not found, create a new one as last resort
                if (!lightRef && window.scene) {
                    lightRef = new THREE.DirectionalLight(0xffffff, 1);
                    lightRef.position.set(5, 3, 5);
                    window.scene.add(lightRef);
                    window.directionalLight = lightRef;
                    console.log("Created missing directional light");
                }
            }
            
            // Only proceed if we found a light reference
            if (lightRef) {
                const timeHours = timeSimulation.getCurrentTimeHours();
                
                // Convert time to angle (24 hours = 360 degrees)
                const angle = (timeHours / 24) * Math.PI * 2;
                
                // Calculate sun position (opposite to time, as sun rises in east)
                const x = Math.sin(-angle) * 5;
                const y = 2; // Slight elevation
                const z = Math.cos(-angle) * 5;
                
                // Update light position
                lightRef.position.set(x, y, z);
                
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
                lightRef.intensity = intensity;
                
                // Also adjust ambient light
                if (window.ambientLight) {
                    window.ambientLight.intensity = 0.2 + intensity * 0.3;
                }
            } else {
                console.warn("Could not find or create directional light");
            }
        } catch (e) {
            // Only log this error once to prevent console spam
            if (!window.sunPositionErrorShown) {
                console.error("Error updating sun position:", e);
                window.sunPositionErrorShown = true;
                
                setTimeout(() => { window.sunPositionErrorShown = false; }, 5000);
            }
        }
    }

    // Check for directionalLight at script load time
    if (typeof window.directionalLight === 'undefined' && typeof THREE !== 'undefined' && typeof window.scene !== 'undefined') {
        try {
            console.log("Creating directional light from time.js");
            window.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            window.directionalLight.position.set(5, 3, 5);
            window.scene.add(window.directionalLight);
        } catch (e) {
            console.warn("Could not create directional light at load time:", e);
        }
    }

    // Initialize right away
    timeSimulation.initialize();

    // Safely add global functions through window object
    function addSafeFunction(name, fn) {
        try {
            window[name] = function() {
                try {
                    return fn.apply(null, arguments);
                } catch (e) {
                    console.error(`Error in ${name}:`, e);
                    return null;
                }
            };
        } catch (e) {
            console.error(`Could not add ${name} to window object:`, e);
        }
    }

    // Expose time control functions globally
    addSafeFunction('speedUpTime', function speedUpTime() {
        try {
            const newSpeed = Math.min(timeSimulation.speed * 2, 1200);
            timeSimulation.setSpeed(newSpeed);
            updateSpeedDisplay();
            
            // Show notification
            if (typeof window.showNotification === 'function') {
                let speedText = newSpeed === 1 ? 'Real time' : 
                              newSpeed < 60 ? `${newSpeed}x` : 
                              `${newSpeed/60}h/sec`;
                window.showNotification(`Time speed: ${speedText}`);
            }
        } catch (e) {
            console.error("Error in speedUpTime:", e);
        }
    });

    addSafeFunction('slowDownTime', function slowDownTime() {
        try {
            const newSpeed = Math.max(timeSimulation.speed / 2, 1);
            timeSimulation.setSpeed(newSpeed);
            updateSpeedDisplay();
            
            // Show notification
            if (typeof window.showNotification === 'function') {
                let speedText = newSpeed === 1 ? 'Real time' : 
                              newSpeed < 60 ? `${newSpeed}x` : 
                              `${newSpeed/60}h/sec`;
                window.showNotification(`Time speed: ${speedText}`);
            }
        } catch (e) {
            console.error("Error in slowDownTime:", e);
        }
    });

    addSafeFunction('toggleTimePause', function toggleTimePause() {
        try {
            const isPaused = timeSimulation.togglePause();
            const pauseButton = document.getElementById('pauseTime');
            if (pauseButton) {
                pauseButton.textContent = isPaused ? '▶ Resume' : '❚❚ Pause';
            }
            
            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification(`Time ${isPaused ? 'paused' : 'resumed'}`);
            }
        } catch (e) {
            console.error("Error in toggleTimePause:", e);
        }
    });

    // Initialize time display
    function initTimeDisplay() {
        try {
            // Create time display if it doesn't exist
            if (!document.getElementById('timeDisplay')) {
                try {
                    const timeDisplay = document.createElement('div');
                    timeDisplay.id = 'timeDisplay';
                    timeDisplay.className = 'ui-panel';
                    timeDisplay.innerHTML = `
                        <div class="time-container">
                            <div class="time">00:00</div>
                            <div class="date-display"></div>
                            <div class="day"></div>
                        </div>
                        <div class="time-controls">
                            <button id="slowDown" onclick="slowDownTime()" data-tooltip="Slow down time">◀</button>
                            <button id="pauseTime" onclick="toggleTimePause()" data-tooltip="Pause/resume time">❚❚ Pause</button>
                            <button id="speedUp" onclick="speedUpTime()" data-tooltip="Speed up time">▶</button>
                            <div id="speedDisplay">1x (Real Time)</div>
                        </div>
                        <div class="calendar-shortcuts">
                            <button onclick="jumpToSeason('spring')" data-tooltip="March 20">Spring</button>
                            <button onclick="jumpToSeason('summer')" data-tooltip="June 21">Summer</button>
                            <button onclick="jumpToSeason('fall')" data-tooltip="September 22">Fall</button>
                            <button onclick="jumpToSeason('winter')" data-tooltip="December 21">Winter</button>
                        </div>
                    `;
                    document.body.appendChild(timeDisplay);
                    
                    // Make sure UI elements are properly positioned after initialization
                    if (typeof positionUIElements === 'function') {
                        setTimeout(positionUIElements, 100);
                    }
                } catch (e) {
                    console.error("Error creating time display:", e);
                    // Create a minimal fallback time display
                    try {
                        const fallbackDisplay = document.createElement('div');
                        fallbackDisplay.id = 'timeDisplay';
                        fallbackDisplay.className = 'ui-panel';
                        fallbackDisplay.innerHTML = `
                            <div class="time-container">
                                <div class="time">${new Date().toLocaleTimeString()}</div>
                            </div>
                        `;
                        document.body.appendChild(fallbackDisplay);
                    } catch (fallbackError) {
                        console.error("Could not create fallback time display:", fallbackError);
                    }
                }
            }
            
            // Set initial display
            updateTimeDisplay();
            updateSpeedDisplay();
        } catch (e) {
            console.error("Error initializing time display:", e);
            // Create a minimal fallback time display
            try {
                const fallbackDisplay = document.createElement('div');
                fallbackDisplay.id = 'timeDisplay';
                fallbackDisplay.className = 'ui-panel';
                fallbackDisplay.innerHTML = `
                    <div class="time-container">
                        <div class="time">${new Date().toLocaleTimeString()}</div>
                    </div>
                `;
                document.body.appendChild(fallbackDisplay);
            } catch (fallbackError) {
                console.error("Could not create fallback time display:", fallbackError);
            }
        }
    }

    // Update time display
    function updateTimeDisplay() {
        try {
            const timeString = timeSimulation.getTimeString();
            const date = timeSimulation.updateDate();
            
            const timeDisplay = document.getElementById('timeDisplay');
            if (timeDisplay) {
                const dateString = timeSimulation.getDateString();
                const monthYearString = timeSimulation.getMonthYearString();
                
                const timeElement = timeDisplay.querySelector('.time');
                const dateElement = timeDisplay.querySelector('.date-display');
                const dayElement = timeDisplay.querySelector('.day');
                
                if (timeElement) timeElement.textContent = timeString;
                if (dateElement) dateElement.textContent = monthYearString;
                if (dayElement) dayElement.textContent = dateString;
            }
        } catch (e) {
            console.error("Error updating time display:", e);
        }
    }

    // Update speed display
    function updateSpeedDisplay() {
        try {
            const speedDisplay = document.getElementById('speedDisplay');
            if (speedDisplay) {
                const speed = timeSimulation.speed;
                let speedText;
                if (speed === 1) speedText = '1x (Real Time)';
                else if (speed < 60) speedText = `${speed}x`;
                else speedText = `${speed/60}h/sec`;
                
                speedDisplay.textContent = speedText;
            }
        } catch (e) {
            console.error("Error updating speed display:", e);
        }
    }

    // Add season jump functions
    addSafeFunction('jumpToSeason', function jumpToSeason(season) {
        try {
            let year = 2012;
            let month, day;
            let seasonName;
            
            switch(season) {
                case 'spring': 
                    month = 2; // March
                    day = 20;
                    seasonName = "Spring (March 20)";
                    break;
                case 'summer': 
                    month = 5; // June
                    day = 21;
                    seasonName = "Summer (June 21)";
                    break;
                case 'fall': 
                    month = 8; // September
                    day = 22;
                    seasonName = "Fall (September 22)";
                    break;
                case 'winter': 
                    month = 11; // December
                    day = 21;
                    seasonName = "Winter (December 21)";
                    break;
                default:
                    month = 9; // October
                    day = 15;
                    seasonName = "Default (October 15)";
            }
            
            timeSimulation.setDate(year, month, day);
            updateTimeDisplay();
            
            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification(`Date set to ${seasonName}`);
            }
        } catch (e) {
            console.error("Error jumping to season:", e);
        }
    });

    // Make functions available globally
    window.updateTimeDisplay = updateTimeDisplay;
    window.updateSunPosition = updateSunPosition;
    window.initTimeDisplay = initTimeDisplay;
    
    // Expose the time simulation object for other scripts
    window.timeSimulation = timeSimulation;
    
    console.log("Time simulation initialized and protected from React errors");
})();