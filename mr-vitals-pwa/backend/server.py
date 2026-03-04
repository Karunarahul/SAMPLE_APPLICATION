import asyncio
import websockets
import json
import time
import random
import math

async def send_mock_data(websocket):
    print('client connected')
    try:
        while True:
            t = time.time()
            
            # Heart rate with sine wave variation + noise
            hr_base = 72 + 5 * math.sin(t * 0.5)
            hr = round(hr_base + (random.random() - 0.5) * 5)
            
            # SpO2 mostly stable
            spo2 = 98 + round((random.random() - 0.5) * 2)
            spo2 = min(100, spo2)
            
            # Temp stable
            temp_c = f"{36.6 + (random.random() - 0.5) * 0.2:.1f}"
            
            payload = json.dumps({
                "ts": int(t * 1000),
                "hr": hr,
                "spo2": spo2,
                "temp_c": temp_c,
                "status": "ok"
            })
            
            await websocket.send(payload)
            await asyncio.sleep(0.8)
    except websockets.exceptions.ConnectionClosed:
        print("client disconnected")

async def main():
    print('ws server started at ws://localhost:8080')
    async with websockets.serve(send_mock_data, "0.0.0.0", 8080):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
