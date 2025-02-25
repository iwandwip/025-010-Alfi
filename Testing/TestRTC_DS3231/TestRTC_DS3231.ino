#define ENABLE_SENSOR_MODULE
#define ENABLE_SENSOR_MODULE_UTILITY
#define ENABLE_SENSOR_RTC

#define ENABLE_CALIBRATE_RTC 1
#if ENABLE_CALIBRATE_RTC
#define CALIBRATE_RTC RTC_DS3231Sens::ALL, DateTime(F(__DATE__), F(__TIME__))
#else
#define CALIBRATE_RTC
#endif

#include "Kinematrix.h"

SensorModule sensor;

void setup() {
  Serial.begin(115200);
  sensor.addModule("rtc", new RTC_DS3231Sens(CALIBRATE_RTC));
  sensor.init();
}

void loop() {
  sensor.update([]() {
    sensor.debug();
  });
}
