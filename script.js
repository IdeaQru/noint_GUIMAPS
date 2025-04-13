// Konstanta dan variabel global
const MAP_WIDTH = 1409;
const MAP_HEIGHT = 799;
const API_ENDPOINT = 'http://localhost:8000/api/destinations';
const DESTINATIONS_ENDPOINT = 'http://localhost:8000/destinations';

const MAP_BOUNDS = {
    north: -7.53300,
    south: -7.58490,
    east: 112.89456,
    west: 112.83757
};

let ships = [
    {
        id: "KAPAL-UJI-PPNS",
        lat: -7.54779,
        lon: 112.86757,
        speed: 12.5,
        heading: -90,
        status: "Aktif"
    }
];

let destinationMarker = null;
let isMonitoring = false;
let monitorInterval = null;

// Elemen DOM
const mapContainer = document.getElementById('map-container');
const shipElements = {
    id: document.getElementById('ship-id'),
    lat: document.getElementById('ship-lat'),
    lon: document.getElementById('ship-lon'),
    speed: document.getElementById('ship-speed'),
    heading: document.getElementById('ship-heading'),
    status: document.getElementById('ship-status')
};
const updateTimeElement = document.getElementById('update-time');

// Fungsi utama
function init() {
    initMap();
    fetchDestinations();
    setupEventListeners();
    startShipMonitoring();
}

function initMap() {
    mapContainer.innerHTML = '';
    mapContainer.style.backgroundImage = 'url("map.png")';
    
    ships.forEach(createShipMarker);
    if (ships.length > 0) updateShipInfo(ships[0]);
}

function setupEventListeners() {
    mapContainer.addEventListener('click', handleMapClick);
    document.getElementById('create-btn').addEventListener('click', showDestinationPopup);
}

function createDestinationMarker(lat, lon, name = "Lokasi Tujuan") {
    // Create a div for the marker
    const marker = document.createElement('div');
    marker.className = 'destination-marker'; // Class for destination marker styling
    
    // Calculate pixel position based on latitude and longitude
    const position = geoToPixel(lat, lon);
    Object.assign(marker.style, {
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)', // Center the marker
        zIndex: 150 // Ensure it's above other elements
    });

    // Add event listener for showing popup
    marker.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent triggering map click
        showDestinationPopup(lat, lon, name, marker);
    });

    // Add marker to the map container
    mapContainer.appendChild(marker);
    return marker;
}

function createShipMarker(ship) {
    const marker = document.createElement('div');
    marker.className = 'ship-marker';
    marker.id = `ship-${ship.id}`;
    
    const position = geoToPixel(ship.lat, ship.lon);
    Object.assign(marker.style, {
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${ship.heading}deg)`
    });
    
    marker.addEventListener('click', () => updateShipInfo(ship));
    mapContainer.appendChild(marker);
    return marker;
}
// Fungsi untuk kapal
function startShipMonitoring() {
    setInterval(async () => {
        try {
            const response = await fetch('http://localhost:8000/data');
            const ships = await response.json();
            
            ships.forEach(ship => {
                const marker = document.getElementById(`ship-${ship.id}`);
                if (!marker) {
                    createShipMarker(ship);
                } else {
                    updateShipPosition(ship, marker);
                }
            });
        } catch (error) {
            console.error('Gagal memperbarui posisi kapal:', error);
        }
    }, 1000);
}

// Fungsi update posisi kapal
function updateShipPosition(ship, marker) {
    const position = geoToPixel(ship.lat, ship.lon);
    
    // Animasi smooth menggunakan CSS transition
    marker.style.transition = 'all 1s ease-out';
    marker.style.left = `${position.x}px`;
    marker.style.top = `${position.y}px`;
    marker.style.transform = `rotate(${ship.heading}deg)`;
    
    // Update informasi kapal jika sedang aktif
    if (ship.id === "KAPAL-UJI-PPNS") {
        updateShipInfo(ship);
    }
}
function updateShipInfo(ship) {
    Object.entries(shipElements).forEach(([key, element]) => {
        if (key === 'heading') {
            const adjusted = (ship.heading - 90) % 360;
            element.textContent = adjusted < 0 ? adjusted + 360 : adjusted;
        } else {
            element.textContent = ship[key];
        }
    });
    updateTimeElement.textContent = new Date().toLocaleTimeString();
}

// Fungsi untuk tujuan
function showDestinationPopup(lat, lon, name, markerElement) {
    // Remove any existing popups
    const existingPopup = document.querySelector('.destination-popup');
    if (existingPopup) existingPopup.remove();
    
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'destination-popup';
    
    // Add content to popup
    popup.innerHTML = `
        <h3>${name}</h3>
        <p>Latitude: ${parseFloat(lat).toFixed(6)}</p>
        <p>Longitude: ${parseFloat(lon).toFixed(6)}</p>
        <button id="set-destination-btn">Set Destination</button>
        <button id="close-popup-btn">Tutup</button>
    `;
    
    // Position the popup above the marker
    const markerRect = markerElement.getBoundingClientRect();
    const mapRect = mapContainer.getBoundingClientRect();
    
    popup.style.left = `${markerRect.left - mapRect.left}px`;
    popup.style.top = `${markerRect.top - mapRect.top - 120}px`; // Position above marker
    
    // Add popup to map
    mapContainer.appendChild(popup);
    
    // Add event listeners for buttons
    document.getElementById('set-destination-btn').addEventListener('click', () => {
        setDestination(lat, lon, name);
        popup.remove();
    });
    
    document.getElementById('close-popup-btn').addEventListener('click', () => {
        popup.remove();
    });
    
    // Prevent clicks on popup from triggering map click
    popup.addEventListener('click', (event) => {
        event.stopPropagation();
    });
}

function setDestination(lat, lon, name) {
    // Implement destination setting logic
    console.log(`Setting destination to: ${name} (${parseFloat(lat).toFixed(6)}, ${parseFloat(lon).toFixed(6)})`);
    
    try {
        sendDestinationToAPI(lat, lon, name);
        alert(`Destinasi diatur ke: ${name}`);
    } catch (error) {
        handleOfflineDestination(lat, lon, name, error);
    }
}

async function handleMapClick(event) {
    // Only process direct clicks on the map (not on existing markers or popups)
    if (event.target !== mapContainer) return;
    
    const {lat, lon} = getClickedCoordinates(event);
    const name = prompt("Masukkan nama lokasi tujuan:", "Lokasi Tujuan");
    if (!name) return;

    try {
       createDestinationMarker(lat, lon, name);
        
        await sendDestinationToAPI(lat, lon, name);
        console.log('Lokasi tujuan berhasil disimpan!');
    } catch (error) {
        handleOfflineDestination(lat, lon, name, error);
    }
}

// Fungsi utilitas
function geoToPixel(lat, lon) {
    return {
        x: ((lon - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * MAP_WIDTH,
        y: ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * MAP_HEIGHT
    };
}

function getClickedCoordinates(event) {
    const rect = mapContainer.getBoundingClientRect();
    return {
        lat: MAP_BOUNDS.north - ((event.clientY - rect.top) / MAP_HEIGHT) * (MAP_BOUNDS.north - MAP_BOUNDS.south),
        lon: MAP_BOUNDS.west + ((event.clientX - rect.left) / MAP_WIDTH) * (MAP_BOUNDS.east - MAP_BOUNDS.west)
    };
}

// API handling
async function fetchDestinations() {
    try {
        const response = await fetch(DESTINATIONS_ENDPOINT);
        if (!response.ok) {
            throw new Error(`Failed to fetch destinations: ${response.status}`);
        }

        const destinations = await response.json();

        // Clear existing destination markers
        const existingMarkers = document.querySelectorAll('.destination-marker');
        existingMarkers.forEach(marker => marker.remove());

        if (!Array.isArray(destinations)) {
            console.error('Destinations is not an array:', destinations);
            return;
        }

        // Create markers for each destination
        destinations.forEach(dest => {
            if (dest.latitude && dest.longitude && dest.name) {
                createDestinationMarker(dest.latitude, dest.longitude, dest.name);
            } else if (dest.lat && dest.lon && dest.name) {
                createDestinationMarker(dest.lat, dest.lon, dest.name);
            } else {
                console.warn('Invalid destination data:', dest);
            }
        });
    } catch (error) {
        console.error('Error fetching destinations:', error);
        loadSavedDestinations(); // Fallback to local storage
    }
}


async function sendDestinationToAPI(lat, lon, name) {
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            name,
            latitude: lat,
            longitude: lon,
            timestamp: new Date().toISOString()
        })
    });

    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

function handleOfflineDestination(lat, lon, name, error) {
    console.error('Error:', error);
    const destinations = JSON.parse(localStorage.getItem('destinations') || '[]');
    destinations.push({lat, lon, name, timestamp: new Date().toISOString()});
    localStorage.setItem('destinations', JSON.stringify(destinations));

    const retryInterval = setInterval(async () => {
        try {
            await sendDestinationToAPI(lat, lon, name);
            clearInterval(retryInterval);
        } catch (err) {
            console.log('Gagal mengirim ulang...');
        }
    }, 10000);

    alert('Lokasi disimpan sementara. Akan dikirim otomatis saat online.');
}

function loadSavedDestinations() {
    const destinations = JSON.parse(localStorage.getItem('destinations') || '[]');
    destinations.forEach(dest => {
        const marker = createDestinationMarker(dest.lat, dest.lon, dest.name);
        mapContainer.appendChild(marker);
    });
}

// Inisialisasi
window.addEventListener('load', init);
