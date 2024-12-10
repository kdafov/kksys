#include <DHT.h>
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

#define DHT_PIN D4
#define DHT_TYPE DHT11
#define RAIN_SENSOR D3
#define GAS_LOW D2
#define GAS_HIGH D1
#define MOTION D0
#define GREEN D5
#define RED D6
#define CONTROL D7
#define CONTROL_OUTPUT D8

const char* SSID = "*";
const char* PASS = "*";
const char* MQTT_SERVER = "broker.hivemq.com";
const char* TOPIC = "*";

WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(DHT_PIN, DHT_TYPE);
bool running = true;

String vals[] = {"0.00", "0.00", "R0", "GL0", "GH0", "M0"};

void setup() {
  // Connect to serial port, sensors, set pin modes, defautls
  Serial.begin(9600);
  dht.begin();
  pinMode(RAIN_SENSOR, INPUT);
  pinMode(GAS_LOW, INPUT);
  pinMode(GAS_HIGH, INPUT);
  pinMode(MOTION, INPUT);
  pinMode(GREEN, OUTPUT);
  pinMode(RED, OUTPUT);
  pinMode(CONTROL, INPUT);
  pinMode(CONTROL_OUTPUT, OUTPUT);
  digitalWrite(GREEN, HIGH);
  digitalWrite(RED, HIGH);
  delay(5000);

  // Connect to WiFi
  setup_wifi();
  digitalWrite(GREEN, LOW);
  delay(1000);
  digitalWrite(GREEN, HIGH);

  // Connect to MQTT server
  client.setServer(MQTT_SERVER, 1883);
  digitalWrite(GREEN, LOW);

  // Set all systems running
  running = true;
  digitalWrite(CONTROL_OUTPUT, HIGH);
}

void setup_wifi() {
  delay(1000);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(SSID);

  WiFi.begin(SSID, PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
}

void loop() {
  // Check connectivity to internet
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  //--->
  uint8_t control_state = digitalRead(CONTROL);

  if (running) {
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    uint8_t rain_data = digitalRead(RAIN_SENSOR);
    uint8_t gas_low_data = digitalRead(GAS_LOW);
    uint8_t gas_high_data = digitalRead(GAS_HIGH);
    uint8_t motion_data = digitalRead(MOTION);

    // Temperature and humidity data
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read from DHT sensor!");
    } else {
      String data_str_temp = "NAVES~T" + String(temperature) + "/" + String(humidity);
      Serial.println(data_str_temp);

      if (String(temperature) != vals[0] || String(humidity) != vals[1]) {
        Serial.println("new-temp-recorded!");
        client.publish(TOPIC, data_str_temp.c_str());
        vals[0] = String(temperature);
        vals[1] = String(humidity);
      }
    }

    // Rain data
    if (rain_data == HIGH) {
      Serial.println("R1");

      if (vals[2] != "R1") {
        client.publish(TOPIC, "NAVES~R1");
        vals[2] = "R1";
      }
    } else {
      if (vals[2] != "R0") {
        client.publish(TOPIC, "NAVES~R0");
        vals[2] = "R0";
      }
    }

    // Gas data [Low]
    if (gas_low_data == HIGH) {
      Serial.println("GL");

      if (vals[3] != "GL1") {
        client.publish(TOPIC, "NAVES~GL1");
        vals[3] = "GL1";
      }
    } else {
      if (vals[3] != "GL0") {
        client.publish(TOPIC, "NAVES~GL0");
        vals[3] = "GL0";
      }
    }

    // Gas data [High]
    if (gas_high_data == HIGH) {
      Serial.println("GH");

      if (vals[4] != "GH1") {
        client.publish(TOPIC, "NAVES~GH1");
        vals[4] = "GH1";
      }
    } else {
      if (vals[4] != "GH0") {
        client.publish(TOPIC, "NAVES~GH0");
        vals[4] = "GH0";
      }
    }

    // Motion data
    if (motion_data == HIGH) {
      Serial.println("M1");

      if (vals[5] != "M1") {
        client.publish(TOPIC, "NAVES~M1");
        vals[5] = "M1";
      }
    } else {
      if (vals[5] != "M0") {
        client.publish(TOPIC, "NAVES~M0");
        vals[5] = "M0";
      }
    }
  }

  // Control state
  if (control_state == LOW) {
    if (running) {
      digitalWrite(GREEN, HIGH);
      digitalWrite(RED, LOW);
      running = false;
      digitalWrite(CONTROL_OUTPUT, LOW);
      client.publish(TOPIC, "NAVES~OFF");
    } else {
      digitalWrite(GREEN, LOW);
      digitalWrite(RED, HIGH);
      running = true;
      digitalWrite(CONTROL_OUTPUT, HIGH);
      client.publish(TOPIC, "NAVES~RUNNING");
    }
  }

  // Delay
  delay(2000);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("Client-MCU01")) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}
