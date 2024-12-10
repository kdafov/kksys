/* Version 3.1.1 JAN 30 24 */
#include <DHT.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

#define DHT_PIN D4 
#define DHT_TYPE DHT11
#define GREEN D3
#define RED D1
#define CONTROL D2
#define RAIN_SENSOR D5
#define MOTION_SENSOR D6

// Network configuration
const char* SSID = "*";
const char* PASS = "*";
WiFiClient espClient;

// MQTT Server config
const char* MQTT_SERVER = "broker.hivemq.com";
const char* TOPIC = "*";
PubSubClient client(espClient);

// System config 
DHT dht(DHT_PIN, DHT_TYPE);
bool running = true;

// Global array to store sensor values
String vals[] = {"0.00", "0.00", "R0", "M0"};

void setup() {
  // Establish serial connection
  Serial.begin(9600);

  // Setup pins and their operation modes
  dht.begin();
  pinMode(RED, OUTPUT);
  pinMode(GREEN, OUTPUT);
  pinMode(CONTROL, INPUT);
  pinMode(RAIN_SENSOR, INPUT);
  pinMode(MOTION_SENSOR, INPUT);

  // Set red LED -> ON
  digitalWrite(GREEN, HIGH);
  digitalWrite(RED, LOW);

  // Attempt connection to WiFi
  Serial.println("Attempting connection to: " + String(SSID));
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected successfully to: " + String(SSID));

  // Attempt connection to MQTT Broker
  client.setServer(MQTT_SERVER, 1883);

  // Warmup & Resume operation
  digitalWrite(GREEN, LOW);
  digitalWrite(RED, HIGH);
  
  int s = 0;
  while (s != 60) {
    digitalWrite(GREEN, HIGH);
    delay(500);
    digitalWrite(GREEN, LOW);
    delay(500);
    s++;
  }
}

void loop() {
  // Check connectivity to MQTT Broker
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Get state of control button (RUNNING/PAUSE)
  uint8_t control_state = digitalRead(CONTROL);

  // When pressed take action (flip current state)
  if (control_state == LOW) {
    if (running) {
      digitalWrite(GREEN, HIGH);
      digitalWrite(RED, LOW);
      running = false;
      client.publish(TOPIC, "VHOD~OFF");
    } else {
      digitalWrite(GREEN, LOW);
      digitalWrite(RED, HIGH);
      running = true;
      client.publish(TOPIC, "VHOD~RUNNING");
    }
  }

  // If system is not paused, run script
  if (running) {
    // Get states of sensors
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    uint8_t motion_sensor = digitalRead(MOTION_SENSOR);
    uint8_t rain_sensor = digitalRead(RAIN_SENSOR);

    // Motion sensor actions
    if (motion_sensor == HIGH && vals[3] != "M1") {
      // Motion detected AND not announced to MQTT
      client.publish(TOPIC, "VHOD~M1");
      vals[3] = "M1";
    } else if (motion_sensor == LOW && vals[3] != "M0") {
      // Motion stopped AND not announced to MQTT
      client.publish(TOPIC, "VHOD~M0");
      vals[3] = "M0";
    }
  }

    // Temperature and humidity data
    if (isnan(temperature) || isnan(humidity)) {
      // Error reading the sensors
      Serial.println("Failed to read from DHT sensor!");
    } else {
      // Check if sensor data is different than the previous recorded and announce to MQTT
      if (String(temperature) != vals[0] || String(humidity) != vals[1]) {
        String data_str_temp = "VHOD~T" + String(temperature) + "/" + String(humidity);
        client.publish(TOPIC, data_str_temp.c_str());
        vals[0] = String(temperature);
        vals[1] = String(humidity);
      }
    }

    // Rain sensor
    if (rain_sensor == HIGH && vals[2] != "R1") {
      // Water detected AND not announced to MQTT
        client.publish(TOPIC, "VHOD~R1");
        vals[2] = "R1";
    } else if (rain_sensor == LOW && vals[2] != "R0") {
      // Water stopped AND not announced to MQTT
        client.publish(TOPIC, "VHOD~R0");
        vals[2] = "R0";
    }

  // System loop every 2s
  delay(2000);
}

void reconnect() {
  // Reconnect to MQTT Broker
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("Client-MCU02")) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println("...trying again in 5 seconds");
      delay(5000);
    }
  }
}
