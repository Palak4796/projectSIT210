#include <ArduinoMqttClient.h>
#include <HCSR04.h> // Library for the ultrasonic sensor
#include <WiFi.h> // Change for ESP32
#include <EMailSender.h> // Include the email sender library

// Wi-Fi credentials
const char ssid[] = "vivo Y21";
const char pass[] = "palak1234";

// Email settings
#define SMTP_SERVER "smtp.gmail.com"
#define SMTP_PORT 587
#define SENDER_EMAIL "palakdankher@gmail.com"
#define SENDER_PASSWORD "ncop mibe bams vcmr" // Use an app password if using Gmail
#define SENDER_NAME "palak"
#define RECIPIENT_EMAIL "palak4796.be23@chitkara.edu.in"

// MQTT settings
const char mqttBroker[] = "broker.hivemq.com";
const int mqttPort = 1883;
const char mqttTopic[] = "SIT210/BIN2"; // Topic for sending distance to the Raspberry Pi

// Ultrasonic sensor pins
const int trigPin = 2;
const int echoPin = 4;
UltraSonicDistanceSensor distanceSensor(trigPin, echoPin); // Initialize the ultrasonic sensor

// Initialize Wi-Fi, MQTT clients, and email sender
WiFiClient wifiClient;
MqttClient mqttClient(wifiClient);
EMailSender emailSender(SENDER_EMAIL, SENDER_PASSWORD, SENDER_EMAIL, SENDER_NAME);

// Variables for timing
unsigned long lastPublishTime = 0;
const unsigned long publishInterval = 10000; // Publish every 1 minute (60000 ms)

// Threshold for bin full
const int binFullThreshold = 5; // Example threshold in cm
bool binFullActive = false;

void setup() {
  connectToWiFi();
  connectToMQTT();
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  mqttClient.poll();

  // Measure distance
  float distance = distanceSensor.measureDistanceCm();

  // Check if it's time to publish
  if (millis() - lastPublishTime >= publishInterval) {
    lastPublishTime = millis();
    publishDistance(distance);

    // Check for the bin full condition
    if (distance <= binFullThreshold && !binFullActive) {
      binFullActive = true;
      sendEmail("Bin Full Notification", "The bin is full. Please empty it.");
    } else if (distance <= binFullThreshold && binFullActive) {
      binFullActive = false;
    }
  }

  delay(200); // Delay to prevent spamming in the loop
}

// Function to connect to Wi-Fi
void connectToWiFi() {
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
  }
}

// Function to connect to the MQTT broker
void connectToMQTT() {
  while (!mqttClient.connect(mqttBroker, mqttPort)) {
    delay(5000);
  }
}

// Function to publish distance to MQTT
void publishDistance(float distance) {
  if (distance > 0) { // Check if the distance is valid
    String payload = "Distance: " + String(distance) + " cm";
    mqttClient.beginMessage(mqttTopic);
    mqttClient.print(payload);
    mqttClient.endMessage();
  }
}

// Function to send email
void sendEmail(const char* subject, const char* body) {
  EMailSender::EMailMessage message;
  message.subject = subject;
  message.message = body;

  emailSender.send(RECIPIENT_EMAIL, message);
}
