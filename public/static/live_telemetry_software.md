---
title: Live Electric Vehicle Telemetry Software
summary: A brief discussion of the telemetry software I'm building for my University's electric Formula Student car
tags:
  - electronics
  - project
authorName: Will Hart
publishedDateString: 14 Jan 2012
---

As part of my course we can get involved in the Formula Student race team. At my
university this is quite a big deal with three distinct projects - a petrol car,
an electric car and a bespoke twin cylinder engine. I'm working mostly on the
electric car and volunteered myself to update our data logging / telemetry
software.

This allows us to record and replay the data in real time from our onboard
CANBus network. Luckily we had existing C++ based CANBus libraries for decoding
the information, and an array of sensors / telemetry hardware already on board.
The scope was therefore to build a student run version of something like Pi
Toolbox.

This is important for testing and troubleshooting of the motor and for safety
reasons - our drive is strapped next to some pretty mean batteries and we want
to know if they are getting hot!

This project is ongoing, and is based on a C# desktop application and SQLite
database. Currently we can log decoded CANBus messages and there are
"sparklines" showing all our sensor readings. I'm working on a simple graph
control after having had difficulty finding something lightweight and compatible
with WPF. As it gets more complete I'll throw up some screenshots!