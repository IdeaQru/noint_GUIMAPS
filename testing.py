<<<<<<< HEAD
import json
import math
import random
import time
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

MAP_BOUNDS = {
    "north": -7.53300,
    "south": -7.58490,
    "east": 112.90890,
    "west": 112.79938
}

# Data kapal global
ships_data = [
    {
        "id": "KAPAL-UJI-PPNS",
        "lat": -7.54779,
        "lon": 112.86757,
        "speed": 12.5,
        "heading": -185,
        "status": "Aktif"
    }
]

# Data tujuan global
destination_data = []

# Function untuk mensimulasikan pergerakan kapal
def simulate_ship_movement():
    global ships_data
    
    while True:
        for ship in ships_data:
            # Perubahan kecil pada heading (untuk berbelok secara bertahap)
            ship["heading"] += random.uniform(-5, 5)
            ship["heading"] %= 360  # Pastikan heading tetap 0-359
            
            # Perubahan kecil pada kecepatan
            ship["speed"] += random.uniform(-0.5, 0.5)
            if ship["speed"] < 5: ship["speed"] = 5  # Kecepatan minimum
            if ship["speed"] > 20: ship["speed"] = 20  # Kecepatan maksimum
            
            # Hitung pergerakan berdasarkan heading dan kecepatan
            # Perhatikan bahwa heading sudah disesuaikan +90 di frontend
            heading_rad = math.radians(ship["heading"] - 90)  # Kompensasi +90 dari frontend
            
            # Konversi kecepatan ke derajat per detik (faktor skala)
            move_factor = ship["speed"] * 0.00001
            
            # Hitung posisi baru
            new_lat = ship["lat"] + move_factor * math.sin(heading_rad)
            new_lon = ship["lon"] + move_factor * math.cos(heading_rad)
            
            # Periksa apakah masih dalam batas peta
            if (new_lat <= MAP_BOUNDS["north"] and new_lat >= MAP_BOUNDS["south"] and
                new_lon <= MAP_BOUNDS["east"] and new_lon >= MAP_BOUNDS["west"]):
                # Update posisi jika masih dalam batas
                ship["lat"] = round(new_lat, 6)
                ship["lon"] = round(new_lon, 6)
            else:
                # Jika keluar batas, balik arah
                ship["heading"] = (ship["heading"] + 180) % 360
        
        # Tunggu sebelum update berikutnya
        time.sleep(1)  # Update posisi setiap 1 detik

class ShipRequestHandler(BaseHTTPRequestHandler):
    
    def do_GET(self):
        if self.path == '/data':
            # Add CORS headers
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")  # Allow requests from any origin
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS, POST")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            
            # Kirim data kapal terbaru
            self.wfile.write(json.dumps(ships_data).encode())
        
        elif self.path == '/destinations' or self.path == '/api/destinations':
            # Add CORS headers
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS, POST")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            
            # Kirim data tujuan terbaru
            self.wfile.write(json.dumps(destination_data).encode())
        
        elif self.path == '/':
            # Untuk path root, kirim pesan informasi
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            info = """
            <html>
            <head>
                <title>Ship Monitoring Server</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #006699; }
                    pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; }
                    .endpoint { background-color: #e0f7fa; padding: 10px; margin: 10px 0; border-radius: 5px; }
                </style>
            </head>
            <body>
                <h1>Server Monitoring Kapal</h1>
                <p>Server berhasil berjalan!</p>
                
                <div class="endpoint">
                    <h2>Endpoint Tersedia:</h2>
                    <p><b>/data</b> - GET: Mendapatkan data kapal</p>
                    <p><b>/destinations</b> atau <b>/api/destinations</b> - GET: Mendapatkan data tujuan</p>
                    <p><b>/destinations</b> atau <b>/api/destinations</b> - POST: Menambahkan data tujuan baru</p>
                    <p><b>/set-destination</b> - POST: Alias untuk menambahkan data tujuan baru</p>
                </div>
                
                <h2>Data Kapal Saat Ini:</h2>
                <pre>{}</pre>
                
                <h2>Data Tujuan Saat Ini:</h2>
                <pre>{}</pre>
            </body>
            </html>
            """.format(json.dumps(ships_data, indent=4), json.dumps(destination_data, indent=4))
            
            self.wfile.write(info.encode())
        
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            
            # Handle destination data
            if self.path == '/destinations' or self.path == '/api/destinations' or self.path == '/set-destination':
                # Validasi data tujuan
                required_fields = ['name', 'latitude', 'longitude']
                for field in required_fields:
                    if field not in data:
                        raise ValueError(f"Field '{field}' is required")
                
                # Tambahkan timestamp jika tidak ada
                if 'timestamp' not in data:
                    data['timestamp'] = time.strftime("%Y-%m-%dT%H:%M:%S.%fZ", time.gmtime())
                
                # Tambahkan data tujuan ke list global
                destination_data.append(data)
                
                # Kirim respons sukses
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS, POST")
                self.send_header("Access-Control-Allow-Headers", "Content-Type")
                self.end_headers()
                
                response = {
                    "success": True,
                    "message": "Destination added successfully",
                    "data": data
                }
                self.wfile.write(json.dumps(response).encode())
            
            # Handle ship data update (jika diperlukan)
            elif self.path == '/data':
                # Update data kapal jika ID cocok
                ship_updated = False
                for i, ship in enumerate(ships_data):
                    if ship["id"] == data.get("id"):
                        # Update data yang ada
                        for key in data:
                            ships_data[i][key] = data[key]
                        ship_updated = True
                        break
                
                # Jika tidak ada ID yang cocok, tambahkan kapal baru
                if not ship_updated and "id" in data:
                    ships_data.append(data)
                
                # Kirim respons sukses
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                
                response = {
                    "success": True,
                    "message": "Ship data updated successfully"
                }
                self.wfile.write(json.dumps(response).encode())
            
            else:
                self.send_response(404)
                self.send_header("Content-type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                
                response = {
                    "success": False,
                    "message": "Endpoint not found"
                }
                self.wfile.write(json.dumps(response).encode())
        
        except Exception as e:
            # Kirim respons error
            self.send_response(400)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            
            response = {
                "success": False,
                "message": str(e)
            }
            self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
    
    # Menonaktifkan output log untuk setiap request
    def log_message(self, format, *args):
        return

def run_server():
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, ShipRequestHandler)
    
    print("Server berjalan di http://localhost:8000")
    print("Akses http://localhost:8000/data untuk mendapatkan data kapal")
    print("Akses http://localhost:8000/destinations untuk mendapatkan data tujuan")
    print("Data kapal akan diupdate secara otomatis")
    print("Tekan Ctrl+C untuk menghentikan server")
    
    httpd.serve_forever()

if __name__ == '__main__':
    # Mulai thread untuk simulasi pergerakan kapal
    simulation_thread = threading.Thread(target=simulate_ship_movement)
    simulation_thread.daemon = True  # Thread akan berhenti ketika program utama berhenti
    simulation_thread.start()
    
    # Jalankan server HTTP
    run_server()
=======
import json
import math
import random
import time
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

MAP_BOUNDS = {
    "north": -7.53779,   # Latitude atas
    "south": -7.57466,   # Latitude bawah
    "east": 112.89456,   # Longitude kanan
    "west": 112.83757    # Longitude kiri
}

# Data kapal global
ships_data = [
    {
        "id": "KAPAL-UJI-PPNS",
        "lat": -7.54779,
        "lon": 112.86757,
        "speed": 12.5,
        "heading": -185,
        "status": "Aktif"
    }
]

# Function untuk mensimulasikan pergerakan kapal
def simulate_ship_movement():
    global ships_data
    
    while True:
        for ship in ships_data:
            # Perubahan kecil pada heading (untuk berbelok secara bertahap)
            ship["heading"] += random.uniform(-5, 5)
            ship["heading"] %= 360  # Pastikan heading tetap 0-359
            
            # Perubahan kecil pada kecepatan
            ship["speed"] += random.uniform(-0.5, 0.5)
            if ship["speed"] < 5: ship["speed"] = 5  # Kecepatan minimum
            if ship["speed"] > 20: ship["speed"] = 20  # Kecepatan maksimum
            
            # Hitung pergerakan berdasarkan heading dan kecepatan
            # Perhatikan bahwa heading sudah disesuaikan +90 di frontend
            heading_rad = math.radians(ship["heading"] - 90)  # Kompensasi +90 dari frontend
            
            # Konversi kecepatan ke derajat per detik (faktor skala)
            move_factor = ship["speed"] * 0.00001
            
            # Hitung posisi baru
            new_lat = ship["lat"] + move_factor * math.sin(heading_rad)
            new_lon = ship["lon"] + move_factor * math.cos(heading_rad)
            
            # Periksa apakah masih dalam batas peta
            if (new_lat <= MAP_BOUNDS["north"] and new_lat >= MAP_BOUNDS["south"] and
                new_lon <= MAP_BOUNDS["east"] and new_lon >= MAP_BOUNDS["west"]):
                # Update posisi jika masih dalam batas
                ship["lat"] = round(new_lat, 6)
                ship["lon"] = round(new_lon, 6)
            else:
                # Jika keluar batas, balik arah
                ship["heading"] = (ship["heading"] + 180) % 360
        
        # Tunggu sebelum update berikutnya
        time.sleep(1)  # Update posisi setiap 1 detik

class ShipRequestHandler(BaseHTTPRequestHandler):
    
    def do_GET(self):
        if self.path == '/data':
            # Add CORS headers
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")  # Allow requests from any origin
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            
            # Kirim data kapal terbaru
            self.wfile.write(json.dumps(ships_data).encode())
        
        elif self.path == '/':
            # Untuk path root, kirim pesan informasi
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            info = """
            <html>
            <head>
                <title>Ship Monitoring Server</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #006699; }
                    pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; }
                </style>
            </head>
            <body>
                <h1>Server Monitoring Kapal</h1>
                <p>Server berhasil berjalan! Gunakan endpoint <b>/data</b> untuk mengakses data kapal.</p>
                <p>Data kapal saat ini:</p>
                <pre>{}</pre>
            </body>
            </html>
            """.format(json.dumps(ships_data, indent=4))
            
            self.wfile.write(info.encode())
        
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
    
    # Menonaktifkan output log untuk setiap request
    def log_message(self, format, *args):
        return

def run_server():
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, ShipRequestHandler)
    
    print("Server berjalan di http://localhost:8000")
    print("Akses http://localhost:8000/data untuk mendapatkan data kapal")
    print("Data kapal akan diupdate secara otomatis")
    print("Tekan Ctrl+C untuk menghentikan server")
    
    httpd.serve_forever()

if __name__ == '__main__':
    # Mulai thread untuk simulasi pergerakan kapal
    simulation_thread = threading.Thread(target=simulate_ship_movement)
    simulation_thread.daemon = True  # Thread akan berhenti ketika program utama berhenti
    simulation_thread.start()
    
    # Jalankan server HTTP
    run_server()
>>>>>>> a30bdabe44cf3e82ba0c2ac2044fb6078357fe0e
