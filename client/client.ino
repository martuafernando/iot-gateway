#include <WiFi.h>
#include <PubSubClient.h>

// WIFI
const char* ssid = "your_SSID";
const char* password = "your_PASSWORD";

// SERVER
const char* mqtt_server = "mqtt://broker.hivemq.com";
const uint16_t port_server = 1883;
const char* subscribeId = "gTkyy9LWTRiRm7Erxn5YWPGjHxG3ySVjTxPXV6p3kUz57ZLuLY34CkWceA5qhkxnAVQUqez3ixx5TEv7SAm2QAfURu8wyHxvue8n";
const char* publishId = "X3ZKeVcLzT3QxLumypkf33jMSWHAUF7f83f5quhNy6yV8G4jVRJPjuxMZzHGcrQRSyUPjV7CBmFmwvTHqP2zf4n3Uz2fGBRUC8QS";

// PIN
const int redLedPin = 0;
const int yellowLedPin = 0;
const int greenLedPin = 0;

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi network");

  client.setServer(mqtt_server, port_server);
  client.subscribe(subscribeId);

  // TODO: Publish ID dari PN532
  client.publish(publishId, "testing");
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // TODO: Tambah fungsi dari PN532
}

void reconnect() {
  while (!client.connected()) {
    Serial.println("Connecting to MQTT broker...");
    if (client.connect("ESP32DevKitV1")) {
      Serial.println("Connected to MQTT broker");
    } else {
      Serial.print("Failed to connect to MQTT broker, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}

void turnOnLed(int pin) {
  digitalWrite(pin, HIGH);
}

void turnDownLed(int pin) {
  digitalWrite(pin, LOW);
}