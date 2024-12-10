import paho.mqtt.client as mqtt
from datetime import datetime, timedelta
from tools import return_temp_array, return_rain_data
from weather_api import run_forecast
import json
import socketio

# Constants
MQTT_HOST = 'broker.hivemq.com'
MQTT_PORT = 1883
MQTT_TOPIC = 'encrypted_token_here'
SOCKET_SERVER = 'http://localhost:3001'

# Global Variables
seq = 0
last_update = ''
weather_api_update = None
vhod_temps, vhod_rain, naves_temps, naves_rain = [], [], [], []
last_rain = {'vhod': None, 'naves': None}
vhod = {'status': 'OFF', 'curr_temp': 0, 'humidity': 0, 'motion': 'NO', 'last_motion': 0, 'curr_rain': 'NO', 'last_rain': 0, 'temps': [], 'rain': []}
naves = {'status': 'OFF', 'curr_temp': 0, 'humidity': 0, 'low_gas': 'NO', 'high_gas': 'NO', 'motion': 'NO', 'last_motion': 0, 'curr_rain': 'NO', 'last_rain': 0, 'temps': [], 'rain': []}

# Websocket Setup
sio = socketio.Client()

# MQTT Setup
client = mqtt.Client() 

# Helper Functions
def update_device_data(device, text, temps, rain):
    """
    Updates the given device's data based on the parsed MQTT message.
    """
    device['status'] = 'ON'
    p = text.split('~')[1]

    if p.startswith('T'):  # Temperature and Humidity
        temp, hum = p[1:].split('/')
        temps.append([datetime.now(), temp])
        device.update({'curr_temp': temp, 'humidity': hum})

    elif p.startswith('M'):  # Motion
        device['motion'] = 'YES' if p[1] == '1' else 'NO'
        if p[1] == '1':
            device['last_motion'] = int(datetime.now().timestamp() * 1000)

    elif p.startswith('R'):  # Rain
        handle_rain(device, rain, p)

    elif p.startswith('GL'):  # Low Gas
        device['low_gas'] = 'YES' if p[2] == '1' else 'NO'

    elif p.startswith('GH'):  # High Gas
        device['high_gas'] = 'YES' if p[2] == '1' else 'NO'

    elif p == 'OFF':
        device['status'] = 'OFF'

    elif p == 'RUNNING':
        device['status'] = 'ON'


def handle_rain(device, rain_data, rain_status):
    """
    Handles rain-related data updates.
    """
    if rain_status[1] == '1':  # Rain started
        device['last_rain'] = int(datetime.now().timestamp() * 1000)
        last_rain[device] = datetime.now()
        device['curr_rain'] = 'YES'
    else:  # Rain stopped
        device['curr_rain'] = 'NO'
        if device['last_rain'] != 0:
            curr_time = datetime.now()
            rain_duration = (curr_time - last_rain[device]).total_seconds() / 60
            rain_data.append([last_rain[device], rain_duration])


def update():
    """
    Updates and emits data to the Socket.IO server.
    """
    global seq, last_update, weather_api_update

    # Print debug info
    print(f'<{seq}> {"*" * 20}')
    print(vhod)
    print(naves)
    print(f'<{seq}/> {"*" * 20}\n')

    # Handle last hour update
    previous_hour = (datetime.now() - timedelta(minutes=datetime.now().minute, seconds=datetime.now().second)).replace(minute=0, second=0) - timedelta(hours=1)
    lh = 'Y' if last_update != previous_hour.strftime('%H:%M') else 'N'
    last_update = previous_hour.strftime('%H:%M')

    # Fetch weather forecast if needed
    weather_forecast = []
    current_time = datetime.now()
    if weather_api_update is None or current_time > weather_api_update + timedelta(hours=3):
        weather_forecast = run_forecast()
        weather_api_update = current_time

    # Emit data
    data_to_send = {
        'forecast': weather_forecast,
        'lh': lh,
        'vhod': vhod,
        'naves': naves,
    }
    sio.emit('sensor-data', json.dumps(data_to_send))

    # Increment or reset sequence
    seq = 0 if seq == 100 else seq + 1


def clear_data():
    """
    Clears old data from the temperature and rain arrays.
    """
    global vhod_temps, vhod_rain, naves_temps, naves_rain

    print('\n*** CLEANING ARRAYS ***')
    cutoff_date = datetime.now() - timedelta(days=3)
    vhod_temps = [entry for entry in vhod_temps if entry[0] >= cutoff_date]
    vhod_rain = [entry for entry in vhod_rain if entry[0] >= cutoff_date]
    naves_temps = [entry for entry in naves_temps if entry[0] >= cutoff_date]
    naves_rain = [entry for entry in naves_rain if entry[0] >= cutoff_date]
    print(f'Cleaned data up to {cutoff_date}')
    print('*' * 20)


# MQTT Callbacks
def on_message(_, userdata, msg):
    """
    Handles incoming MQTT messages.
    """
    text = msg.payload.decode('utf-8')

    if text.startswith('VHOD~'):
        update_device_data(vhod, text, vhod_temps, vhod_rain)
    elif text.startswith('NAVES~'):
        update_device_data(naves, text, naves_temps, naves_rain)

    vhod['temps'] = return_temp_array(vhod_temps)
    vhod['rain'] = return_rain_data(vhod_rain)
    naves['temps'] = return_temp_array(naves_temps)
    naves['rain'] = return_rain_data(naves_rain)

    update()


# Socket.IO Events
@sio.event
def connect():
    print('Connected to Socket.IO server')


@sio.event
def disconnect():
    print('Disconnected from Socket.IO server')


# MQTT Setup
client.connect(MQTT_HOST, MQTT_PORT, 60)
client.subscribe(MQTT_TOPIC)
client.on_message = on_message
client.loop_start()

# Socket.IO Connection
sio.connect(SOCKET_SERVER)
