// Konstanta dan variabel global
const MAP_WIDTH = 1000;  // Lebar peta dalam pixel
const MAP_HEIGHT = 800;  // Tinggi peta dalam pixel

// Batas koordinat peta untuk area Surabaya (PPNS)
const MAP_BOUNDS = {
    north: -7.53779,  // Latitude atas
    south: -7.57466,  // Latitude bawah
    east: 112.89456,  // Longitude kanan
    west: 112.83757   // Longitude kiri
};

// Data kapal awal (akan diperbarui dari server)
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

// Elemen DOM
const mapContainer = document.getElementById('map-container');
const shipIdElement = document.getElementById('ship-id');
const shipLatElement = document.getElementById('ship-lat');
const shipLonElement = document.getElementById('ship-lon');
const shipSpeedElement = document.getElementById('ship-speed');
const shipHeadingElement = document.getElementById('ship-heading');
const shipStatusElement = document.getElementById('ship-status');
const updateTimeElement = document.getElementById('update-time');

// Fungsi untuk mengonversi koordinat geografis ke posisi pixel pada peta
function geoToPixel(lat, lon) {
    const x = ((lon - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * MAP_WIDTH;
    const y = ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * MAP_HEIGHT;
    return { x, y };
}

// Fungsi untuk membuat marker kapal
function createShipMarker(ship) {
    const marker = document.createElement('div');
    marker.className = 'ship-marker';
    marker.id = `ship-${ship.id}`;
    
    // Konversi posisi geografis ke pixel
    const position = geoToPixel(ship.lat, ship.lon);
    
    // Posisikan marker
    marker.style.left = `${position.x}px`;
    marker.style.top = `${position.y}px`;
    
    // Rotasi marker sesuai arah kapal
    marker.style.transform = `rotate(${ship.heading}deg)`;
    
    // Tambahkan event listener untuk klik
    marker.addEventListener('click', () => {
        updateShipInfo(ship);
    });
    
    return marker;
}

// Fungsi untuk memperbarui info kapal
function updateShipInfo(ship) {
    shipIdElement.textContent = ship.id;
    shipLatElement.textContent = ship.lat.toFixed(6);
    shipLonElement.textContent = ship.lon.toFixed(6);
    shipSpeedElement.textContent = ship.speed;
    
    const adjustedHeading = (ship.heading - 90) % 360;
    shipHeadingElement.textContent = adjustedHeading < 0 ? adjustedHeading + 360 : adjustedHeading;
    
    shipStatusElement.textContent = ship.status;
    updateTimeElement.textContent = new Date().toLocaleTimeString();
}

// Fungsi untuk memperbarui posisi kapal
function updateShipPosition(ship) {
    const marker = document.getElementById(`ship-${ship.id}`);
    if (marker) {
        const position = geoToPixel(ship.lat, ship.lon);
        marker.style.left = `${position.x}px`;
        marker.style.top = `${position.y}px`;
        
        marker.style.transform = `rotate(${ship.heading}deg)`;
    }
}

// Fungsi untuk mendapatkan data kapal dari server Python lokal
async function fetchShipData() {
    try {
        const response = await fetch('http://localhost:8000/data'); // URL server Python Anda
        
        if (response.ok) {
            const data = await response.json();
            
            ships = data; // Update data kapal
            
            ships.forEach(ship => {
                const existingMarker = document.getElementById(`ship-${ship.id}`);
                if (!existingMarker) {
                    const marker = createShipMarker(ship);
                    mapContainer.appendChild(marker);
                } else {
                    updateShipPosition(ship);
                }
            });
            
            if (ships.length > 0) {
                updateShipInfo(ships[0]);
            }
            
            // Set status kembali ke Aktif jika data diterima
            shipStatusElement.textContent = "Aktif";
            shipStatusElement.classList.remove("status-inactive");
            shipStatusElement.classList.add("status-active");
            
        } else {
            throw new Error("Server memberikan respons yang tidak valid.");
        }
        
    } catch (error) {
        console.error('Gagal mengambil data kapal:', error);
        
        // Set status ke Nonaktif jika gagal mengambil data
        shipStatusElement.textContent = "Nonaktif";
        shipStatusElement.classList.remove("status-active");
        shipStatusElement.classList.add("status-inactive");
        
        updateTimeElement.textContent = "Tidak ada pembaruan";
        
        // Kosongkan informasi kapal jika tidak ada data yang diterima
        shipIdElement.textContent = "--";
        shipLatElement.textContent = "--";
        shipLonElement.textContent = "--";
        shipSpeedElement.textContent = "--";
        shipHeadingElement.textContent = "--";
    }
}

// Inisialisasi peta dan marker
function initMap() {
    mapContainer.innerHTML = '';
    
    mapContainer.style.backgroundImage = 'url("map.png")';
    
    ships.forEach(ship => {
        const marker = createShipMarker(ship);
        mapContainer.appendChild(marker);
    });
    
    if (ships.length > 0) {
        updateShipInfo(ships[0]);
    }
}

// Inisialisasi aplikasi
function init() {
    initMap();
    
    setInterval(fetchShipData, 1000); // Perbarui data setiap detik
}

window.addEventListener('load', init);
