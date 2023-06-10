#include <WiFi.h>
#include <WiFiClient.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <Adafruit_PN532.h>

const char* ssid = "V2043";
const char* password = "testing1";
const String serverUrl = "http://10.15.43.100:3000/";
const String gatewayId = "7";

// IPAddress local_IP(10, 7, 66, 17); // Set your desired IP address here
// IPAddress gateway(10, 7, 66, 1);
// IPAddress subnet(255, 255, 255, 0);

// PIN
const int RED_LED_PIN = 4;
const int YELLOW_LED_PIN = 2;
const int GREEN_LED_PIN = 5;
#define PN532_SCK  (18)
#define PN532_MISO (19)
#define PN532_MOSI (23)
#define PN532_SS   (27)

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

void performPostRequest(String url, String data) {
  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  int httpResponseCode = http.POST(data);
  if (httpResponseCode > 0) {
    String payload = http.getString();
    Serial.println("Response:");
    Serial.println(payload);
    const int intValue = payload.toInt();
    if (intValue == 0) turnOnGreenLed();
    else turnOnRedLed();
    
  } else {
    Serial.print("Error: ");
    Serial.println(httpResponseCode);
    turnOnYellowLed();
  }
  http.end();
  delay(1000);
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  nfc.begin();

  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(YELLOW_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);

  uint32_t versiondata = nfc.getFirmwareVersion();
  nfc.SAMConfig();

  if (! versiondata) {
    Serial.print("Didn't find PN53x board");
    while (1); // halt
  }

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // if (!WiFi.config(local_IP, gateway, subnet)) {
  //   Serial.println("Failed to configure static IP");
  // }
  // else {
  //   Serial.println("Static IP successfully configured");
  // }
}

String URLEncode(String msg) {
  const char* hex = "0123456789abcdef";
  String encodedMsg = "";
  
  for (size_t i = 0; i < msg.length(); i++) {
    if (('a' <= msg.charAt(i) && msg.charAt(i) <= 'z')
        || ('A' <= msg.charAt(i) && msg.charAt(i) <= 'Z')
        || ('0' <= msg.charAt(i) && msg.charAt(i) <= '9')) {
      encodedMsg += msg.charAt(i);
    } else {
      encodedMsg += '%';
      encodedMsg += hex[msg.charAt(i) >> 4];
      encodedMsg += hex[msg.charAt(i) & 15];
    }
  }
  
  return encodedMsg;
}

void loop() {
  turnOnRedLed();
  uint8_t success;
  uint8_t uid[] = { 0, 0, 0, 0, 0, 0, 0 };  // Buffer to store the returned UID
  uint8_t uidLength;

  success = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength);

  if (success) {
    String idcard, data;
    turnOnYellowLed();
    idcard = "";
    data = "";
    for (byte i = 0; i <= uidLength - 1; i++) {
      idcard += (uid[i] < 0x10 ? "0" : "") + String(uid[i], HEX);
    }

    const char* message = idcard.c_str();
    Serial.print("ID CARD : ");
    Serial.print(idcard);
    Serial.println("");
    
    data = "gate_id=" + URLEncode(gatewayId) + "&card_id=" + URLEncode(message);
    performPostRequest(serverUrl, data);
    turnOnYellowLed();
  }
}
