#include <Arduino.h>
#include <CatGFX.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <base64.hpp>
#include "creds.h"

// #define DEBUG
#define BLACK 0
#define WHITE 1
#define INVERSE 2

const unsigned int qr_width = 128;
const unsigned int qr_height = 128;

// Buffer which can hold 400 lines
byte buffer[48 * 400] = {0};

uint8_t bitmap_qr[128*128];

// Create a printer supporting those 400 lines
WebServer server(80);

void handle_print() {
    JsonDocument json_doc;
    CatPrinter cat(400);
    // DynamicJsonDocument json_doc(32768);
    Serial.println("entering printing stage");
    if (!server.hasArg("plain")) {
        Serial.println("no data given?");
        server.send(400);
        return;
    }

    String body = server.arg("plain");
    // Serial.println(body);
    deserializeJson(json_doc, body);
    Serial.println("deserialized");

    // connect to cat printer and print body
    // Hand buffer to printer
    cat.begin(buffer, sizeof(buffer));
    Serial.println("cat began");

    // Set the name of the printer to be searched
    // cat.printNameArray();
    // cat.resetNameArray();
    // cat.addNameArray((char *)"MX09");
    // cat.addNameArray((char *)"PD01");
    BLEAddress addr("D1:01:04:13:F2:FF");

    // Every non-zero color is white
    cat.fillScreen(1);

    const char *char_qr = json_doc["qr"];
    Serial.println("starting decoding");
    Serial.println(char_qr);
    size_t enc_qr_len = strlen(char_qr);
    Serial.println(enc_qr_len);
    decode_base64((uint8_t *)char_qr, enc_qr_len, bitmap_qr);
    Serial.println("ended decoding");
    cat.drawBitmap(0, 0, bitmap_qr, qr_width, qr_height, BLACK);
    Serial.println("gave shit to draw");

    if (cat.connect(addr)) {
        Serial.print("Connected! Printing...");

        // Print it!
        cat.printBuffer();
        // Feed enough paper to show the whole print
        // cat.feed(100);
        cat.feed(70);

        Serial.println("Disconnecting");
        cat.disconnect();
        Serial.println("Done!");
    } else {
        Serial.println("Could not find printer!");
    }
    server.send(200, "application/json", "{}");
}

void hello() {
    Serial.println("got into health check");
    server.send(200, "text/plain", "hello");
}

void setup_routing() {
    server.on("/print", HTTP_POST, handle_print);
    server.on("/health", hello);
    server.begin();
}

void setup() {
    Serial.begin(115200);
    Serial.println();


    // connect to wifi
    WiFi.mode(WIFI_STA);
    WiFi.begin(SSID, PASSWD);
    Serial.println("connecting to wifi");
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(100);
    }
    Serial.println("\n connected to wifi");
    Serial.print("Local ip: ");
    Serial.println(WiFi.localIP());

    setup_routing();
}

void loop() {
    server.handleClient();
}
