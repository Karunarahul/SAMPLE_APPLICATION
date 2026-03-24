import asyncio
import websockets
import json
import time
import random
import math

# The public URL of your deployed cloud_server.py
CLOUD_SERVER_URL = "wss://sample-application-3bsj.onrender.com/sensor_push" 

async def read_and_stream():
    async for websocket in websockets.connect(CLOUD_SERVER_URL):
        print(f"Connected to Cloud Hub at {CLOUD_SERVER_URL}")
        try:
            while True:
                t = time.time()
                
                # --- Mock Sensors ---
                # Heart rate with sine wave variation + noise
                hr_base = 72 + 5 * math.sin(t * 0.5)
                hr_calc = round(hr_base + (random.random() - 0.5) * 5)
                
                # SpO2 mostly stable
                spo2_calc = 98 + round((random.random() - 0.5) * 2)
                spo2_calc = min(100, spo2_calc)
                
                # Temp stable
                body_temp_c = 36.6 + (random.random() - 0.5) * 0.2
                
                # Fake ECG
                ecg_voltage = 1.6 + math.sin(t * 10) * 0.5 + (random.random() - 0.5) * 0.1
                
                # --- Package Data ---
                payload = json.dumps({
                    "ts": int(time.time() * 1000),
                    "hr": hr_calc,
                    "spo2": spo2_calc,
                    "temp_c": f"{body_temp_c:.1f}",
                    "ecg": ecg_voltage,
                    "status": "ok"
                })
                
                # Push to cloud
                print(f"Pushing mock data: {payload}")
                await websocket.send(payload)
                await asyncio.sleep(0.1) # 10Hz
                
        except websockets.exceptions.ConnectionClosed:
            print("Connection to Cloud Hub lost. Reconnecting...")
            await asyncio.sleep(2) # Wait before reconnecting

async def main():
    print("Starting MOCK sensor stream to cloud...")
    await read_and_stream()

if __name__ == "__main__":
    asyncio.run(main())
