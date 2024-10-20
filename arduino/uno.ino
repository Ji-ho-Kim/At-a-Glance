#include "HX711.h"

#define DOUT  3
#define CLK  2 

HX711 myScale;

float calibration_factor = 3000;

void setup() {
  Serial.begin(9600);

  myScale.begin(DOUT, CLK);
  myScale.set_scale();
  myScale.tare();	//Reset the scale to 0

  long zero_factor = myScale.read_average();
  Serial.println(zero_factor);
}

void loop() {
  myScale.set_scale(calibration_factor);

  Serial.print(myScale.get_units() * 100);
  Serial.println();
}

