import osmtogeojson from "osmtogeojson";

let mapInstanceForRoadMapper = null; // Store map instance

/* @tweakable Padding for fitting map bounds to show home and subgrid */
const mapFitBoundsPadding = 0.1;

export function initRoadMapper(map) {
  mapInstanceForRoadMapper = map; // Assign map instance
  const roadLayerGroup = L.layerGroup();
  let currentRoadGeoJson = null;
  let mappingCompletedForCurrentArea = false;
  
  async function fetchAndDisplayRoads(bounds, startPoint = null) { 
    if (!bounds) return;

    roadLayerGroup.clearLayers();
    mappingCompletedForCurrentArea = false; 
    currentRoadGeoJson = null;
    
    // Signal that road mapping is starting
    document.dispatchEvent(new CustomEvent('roadMappingStarted'));

    // Ensure the layer group is on the map
    if (!map.hasLayer(roadLayerGroup)) {
      roadLayerGroup.addTo(map);
    }

    const [sw, ne] = bounds;
    const bbox = `${sw[0]},${sw[1]},${ne[0]},${ne[1]}`;
    const roadTypes = "^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link)$";
    const query = `
        [out:json][timeout:25];
        (
            way["highway"~"${roadTypes}"](${bbox});
        );
        out geom;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Overpass API request failed: ${response.status}`, errorText);
            throw new Error(`Overpass API request failed (${response.status}). Server response: ${errorText}`);
        }
        const overpassResponseData = await response.json(); 
        const geojsonData = osmtogeojson(overpassResponseData);

        if (geojsonData.features && geojsonData.features.length > 0) {
            L.geoJson(geojsonData, { 
                style: {
                    color: "#FF0000", 
                    weight: 3,        
                    opacity: 0.7
                }
            }).addTo(roadLayerGroup);
            currentRoadGeoJson = geojsonData;
            mappingCompletedForCurrentArea = true; 
            
            document.dispatchEvent(new CustomEvent('roadMappingCompleted', {
              detail: { success: true, data: geojsonData }
            }));
        } else {
            console.log("No major roads found in the selected area.");
            document.dispatchEvent(new CustomEvent('roadMappingCompleted', {
              detail: { success: false, message: "No major roads found in this area." }
            }));
        }

        // If a startPoint is provided, draw a BLUE DOTTED line from it to the center of the bounds
        // and display the direct flight distance.
        if (startPoint && startPoint.lat && startPoint.lng) {
            const subgridSW = L.latLng(bounds[0][0], bounds[0][1]);
            const subgridNE = L.latLng(bounds[1][0], bounds[1][1]);
            const subgridBoundsObj = L.latLngBounds(subgridSW, subgridNE);
            const subgridCenterLatLng = subgridBoundsObj.getCenter();

            const homeLatLng = L.latLng(startPoint.lat, startPoint.lng);
            
            const directDistanceInMeters = homeLatLng.distanceTo(subgridCenterLatLng);
            const directDistanceInKm = (directDistanceInMeters / 1000).toFixed(2);

            const directFlightLine = L.polyline([
                homeLatLng,
                subgridCenterLatLng
            ], { 
                color: 'blue',     
                weight: 3,         
                opacity: 0.8, 
                dashArray: '5, 5', 
                interactive: true  
            }).addTo(roadLayerGroup);
            
            directFlightLine.bindPopup(`<b>Direct Flight Distance:</b><br>${directDistanceInKm} km`);

            // New logic: fit bounds to show home and the entire subgrid cell
            if (mapInstanceForRoadMapper && typeof mapInstanceForRoadMapper.fitBounds === 'function') {
                const viewBounds = L.latLngBounds(homeLatLng, homeLatLng); // Initialize with home
                viewBounds.extend(subgridBoundsObj); // Extend to include the subgrid cell

                mapInstanceForRoadMapper.fitBounds(viewBounds.pad(mapFitBoundsPadding)); 
                
                // Open popup after fitting bounds
                if (mapInstanceForRoadMapper.hasLayer(directFlightLine)) {
                    directFlightLine.openPopup(); 
                }
            } else {
                 if (mapInstanceForRoadMapper.hasLayer(directFlightLine)) { 
                    directFlightLine.openPopup();
                }
            }
        }

    } catch (error) {
        console.error("Error fetching or displaying roads:", error);
        document.dispatchEvent(new CustomEvent('roadMappingFailed', {
          detail: { error: error.message }
        }));
    }
  }

  // Listen for grid cell selection
  document.addEventListener('gridCellSelected', (e) => {
    roadLayerGroup.clearLayers();
    currentRoadGeoJson = null;
    mappingCompletedForCurrentArea = false;
  });

  document.addEventListener('subgridCellSelected', (e) => {
    roadLayerGroup.clearLayers();
    currentRoadGeoJson = null;
    mappingCompletedForCurrentArea = false; 
  });
  
  document.addEventListener('gridToggled', (e) => {
    if (!e.detail.visible) {
      if (map.hasLayer(roadLayerGroup)) map.removeLayer(roadLayerGroup);
      currentRoadGeoJson = null;
      mappingCompletedForCurrentArea = false;
    }
  });

  return {
    fetchAndDisplayRoads,
    getCurrentRoadGeoJson: () => currentRoadGeoJson,
    hasCompletedMapping: () => mappingCompletedForCurrentArea, 
    layer: roadLayerGroup
  };
}