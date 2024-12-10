# Project overview

This project is a real-time monitoring and control system for IoT-enabled devices, utilizing Socket.IO for live data updates and MQTT for device communication. It features a web interface built with React and Material-UI that displays sensor data (e.g., temperature, humidity, motion, rain) from two MCU devices, "Vhod" and "Naves," with functionality to view historical data, system status, and weather forecasts.

# Naves – MCU + Arduino Controller (V3)

### Overview
A combined Arduino and MCU-based system for data collection and MQTT communication. The Arduino collects sensor data and sends it to the MCU, which processes additional data and publishes changes to an MQTT pub/sub system. Data is sent only if the state changes. Wi-Fi credentials must be configured for new installations.

### Features
- **Boot Process**: 
  - MCU: Flashes green twice (network and MQTT setup) before turning steady to indicate readiness.
  - Arduino: Sensors warm up for 30 seconds, after which the "L" light switches on to indicate readiness.
- **Sensors and Ports**:
  | **Sensor**                 | **Type**    | **Port** | **DC**  |
  |----------------------------|-------------|----------|---------|
  | Motion indicator           | Input       | D0       | -       |
  | Gas High indicator         | Input       | D1       | -       |
  | Gas Low indicator          | Input       | D2       | -       |
  | Rain sensor                | Input       | D3       | 3.3V    |
  | Temp/Hum sensor            | Input       | D4       | 3.3V    |
  | Green LED resistor         | Output      | D5       | 3.3V    |
  | Red LED resistor           | Output      | D6       | 3.3V    |
  | Button                     | Input       | D7       | 3.3V    |
  | System state indicator     | Output      | D8       | 3.3V    |
  | Gas sensor (analogue)      | Input       | A0       | 5V      |
  | Gas sensor (digital)       | Input       | 2        | 5V      |
  | Motion sensor              | Input       | 3        | 5V      |
  | Buzzer                     | Output      | 4        | 3.3V    |
  | Gas Low indicator          | Output      | 5        | -       |
  | Gas High indicator         | Output      | 6        | -       |
  | Motion indicator           | Output      | 7        | -       |
  | System state indicator     | Input       | 8        | -       |

- **Power**: 7.5V/5V power cable.
- **Control**: Hold the button for 3 seconds to halt (red light) or resume (green light).

# Vhod – MCU (V2)

### Overview
An MCU module that collects sensor inputs and publishes changes to an MQTT broker. Data is sent only if the state changes. Wi-Fi credentials must be configured for new installations.

### Features
- **Boot Process**:
  - Connects to Wi-Fi (flashes twice) and MQTT broker (flashes twice) before turning steady blue to indicate readiness.
  - White light indicates admin mode before a state change.
- **Sensors and Ports**:
  | **Sensor**                 | **Type**    | **Port** | **DC**  |
  |----------------------------|-------------|----------|---------|
  | Button                     | Input       | D0       | 3.3V    |
  | Red LED resistor           | Output      | D1       | 3.3V    |
  | White LED resistor         | Output      | D2       | 3.3V    |
  | Blue LED resistor          | Output      | D3       | 3.3V    |
  | Temp/Hum sensor            | Input       | D4       | 3.3V    |
  | Rain sensor                | Input       | D5       | 3.3V    |
  | Motion sensor              | Input       | D6       | 3.3V    |

- **Power**: 5V power cable or short-life 9V battery with a voltage regulator.
- **Control**: Hold the button until white light followed by red (halt) or blue (resume).

# Installing ESP8266 Core in Arduino IDE

Follow these steps to set up your AZ-Delivery NodeMCU LUA Amica V2 (based on the ESP8266 chip) with the Arduino IDE:

## Step 1: Install ESP8266 Core

1. Open the Arduino IDE.
2. Go to **File** -> **Preferences**.
3. In the **Additional Boards Manager URLs** field, paste the following URL: https://arduino.esp8266.com/stable/package_esp8266com_index.json
4. Click **OK** to save the preferences.
5. Navigate to **Tools** -> **Board** -> **Boards Manager**.
6. Search for `esp8266` in the Boards Manager and install the **esp8266** board package by the "ESP8266 Community."

## Step 2: Select the NodeMCU Board

1. After installation, go to **Tools** -> **Board**.
2. Select **NodeMCU 1.0 (ESP-12E Module)** as your target board.

## Step 3: Select the Correct COM Port

1. Connect your NodeMCU Amica V2 to your computer via USB.
2. In the Arduino IDE, go to **Tools** -> **Port** and select the COM port corresponding to your NodeMCU.

## Step 4: Write and Upload Code

1. Write your Arduino sketch code in the Arduino IDE.
2. You can use example codes or create custom sketches to interact with sensors or perform other tasks.
3. Click the **Upload** button (arrow icon) to compile and upload the code to your NodeMCU.

## Step 5: Verify and Monitor

1. Open the **Serial Monitor** in the Arduino IDE to debug your code and view the output.
2. Ensure the baud rate in the Serial Monitor matches the value specified in your sketch (e.g., 115200).

## Step 6: Experiment and Build Projects

- With your NodeMCU set up in the Arduino IDE, you can start creating IoT projects.
- Leverage GPIO pins, analog input, PWM, and other features to develop advanced functionalities.

## Additional Resources

- Refer to the specific pinout information provided in the NodeMCU documentation when connecting peripherals.
- Install required libraries for external components like sensors to enhance your projects.
- Explore PWM, analog input, and other NodeMCU features to expand your project capabilities.

You're now ready to explore and build exciting IoT projects with your NodeMCU LUA Amica V2!

# MQTT Broker Platform

web: https://www.hivemq.com/demos/websocket-client/#data
topic: {uid}/mcu
