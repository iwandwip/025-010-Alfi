
// Network
#define ENABLE_USER_AUTH
#define ENABLE_DATABASE

#include <FirebaseClient.h>
#include "ExampleFunctions.h" // Provides the functions used in the examples.
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <ESP32Servo.h>


#define API_KEY "AIzaSyBWQQhy75qFEL6fmyMBALue5fgT5NoikpQ"
#define DATABASE_URL "https://faiz-7b153-default-rtdb.firebaseio.com/"
#define USER_EMAIL "admin@gmail.com"
#define USER_PASSWORD "admin123"
#define WIFI_SSID "TIMEOSPACE"
#define WIFI_PASSWORD "1234Saja"
#define FIREBASE_PROJECT_ID "faiz-7b153"


void processData(AsyncResult &aResult);
void set_async();

SSL_CLIENT ssl_client;

using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client);

UserAuth user_auth(API_KEY, USER_EMAIL, USER_PASSWORD, 3000 /* expire period in seconds (<3600) */);
FirebaseApp app;
RealtimeDatabase Database;

AsyncResult databaseResult;


// NTPClient setup
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 25200); // GMT+7 for Indonesia

bool taskComplete = false;



//RFID 

// admin = d3a6d629
// user1 = 5751b07b
// user2 = 9b386bf1

// dataset 
/*
2000 55 200 55
2000 58 200 55
2000 55 200 58
2000 58 200 58
2000 50 166 50

5000 71 200 71
5000 66 200 66
5000 71 200 66
5000 66 200 71
5000 76 250 76
5000 83 250 83




*/

// rfid

#include <MFRC522v2.h>
#include <MFRC522DriverSPI.h>
#include <MFRC522DriverPinSimple.h>
#include <MFRC522Debug.h>

MFRC522DriverPinSimple ss_pin(5);

MFRC522DriverSPI driver{ss_pin}; // Create SPI driver
MFRC522 mfrc522{driver};         // Create MFRC522 instance


// sensor color 

#include <tcs3200.h>    // Include TCS3200 library 

#define num_of_colors 5   // Declares the number of colors the program can recognise (number of calibrated colors)

// distinctRGB[] array declares calibration values for each declared color in distinctColors[] array
int distinctRGB[num_of_colors][3] = {{62, 200, 200}, {76, 250, 250}, {80 , 200 , 200}, {55, 200, 200} , {27 , 71 ,71}};
// distinctColors[] array declares values to be returned from closestColor() function if specified color is recognised
String distinctColors[num_of_colors] = {"2K", "5K", "10K", "20K" , "KOSONG"};

int red, green, blue;

#define S2 4 /*Define S2 Pin Number of ESP32*/
#define S3 2 /*Define S3 Pin Number of ESP32*/
#define sensorOut 16 /*Define Sensor Output Pin Number of ESP32*/

tcs3200 tcs(S2, S2, S2, S3, sensorOut); // (S0, S1, S2, S3, output pin) //  ---  see:  https://www.mouser.com/catalog/specsheets/TCS3200-E11.pdf


// actuator 

#define servoPin 26
Servo servo;