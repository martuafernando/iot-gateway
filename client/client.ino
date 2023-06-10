#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_PN532.h>

#define RED_LED_PIN D0
#define YELLOW_LED_PIN D1
#define GREEN_LED_PIN D2
#define SCK_PIN D5
#define MISO_PIN D6
#define MOSI_PIN D7
#define SS_PIN D8
#define STATUS_DURATION 500
// Update these with your network credentials
const char* ssid = "SUPER WIN";
const char* password = "kamutanya";
char temp[100] = "";

// MQTT broker details
const char* mqttServer = "broker.hivemq.com";
const int mqttPort = 1883;
const char* publishId = "X3ZKeVcLzT3QxLumypkf33jMSWHAUF7f83f5quhNy6yV8G4jVRJPjuxMZzHGcrQRSyUPjV7CBmFmwvTHqP2zf4n3Uz2fGBRUC8QS";
const char* subscribeId = "gTkyy9LWTRiRm7Erxn5YWPGjHxG3ySVjTxPXV6p3kUz57ZLuLY34CkWceA5qhkxnAVQUqez3ixx5TEv7SAm2QAfURu8wyHxvue8n";
bool receivedResponse = false;
unsigned long previousTime = 0;

WiFiClient espClient;
PubSubClient client(espClient);
Adafruit_PN532 nfc(SCK_PIN, MISO_PIN, MOSI_PIN, SS_PIN);


void setup() {
  Serial.begin(9600);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(YELLOW_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  delay(10);

  // PN532 Setup
  nfc.begin();
  uint32_t versiondata = nfc.getFirmwareVersion();

  nfc.SAMConfig();

  if (! versiondata) {
    Serial.print("Didn't find PN53x board");
    while (1); // halt
  }

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    showMessage(YELLOW_LED_PIN, 1, STATUS_DURATION, "Connecting...");
  }

  Serial.println("");
  Serial.println("Wi-Fi connected");

  // Connect to MQTT broker
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);

  while (!client.connected()) {
    Serial.println("Connecting to MQTT server...");
    if (client.connect(subscribeId)) {
      Serial.println("Connected to MQTT server");
      client.subscribe(subscribeId);
    } else {
      Serial.print("Failed with state ");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

void loop(void) {
  digitalWrite(YELLOW_LED_PIN, HIGH);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
  uint8_t uid[] = { 0, 0, 0, 0, 0, 0, 0 };
  uint8_t uidLength;
  
  if (nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength)) {
    strcpy(temp, "");
    for (uint8_t i = 0; i < uidLength; i++) {
      sprintf(temp, "%s%d", temp, uid[i]);
    }
    Serial.println(temp);
    sendData(temp);
  }
}

void sendData(const char* message){
  turnOnAllLed();
  client.publish(publishId, message);

  previousTime = millis();
  while (!receivedResponse) {
    client.loop();

    if (millis() - previousTime > 10000) {
      Serial.println("No response received. Timeout.");
      break;
    }
  }

  receivedResponse = false;
}

void callback(char* topic, byte* payload, unsigned int length) {
  strcpy(temp, "");
  for (uint8_t i = 0; i < length; i++) {
    sprintf(temp, "%s%c", temp, (char)payload[i]);
  }

  receivedResponse = true;
  turnOffAllLed();
  if (strcmp(temp, "true") == 0) showMessage(GREEN_LED_PIN, 3, STATUS_DURATION, "success");
  else showMessage(RED_LED_PIN, 3, STATUS_DURATION, "failed");
}

void turnOnAllLed() {
  digitalWrite(RED_LED_PIN, HIGH);
  digitalWrite(YELLOW_LED_PIN, HIGH);
  digitalWrite(GREEN_LED_PIN, HIGH);
}

void turnOffAllLed() {
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(YELLOW_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
}


void showMessage(uint8_t ledPin, uint8_t blinkCount, int duration, const char* errorMessage) {
  Serial.println(errorMessage);
  for(uint8_t i=0; i<blinkCount*2; i++){
    digitalWrite(ledPin, !digitalRead(ledPin));
    delay(duration / blinkCount / 2);
  }
}

