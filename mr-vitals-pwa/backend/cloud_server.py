import asyncio
import websockets
import json
import os

# Store connected clients
PI_CLIENTS = set()
WEB_UI_CLIENTS = set()

# A cache of the latest vitals to send to new UI clients immediately upon connection
latest_vitals = {
    "hr": 0,
    "spo2": 0,
    "temp_c": "0.0",
    "ecg": 0,
    "status": "waiting_for_hardware"
}

async def handle_connection(websocket, path):
    print(f"New connection on path: {path}")
    
    # Simple routing based on the URL path the client connects to
    if path == "/sensor_push":
        # This is the Raspberry Pi connecting to push data
        PI_CLIENTS.add(websocket)
        print("Hardware (Raspberry Pi) connected.")
        try:
            async for message in websocket:
                # 1. Receive data from Pi
                data = json.loads(message)
                global latest_vitals
                latest_vitals = data
                
                # 2. Broadcast immediately to all connected Web UIs
                if WEB_UI_CLIENTS:
                    payload = json.dumps(data)
                    websockets.broadcast(WEB_UI_CLIENTS, payload)
                    
        except websockets.exceptions.ConnectionClosed:
            print("Hardware (Raspberry Pi) disconnected.")
        finally:
            PI_CLIENTS.remove(websocket)
            
    elif path == "/web_ui":
        # This is the React Web App connecting to view data
        WEB_UI_CLIENTS.add(websocket)
        print("Web UI connected.")
        
        # Send the latest known state immediately
        await websocket.send(json.dumps(latest_vitals))
        
        try:
            # Keep connection open, wait for it to close
            await websocket.wait_closed()
        finally:
            print("Web UI disconnected.")
            WEB_UI_CLIENTS.remove(websocket)
            
    else:
        print(f"Unknown connection path: {path}")
        await websocket.close()

async def main():
    # Use PORT env variable if available (e.g., Render/Heroku sets this), else default to 8080
    port = int(os.environ.get("PORT", 8080))
    print(f"Cloud Hub started on 0.0.0.0:{port}")
    print(" - Pi should connect to: ws://<server_ip>:{port}/sensor_push")
    print(" - Web UI should connect to: ws://<server_ip>:{port}/web_ui")
    
    async with websockets.serve(handle_connection, "0.0.0.0", port):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
