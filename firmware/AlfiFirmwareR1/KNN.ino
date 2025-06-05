void setupKNN() {
  addTrainingData("2000", 120, 120, 120);
  addTrainingData("2000", 110, 110, 115);
  addTrainingData("2000", 130, 125, 125);
  addTrainingData("2000", 115, 115, 110);
  addTrainingData("2000", 125, 120, 130);
  addTrainingData("2000", 105, 110, 105);
  addTrainingData("2000", 115, 105, 115);
  addTrainingData("2000", 130, 130, 125);

  addTrainingData("5000", 200, 120, 50);
  addTrainingData("5000", 210, 130, 60);
  addTrainingData("5000", 190, 110, 40);
  addTrainingData("5000", 205, 125, 55);
  addTrainingData("5000", 195, 115, 45);
  addTrainingData("5000", 215, 135, 65);
  addTrainingData("5000", 185, 105, 35);
  addTrainingData("5000", 205, 130, 60);

  addTrainingData("10000", 140, 80, 180);
  addTrainingData("10000", 150, 90, 190);
  addTrainingData("10000", 130, 70, 170);
  addTrainingData("10000", 145, 85, 185);
  addTrainingData("10000", 135, 75, 175);
  addTrainingData("10000", 155, 95, 195);
  addTrainingData("10000", 125, 65, 165);
  addTrainingData("10000", 145, 90, 180);
}

void addTrainingData(const char* label, int r, int g, int b) {
  float features[] = { (float)r, (float)g, (float)b };
  currencyKNN.addTrainingData(label, features);
}

String predictKNN(int r, int g, int b) {
  float features[] = { (float)r, (float)g, (float)b };
  const char* knnPrediction = currencyKNN.predict(features);
  return String(knnPrediction);
}