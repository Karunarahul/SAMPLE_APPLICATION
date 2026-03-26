/*
 * SafeVitals ESP32 BLE Server
 * 
 * Streams real-time vital signs over Bluetooth Low Energy.
 * 
 * Hardware:
 *   - MAX30102  (HR + SpO2)  → I2C (SDA=21, SCL=22)
 *   - MLX90614  (Temp IR)    → I2C (SDA=21, SCL=22)
 *   - AD8232   (ECG)         → Analog GPIO34
 *   - MPU6050  (Motion)      → I2C (SDA=21, SCL=22)
 * 
 * BLE:
 *   Device Name : "SafeVitalsESP32"
 *   Service UUID: 12345678-1234-1234-1234-123456789abc
 *   Char UUID   : abcd1234-ab12-cd34-ef56-123456789abc  (Notify)
 * 
 * Libraries required (install via Arduino Library Manager):
 *   - SparkFun MAX3010x Pulse and Proximity Sensor Library
 *   - Adafruit MLX90614 Library
 *   - Adafruit MPU6050 Library
 *   - Adafruit Unified Sensor
 *   - ArduinoJson (v7+)
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <Wire.h>
#include <ArduinoJson.h>

// Sensor Libraries
#include <MAX30105.h>          // SparkFun MAX3010x
#include <heartRate.h>         // SparkFun heart-rate algorithm
#include <Adafruit_MLX90614.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// ─── BLE UUIDs ────────────────────────────────────────────
#define SERVICE_UUID        "12345678-1234-1234-1234-123456789abc"
#define CHARACTERISTIC_UUID "abcd1234-ab12-cd34-ef56-123456789abc"

// ─── Pin Definitions ──────────────────────────────────────
#define ECG_PIN       34   // AD8232 OUTPUT → GPIO34 (analog input only)
#define ECG_LO_PLUS   32   // AD8232 LO+ (leads-off detection)
#define ECG_LO_MINUS  33   // AD8232 LO- (leads-off detection)

// ─── BLE Globals ──────────────────────────────────────────
BLEServer*         pServer        = nullptr;
BLECharacteristic* pCharacteristic = nullptr;
bool               deviceConnected    = false;
bool               oldDeviceConnected = false;

// ─── Sensor Objects ───────────────────────────────────────
MAX30105       particleSensor;
Adafruit_MLX90614 mlx;
Adafruit_MPU6050  mpu;

// ─── Heart Rate Computation ───────────────────────────────
const byte RATE_SIZE = 4;
byte       rates[RATE_SIZE];
byte       rateSpot  = 0;
long       lastBeat  = 0;
float      beatsPerMinute = 0;
int        beatAvg   = 72;  // fallback
int        spO2Value = 98;  // fallback (simplified; production needs SpO2 algo)

// ─── Timing ───────────────────────────────────────────────
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 500; // ms

// ─── BLE Server Callbacks ─────────────────────────────────
class ServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) override {
        deviceConnected = true;
        Serial.println("[BLE] Client connected");
    }

    void onDisconnect(BLEServer* pServer) override {
        deviceConnected = false;
        Serial.println("[BLE] Client disconnected — restarting advertising");
    }
};

// ─── Sensor Initialization ────────────────────────────────
bool initMAX30102() {
    if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
        Serial.println("[SENSOR] MAX30102 not found!");
        return false;
    }
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);
    Serial.println("[SENSOR] MAX30102 initialized");
    return true;
}

bool initMLX90614() {
    if (!mlx.begin()) {
        Serial.println("[SENSOR] MLX90614 not found!");
        return false;
    }
    Serial.println("[SENSOR] MLX90614 initialized");
    return true;
}

bool initMPU6050() {
    if (!mpu.begin()) {
        Serial.println("[SENSOR] MPU6050 not found!");
        return false;
    }
    mpu.setAccelerometerRange(MPU6050_RANGE_2_G);
    mpu.setGyroRange(MPU6050_RANGE_250_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    Serial.println("[SENSOR] MPU6050 initialized");
    return true;
}

// ─── Sensor Flags ─────────────────────────────────────────
bool hasMAX30102 = false;
bool hasMLX90614 = false;
bool hasMPU6050  = false;

// ═══════════════════════════════════════════════════════════
void setup() {
    Serial.begin(115200);
    Serial.println("\n=== SafeVitals ESP32 BLE Server ===");

    // ECG pins
    pinMode(ECG_LO_PLUS,  INPUT);
    pinMode(ECG_LO_MINUS, INPUT);

    // I2C
    Wire.begin(21, 22);

    // Initialize sensors (gracefully handle missing hardware)
    hasMAX30102 = initMAX30102();
    hasMLX90614 = initMLX90614();
    hasMPU6050  = initMPU6050();

    // ─── BLE Setup ────────────────────────────────────────
    BLEDevice::init("SafeVitalsESP32");
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new ServerCallbacks());

    BLEService* pService = pServer->createService(SERVICE_UUID);

    pCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_NOTIFY
    );

    // Client Characteristic Configuration Descriptor (required for Notify)
    pCharacteristic->addDescriptor(new BLE2902());

    pService->start();

    // Start advertising
    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->setMinPreferred(0x06);
    pAdvertising->setMinPreferred(0x12);
    BLEDevice::startAdvertising();

    Serial.println("[BLE] Advertising started — waiting for connections...");
}

// ═══════════════════════════════════════════════════════════
void loop() {
    // ─── Handle reconnection ──────────────────────────────
    if (!deviceConnected && oldDeviceConnected) {
        delay(500);
        pServer->startAdvertising();
        Serial.println("[BLE] Re-advertising...");
        oldDeviceConnected = false;
    }
    if (deviceConnected && !oldDeviceConnected) {
        oldDeviceConnected = true;
    }

    // ─── Read Sensors ─────────────────────────────────────

    // 1) Heart Rate (MAX30102) — non-blocking read
    if (hasMAX30102) {
        long irValue = particleSensor.getIR();
        if (checkForBeat(irValue)) {
            long delta = millis() - lastBeat;
            lastBeat = millis();
            beatsPerMinute = 60.0 / (delta / 1000.0);

            if (beatsPerMinute > 20 && beatsPerMinute < 255) {
                rates[rateSpot++ % RATE_SIZE] = (byte)beatsPerMinute;
                int total = 0;
                for (byte x = 0; x < RATE_SIZE; x++) total += rates[x];
                beatAvg = total / RATE_SIZE;
            }
        }

        // Simplified SpO2 estimation (production should use SpO2 algorithm)
        if (irValue > 50000) {
            long redValue = particleSensor.getRed();
            float ratio = (float)redValue / (float)irValue;
            spO2Value = constrain((int)(110.0 - 25.0 * ratio), 70, 100);
        }
    }

    // 2) Temperature (MLX90614)
    float tempC = 36.5; // fallback
    if (hasMLX90614) {
        float reading = mlx.readObjectTempC();
        if (reading > 20.0 && reading < 45.0) {
            tempC = reading;
        }
    }

    // 3) ECG (AD8232)
    int ecgValue = 512; // fallback midpoint
    if (digitalRead(ECG_LO_PLUS) == 0 && digitalRead(ECG_LO_MINUS) == 0) {
        ecgValue = analogRead(ECG_PIN);
    }

    // 4) Motion (MPU6050)
    float ax = 0, ay = 0, az = 0;
    if (hasMPU6050) {
        sensors_event_t a, g, temp;
        mpu.getEvent(&a, &g, &temp);
        ax = a.acceleration.x;
        ay = a.acceleration.y;
        az = a.acceleration.z;
    }

    // ─── Send BLE Notification ────────────────────────────
    if (deviceConnected && (millis() - lastSendTime >= SEND_INTERVAL)) {
        lastSendTime = millis();

        // Build JSON (compact to fit BLE MTU)
        JsonDocument doc;
        doc["hr"]   = constrain(beatAvg, 30, 220);
        doc["spo2"] = constrain(spO2Value, 70, 100);
        doc["temp"] = round(tempC * 10.0) / 10.0;
        doc["ecg"]  = constrain(ecgValue, 0, 4095);

        JsonObject motion = doc["motion"].to<JsonObject>();
        motion["x"] = round(ax * 100.0) / 100.0;
        motion["y"] = round(ay * 100.0) / 100.0;
        motion["z"] = round(az * 100.0) / 100.0;

        // Serialize to string
        char jsonBuffer[200];
        size_t len = serializeJson(doc, jsonBuffer, sizeof(jsonBuffer));

        // Send via BLE Notify
        pCharacteristic->setValue((uint8_t*)jsonBuffer, len);
        pCharacteristic->notify();

        Serial.println(jsonBuffer);
    }

    delay(10); // yield to BLE stack
}
