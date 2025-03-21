#define ENABLE_MODULE_DIGITAL_INPUT
#define ENABLE_MODULE_DIGITAL_OUTPUT
#define ENABLE_MODULE_TASK_HANDLER
#define ENABLE_MODULE_TIMER_DURATION
#define ENABLE_MODULE_TIMER_TASK
#define ENABLE_MODULE_SERIAL_HARD
#define ENABLE_MODULE_DATETIME_NTP_V2
#define ENABLE_MODULE_FIREBASE_RTDB_V2
#define ENABLE_MODULE_FIREBASE_FIRESTORE_V2
#define ENABLE_MODULE_FIREBASE_MESSAGING_V2
#define ENABLE_MODULE_LCD_MENU

#define ENABLE_SENSOR_MODULE
#define ENABLE_SENSOR_MODULE_UTILITY
#define ENABLE_SENSOR_TCS3200
#define ENABLE_SENSOR_RFID
#define ENABLE_SENSOR_RTC
#define ENABLE_CALIBRATE_RTC 1
#if ENABLE_CALIBRATE_RTC
#define CALIBRATE_RTC RTC_DS3231Sens::ALL, DateTime(F(__DATE__), F(__TIME__))
#else
#define CALIBRATE_RTC
#endif

#include "Kinematrix.h"
#include "Preferences.h"
#include "WiFi.h"
#include "WiFiClientSecure.h"
#include "ESP32Servo.h"

////////// Utility //////////
const char *ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 7 * 3600;  // Offset for WIB (UTC+7)
const int daylightOffset_sec = 0;

DateTimeNTPV2 dateTimeNTP(ntpServer, gmtOffset_sec, daylightOffset_sec);
TaskHandle task;
Preferences preferences;
FirebaseV2RTDB firebase;
FirebaseV2Firestore firestore;
FirebaseV2Messaging messaging;
WiFiClientSecure client;

////////// Sensor //////////
SensorModule sensor;

////////// Communication //////////
HardSerial usbSerial;

////////// Input Module //////////
DigitalIn buttonOk(36);
DigitalIn buttonUp(39);
DigitalIn buttonDown(34);

////////// Output Module //////////
Servo servo;
LcdMenu menu(0x27, 16, 2);
DigitalOut buzzer(17);
DigitalOut ledRed(13);
DigitalOut ledGreen(12);
DigitalOut ledYellow(14);
DigitalOut relaySolenoid(33, true);

////////// Global Variable //////////
bool firebaseEnable = false;

enum FirebaseRTDBState {
  RTDB_IDLE,
  RTDB_SET_VALUE,
  RTDB_SET_VALUE_JSON,
  RTDB_SET_VALUE_PERIODIC,
  RTDB_GET_VALUE,
  RTDB_GET_VALUE_JSON,
  RTDB_GET_VALUE_PERIODIC,
};

enum FirebaseFirestoreState {
  FIRESTORE_IDE,
  FIRESTORE_CREATE,
  FIRESTORE_READ,
  FIRESTORE_UPDATE,
  FIRESTORE_DELETE,
};

enum FirebaseMessagingState {
  MESSAGING_IDLE,
  MESSAGING_SEND,
};

FirebaseRTDBState firebaseRTDBState = RTDB_IDLE;
FirebaseFirestoreState firebaseFirestoreState = FIRESTORE_IDE;
FirebaseMessagingState firebaseMessagingState = MESSAGING_IDLE;

bool isNTPClientInitialize = false;