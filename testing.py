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
