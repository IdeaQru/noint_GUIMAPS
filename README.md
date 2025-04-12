<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Ship Monitoring System

This project is a **Ship Monitoring System** that visualizes the movement and status of ships on a map. It uses HTML, CSS, JavaScript, and Python (as a server) to simulate real-time monitoring. The project is designed to run locally without requiring internet access.

---

## Project Structure

The folder structure of the project is as follows:

```
noint/
├── index.html       # Main HTML file for the web interface
├── map.osm          # OpenStreetMap data file (optional)
├── map.png          # Background map image
├── script.js        # JavaScript file for logic and interactivity
├── ships-icon.png   # Icon representing ships on the map
├── style.css        # CSS file for styling the web interface
```

---

## Features

1. **Real-Time Ship Monitoring**:
    - Displays ship movement dynamically on a map.
    - Updates ship information such as latitude, longitude, speed, heading, and status.
2. **Offline Functionality**:
    - Runs locally without requiring internet access.
3. **Dynamic Status Handling**:
    - Displays "Aktif" if data is received successfully.
    - Displays "Nonaktif" if no data is received.
4. **Responsive Design**:
    - Optimized for desktop and mobile devices.
5. **Customizable Map**:
    - Uses `map.png` as the background map.
    - You can replace `map.png` with your own map image.

---

## Installation and Usage

### Prerequisites

- Python 3 installed on your system.
- A modern web browser (e.g., Chrome, Firefox).


### Steps to Run the Project

1. **Clone or Download the Repository**:
Download or clone the `noint/` folder to your local machine.
2. **Start Python Server**:
Run the following Python script to start the server:

```python
import json
from http.server import BaseHTTPRequestHandler, HTTPServer

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

class ShipRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/data':
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(ships_data).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

def run_server():
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, ShipRequestHandler)
    print("Server berjalan di http://localhost:8000")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
```

3. **Open `index.html` in Browser**:
Open `index.html` in your browser to view the ship monitoring interface.
4. **Simulate Ship Movement**:
Modify the `ships_data` variable in the Python script to simulate different ship positions dynamically.

---

## Customization

### Map Image

Replace `map.png` with your own map image by ensuring it fits within the defined bounds in `script.js`.

### Ship Icon

Replace `ships-icon.png` with your preferred ship icon image.

### CSS Styling

Modify `style.css` to customize colors, fonts, or layout.

---

## How It Works

1. **Python Server**:
    - Serves ship data at `http://localhost:8000/data`.
    - Updates ship positions dynamically every second.
2. **JavaScript Logic**:
    - Fetches ship data from the Python server using `fetch()` API.
    - Updates ship markers and information on the map dynamically.
3. **HTML Interface**:
    - Displays ship information such as ID, latitude, longitude, speed, heading, and status.
    - Provides visual feedback for active/inactive status.
4. **CSS Styling**:
    - Enhances user experience with modern design elements.
    - Includes responsive layout for different screen sizes.

---

## Troubleshooting

### CORS Error

If you encounter a CORS error when fetching data from the Python server, ensure that the server includes CORS headers:

```python
self.send_header("Access-Control-Allow-Origin", "*")
```


### No Data Received

If no data is received:

- Check if the Python server is running correctly.
- Ensure that `ships_data` contains valid JSON data.

---

## Future Improvements

1. Add support for multiple ships with unique markers.
2. Integrate GPS data for real-world applications.
3. Enhance map functionality using interactive elements like zoom and pan.

---

## License

This project is open-source and free to use for personal or educational purposes.

---

## Screenshot Preview

Below is an example screenshot of the project folder structure:

Project Folder Structure

Enjoy monitoring your ships! 🚢

<div>⁂</div>

[^1]: https://pplx-res.cloudinary.com/image/upload/v1744430604/user_uploads/QKPzyNlqtDkNToj/image.jpg

#   n o i n t _ G U I M A P S  
 