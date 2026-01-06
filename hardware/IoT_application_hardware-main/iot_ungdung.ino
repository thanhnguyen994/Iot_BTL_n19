#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <WebServer.h>
#include <Preferences.h>
#include <PubSubClient.h>
#include <time.h>
#include <DHT.h>
#include <ESP32Servo.h>

// WIFI CONFIG
#define RESET_WIFI_PIN 0
const char* apSSID = "ESP32-Config";
const char* apPassword = "12345678";

// MQTT HIVE
const char* mqttServer = "de3d076c8a8d4165bb42cf36bd001499.s1.eu.hivemq.cloud";
const int mqttPort = 8883;
const char* mqttUser = "iot_n19";
const char* mqttPassword = "IoTn192025";

// CA CERT
const char* rootCACertificate =
"-----BEGIN CERTIFICATE-----\n" \
"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\n" \
"-----END CERTIFICATE-----\n";

// GPIO
#define LIGHT_SENSOR_PIN 25
#define LED_AUTO_PIN     27
#define LED_MANUAL_PIN   32
#define SOIL_SENSOR_PIN  34
#define RELAY_PUMP_PIN   4
#define SERVO_PIN        13
#define FAN_PIN          26
#define DHT_PIN          14
#define AIR_QUALITY_PIN 35
#define DHTTYPE DHT22

// OBJECT
Preferences preferences;
WebServer server(80);
WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);
DHT dht(DHT_PIN, DHTTYPE);
Servo feeder;
float R0 = 10.0;
float RL = 10.0;
float readSensorResistance(int adcPin) {
  int adcValue = analogRead(adcPin);
  float voltage = adcValue * (3.3 / 4095.0);
  float Rs = ((3.3 - voltage) * RL) / voltage; // kOhm
  return Rs;
}
float a_CO2 = 110.47, b_CO2 = -2.862;
float a_NH3 = 102.2, b_NH3 = -2.473;
float a_NOx = 97.43, b_NOx = -2.490;
float a_Alcohol = 96.38, b_Alcohol = -2.179;
float a_Benzene = 96.16, b_Benzene = -2.131;

float getPPM(float Rs, float a, float b) {
  float ratio = Rs / R0;
  float ppm = a * pow(ratio, b);
  if(ppm < 0) ppm = 0;
  return ppm;
}

// VAR
String ssid, password;
bool wifiConnected = false;
unsigned long lastSend = 0;
bool servoOpened = false;

// MQTT JSON
void publishJSON(const char* topic, const char* device, float value) {
  char payload[128];
  sprintf(payload, "{\"device\":\"%s\",\"value\":%.2f}", device, value);

  if (mqttClient.publish(topic, payload)) {
    Serial.print(" MQTT OK → ");
  } else {
    Serial.print("MQTT FAIL → ");
  }
  Serial.print(topic);
  Serial.print(" | ");
  Serial.println(payload);
}
float soilHumidityPercent(int adcValue) {
  int ADC_dry = 4095;
  int ADC_wet = 1215;

  float percent = (float)(ADC_dry - adcValue) / (ADC_dry - ADC_wet) * 100.0;
  if (percent < 0) percent = 0;
  if (percent > 100) percent = 100;
  return percent;
}

// MQTT CALLBACK
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';
  String msg = String((char*)payload);

  Serial.print("📩 MQTT IN → ");
  Serial.print(topic);
  Serial.print(" | ");
  Serial.println(msg);

  if (String(topic).endsWith("/den_led/action"))
    digitalWrite(LED_MANUAL_PIN, msg == "1");

  if (String(topic).endsWith("/may_bom/action"))
    digitalWrite(RELAY_PUMP_PIN, msg == "1" ? LOW : HIGH);

  if (String(topic).endsWith("/quat/action"))
    digitalWrite(FAN_PIN, msg == "1");

  if (String(topic).endsWith("/cung_cap_thuc_an/action")) {

  if (msg == "1" && !servoOpened) {
    feeder.write(90);        // MỞ
    servoOpened = true;
    Serial.println("🟢 Servo OPEN");
  }

  if (msg == "0" && servoOpened) {
    feeder.write(0);         // ĐÓNG
    servoOpened = false;
    Serial.println("🔴 Servo CLOSE");
  }
}

}

// MQTT CONNECT
void reconnectMQTT() {
  if (!mqttClient.connected()) {
    Serial.print("Kết nối MQTT...");
    if (mqttClient.connect("ESP32_IOT_N19", mqttUser, mqttPassword)) {
      Serial.println(" THÀNH CÔNG");

      mqttClient.subscribe("topic/btl_iot_n19/den_led/action");
      mqttClient.subscribe("topic/btl_iot_n19/may_bom/action");
      mqttClient.subscribe("topic/btl_iot_n19/quat/action");
      mqttClient.subscribe("topic/btl_iot_n19/cung_cap_thuc_an/action");

      Serial.println("Đã subscribe topic điều khiển");
    } else {
      Serial.print(" THẤT BẠI | rc=");
      Serial.println(mqttClient.state());
    }
  }
}

// WIFI AP
void handleRoot() {
  String html = "<form action='/save' method='POST'>SSID:<input name='ssid'><br>Password:<input name='password'><br><input type='submit'></form>";
  server.send(200, "text/html", html);
}

void handleSave() {
  preferences.begin("config", false);
  preferences.putString("ssid", server.arg("ssid"));
  preferences.putString("password", server.arg("password"));
  preferences.end();
  server.send(200, "text/html", "Saved. Restarting...");
  delay(2000);
  ESP.restart();
}

// SETUP
void setup() {
  Serial.begin(115200);
  Serial.println("\n ESP32 IOT N19 START");

  pinMode(LED_AUTO_PIN, OUTPUT);
  pinMode(LED_MANUAL_PIN, OUTPUT);
  pinMode(RELAY_PUMP_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  pinMode(LIGHT_SENSOR_PIN, INPUT);

  digitalWrite(RELAY_PUMP_PIN, LOW);
  digitalWrite(FAN_PIN, HIGH);

  feeder.setPeriodHertz(50);      // Servo chuẩn 50Hz
feeder.attach(SERVO_PIN, 500, 2400);
  feeder.write(0);
  servoOpened = false;
  dht.begin();

  preferences.begin("config", true);
  ssid = preferences.getString("ssid", "Redmi 10");
  password = preferences.getString("password", "10012004");
  preferences.end();

  Serial.println(" Đang kết nối WiFi...");
  Serial.println(" SSID: " + ssid);

  WiFi.begin(ssid.c_str(), password.c_str());
  unsigned long t = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t < 10000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("\n WiFi OK");
    Serial.print("📡 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    wifiConnected = false;
    Serial.println("\n WiFi FAIL → AP CONFIG");
    WiFi.softAP(apSSID, apPassword);
    server.on("/", handleRoot);
    server.on("/save", handleSave);
    server.begin();
  }

  secureClient.setCACert(rootCACertificate);
  mqttClient.setServer(mqttServer, mqttPort);
  mqttClient.setCallback(mqttCallback);

  configTime(0, 0, "pool.ntp.org");
}

// LOOP
void loop() {
  if (wifiConnected) {
    reconnectMQTT();
    mqttClient.loop();
  } else {
    server.handleClient();
  }

  // AUTO LED
  digitalWrite(LED_AUTO_PIN, digitalRead(LIGHT_SENSOR_PIN) == 0);

  // SEND DATA 30s
  if (millis() - lastSend > 30000) {
    lastSend = millis();

    publishJSON("topic/btl_iot_n19/cam_bien_anh_sang","cam_bien_anh_sang",digitalRead(LIGHT_SENSOR_PIN));
    publishJSON("topic/btl_iot_n19/den_led/state","den_led",digitalRead(LED_MANUAL_PIN));
    int adcSoil = analogRead(SOIL_SENSOR_PIN);
float soilPercent = soilHumidityPercent(adcSoil);
publishJSON("topic/btl_iot_n19/cam_bien_do_am","cam_bien_do_am", soilPercent);
Serial.print("Soil ADC: "); Serial.print(adcSoil); Serial.print(" | %: "); Serial.println(soilPercent);

   float Rs = readSensorResistance(AIR_QUALITY_PIN);

float ppm_CO2 = getPPM(Rs, a_CO2, b_CO2);
float ppm_NH3 = getPPM(Rs, a_NH3, b_NH3);
float ppm_NOx = getPPM(Rs, a_NOx, b_NOx);
float ppm_Alcohol = getPPM(Rs, a_Alcohol, b_Alcohol);
float ppm_Benzene = getPPM(Rs, a_Benzene, b_Benzene);


publishJSON("topic/btl_iot_n19/air_quality/CO2", "CO2", ppm_CO2);
publishJSON("topic/btl_iot_n19/air_quality/NH3", "NH3", ppm_NH3);
publishJSON("topic/btl_iot_n19/air_quality/NOx", "NOx", ppm_NOx);
publishJSON("topic/btl_iot_n19/air_quality/Alcohol", "Alcohol", ppm_Alcohol);
publishJSON("topic/btl_iot_n19/air_quality/Benzene", "Benzene", ppm_Benzene);


Serial.print("Rs: "); Serial.print(Rs);
Serial.print(" kOhm | CO2: "); Serial.print(ppm_CO2);
Serial.print(" ppm | NH3: "); Serial.print(ppm_NH3);
Serial.print(" ppm | NOx: "); Serial.print(ppm_NOx);
Serial.print(" ppm | Alcohol: "); Serial.print(ppm_Alcohol);
Serial.print(" ppm | Benzene: "); Serial.println(ppm_Benzene);


    publishJSON("topic/btl_iot_n19/cam_bien_nhiet_do","cam_bien_nhiet_do",dht.readTemperature());
    publishJSON("topic/btl_iot_n19/may_bom","may_bom",digitalRead(RELAY_PUMP_PIN)==LOW);
    publishJSON("topic/btl_iot_n19/quat/state","quat",digitalRead(FAN_PIN));
  }
}
