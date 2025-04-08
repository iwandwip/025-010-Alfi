#define ENABLE_MODULE_DIGITAL_INPUT
#define ENABLE_MODULE_DIGITAL_OUTPUT
#define ENABLE_MODULE_TASK_HANDLER
#define ENABLE_MODULE_TIMER_DURATION
#define ENABLE_MODULE_TIMER_TASK
#define ENABLE_MODULE_SERIAL_HARD
#define ENABLE_MODULE_DATETIME_NTP_V2
#define ENABLE_MODULE_LCD_MENU
#define ENABLE_MODULE_KNN

#define ENABLE_MODULE_FIREBASE_APPLICATION_V3
#define ENABLE_MODULE_FIREBASE_RTDB_V3
#define ENABLE_MODULE_FIREBASE_FIRESTORE_V3
#define ENABLE_MODULE_FIREBASE_MESSAGING_V3

#define ENABLE_SENSOR_MODULE
#define ENABLE_SENSOR_MODULE_UTILITY
#define ENABLE_SENSOR_TCS3200
#define ENABLE_SENSOR_RFID
#define ENABLE_SENSOR_RTC

#include "Kinematrix.h"
#include "Preferences.h"
#include "WiFi.h"
#include "WiFiClientSecure.h"
#include "ESP32Servo.h"
#include "SPI.h"
#include "HTTPClient.h"

////////// Utility //////////
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 7 * 3600;  // Offset for WIB (UTC+7)
const int daylightOffset_sec = 0;

DateTimeNTPV2 dateTimeNTP(ntpServer, gmtOffset_sec, daylightOffset_sec);
TaskHandle task;
Preferences preferences;
FirebaseV3RTDB* firebase = nullptr;
FirebaseV3Firestore* firestore = nullptr;
FirebaseV3Messaging* messaging = nullptr;
WiFiClientSecure client;

KNN currencyKNN(5, 3, 30);

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
DigitalOut ledGreen(14);
DigitalOut ledYellow(12);
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
String clientName = "haikal";

String buttonUpStr = "";
String buttonDownStr = "";
String buttonOkStr = "";

String uuidRFID = "";

String registerEmail = "";
String registerPassword = "";
String registerName = "";
String registerPhone = "";
String registerRFID = "";

unsigned long registerUserIdIndex = 0;

int checkRFIDMasterState = 0;
int isRFIDMasterValid = 0;

int checkRFIDUserState = 0;
int isRFIDUserValid = 0;

int registerRFIDState = 0;
int isRegisterRFIDValid = 0;

int paymentRFIDState = 0;
int isPaymentRFIDValid = 0;