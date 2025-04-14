#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>

// Konfigurasi WiFi
const char* ssid = "Your_SSID";
const char* password = "Your_PASSWORD";

// Data Kapal
struct Ship {
  String id;
  float lat;
  float lon;
  float speed;
  float heading;
  String status;
};

Ship ship = {
  "KAPAL-UJI-PPNS",
  -7.54779,
  112.86757,
  12.5,
  -185.0,
  "Aktif"
};

// Data Tujuan
std::vector<DynamicJsonDocument> destinations;
const size_t MAX_DESTINATIONS = 10;

// Mutex untuk proteksi data
SemaphoreHandle_t xMutex;

// Web Server
AsyncWebServer server(80);

// Simulasi Pergerakan Kapal
void simulateShipMovement(void * parameter) {
  const float NORTH = -7.53300;
  const float SOUTH = -7.58490;
  const float EAST = 112.90890;
  const float WEST = 112.79938;

  while(1) {
    if(xSemaphoreTake(xMutex, portMAX_DELAY) == pdTRUE) {
      // Update heading dan speed
      ship.heading += random(-50, 50)/10.0;
      if(ship.heading > 360) ship.heading -= 360;
      if(ship.heading < 0) ship.heading += 360;
      
      ship.speed += random(-5, 5)/10.0;
      ship.speed = constrain(ship.speed, 5.0, 20.0);

      // Hitung posisi baru
      float heading_rad = radians(ship.heading - 90);
      float move_factor = ship.speed * 0.00001;
      
      float new_lat = ship.lat + move_factor * sin(heading_rad);
      float new_lon = ship.lon + move_factor * cos(heading_rad);

      // Boundary check
      if(new_lat <= NORTH && new_lat >= SOUTH && 
         new_lon <= EAST && new_lon >= WEST) {
        ship.lat = new_lat;
        ship.lon = new_lon;
      } else {
        ship.heading = fmod(ship.heading + 180.0, 360.0);
      }
      
      xSemaphoreGive(xMutex);
    }
    vTaskDelay(1000 / portTICK_PERIOD_MS);
  }
}

void setup() {
  Serial.begin(115200);
  xMutex = xSemaphoreCreateMutex();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // Configure Web Server
  server.on("/data", HTTP_GET, [](AsyncWebServerRequest *request){
    if(xSemaphoreTake(xMutex, portMAX_DELAY) == pdTRUE) {
      StaticJsonDocument<200> doc;
      doc["id"] = ship.id;
      doc["lat"] = ship.lat;
      doc["lon"] = ship.lon;
      doc["speed"] = ship.speed;
      doc["heading"] = ship.heading;
      doc["status"] = ship.status;
      
      String response;
      serializeJson(doc, response);
      
      AsyncWebServerResponse *resp = request->beginResponse(200, "application/json", response);
      resp->addHeader("Access-Control-Allow-Origin", "*");
      request->send(resp);
      
      xSemaphoreGive(xMutex);
    }
  });

  server.on("/destinations", HTTP_GET, [](AsyncWebServerRequest *request){
    if(xSemaphoreTake(xMutex, portMAX_DELAY) == pdTRUE) {
      DynamicJsonDocument doc(1024);
      JsonArray arr = doc.to<JsonArray>();
      
      for(auto& dest : destinations) {
        arr.add(dest);
      }
      
      String response;
      serializeJson(doc, response);
      
      AsyncWebServerResponse *resp = request->beginResponse(200, "application/json", response);
      resp->addHeader("Access-Control-Allow-Origin", "*");
      request->send(resp);
      
      xSemaphoreGive(xMutex);
    }
  });

  server.on("/destinations", HTTP_POST, [](AsyncWebServerRequest *request){
    // Handle POST request
  }, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total){
    if(xSemaphoreTake(xMutex, portMAX_DELAY) == pdTRUE) {
      DynamicJsonDocument doc(256);
      deserializeJson(doc, data, len);
      
      if(destinations.size() < MAX_DESTINATIONS) {
        destinations.push_back(doc);
      }
      
      xSemaphoreGive(xMutex);
    }
    
    AsyncWebServerResponse *resp = request->beginResponse(200, "application/json", "{\"status\":\"ok\"}");
    resp->addHeader("Access-Control-Allow-Origin", "*");
    request->send(resp);
  });

  server.onNotFound([](AsyncWebServerRequest *request){
    request->send(404, "text/plain", "Not found");
  });

  // Start server
  server.begin();

  // Start simulation task
  xTaskCreate(
    simulateShipMovement,   // Function
    "Ship Simulation",      // Name
    4096,                   // Stack size
    NULL,                   // Parameters
    1,                      // Priority
    NULL                    // Task handle
  );
}

void loop() {
  // Empty - menggunakan FreeRTOS tasks
}
