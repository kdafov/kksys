import socketio
import eventlet

# Initialize the Socket.IO server
sio = socketio.Server(cors_allowed_origins="*")

# Event handler for client connection
@sio.event
def connect(sid, environ):
    print(f"Client connected: {sid}")

# Event handler for client disconnection
@sio.event
def disconnect(sid):
    print(f"Client disconnected: {sid}")

# Event handler for 'sensor-data' events
@sio.on("sensor-data")
def handle_sensor_data(sid, data):
    print(f"Received data from {sid}: {data}")
    sio.emit("message", data)  # Broadcast the data to all connected clients

# Set up the WSGI application with the Socket.IO server
app = socketio.WSGIApp(sio)

# Run the server using Eventlet
if __name__ == "__main__":
    print("Starting Socket.IO server on http://localhost:3001")
    eventlet.wsgi.server(eventlet.listen(("localhost", 3001)), app)
