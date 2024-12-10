#include <DHT.h>

#define GAS_DIGITAL 2
#define GAS_ANALOG 0
#define MOTION_SENSOR 3
#define BUZZER 4
#define GAS_OUTPUT_LOW 5
#define GAS_OUTPUT_HIGH 6
#define MOTION_OUTPUT 7
#define CONTROL_STATE 8

void setup() {
  // Setup pin modes and sensors
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(GAS_DIGITAL, INPUT);
  pinMode(MOTION_SENSOR, INPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(GAS_OUTPUT_LOW, OUTPUT);
  pinMode(GAS_OUTPUT_HIGH, OUTPUT);
  pinMode(MOTION_OUTPUT, OUTPUT);
  pinMode(CONTROL_STATE, INPUT);
  digitalWrite(BUZZER, HIGH);
  digitalWrite(GAS_OUTPUT_LOW, LOW);
  digitalWrite(GAS_OUTPUT_HIGH, LOW);
  digitalWrite(MOTION_OUTPUT, LOW);
  delay(30000); //30 seconds in production
  digitalWrite(LED_BUILTIN, HIGH);
}

void loop() {
  uint8_t system_running = digitalRead(CONTROL_STATE);
  if (system_running) {
    digitalWrite(LED_BUILTIN, HIGH);

    // Collect data from sensors
    uint16_t gas_data = analogRead(GAS_ANALOG);
    uint8_t gasWarning = digitalRead(GAS_DIGITAL);
    uint8_t motion_data = digitalRead(MOTION_SENSOR);

    // High warning for gas
    if (gasWarning == LOW) {
      Serial.println("G1");
      digitalWrite(GAS_OUTPUT_HIGH, HIGH);
      digitalWrite(BUZZER, LOW);
    } else {
      digitalWrite(BUZZER, HIGH);
      digitalWrite(GAS_OUTPUT_HIGH, LOW);
    }

    if (map(gas_data, 0, 1023, 0, 100) > 15) {
      digitalWrite(GAS_OUTPUT_LOW, HIGH);
    } else {
      digitalWrite(GAS_OUTPUT_LOW, LOW);
      Serial.println(map(gas_data, 0, 1023, 0, 100));
    }

    // Motion sensor
    if (motion_data == HIGH) {
      Serial.println("M1");
      digitalWrite(MOTION_OUTPUT, HIGH);
    } else {
      digitalWrite(MOTION_OUTPUT, LOW);
    }
  } else {
    digitalWrite(LED_BUILTIN, LOW);
  }

  // System delay
  delay(2000);
}
