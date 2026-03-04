import asyncio
import websockets
import json
import time

# --- Sensor Library Imports (You will need to install these on the Pi) ---
# For I2C sensors:
import board
import busio
# Body Temp (MLX90614)
import adafruit_mlx90614
# Heart Rate / SpO2 (MAX30102) - often uses max30102 library or similar
from max30102 import MAX30102 
# For Analog ECG (AD8232) - Raspberry Pi has NO built-in analog pins!
# You MUST use an ADC like the ADS1115 via I2C to read the analog signal
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

def setup_sensors():
    print("Initializing sensors...")
    i2c = busio.I2C(board.SCL, board.SDA)
    
    # 1. Setup MLX90614 (Body Temp) - Address usually 0x5A
    mlx = adafruit_mlx90614.MLX90614(i2c)
    
    # 2. Setup MAX30102 (HR / SpO2) - Address usually 0x57
    max_sensor = MAX30102()
    max_sensor.setup_sensor()
    
    # 3. Setup ADC for AD8232 (ECG) - Address usually 0x48
    ads = ADS.ADS1115(i2c)
    # The AD8232 'OUTPUT' pin goes into the ADC, e.g., pin A0
    ecg_channel = AnalogIn(ads, ADS.P0)
    
    return mlx, max_sensor, ecg_channel

async def read_and_stream(websocket, mlx, max_sensor, ecg_channel):
    print("Client connected, starting data stream.")
    try:
        while True:
            # --- Read Sensors ---
            
            # Read MLX90614
            body_temp_c = mlx.object_temperature
            
            # Read MAX30102 
            # (Note: MAX30102 requires a continuous read loop in a real app to get accurate BPM/SpO2 algorithms. 
            # This is simplified for demonstration.)
            max_sensor.check()
            if max_sensor.available():
                red_reading = max_sensor.pop_red_from_storage()
                ir_reading = max_sensor.pop_ir_from_storage()
                # You'll need to run an algorithm on red_reading & ir_reading to calculate HR/SpO2
                hr_calc = 75 # Placeholder for calculated HR
                spo2_calc = 98 # Placeholder for calculated SpO2
            else:
                hr_calc, spo2_calc = 0, 0
                
            # Read AD8232 ECG Voltage
            ecg_voltage = ecg_channel.voltage
            
            # --- Package Data for Web App ---
            payload = json.dumps({
                "ts": int(time.time() * 1000),
                "hr": hr_calc,
                "spo2": spo2_calc,
                "temp_c": f"{body_temp_c:.1f}",
                "ecg": ecg_voltage,
                "status": "ok"
            })
            
            await websocket.send(payload)
            await asyncio.sleep(0.1) # 10Hz update rate, essential for smooth ECG
            
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected.")

async def main():
    # Attempt to initialize sensors, fallback if hardware is missing
    try:
        mlx, max_sensor, ecg_channel = setup_sensors()
    except Exception as e:
        print(f"Warning: Hardware initialization failed. {e}")
        print("Make sure you are running this on the Raspberry Pi with sensors wired correctly.")
        return
        
    print("WebSocket Server starting on ws://0.0.0.0:8080")
    async with websockets.serve(lambda ws: read_and_stream(ws, mlx, max_sensor, ecg_channel), "0.0.0.0", 8080):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
