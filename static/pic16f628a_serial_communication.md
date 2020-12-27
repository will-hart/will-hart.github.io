---
title: PIC16F628A Serial Communication
tags:
  - tutorials
  - electronics
authorName: Will Hart
publishedDateString: 14 Jan 2012
---

Serial communication is used extensively in electronics projects, and many
microcontrollers come with some form of USART on board. I'm going to describe
here how I got PIC USART serial communication working with a PIC16F628A, and got
the PIC talking to an Arduino Uno. For this I'm using a PICKIT2, my own
PIC16F628A breakout board and MicroC compiler because it has a handy serial
library all built in. If you are using MPLAB or some other development tool, you
can find the locations of the relevant registers in the datasheets for `TXSTA` and
`RCSTA`.

## The Code

The code itself is very simple - most of the setup is done using two registers -
`TXSTA` and `RCSTA`. There are three main steps in setting up serial transmission on
the PIC16F628A:

1. Enable serial communication
2. Set up the communication mode
3. Set the baud rate

The best source of information is (of course) the datasheet, however... to
enable serial communication we set (i.e. make equal to 1) `TXSTA.TXEN` and
`RCSTA.SPEN`.

We then set to 8 bit mode (there is quite a bit of information in the datasheet
about 9 bit mode, but for this simple example probably not relevant) by clearing
`TXSTA.TX9` and `RCSTA.RX9` (i.e. making equal to 0). The 16F628A can run in
either synchronous or asynchronous serial modes, but here we set asynchronous by
clearing `TXSTA.SYNC`.

```c
void main() {

     // some standard PIC16F628A configuration
     TRISA = 0x00;   // output
     TRISB = 0xFF;   // input
     PORTA = 0x00;   // set PORTA to off
     CMCON = 0x07;   // turn off comparators by setting the last three bits to 111

     // Step 1, enable USART
     TXSTA.TXEN = 1; // transmission enabled
     RCSTA.SPEN = 1; // enable serial port

     // Step 2, Set 8 bit, asynchronous continuous mode
     TXSTA.TX9 = 0;  // 8 bit transmission
     RCSTA.RX9 = 0;  // 8 bit reception
     TXSTA.SYNC = 0; // asynchronous mode
     RCSTA.CREN = 1; // enable continuous receive mode

     // Step 3, Set the baud rate using the built in baud rate generator
     TXSTA.BRGH = 1; // set baud rate generator high
     SPBRG = 0b00011001; // set the baud rate to 9600kb, Asynchronous mode BTGH=1

     // initialise the library and wait for it to start
     UART1_Init(9600);
     Delay_ms(100);

     // ok, now some dummy code... (loop forever and ever and ever and ...)
     // just send some information every second
     do
     {
         UART1_Write_Text("Sending some text");
         Delay_ms(1000); // wait one second
     } while(1);
}
```

I then built a very basic Arduino sketch, from memory (and untested) something
along the lines of:

```c
void setup() {
        Serial.begin(9600);
}

void loop() {
        while(Serial.available() > 0) {
         Serial.write(Serial.read());
        }
}
```

## What happens?

Wire up the RX and TX ports from the PIC16F628A to the TX and RX ports of the
Arduino. Compile the sketch, program the PIC and then open up the Arduino serial
monitor. Every second or so you should see a message appear on the serial
monitor... `Sending some text`. There you go - your first serial communication!