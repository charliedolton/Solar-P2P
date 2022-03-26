import math
import time
import sys
import board
import digitalio
from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw
from adafruit_extended_bus import ExtendedI2C as I2C
import adafruit_ssd1306
import neopixel
import RPi.GPIO as GPIO
from encoder import Encoder


class UIElement:
    def __init__(self, username, color, font, display, pixels, pixelIndex):
        self.username = username
        self.color = color
        self.font = font

        self.display = display
        self.pixels = pixels
        self.pixelIndex = pixelIndex

        self.image = Image.new("1", (WIDTH, HEIGHT))
        self.draw = ImageDraw.Draw(self.image)

        # Start off with an empty screen
        self.display.fill(0)
        self.display.show()

    def show(self):
        self.display.fill(0)
        self.draw.text((0, 0), self.username, font=self.font, fill=255)
        self.display.image(self.image)
        self.display.show()

        self.pixels[self.pixelIndex] = self.color
        self.pixels.show()

    def selected(self, isSelected):
        if isSelected:
            color = (255, 0, 0)
        else:
            color = self.color
        self.pixels[self.pixelIndex] = color
        self.pixels.show()


# Alternatively load a TTF font.  Make sure the .ttf font file is in the same directory as this python script!
# Some nice fonts to try: http://www.dafont.com/bitmap.php
font = ImageFont.truetype("OpenSans-ExtraBoldItalic.ttf", 20)
# font = ImageFont.load_default()


pixel_pin = board.D18

# The number of NeoPixels
num_pixels = 8

# The order of the pixel colors - RGB or GRB. Some NeoPixels have red and green reversed!
# For RGBW NeoPixels, simply change the ORDER to RGBW or GRBW.
ORDER = neopixel.RGB

pixels = neopixel.NeoPixel(
    pixel_pin, num_pixels, brightness=0.2, auto_write=False, pixel_order=ORDER
)


# Raspberry Pi pin configuration:
oled_reset = digitalio.DigitalInOut(board.D4)

# Display Dimensions
WIDTH = 128
HEIGHT = 32  # Change to 64 if needed

usernames = [
    "Uncle Bob",
    "Talia",
    "Raymond",
    "Pradeep",
    "Karim",
    "Miguel",
    "Sofia",
    "Giuseppe",
]

colors = [
    (51, 255, 255),
    (0, 255, 0),
    (0, 0, 255),
    (0, 255, 255),
    (255, 0, 255),
    (255, 255, 0),
    (255, 255, 255),
    (128, 128, 128),
]

pixelMap = [3, 2, 1, 0, 4, 5, 6, 7]

uiElements = []
for i in range(8):
    i2c = I2C(11 + i)  # Displays start at index 11
    disp = adafruit_ssd1306.SSD1306_I2C(WIDTH, HEIGHT, i2c, addr=0x3C, reset=oled_reset)
    uiElements.append(
        UIElement(usernames[i], colors[i], font, disp, pixels, pixelMap[i])
    )

for element in uiElements:
    element.show()

curElement = 0


def valueChanged(value, direction):
    global curElement
    global uiElements
    uiElements[curElement].selected(False)
    if direction == "L":
        curElement -= 1
    else:
        curElement += 1
    if curElement < 0:
        curElement = 7
    elif curElement > 7:
        curElement = 0
    uiElements[curElement].selected(True)


GPIO.setmode(GPIO.BCM)

# e1 = Encoder(17, 27, valueChanged)    # Rev 1.2 Board
e1 = Encoder(10, 8, valueChanged)  # Rev 1.0 Board, SPI must be off!!


try:
    while True:
        time.sleep(5)
except Exception:
    pass

GPIO.cleanup()
