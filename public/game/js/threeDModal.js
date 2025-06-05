// Manages the 3D Terrain and Street View Modal

// Function to initialize Three.js terrain visualization
function initTerrain3D(canvas, subCellData) {
  // Check if Three.js is available
  if (!window.THREE) {
    console.error('Three.js library not loaded');
    canvas.innerHTML = '<p class="error-message">Three.js library not loaded. Terrain view unavailable.</p>';
    return;
  }

  try {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    if (width === 0 || height === 0) {
        console.warn('Canvas for 3D terrain has zero dimensions. Rendering might fail or be invisible.');
        // Fallback or error message
        canvas.innerHTML = '<p class="error-message">Canvas dimensions are zero. Cannot render 3D terrain.</p>';
        return;
    }

    // Set up the scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue background
    
    // Set up the camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 20, 30);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(width, height);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Add directional light (like sunlight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 200, 100);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Get bounds from subCellData to calculate terrain dimensions
    const bounds = subCellData.bounds;
    const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
    const centerLng = (bounds[0][1] + bounds[1][1]) / 2;
    // const cellSize = Math.abs(bounds[1][0] - bounds[0][0]) * 111000; // Approx meters
    
    // Create a terrain geometry
    const geometry = new THREE.PlaneGeometry(50, 50, 128, 128); // Plane size and segments
    
    // Generate height map based on grid coordinates
    const seed = (centerLat * 100000 + centerLng * 10000) % 1000; // Adjusted seed for more variability
    const vertices = geometry.attributes.position.array;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2]; // In PlaneGeometry, y is up, so z is the other horizontal axis
      
      // Use a noise function to create terrain heights
      const noiseValue = 
        (Math.sin((x + seed) * 0.15) * Math.cos((z + seed) * 0.15) * 3.5) + // Main terrain features
        (Math.sin((x + seed) * 0.35) * Math.cos((z + seed) * 0.35) * 1.0) + // Smaller details
        (Math.sin((x + seed) * 0.05) * Math.cos((z + seed) * 0.05) * 5.0); // Larger swells
      
      vertices[i + 1] = noiseValue; // y-coordinate for height
    }
    
    geometry.computeVertexNormals(); // Important for lighting
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x3b7d4e, // Green-ish color for terrain
      // flatShading: true, // Can be performance intensive, consider removing for smoother look
      wireframe: false,
      roughness: 0.9, // More matte
      metalness: 0.1  // Less metallic
    });
    
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    terrain.receiveShadow = true;
    scene.add(terrain);
    
    // Add roads (simple red line approximation based on grid ID)
    const roadMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 }); // Thicker lines
    
    const cellId = subCellData.id;
    const idSum = cellId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const numRoads = (idSum % 2) + 2; // 2 or 3 roads

    for (let r = 0; r < numRoads; r++) {
      const roadPath = [];
      let currentX = -25 + (idSum * (r + 1) * 3) % 50;
      let currentZ = -25 + (idSum * (r * 7)) % 50;
      roadPath.push(new THREE.Vector3(currentX, 0.1, currentZ)); // Start slightly above terrain

      const numSegments = 5 + (idSum % 3);
      for (let j = 0; j < numSegments; j++) {
        currentX += (Math.sin(idSum * (j + 1 + r) * 0.2) * 8);
        currentZ += (Math.cos(idSum * (j + 1 + r) * 0.2) * 8);
        
        currentX = Math.max(-25, Math.min(25, currentX));
        currentZ = Math.max(-25, Math.min(25, currentZ));
        
        // Simple height approximation for road (can be improved by raycasting or sampling plane)
        const roadHeight = 0.1 + 
          (Math.sin((currentX + seed) * 0.15) * Math.cos((currentZ + seed) * 0.15) * 3.5) +
          (Math.sin((currentX + seed) * 0.35) * Math.cos((currentZ + seed) * 0.35) * 1.0) +
          (Math.sin((currentX + seed) * 0.05) * Math.cos((currentZ + seed) * 0.05) * 5.0);

        roadPath.push(new THREE.Vector3(currentX, roadHeight + 0.1, currentZ)); // Keep road slightly above terrain
      }
      const roadGeometry = new THREE.BufferGeometry().setFromPoints(roadPath);
      const road = new THREE.Line(roadGeometry, roadMaterial);
      scene.add(road);
    }
    
    // Add simple building objects
    const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.7, metalness: 0.3 });
    const numBuildings = (idSum % 8) + 3; // 3 to 10 buildings
    
    for (let i = 0; i < numBuildings; i++) {
      const buildingSizeX = 1.5 + (idSum * (i + 2)) % 2.5;
      const buildingSizeZ = 1.5 + (idSum * (i + 3)) % 2.5;
      const buildingHeight = 2 + (idSum * (i + 1) * 1.7) % 6;
      
      const buildingGeometry = new THREE.BoxGeometry(buildingSizeX, buildingHeight, buildingSizeZ);
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      
      const x = -22 + (idSum * i * 4.3) % 44;
      const z = -22 + (idSum * (i * 6.7)) % 44;
      
      const buildingBaseHeight = 
        (Math.sin((x + seed) * 0.15) * Math.cos((z + seed) * 0.15) * 3.5) +
        (Math.sin((x + seed) * 0.35) * Math.cos((z + seed) * 0.35) * 1.0) +
        (Math.sin((x + seed) * 0.05) * Math.cos((z + seed) * 0.05) * 5.0);

      building.position.set(x, buildingBaseHeight + buildingHeight / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;
      scene.add(building);
    }
    
    const gridHelper = new THREE.GridHelper(50, 10, 0x000000, 0x444444);
    gridHelper.position.y = -0.05; // Slightly below to avoid z-fighting with terrain
    scene.add(gridHelper);
    
    if (window.THREE.OrbitControls) {
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05; // Smoother damping
      controls.minDistance = 5;    // Prevent zooming too close
      controls.maxDistance = 100;  // Prevent zooming too far
      controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent looking from below ground
      
      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
    } else {
      renderer.render(scene, camera); // Basic render if no controls
    }
    
    const infoElement = document.querySelector('.terrain-info-overlay');
    if (infoElement && infoElement.parentElement.id === 'threeD-content') { // Ensure it's the right overlay
      infoElement.innerHTML = `
        <p><strong>Cell ID:</strong> ${subCellData.id}</p>
        <p><strong>View:</strong> 3D Terrain</p>
        <p><strong>Buildings:</strong> ${numBuildings}</p>
        <p><strong>Major Routes:</strong> ${numRoads}</p>
        <p><i>Drag to rotate, scroll to zoom</i></p>
      `;
    }
    
  } catch (error) {
    console.error('Error initializing 3D terrain:', error);
    const errorContainer = canvas.parentElement || document.body;
    errorContainer.innerHTML = `<div class="error-message">Failed to load 3D terrain: ${error.message}</div>`;
  }
}

// Initialize Street View for the selected subgrid cell
function initStreetViewForSubcell(container, subCellData) {
  // Clear any existing content except controls and overlay
  Array.from(container.children).forEach(child => {
    if (!child.classList.contains('threeD-view-controls') && !child.classList.contains('terrain-info-overlay')) {
      container.removeChild(child);
    }
  });
  
  if (!subCellData || !subCellData.bounds) {
    container.insertAdjacentHTML('beforeend', '<p class="error-message">No valid subgrid cell data available.</p>');
    return null;
  }
  
  const streetViewDiv = document.createElement('div');
  streetViewDiv.id = 'threeD-street-view'; // Keep ID for CSS
  streetViewDiv.style.width = '100%';
  streetViewDiv.style.height = '100%';
  
  // Insert street view div before the overlay if it exists
  const infoOverlay = container.querySelector('.terrain-info-overlay');
  if (infoOverlay) {
    container.insertBefore(streetViewDiv, infoOverlay);
  } else {
    container.appendChild(streetViewDiv);
  }
  
  if (infoOverlay) {
    infoOverlay.innerHTML = `
      <p><strong>Cell ID:</strong> ${subCellData.id}</p>
      <p><strong>View:</strong> Street Level</p>
      <p><i>Loading Street View...</i></p>
    `;
  }
  
  const centerLat = (subCellData.bounds[0][0] + subCellData.bounds[1][0]) / 2;
  const centerLng = (subCellData.bounds[0][1] + subCellData.bounds[1][1]) / 2;
  
  try {
    if (!window.google || !window.google.maps || !window.google.maps.StreetViewService) {
      container.innerHTML = '<p class="error-message">Google Maps API not fully loaded. Street View unavailable.</p>';
      return null;
    }
    
    const streetViewService = new google.maps.StreetViewService();
    const panoramaOptions = {
      position: { lat: centerLat, lng: centerLng },
      pov: { heading: 0, pitch: 0 },
      zoom: 1,
      addressControl: false, showRoadLabels: false, linksControl: true,
      panControl: true, enableCloseButton: false, zoomControl: true, // Enable some GMap controls
      fullscreenControl: false
    };
    
    const panorama = new google.maps.StreetViewPanorama(streetViewDiv, panoramaOptions);
    
    streetViewService.getPanorama({ location: { lat: centerLat, lng: centerLng }, radius: 150, source: google.maps.StreetViewSource.OUTDOOR }, (data, status) => {
      if (status === google.maps.StreetViewStatus.OK) {
        panorama.setPano(data.location.pano); // Use pano ID for stability
        panorama.setPov({ heading: data.tiles.centerHeading || 0, pitch: 0 });
        panorama.setVisible(true);
        if (infoOverlay) {
          infoOverlay.innerHTML = `
            <p><strong>Cell ID:</strong> ${subCellData.id}</p>
            <p><strong>View:</strong> Street Level</p>
            <p><strong>Location:</strong> ${data.location.description || 'Near selected point'}</p>
            <p><i>Use mouse to look around</i></p>
          `;
        }
      } else {
        if (infoOverlay) {
          infoOverlay.innerHTML = `
            <p><strong>Cell ID:</strong> ${subCellData.id}</p>
            <p><strong>Street View not available for this location.</strong></p>
            <p><i>Switch to 3D Terrain view.</i></p>
          `;
        }
        streetViewDiv.innerHTML = '<p class="error-message" style="padding-top: 20px;">Street View not available here. Try 3D Terrain view.</p>';
      }
    });
    
    return panorama;
  } catch (e) {
    console.error("Error initializing Street View:", e);
    container.insertAdjacentHTML('beforeend', `<p class="error-message">Failed to initialize Street View: ${e.message}</p>`);
    return null;
  }
}

async function captureAndRender3DView(container) {
  container.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading location view...</p></div>';
  
  try {
    const selectedSubCellData = window.subgridModule ? window.subgridModule.getSelectedSubCellData() : null;
    
    if (!selectedSubCellData || !selectedSubCellData.bounds) {
      container.innerHTML = '<p class="error-message">No subgrid cell selected. Please scan and select a cell first.</p>';
      return;
    }
    
    // Clear container before adding new elements
    container.innerHTML = '';

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'threeD-view-controls';
    controlsDiv.innerHTML = `<button id="toggle-view-btn" class="view-toggle-btn">Switch to Terrain View</button>`;
    container.appendChild(controlsDiv);

    const infoOverlay = document.createElement('div');
    infoOverlay.className = 'terrain-info-overlay';
    container.appendChild(infoOverlay); // Add info overlay once
    
    // Default to Street View
    initStreetViewForSubcell(container, selectedSubCellData);
    
    const toggleBtn = document.getElementById('toggle-view-btn');
    if (toggleBtn) {
      let currentViewIsStreet = true; // Start with Street View

      toggleBtn.addEventListener('click', function() {
        // Clear view-specific content (StreetView div or Terrain canvas)
        const streetViewDiv = container.querySelector('#threeD-street-view');
        if (streetViewDiv) streetViewDiv.remove();
        const terrainCanvas = container.querySelector('#terrain-canvas');
        if (terrainCanvas) terrainCanvas.remove();

        currentViewIsStreet = !currentViewIsStreet; // Toggle the state

        if (currentViewIsStreet) {
          this.textContent = 'Switch to Terrain View';
          initStreetViewForSubcell(container, selectedSubCellData);
        } else {
          this.textContent = 'Switch to Street View';
          const canvas3D = document.createElement('canvas');
          canvas3D.id = 'terrain-canvas';
          canvas3D.style.width = '100%';
          canvas3D.style.height = '100%';
          container.insertBefore(canvas3D, infoOverlay); // Insert before overlay
          initTerrain3D(canvas3D, selectedSubCellData);
        }
      });
    }
    
  } catch (error) {
    console.error('Error generating 3D/Street view:', error);
    container.innerHTML = `<p class="error-message">Failed to generate view: ${error.message}</p>`;
  }
}

export function initThreeDModal(map) { // map parameter might not be strictly needed here anymore
  const toggle3DBtn = document.getElementById('toggle-3d-btn');
  const threeDModal = document.getElementById('threeD-modal');
  const close3DModalBtn = document.getElementById('close-3d-modal');
  const threeDContentContainer = document.getElementById('threeD-content');

  if (toggle3DBtn && threeDModal && close3DModalBtn && threeDContentContainer) {
    toggle3DBtn.addEventListener('click', () => {
      threeDModal.classList.add('active'); // Use classList
      setTimeout(() => { 
         captureAndRender3DView(threeDContentContainer);
      }, 0);
    });

    close3DModalBtn.addEventListener('click', () => {
      threeDModal.classList.remove('active'); // Use classList
      threeDContentContainer.innerHTML = ''; 
    });

    window.addEventListener('click', (event) => {
      if (event.target === threeDModal) {
        threeDModal.classList.remove('active'); // Use classList
        threeDContentContainer.innerHTML = '';
      }
    });
  } else {
    console.error('3D Modal UI elements not found. Check IDs: toggle-3d-btn, threeD-modal, close-3d-modal, threeD-content.');
  }
}