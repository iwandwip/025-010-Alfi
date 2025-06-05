#include "Header.h"

void setup() {
  usbSerial.begin(&Serial, 115200);

  // preferences.begin(clientName.c_str(), false);
  // preferences.putULong("userIndex", 5);
  // preferences.end();

  preferences.begin(clientName.c_str(), false);
  registerUserIdIndex = preferences.getULong("userIndex", 0);
  preferences.end();

  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  servo.setPeriodHertz(50);
  servo.attach(26, 500, 2500);
  servo.write(90);

  task.initialize(wifiTask);
  menu.initialize(true);
  menu.setLen(16, 2);

  // sensor.addModule("rfid", new RFID_Mfrc522(5, 27));
  sensor.addModule("rtc", []() -> BaseSens* {
    while (!isNTPClientInitialize) {
      ledRed.toggle();
      delay(500);
    }
    DateTime timeNow(dateTimeNTP.getISO8601Time().c_str());
    return new RTC_DS3231Sens(RTC_DS3231Sens::ALL, timeNow);
  });
  ledRed.on();
  sensor.addModule("tcs", new TCS3200Sens(4, 2, 16));
  sensor.init();
  // ledGreen.toggleInit(100, 5);
  // ledGreen.on();
}

void loop() {
  sensor.update([]() {
    // String uuid = sensor["rfid"].as<String>();
    // if (!uuid.isEmpty()) {
    //   sensor.debug();
    // }
    // sensor.debug();
  });

  usbSerial.receive(usbCommunicationTask);

  MenuCursor cursor{
    .up = buttonUp.isPressed() || !buttonUpStr.isEmpty(),
    .down = buttonDown.isPressed() || !buttonDownStr.isEmpty(),
    .select = buttonOk.isPressed() || !buttonOkStr.isEmpty(),
    .back = false,
    .show = true
  };
  menu.onListen(&cursor, lcdMenuCallback);

  buttonUpStr = "";
  buttonDownStr = "";
  buttonOkStr = "";

  ledRed.toggleAsync(100);

  DigitalIn::updateAll(&buttonOk, &buttonUp, &buttonDown, DigitalIn::stop());
  DigitalOut::updateAll(&ledRed, &ledGreen, &ledYellow, &buzzer, &relaySolenoid, DigitalOut::stop());
}
