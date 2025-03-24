#include "Header.h"

void setup() {
  usbSerial.begin(&Serial, 115200);
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

  sensor.addModule("rfid", new RFID_Mfrc522(5, 27));
  sensor.addModule("rtc", []() -> BaseSens* {
    while (!isNTPClientInitialize) {
      ledRed.toggle();
      delay(500);
    }
    DateTime timeNow(dateTimeNTP.getISO8601Time().c_str());
    // DateTime timeNow(dateTimeNTP.getDateString().c_str(), dateTimeNTP.getTimeString().c_str());
    // DateTime timeNow(dateTimeNTP.unixtime());
    return new RTC_DS3231Sens(RTC_DS3231Sens::ALL, timeNow);
  });
  sensor.addModule("tcs", new TCS3200Sens(4, 2, 16));
  sensor.init();
  buzzer.toggleInit(100, 5);
}

void loop() {
  sensor.update([]() {
    String uuid = sensor["rfid"].as<String>();
    if (!uuid.isEmpty()) {
      sensor.debug();
    }
  });

  usbSerial.receive(usbCommunicationTask);

  MenuCursor cursor{
    .up = buttonUp.isPressed(),
    .down = buttonDown.isPressed(),
    .select = buttonOk.isPressed(),
    .back = false,
    .show = true
  };
  menu.onListen(&cursor, lcdMenuCallback);

  DigitalIn::updateAll(&buttonOk, &buttonUp, &buttonDown, DigitalIn::stop());
  DigitalOut::updateAll(&ledRed, &ledGreen, &ledYellow, &buzzer, &relaySolenoid, DigitalOut::stop());
}
