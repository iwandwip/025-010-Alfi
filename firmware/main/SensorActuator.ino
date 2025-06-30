void setupServo(){
  servo.attach(servoPin);
  stop();
}

void tarik(){
  servo.write(150); 

}

void stop(){
  servo.write(90); 
}





String readCard() {
	// Reset the loop if no new card present on the sensor/reader. This saves the entire process when idle.
	if (!mfrc522.PICC_IsNewCardPresent()) {
		return "-1";
	}
	if (!mfrc522.PICC_ReadCardSerial()) {
		return "-1";
	}
  String uidString = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) {
      uidString += "0"; 
    }
    uidString += String(mfrc522.uid.uidByte[i], HEX);
  }
  return(uidString);
}
// RFID
void setupRFID() {

  mfrc522.PCD_Init();    // Init MFRC522 board.
  MFRC522Debug::PCD_DumpVersionToSerial(mfrc522, Serial);	// Show details of PCD - MFRC522 Card Reader details.
	Serial.println(F("Scan PICC to see UID"));
}

void readColor() {
  Serial.println(tcs.closestColor(distinctRGB, distinctColors, num_of_colors) );

  red = tcs.colorRead('r');   //reads color value for red
  // Serial.print("R= ");
  // Serial.print(red);
  // Serial.print("    ");
  
  green = tcs.colorRead('g');   //reads color value for green
  // Serial.print("G= ");
  // Serial.print(green);
  // Serial.print("    ");

  blue = tcs.colorRead('b');    //reads color value for blue
  // Serial.print("B= ");
  // Serial.print(blue);
  // Serial.print("    ");

  // Serial.println();

  vTaskDelay(200);
}
