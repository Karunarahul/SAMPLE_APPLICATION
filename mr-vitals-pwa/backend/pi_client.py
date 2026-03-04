import asyncio
import websockets
import json
import time

# --- Sensor Library Imports ---
import board
import busio
import adafruit_mlx90614
from max30102 import MAX30102 
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

# The public URL of your deployed cloud_server.py
# (e.g., "wss://my-health-app.onrender.com/sensor_push")
CLOUD_SERVER_URL = "ws://localhost:8080/sensor_push" 

def setup_sensors():
    print("Initializing sensors...")
    i2c = busio.I2C(board.SCL, board.SDA)
    mlx = adafruit_mlx90614.MLX90614(i2c)
    max_sensor = MAX30102()
    max_sensor.setup_sensor()
    ads = ADS.ADS1115(i2c)
    ecg_channel = AnalogIn(ads, ADS.P0)
    return mlx, max_sensor, ecg_channel

async def read_and_stream(mlx, max_sensor, ecg_channel):
    async for websocket in websockets.connect(CLOUD_SERVER_URL):
        print(f"Connected to Cloud Hub at {CLOUD_SERVER_URL}")
        try:
            while True:
                # --- Read Sensors ---
                body_temp_c = mlx.object_temperature
                max_sensor.check()
                if max_sensor.available():
                    # Placeholder for actual HR/SpO2 calculation algorithm
                    hr_calc, spo2_calc = 75, 98 
                else:
                    hr_calc, spo2_calc = 0, 0
                ecg_voltage = ecg_channel.voltage
                
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
                await websocket.send(payload)
                await asyncio.sleep(0.1) # 10Hz
                
        except websockets.exceptions.ConnectionClosed:
            print("Connection to Cloud Hub lost. Reconnecting...")
            await asyncio.sleep(2) # Wait before reconnecting

async def main():
    try:
        mlx, max_sensor, ecg_channel = setup_sensors()
    except Exception as e:
        print(f"Hardware initialization failed: {e}")
        return
        
    print("Starting sensor stream to cloud...")
    await read_and_stream(mlx, max_sensor, ecg_channel)

if __name__ == "__main__":
    asyncio.run(main())
