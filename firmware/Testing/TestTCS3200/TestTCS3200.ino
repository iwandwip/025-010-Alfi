#define ENABLE_SENSOR_MODULE
#define ENABLE_SENSOR_MODULE_UTILITY
#define ENABLE_SENSOR_TCS3200

#include "Kinematrix.h"

SensorModule sensor;

void setup() {
  Serial.begin(115200);
  sensor.addModule("tcs", new TCS3200Sens(15, 15, 4, 2, 16));
  sensor.init();
}

void loop() {
  sensor.update([]() {
    sensor.debug();
  });
}
