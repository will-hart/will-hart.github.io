---
title: PIC16F628A TMR0 Interrupts
summary: A quick tutorial on how to use interrupts on a PIC16F628A microcontroller
tags:
  - tutorials
  - electronics
authorName: Will Hart
publishedDateString: 15 Jan 2012
---

PIC TMR0 Interrupts, (or any PIC interrupts!) can be very confusing to setup,
but the rewards are well worthwhile! They allow you to have something happen
after a certain period of time, or for some interrupt types, something happens
when a button is pushed or a sensor reads a certain value. This means that the
microcontroller can automatically respond to user input. This article shows how
to set up a PIC16F628 TMR0 Interrupt, using MikroC.

## What on earth are interrupts?

An interrupt is basically what it sounds like. It is a piece of code that
interrupts the main program and is executed when asked. Once the interrupt code
is executed, the normal program flow resumes. PIC Interrupts can be based on
PORT values (e.g. if PORTB is high) or on a "timer overflow".

On the PIC16F628A (and most PICs), a register is set aside to act as a counter.
This basically counts upwards as the microcontroller clock "ticks". Counters are
commonly "8 bits", meaning they can count from 0 to 255. When the counter tries
to go past 255, it "overflows" and goes back to 0. If the correct settings are
made in the registers, this triggers the PIC TMR0 Interrupt code to run.

## Why would I use interrupts?

One way to get the same functionality as an interrupt is to put in some sort of
check in your main loop. Say you want to execute some code when a button is
pressed, in your program loop you could have something similar to the following:

```c
do {
 if (BUTTON == 1)
    {
     execute your "interrupt code"
    }
} while(1);
```

This code looks fairly simple, but what if you have five buttons, or want
something to be checked on a regular basis (say every second). Or what if your
main loop has some extremely intensive calculations going on which means that
your test of whether the button is pushed or not may only happen every 20
seconds or so? Not a very good user experience!

An interrupt basically allows you to offload this functionality from the program
loop and let the micro hardware work out when the button is pushed or a second
has elapsed. This article focuses on PIC TMR0 interrupts, so if you are
interested in the PORT interrupts, then have a look at the datasheet!

## The Code

I have broken out the interrupt configuration separately in the code below and
the comments should be fairly self explanatory. Basically we tell the micro what
source to use for its timer interrupts, "scale" the timer and then turn on
interrupts.

The `OPTION_REG.T0CS` bit sets our source for the `TIMER0` clock. In this case I
am using the PIC16F628A internal clock and hence I clear (set to 0) this bit.

Recall that most TMR0 registers are 8-bit and can only count up to 255. We can
count the number of overflows in our interrupt code to get a certain time
period, or if we are really clever us the inbuilt prescaler to only call the
interrupt after a certain number of loops. If we set the prescaler to 1:64, like
we have below this means that we are only calling the interrupt every 64 times
that the TMR0 register overflows. The last 3 bits of `OPTION_REG` on the 628A
control the prescalar, and `OPTION_REG.PSA` sets what the prescaler is applied
to. We clear `OPTION_REG.PSA` to turn the prescaler on for TMR0 and set the last
three bits to 1 to set a 1:64 ratio. This can be done in one line with the
following:

```c
OPTION_REG |= 0x07
```

Finally we set `INTCON.GIE` and `INTCON.T0IE` to enable interrupts globally, and
`TMR0` in particular.

```c
void setup_interrupts()
{
    // clear the TMR0 register
    TMR0 = 0;

    // set up interrupt registers
    OPTION_REG.T0CS = 0;  // clock source is internal instruction clock
    OPTION_REG.PSA = 0;   // prescaler assigned to TMR0
    OPTION_REG |= 0x07;   // set the prescaler to 1:64 scale using an or
    INTCON.GIE = 1;       // enable global interrupts
    INTCON.T0IE = 1;      // enable TMR0 interrupt
}
```

The main loop is pretty basic - it sets some standard PIC16F628A configurations,
calls the `setup_interrupts()` function declared above and then loops forever.

```c
void main() {
     // some standard PIC16F628A configuration
     TRISA = 0x00;   // output
     TRISB = 0x07;   // input
     PORTA = 0x01;   // set PORTA to off
     CMCON = 0x07;   // turn off comparators

     // setup interrupts
     setup_interrupts();

     // loop forever and ever and ever and ...
     while(1);
}
```

If we turn the interrupts on, we also need to define an interrupt function. This
is saved at the "interrupt vector" which is basically the location in memory
where the micro goes when an interrupt is called. This is done with the line
void `ISR() iv 0x0004` below. This declares an interrupt service routine (ISR)
that is located at interrupt vector `0x0004` in memory. From there its a
standard function!

Note that its considered poor practice to call functions from within your
interrupt, and if you do want a specific function called its best to set a flag
in your interrupt function and process this somewhere in your main loop. The
interrupt function below basically flips PORTA. This can be used to blink an
LED, sound a buzzer or whatever... Once your interrupt routine has run you need
to restart the timer interrupts. This can be done by clearing `INTCON.TMR0IF`.

```c
// the interrupt vector
void ISR() iv 0x0004
{
    if(INTCON.TMR0IF &amp;&amp; INTCON.T0IE)
    {
        PORTA = ~PORTA;
        INTCON.TMR0IF = 0; // unset the interrupt flag for TMR0
    }
}
```

## A note on "clocks"

One of the things I found most confusing when learning about PIC timers was the
concept of clocks, oscillators, resonators, etc. Why did some micros need an
external crystal oscillator, whilst others didn't? What was the benefit of
having an external crystal, and what was the difference between a clock and a
crystal?

To cut to the chase, most micros will need some sort of external timing source
to function at all, and those that have this timing source built in are
frequently not very accurate. The best way to find out whether a timing source
is needed is to read the datasheet, but as an example the PIC16F628A has an
internal crystal but the PIC16F877A does not.
