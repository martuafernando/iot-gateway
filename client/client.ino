#include <WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <Adafruit_PN532.h>

// WIFI
const char* ssid = "V2043";
const char* password = "testing1";

// SERVER
const char* mqtt_server = "broker.hivemq.com";
const uint16_t port_server = 1883;
const char* subscribeId = "gTkyy9LWTRiRm7Erxn5YWPGjHxG3ySVjTxPXV6p3kUz57ZLuLY34CkWceA5qhkxnAVQUqez3ixx5TEv7SAm2QAfURu8wyHxvue8n";
const char* publishId = "X3ZKeVcLzT3QxLumypkf33jMSWHAUF7f83f5quhNy6yV8G4jVRJPjuxMZzHGcrQRSyUPjV7CBmFmwvTHqP2zf4n3Uz2fGBRUC8QS";
String idcard, receivedMessage;

// PIN
const int RED_LED_PIN = 4;
const int YELLOW_LED_PIN = 2;
const int GREEN_LED_PIN = 5;
#define PN532_SCK  (18)
#define PN532_MISO (19)
#define PN532_MOSI (23)
#define PN532_SS   (27)

WiFiClient espClient;
PubSubClient client(espClient);
Adafruit_PN532 nfc(PN532_SCK, PN532_MISO, PN532_MOSI, PN532_SS);

void turnOnRedLed() {
  digitalWrite(RED_LED_PIN, HIGH);
  digitalWrite(YELLOW_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
}

void turnOnYellowLed() {
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(YELLOW_LED_PIN, HIGH);
  digitalWrite(GREEN_LED_PIN, LOW);
}

void turnOnGreenLed() {
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(YELLOW_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, HIGH);
}

void turnOffLed(){
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(YELLOW_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
}

void callback(char* topic, byte* payload, unsigned int length) {
  receivedMessage = "";
  Serial.print("Message received on topic: ");
  Serial.println(topic);
  Serial.print("Message: ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
    receivedMessage += (char)payload[i];
  }
  if (receivedMessage == "true"){
    turnOnGreenLed();
    delay(2000);
  }
  Serial.println();
  turnOnRedLed();
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  nfc.begin();

  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(YELLOW_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);

  uint32_t versiondata = nfc.getFirmwareVersion();

  Serial.print("Found chip PN5"); Serial.println((versiondata >> 24) & 0xFF, HEX);
  Serial.print("Firmware ver. "); Serial.print((versiondata >> 16) & 0xFF, DEC);
  Serial.print('.'); Serial.println((versiondata >> 8) & 0xFF, DEC);

  nfc.SAMConfig();

  if (! versiondata) {
    Serial.print("Didn't find PN53x board");
    while (1); // halt
  }

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi network");

  client.setServer(mqtt_server, port_server);
  client.setCallback(callback);
}

void loop() {
  client.loop();
  if (!client.connected()) {
    reconnect();
  }
  turnOnRedLed();

  uint8_t success;
  uint8_t uid[] = { 0, 0, 0, 0, 0, 0, 0 };  // Buffer to store the returned UID
  uint8_t uidLength;

  success = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength);

  if (success) {
    turnOnYellowLed();
    idcard = "";
    for (byte i = 0; i <= uidLength - 1; i++) {
      idcard += (uid[i] < 0x10 ? "0" : "") + String(uid[i], HEX);
    }

    const char* message = idcard.c_str();
    client.publish(publishId, message);
    Serial.print("ID CARD : ");
    Serial.print(idcard);
    Serial.println("");
    delay(500);
  }
}

void reconnect() {
  while (!client.connected()) {
    turnOnYellowLed();
    Serial.println("Connecting to MQTT broker...");
    if (client.connect(subscribeId)) {
      Serial.println("Connected to MQTT broker");
      turnOnRedLed();
      client.subscribe(subscribeId);
    } else {
      Serial.print("Failed to connect to MQTT broker, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}