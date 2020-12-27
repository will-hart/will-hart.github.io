---
title: Moving away from Arduino
summary: A quick checklist of things to know when considering moving from Arduino to a lower level microcontroller
tags:
  - electronics
authorName: Will Hart
publishedDateString: 24 Feb 2012
---


Arduinos are great for getting started, they're easy to use, relatively cheap
and you can find a tonne of information, ideas and support online. For most
people, however, there comes a time when they feel they have outgrown the
Arduino's capabilities, or want something a bit more flexible, or they just want
to build their own circuits from scratch. Moving away from an Arduino into the
big bad world of "proper" micros can be a bit daunting, so I've collected a kind
of (work in progress) top ten list of the things you need to consider when
moving away from the Arduino.

## What brand of microcontroller?

### The Confusing Bit

Any search online about "which microcontroller should I start with" will give
you about a thousand different chips brands, chip types and about twice as many
differing opinions. Where on earth do you start?

### The Skinny

It doesn't matter - just pick one that looks appealing to you and get on with it!

### Thats it?

Kind of... you can narrow down your search a bit. The most popular micros are
Atmel's or PICs. There are other brands (i.e. TI make some pretty cheap "dev
boards") but these are the ones where you will find the most online support and
experience. The Arduino has an Atmel chip inside it, so many people start there,
but I personally chose PIC to start with because ... well, I don't really
remember to be honest!

### Anything else to read?

[Lady Ada Smackdown](http://www.ladyada.net/library/picvsavr.html) (PIC vs AVR)    
Hmmm... just use google I guess.

## Which microcontroller?

### The Confusing Bit

OK, you've chosen which brand of microcontroller you would like to use, now to
choose which particular chip! So you visit the manufacturers home page and
there's a hundred thousand different parts! Where do you start?

### The Skinny

Again, it almost doesn't matter - just pick one that looks appealing to you and
get on with it!

### Thats it?

Again, kind of... there are certainly some chips that are better than others. If
you've chosen Atmel then its probably worth having a look at the ATmega328 which
is inside the Arduino Uno. If you are looking at a PIC, then something like the
PIC16F628A is a great starting point as it has an internal oscillator (see below
for what that means!) making it dead easy to hook up.

If you know a bit more about what you are doing, then there are online part
selectors which let you put in some parameters and it lists the chips that
match. See the links below.

Another viable option is to check out your favourite electronics store and find
out what they have in stock. Check out the features of the chip online and if
you are happy, just buy it!

### Anything else to read?

[ATmega328 web page](http://www.atmel.com/devices/ATMEGA328.aspx)    
[PIC16F628A web page](http://www.microchip.com/wwwproducts/Devices.aspx?dDocName=en010210)    
[Microchip Product Selector](http://www.microchip.com/productselector/MCUProductSelector.html)

## Eeeek, your datasheet is huge!

### The Confusing Bit

You've chosen your chip, put your hard earned down and its arrived in the mail.
Time to jump online and work out to use the silly thing! You browse to the
product home page and click on the "datasheet" link. Up pops a 300 page document
written by a electrical engineer with a PhD in confusing the lights out of you.
What the hell, was that really necessary?

### The Skinny

The short answer is yes... (almost) everything you will ever need is in this
document. Read it, print it out, sleep with it under your pillow and you'll be
fine.

### Thats it?

Not really. In reality, there are only a few things that are really important in
a datasheet - you really need to know

- what registers (see below) the device has and what the different bits do
- how to configure the device
- what features to turn on or off
- what to connect to which pins
- how much power to put into the device

Thats all well and good, but where do you find these mysterious things. Well,
er... glad you asked. The best way to find these things is to ... (drum roll)
read the datasheet!

### Anything else to read?
[ATmega328 web page](http://www.atmel.com/devices/ATMEGA328.aspx)    
[PIC16F628A web page](http://www.microchip.com/wwwproducts/Devices.aspx?dDocName=en010210)

## Do I need a development board?

### The Confusing Bit

Egad, there are more options! I'm ready to go, should I get a development board,
with buttons, LCDs etc, or should I just use a breadboard?

### The Skinny

No, it is not compulsory to have a dev board.

### Thats it?

Well this one is really up to you. The cheapest and most flexible way is to buy
the individual components from someone like mouser, digikey or farnell and
breadboard a circuit. If you build on a breadboard (or even your own custom PCB)
there is the added advantage of being able to learn more about the hardware at
the same time. You can always use google to find sample circuits (or open source
dev boards) and build those yourself.

Its quite a bit more expensive, but possible simpler and faster to buy a
prebuilt development board from someone like Olimex, Mikro Elektroinica, ebay,
etc. You can select a board with the features you want to learn and the hardware
part is all built for you. Many people would say that you aren't getting the
full learning experience by doing this and I would tend to agree!

### Anything else to read?

Google is your friend

## Do I need to make my own PCB?

### The Confusing Bit

With the Arduino I only have to plug things in to the pin headers, or into a
shield. With another microcontroller, do I have to make my own PCB?

### The Skinny

No, it is not really compulsory to have your own PCB made.

### Thats it?

This is a similar answer to the previous question, and it depends on your
application. If you use through-hole components, then you will be able to use a
breadboard to build a working circuit. If you want something more permanent,
then veroboard or perfboard is a good option.

Of course, I like nothing more than to have a custom made PCB fitting perfectly
into the enclosure I designed for it. Here you can either make your own (plenty
of tutorials about that on the internet - I use acetate sheets, a laminator for
toner transfer and ammonium persulphate but there are tonnes of other/better
methods around) or get someone like Seeedstudio, iTead Studio, pcb cart etc to
make you a couple of prototypes.

### Anything else to read?

Google is your friend
