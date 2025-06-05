// Improved to handle API rate limits and errors more robustly, using a single reliable GeoJSON source
export function initTerraIncognita(map) {
  map.createPane("terraPane");
  map.getPane("terraPane").style.zIndex = 650;
  const style = { color:"#000", weight:0, fillColor:"#000", fillOpacity:0.7 };
  
  let countriesGeoJsonCache = null; // Cache for the world geojson

  async function fetchCountriesGeoJson() {
    if (countriesGeoJsonCache) return countriesGeoJsonCache;
    // Switched to a different GeoJSON source. This one uses 'id' for ISO A3.
    const url = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load world.geojson from ${url} (status: ${response.status})`);
      }
      countriesGeoJsonCache = await response.json();
      console.log("Successfully loaded world.geojson for Terra Incognita");
      return countriesGeoJsonCache;
    } catch (error) {
      console.error("Error fetching world.geojson for Terra Incognita:", error);
      throw error; // Re-throw to be caught by blackout function
    }
  }

  async function blackout(countryCodeISO_A3, label) {
    try {
      const worldData = await fetchCountriesGeoJson(); // Ensures cache is populated or fetched
      if (!worldData || !worldData.features) {
        console.warn("World GeoJSON data for Terra Incognita is not available or invalid.");
        return;
      }

      // Find the country feature using 'id' property, adding .trim() for robustness
      const countryFeature = worldData.features.find(
        f => f.properties && typeof f.properties.id === 'string' && f.properties.id.trim().toUpperCase() === countryCodeISO_A3.toUpperCase()
      );

      if (countryFeature) {
        const lay = L.geoJson(countryFeature, { pane:"terraPane", style, interactive:false }).addTo(map);
        if (label) {
          let center;
          if (lay.getBounds && typeof lay.getBounds === 'function' && lay.getBounds().isValid()) {
            center = lay.getBounds().getCenter();
          } 
          else if (countryFeature.geometry && countryFeature.geometry.type === "Point") {
            center = L.latLng(countryFeature.geometry.coordinates[1], countryFeature.geometry.coordinates[0]);
          } else {
            // Fallback for complex geometries: calculate centroid of all points
            let lats = [], lngs = [];
            const extractCoords = (coords) => {
              if (Array.isArray(coords)) {
                if (coords.length > 0 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
                    // It's a coordinate pair
                    lngs.push(coords[0]); 
                    lats.push(coords[1]);
                } else {
                    // It's an array of coordinates or deeper nested arrays
                    coords.forEach(c => extractCoords(c)); 
                }
              }
            };
            if (countryFeature.geometry && countryFeature.geometry.coordinates) {
                extractCoords(countryFeature.geometry.coordinates);
            }
            if (lats.length > 0 && lngs.length > 0) {
                const avgLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
                const avgLng = lngs.reduce((sum, lng) => sum + lng, 0) / lngs.length;
                center = L.latLng(avgLat, avgLng);
            } else {
                console.warn(`Could not determine center for ${countryCodeISO_A3} label.`);
                return; 
            }
          }
          
          L.marker(center, {
            pane:"terraPane",
            icon: L.divIcon({ className:"terra-label", html:"TERRA INCOGNITA", iconSize:[200,40], iconAnchor:[100,20] }),
            interactive:false
          }).addTo(map);
        }
      } else {
        console.warn(`Country with ISO_A3 code ${countryCodeISO_A3} not found using 'id' property in the loaded world.geojson`);
      }
    } catch (err) {
      console.error(`Error processing Terra Incognita for country ${countryCodeISO_A3}:`, err);
    }
  }

  // Initialize fetching of the main GeoJSON file once
  fetchCountriesGeoJson().then(() => {
    // Blackout specific countries using their ISO A3 codes after the main data is loaded
    blackout("CAN", true); // Canada
    blackout("MEX", true); // Mexico
    blackout("RUS", true); // Russia
    blackout("CHN", true); // China
    blackout("AUS", true); // Australia
    // Add more countries as needed
  }).catch(error => {
    console.error("Failed to initialize Terra Incognita due to GeoJSON loading error:", error);
  });
}