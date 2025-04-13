<<<<<<< HEAD
#include <WiFi.h>
#include <SPIFFS.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include <ArduinoJson.h>

// Konfigurasi WiFi Access Point
const char* ssid = "KapalMonitor";
const char* password = "12345678";

// Data kapal (akan diperbarui melalui HTTP POST)
struct ShipData {
  String id = "KAPAL-UJI-PPNS";
  float lat = -7.54779;
  float lon = 112.86757;
  float speed = 12.5;
  float heading = -90; // Heading sudah disesuaikan +90
  String status = "Aktif";
} shipData;

// Buat server web pada port 80
AsyncWebServer server(80);

void setup() {
  Serial.begin(115200);

  // Inisialisasi SPIFFS
  if (!SPIFFS.begin(true)) {
    Serial.println("Gagal me-mount SPIFFS");
    return;
  }

  // Tampilkan file yang ada di SPIFFS
  Serial.println("File SPIFFS:");
  File root = SPIFFS.open("/");
  File file = root.openNextFile();
  while (file) {
    Serial.print(" - ");
    Serial.println(file.name());
    file = root.openNextFile();
  }

  // Atur WiFi sebagai Access Point
  WiFi.softAP(ssid, password);
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP);

  // Rute untuk file statis dari SPIFFS
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/index.html", "text/html");
  });

  server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/style.css", "text/css");
  });

  server.on("/script.js", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/script.js", "application/javascript");
  });

  server.on("/map.png", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/map.png", "image/png");
  });

  server.on("/ships-icon.png", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/ships-icon.png", "image/png");
  });

  server.on("/map.osm", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/map.osm", "application/xml");
  });

  // API endpoint untuk mendapatkan data kapal
  server.on("/api/ships", HTTP_GET, [](AsyncWebServerRequest *request) {
    AsyncResponseStream *response = request->beginResponseStream("application/json");

    DynamicJsonDocument doc(1024);
    JsonArray array = doc.to<JsonArray>();

    JsonObject ship = array.createNestedObject();
    ship["id"] = shipData.id;
    ship["lat"] = shipData.lat;
    ship["lon"] = shipData.lon;
    ship["speed"] = shipData.speed;
    ship["heading"] = shipData.heading;
    ship["status"] = shipData.status;

    serializeJson(doc, *response);
    request->send(response);
  });

  // API endpoint untuk memperbarui data kapal
  server.on("/api/update", HTTP_POST, [](AsyncWebServerRequest *request) {
    DynamicJsonDocument doc(1024);
    
    String body;
    if (request->hasParam("body", true)) {
      body = request->getParam("body", true)->value();
      deserializeJson(doc, body);

      if (doc.containsKey("id")) shipData.id = doc["id"].as<String>();
      if (doc.containsKey("lat")) shipData.lat = doc["lat"];
      if (doc.containsKey("lon")) shipData.lon = doc["lon"];
      if (doc.containsKey("speed")) shipData.speed = doc["speed"];
      if (doc.containsKey("heading")) shipData.heading = doc["heading"];
      if (doc.containsKey("status")) shipData.status = doc["status"].as<String>();
      
      request->send(200, "application/json", "{\"message\":\"Data updated\"}");
      Serial.println("Data kapal diperbarui!");
      return;
    }

    request->send(400, "application/json", "{\"error\":\"Invalid data\"}");
  });

  // Mulai server
  server.begin();
}

void loop() {
}
=======
#include <WiFi.h>
#include <SPIFFS.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include <ArduinoJson.h>

// Konfigurasi WiFi Access Point
const char* ssid = "KapalMonitor";
const char* password = "12345678";

// Data kapal (akan diperbarui melalui HTTP POST)
struct ShipData {
  String id = "KAPAL-UJI-PPNS";
  float lat = -7.54779;
  float lon = 112.86757;
  float speed = 12.5;
  float heading = -90; // Heading sudah disesuaikan +90
  String status = "Aktif";
} shipData;

// Buat server web pada port 80
AsyncWebServer server(80);

void setup() {
  Serial.begin(115200);

  // Inisialisasi SPIFFS
  if (!SPIFFS.begin(true)) {
    Serial.println("Gagal me-mount SPIFFS");
    return;
  }

  // Tampilkan file yang ada di SPIFFS
  Serial.println("File SPIFFS:");
  File root = SPIFFS.open("/");
  File file = root.openNextFile();
  while (file) {
    Serial.print(" - ");
    Serial.println(file.name());
    file = root.openNextFile();
  }

  // Atur WiFi sebagai Access Point
  WiFi.softAP(ssid, password);
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP);

  // Rute untuk file statis dari SPIFFS
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/index.html", "text/html");
  });

  server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/style.css", "text/css");
  });

  server.on("/script.js", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/script.js", "application/javascript");
  });

  server.on("/map.png", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/map.png", "image/png");
  });

  server.on("/ships-icon.png", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/ships-icon.png", "image/png");
  });

  server.on("/map.osm", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/map.osm", "application/xml");
  });

  // API endpoint untuk mendapatkan data kapal
  server.on("/api/ships", HTTP_GET, [](AsyncWebServerRequest *request) {
    AsyncResponseStream *response = request->beginResponseStream("application/json");

    DynamicJsonDocument doc(1024);
    JsonArray array = doc.to<JsonArray>();

    JsonObject ship = array.createNestedObject();
    ship["id"] = shipData.id;
    ship["lat"] = shipData.lat;
    ship["lon"] = shipData.lon;
    ship["speed"] = shipData.speed;
    ship["heading"] = shipData.heading;
    ship["status"] = shipData.status;

    serializeJson(doc, *response);
    request->send(response);
  });

  // API endpoint untuk memperbarui data kapal
  server.on("/api/update", HTTP_POST, [](AsyncWebServerRequest *request) {
    DynamicJsonDocument doc(1024);
    
    String body;
    if (request->hasParam("body", true)) {
      body = request->getParam("body", true)->value();
      deserializeJson(doc, body);

      if (doc.containsKey("id")) shipData.id = doc["id"].as<String>();
      if (doc.containsKey("lat")) shipData.lat = doc["lat"];
      if (doc.containsKey("lon")) shipData.lon = doc["lon"];
      if (doc.containsKey("speed")) shipData.speed = doc["speed"];
      if (doc.containsKey("heading")) shipData.heading = doc["heading"];
      if (doc.containsKey("status")) shipData.status = doc["status"].as<String>();
      
      request->send(200, "application/json", "{\"message\":\"Data updated\"}");
      Serial.println("Data kapal diperbarui!");
      return;
    }

    request->send(400, "application/json", "{\"error\":\"Invalid data\"}");
  });

  // Mulai server
  server.begin();
}

void loop() {
}
>>>>>>> a30bdabe44cf3e82ba0c2ac2044fb6078357fe0e
