void TaskDatabase(void *pvParameters) {
  // setupNetwork();
  // setupDatabase();
  while (true) {
    // updateData();
    vTaskDelay(100 / portTICK_PERIOD_MS);  // Delay dalam ms (misalnya 100ms)
  }
}

String input;
void TaskControl(void *pvParameters) {
  setupServo();
  while (true) {
    if (Serial.available() >= 0) {
      if (Serial.read() == 'r') ESP.restart();
      input = Serial.readStringUntil('\n');
      Serial.println(input);
    }
    if (input == "t") tarik();
    else if (input == "s")stop();
  }
}


void TaskSensor(void *pvParameters) {
  setupRFID();
  while (true) {
    Serial.println(readCard());
    // readColor();
  }
}


TaskHandle_t DatabaseHandle;
TaskHandle_t ControlHandle;
TaskHandle_t SensorHandle;

// Fungsi setup RTOS
void setupRTOS() {
  // Membuat task untuk Database Firebase di Core 0
  xTaskCreatePinnedToCore(
    TaskDatabase,     // Nama fungsi task
    "TaskDatabase",   // Nama task
    10000,            // Ukuran stack (10KB)
    NULL,             // Parameter untuk task (NULL jika tidak ada)
    1,                // Prioritas task (1 adalah prioritas rendah)
    &DatabaseHandle,  // Handle untuk task
    0                 // Core 0
  );

  // Membuat task untuk Control Pin di Core 1
  xTaskCreatePinnedToCore(
    TaskControl,     // Nama fungsi task
    "TaskControl",   // Nama task
    10000,           // Ukuran stack (10KB) untuk kontrol pin
    NULL,            // Parameter untuk task (NULL jika tidak ada)
    1,               // Prioritas task (2 adalah prioritas menengah)
    &ControlHandle,  // Handle untuk task
    1                // Core 1
  );
  
   xTaskCreatePinnedToCore(
    TaskSensor,     // Nama fungsi task
    "TaskSensor",   // Nama task
    10000,           // Ukuran stack (10KB) untuk kontrol pin
    NULL,            // Parameter untuk task (NULL jika tidak ada)
    1,               // Prioritas task (2 adalah prioritas menengah)
    &SensorHandle,  // Handle untuk task
    1                // Core 1
  );



  Serial.println("Setup RTOS Finish !!");
}