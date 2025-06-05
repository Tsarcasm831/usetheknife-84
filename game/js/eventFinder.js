import bboxPolygon from '@turf/bbox-polygon';
import { lineString } from '@turf/helpers';
import pointOnFeature from '@turf/point-on-feature';
import lineSplit from '@turf/line-split';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

const eventTitles = [
  "Straight-Up Skirmish",
  "Surprise Ambush",
  "Mobile Patrol",
  "Big Bad Showdown",
  "Hold the Line",
  "Extraction/Escort",
  "Deep Recon",
  "Resource Hunt",
  "Sabotage Strike",
  "Diplomatic Parley",
  "Puzzle & Mechanism",
  "Environmental Gauntlet",
  "Rescue Operation",
  "Lore Discovery",
  "Trap & Trigger",
  "Arena Trial",
  "Faction Reputation Event"
];

function getRandomEventTitle() {
  return eventTitles[Math.floor(Math.random() * eventTitles.length)];
}

async function getAddressForLatLng(lat, lng) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await response.json();
    return data.display_name || "Address not found";
  } catch (error) {
    console.error("Error reverse-geocoding for event:", error);
    return "Address lookup failed";
  }
}

// Start an event after preparation is complete
export function startEvent(eventId, eventTitle, eventAddress, eventLat, eventLng) {
  console.log(`Starting event: ${eventId} - ${eventTitle} at ${eventAddress}`);
  const latText = eventLat !== undefined ? eventLat.toFixed(6) : 'N/A';
  const lngText = eventLng !== undefined ? eventLng.toFixed(6) : 'N/A';
  alert(`Launching event: ${eventTitle}\nAddress: ${eventAddress}\nLocation: ${latText}, ${lngText}`);
}
// Make available globally for any UI callbacks
window.startEvent = startEvent;

// Layer group for event routes
let mapInstance = null; // To store the map instance for routing
let eventLayerGroup = null; // To store the layer group for event markers
let eventRouteLayerGroup = null; // Layer group for event routes
let currentEvents = []; // Module-scoped array to store current event details including markers

async function routeToEvent(eventId, eventLat, eventLng) {
  if (!mapInstance) {
    console.error("Map instance not available for routing.");
    return;
  }
  console.log(`Routing to event: ${eventId} (${eventLat}, ${eventLng})`);

  const eventData = currentEvents.find(event => event.id === eventId);
  const marker = eventData ? eventData.marker : null;

  if (!marker) {
    console.error(`Marker for event ${eventId} not found.`);
    // Attempt to find marker on layer group if currentEvents is somehow out of sync
    let foundMarker = null;
    if (eventLayerGroup) {
        eventLayerGroup.eachLayer(layer => {
            if (layer.eventId === eventId) {
                foundMarker = layer;
            }
        });
    }
    if (!foundMarker) {
        console.error(`Marker for event ${eventId} still not found on layer group.`);
        return;
    }
     // If found this way, we don't have the original title/address easily. This is a fallback.
     // For robust solution, ensure currentEvents is always accurate or marker stores all its info.
     // For now, we'll proceed assuming eventData/marker was found via currentEvents.
  }


  if (eventRouteLayerGroup) {
    eventRouteLayerGroup.clearLayers(); // Clear previous routes
  } else {
    console.warn("eventRouteLayerGroup not initialized.");
    return;
  }

  const homeCoords = { lat: 40.153654, lng: -105.109248 };
  const homeLatLng = L.latLng(homeCoords.lat, homeCoords.lng);
  const eventLatLng = L.latLng(eventLat, eventLng);

  // Calculate direct flight distance
  const directDistanceMeters = homeLatLng.distanceTo(eventLatLng);
  const directDistanceKm = (directDistanceMeters / 1000).toFixed(2);
  const airDistanceText = `Air Distance: ${directDistanceKm} km`;

  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${homeCoords.lng},${homeCoords.lat};${eventLng},${eventLat}?overview=full&geometries=geojson`;
  let routeDistanceText = "";

  try {
    const response = await fetch(osrmUrl);
    if (!response.ok) {
      throw new Error(`OSRM request failed: ${response.status} ${response.statusText}`);
    }
    const routeData = await response.json();


    if (routeData.routes && routeData.routes.length > 0) {
      const routeGeoJson = routeData.routes[0].geometry;
      const distanceInMeters = routeData.routes[0].distance;
      const distanceInKm = (distanceInMeters / 1000).toFixed(2);
      routeDistanceText = `Route Distance: ${distanceInKm} km (OSRM)`;

      L.geoJSON(routeGeoJson, {
        style: {
          color: 'lime', 
          weight: 5,
          opacity: 0.7
        }
      }).addTo(eventRouteLayerGroup);
      mapInstance.fitBounds(L.geoJSON(routeGeoJson).getBounds().pad(0.1));
    } else {
      console.warn("No route found by OSRM. Drawing straight line.");
      drawStraightRouteLine(homeCoords, { lat: eventLat, lng: eventLng });
      routeDistanceText = `Drawn Route: ${directDistanceKm} km (Direct Line)`;
    }

  } catch (error) {
    console.error("Error fetching route from OSRM:", error);
    alert(`Failed to calculate route: ${error.message}. Drawing a straight line instead.`);
    drawStraightRouteLine(homeCoords, { lat: eventLat, lng: eventLng });
    routeDistanceText = `Drawn Route: ${directDistanceKm} km (Direct Line)`;
  }

  if (marker && eventData) { 
      const popupContent = `<b>${eventData.title}</b><br>Address: ${eventData.address}<br>${routeDistanceText}<br>${airDistanceText}<br><button class="sidebar-button" onclick="window.openPrepareEventModal('${eventId}', '${eventData.title.replace(/'/g, "\\'")}', '${eventData.address.replace(/'/g, "\\'")}', ${eventLat}, ${eventLng})">Prepare</button><button class="sidebar-button" onclick="routeToEvent('${eventId}', ${eventLat}, ${eventLng})">Route to Event</button>`;
      marker.setPopupContent(popupContent);
      if (!marker.isPopupOpen()) {
          marker.openPopup();
      }
  }
}
window.routeToEvent = routeToEvent; // Expose to global scope for the popup button

function drawStraightRouteLine(startCoords, endCoords) {
  if (!mapInstance || !eventRouteLayerGroup) return;
  L.polyline([
    [startCoords.lat, startCoords.lng],
    [endCoords.lat, endCoords.lng]
  ], {
    color: 'lime', // Changed to lime
    weight: 4,
    opacity: 0.8,
    dashArray: '5, 5'
  }).addTo(eventRouteLayerGroup);
  mapInstance.fitBounds(L.latLngBounds([startCoords, endCoords]).pad(0.1));
}

export function initEventFinder(map) {
  mapInstance = map; // Store map instance
  eventLayerGroup = L.layerGroup().addTo(mapInstance); // Initialize and add layer group
  eventRouteLayerGroup = L.layerGroup().addTo(mapInstance); // Initialize and add route layer group

  async function findEventsInSubgrid(subgridData, roadGeoJson) {
    if (!subgridData || !subgridData.bounds || !roadGeoJson || !roadGeoJson.features) {
      document.dispatchEvent(new CustomEvent('eventFindingFailed', {
        detail: { message: "Missing required data for event finding" }
      }));
      return;
    }

    document.dispatchEvent(new CustomEvent('eventFindingStarted'));
    eventLayerGroup.clearLayers();
    if (eventRouteLayerGroup) eventRouteLayerGroup.clearLayers(); // Clear old routes
    currentEvents = []; // Clear previous events array

    const subgridBounds = subgridData.bounds;
    const subgridPoly = bboxPolygon([ 
      subgridBounds[0][1], 
      subgridBounds[0][0], 
      subgridBounds[1][1], 
      subgridBounds[1][0]  
    ]);

    const candidateSegments = [];
    roadGeoJson.features.forEach(roadFeature => {
      if (!roadFeature || !roadFeature.geometry) {
        console.warn("Skipping road feature with no geometry:", roadFeature);
        return;
      }

      let linesToProcess = [];
      if (roadFeature.geometry.type === 'LineString') {
        linesToProcess.push(roadFeature); 
      } else if (roadFeature.geometry.type === 'MultiLineString') {
        roadFeature.geometry.coordinates.forEach(lineCoords => {
          if (lineCoords && lineCoords.length >= 2) {
            linesToProcess.push(lineString(lineCoords, roadFeature.properties));
          }
        });
      } else {
        return;
      }

      linesToProcess.forEach(lineToProcess => {
        try {
          const splitLines = lineSplit(lineToProcess, subgridPoly); 
          
          splitLines.features.forEach(segment => {
            if (segment && segment.geometry && segment.geometry.coordinates && segment.geometry.coordinates.length >= 2) {
              const pointToCheck = pointOnFeature(segment); 
              if (booleanPointInPolygon(pointToCheck, subgridPoly)) {
                candidateSegments.push(segment); 
              }
            }
          });
        } catch (e) {
          console.error("Error during line splitting or processing segment:", e, "Line to Process:", lineToProcess, "Subgrid Polygon:", subgridPoly);
        }
      });
    });

    if (candidateSegments.length === 0) {
      document.dispatchEvent(new CustomEvent('eventFindingCompleted', {
        detail: { success: false, message: "No road segments found in the selected subgrid." }
      }));
      return;
    }

    const numEvents = Math.floor(Math.random() * 5) + 1; 
    const eventIcon = L.icon({
      iconUrl: '/icons/event-icon.png',  
      iconSize: [25, 25],
      iconAnchor: [12, 12]
    });

    const events = [];
    for (let i = 0; i < numEvents; i++) {
      if (candidateSegments.length === 0) break;
      const randomSegmentIndex = Math.floor(Math.random() * candidateSegments.length);
      const segment = candidateSegments[randomSegmentIndex];
      
      try {
        const ptOnLine = pointOnFeature(segment); 
        if (ptOnLine && ptOnLine.geometry && ptOnLine.geometry.coordinates) {
          const latLng = [ptOnLine.geometry.coordinates[1], ptOnLine.geometry.coordinates[0]];
          const address = await getAddressForLatLng(latLng[0], latLng[1]);
          const eventTitle = getRandomEventTitle();
          const eventId = `event-${Date.now()}-${i}`; 
  
          const marker = L.marker(latLng, { icon: eventIcon })
            .bindPopup(`<b>${eventTitle}</b><br>Address: ${address}<br><button class="sidebar-button" onclick="window.openPrepareEventModal('${eventId}', '${eventTitle.replace(/'/g, "\\'")}', '${address.replace(/'/g, "\\'")}', ${latLng[0]}, ${latLng[1]})">Prepare</button><button class="sidebar-button" onclick="routeToEvent('${eventId}', ${latLng[0]}, ${latLng[1]})">Route to Event</button>`);
          
          marker.eventId = eventId; // Store eventId on the marker
          marker.addTo(eventLayerGroup);

          currentEvents.push({ // Store in module-scoped array
            id: eventId,
            title: eventTitle,
            address: address,
            location: latLng,
            marker: marker
          });
        }
      } catch(e) {
        console.error("Error placing point on feature or getting address:", e, segment);
      }
    }
    
    // Signal that event finding is complete with results
    document.dispatchEvent(new CustomEvent('eventFindingCompleted', {
      detail: { success: true, events: events, count: events.length }
    }));
  }

  // Listen for grid toggle
  document.addEventListener('gridToggled', (e) => {
    if (!e.detail.visible) {
      // Clean up events when grid is toggled off
      eventLayerGroup.clearLayers();
      if (eventRouteLayerGroup) { // Also clear routes
        eventRouteLayerGroup.clearLayers();
      }
    }
  });

  return {
    findEventsInSubgrid,
    layer: eventLayerGroup,
    routeLayer: eventRouteLayerGroup // Expose route layer if needed elsewhere
  };
}