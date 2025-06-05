void usbCommunicationTask(const String& dataRecv) {
  String data = dataRecv;
  String dataHeader = usbSerial.getStrData(dataRecv, 0, "#");
  String dataValue = usbSerial.getStrData(dataRecv, 1, "#");

  Serial.print("| dataRecv: ");
  Serial.print(dataRecv);
  Serial.println();

  if (isDigit(data[0]) || isDigit(data[1])) {
    // nums
  } else {
    dataHeader.toUpperCase();
    if (dataHeader == "R") ESP.restart();

    if (dataHeader == "W") buttonUpStr = "W";
    if (dataHeader == "S") buttonDownStr = "S";
    if (dataHeader == "D") buttonOkStr = "D";

    if (dataHeader == "RFID_MASTER") {  // RFID_MASTER#111
      uuidRFID = dataValue;
      Serial.print("| RFID_MASTER: ");
      Serial.print("| uuidRFID: ");
      Serial.print(uuidRFID);
      Serial.println();
    }
    if (dataHeader == "RFID_REGISTER") {  // RFID_REGISTER
      Serial.print("| RFID_REGISTER: ");
      Serial.print("| uuidRFID: ");
      Serial.print(uuidRFID);
      Serial.println();
      uuidRFID = generateRandomUID(14);
    }
    if (dataHeader == "RFID_USER") {  // RFID_USER#04a2bc1f294e80
      Serial.print("| RFID_USER: ");
      Serial.print("| uuidRFID: ");
      Serial.print(uuidRFID);
      Serial.println();
      uuidRFID = dataValue;
    }

    if (dataHeader == "SET_USER_INDEX") {  // SET_USER_INDEX#5
      int setUserIndex = dataValue.toInt();
      Serial.print("| setUserIndex: ");
      Serial.print(setUserIndex);
      Serial.println();
      registerUserIdIndex = setUserIndex;

      preferences.begin(clientName.c_str(), false);
      preferences.putULong("userIndex", registerUserIdIndex);
      preferences.end();
    }

    // Firebase RTDB
    if (dataHeader == "RTDB_SET_VALUE") firebaseRTDBState = RTDB_SET_VALUE;
    if (dataHeader == "RTDB_SET_VALUE_JSON") firebaseRTDBState = RTDB_SET_VALUE_JSON;
    if (dataHeader == "RTDB_SET_VALUE_PERIODIC") firebaseRTDBState = RTDB_SET_VALUE_PERIODIC;
    if (dataHeader == "RTDB_GET_VALUE") firebaseRTDBState = RTDB_GET_VALUE;
    if (dataHeader == "RTDB_GET_VALUE_JSON") firebaseRTDBState = RTDB_GET_VALUE_JSON;
    if (dataHeader == "RTDB_GET_VALUE_PERIODIC") firebaseRTDBState = RTDB_GET_VALUE_PERIODIC;

    // Firebase Firestore
    if (dataHeader == "FIRESTORE_CREATE") firebaseFirestoreState = FIRESTORE_CREATE;
    if (dataHeader == "FIRESTORE_READ") firebaseFirestoreState = FIRESTORE_READ;
    if (dataHeader == "FIRESTORE_UPDATE") firebaseFirestoreState = FIRESTORE_UPDATE;
    if (dataHeader == "FIRESTORE_DELETE") firebaseFirestoreState = FIRESTORE_DELETE;

    // Firebase Mesagging
    if (dataHeader == "MESSAGING_SEND") firebaseMessagingState = MESSAGING_SEND;
  }
}