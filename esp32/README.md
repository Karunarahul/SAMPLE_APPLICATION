# SafeVitals ESP32 BLE Firmware

## Wiring Diagram

```
ESP32 Dev Module
┌──────────────┐
│         3V3  │──── MAX30102 VCC, MLX90614 VCC, MPU6050 VCC
│         GND  │──── All sensor GNDs
│   GPIO 21    │──── SDA (MAX30102, MLX90614, MPU6050)
│   GPIO 22    │──── SCL (MAX30102, MLX90614, MPU6050)
│   GPIO 34    │──── AD8232 OUTPUT
│   GPIO 32    │──── AD8232 LO+
│   GPIO 33    │──── AD8232 LO-
│         3V3  │──── AD8232 3.3V
│         GND  │──── AD8232 GND
└──────────────┘
```

> All I2C sensors share the same SDA/SCL bus. Add 4.7kΩ pull-up resistors on SDA & SCL if not on breakout boards.

## Required Arduino Libraries

Install via **Sketch → Include Library → Manage Libraries**:

| Library | Author |
|---------|--------|
| SparkFun MAX3010x Pulse and Proximity Sensor | SparkFun |
| Adafruit MLX90614 | Adafruit |
| Adafruit MPU6050 | Adafruit |
| Adafruit Unified Sensor | Adafruit |
| ArduinoJson | Benoît Blanchon |

## Board Setup

1. **Arduino IDE → File → Preferences → Additional Board URLs:**
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
2. **Tools → Board → ESP32 Arduino → ESP32 Dev Module**
3. **Tools → Partition Scheme → Default 4MB with spiffs**
4. **Tools → Upload Speed → 921600**

## Flash

1. Connect ESP32 via USB
2. Select the correct COM port
3. Click **Upload**
4. Open Serial Monitor at **115200 baud** to verify sensor output

## BLE Details

| Field | Value |
|-------|-------|
| Device Name | `SafeVitalsESP32` |
| Service UUID | `12345678-1234-1234-1234-123456789abc` |
| Characteristic UUID | `abcd1234-ab12-cd34-ef56-123456789abc` |
| Property | Notify (500ms interval) |
| Payload | JSON string, ~100-150 bytes |

## Power Tips

- Use `ESP32 Light Sleep` between BLE intervals for battery operation
- Lower `SEND_INTERVAL` to 1000ms if power is critical
- Disable Serial prints in production to save ~5mA
