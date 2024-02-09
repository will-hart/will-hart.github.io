+++
title = "Embedded rust - comparing RTIC and embassy"
description = "Looking at the pros and cons of different approaches for running rust on STM32 microcontrollers"

[taxonomies]
tag = ["code", "electronics"]
+++

## Writing custom input devices in rust

Now that the price of ICs has returned to the realms of affordability, I've been
playing around with a few programmable input devices powered by STM32. For
instance I made some sorta [programmable
pedals](/post/2022-02-08_custom-gaming-foot-pedals)
([code](https://github.com/will-hart/pedalrs)) which were a lot of fun and more
recently I've been playing around with a macro-style keyboard called
[switchy](https://github.com/will-hart/switchy) which has support for 24
switches, 4 rotary encoders with buttons, and two joysticks with buttons.

Before 2023 work life balance got tipped strongly in favour of work (has it
really been almost a year and a half since my last post?) I had converted the
firmware to use something called [`RTIC`](https://rtic.rs) which, according to
their website, is a "The hardware accelerated Rust RTOS", where RTOS is a
real-time operating system.

The summary of what the RTOS provides is that instead of writing your code in a
big loop, e.g.

```rust
// pseudo-rust code, obvs
fn main() {
  loop {
    read_adcs();

    if time() > time_to_next_blink_led {
      toggle_led();
      time_to_next_blink_led = time() + 1000;
    }
  }
}
```

You structure the code into "tasks", which are scheduled and executed at the
appropriate time by the RTOS. The RTOS bit means that there is a scheduler that
determines when the tasks can run. Tasks can be triggered by interrupts, a
timer, or called as a "one-shot" task. A totally made up non-compiling toy
example might be:

```rust
async fn main() {
  let task1 = spawn(adc_task);
  let task2 = spawn(blink_task);
  join!([task1, task2]).await;
}

async fn adc_task() -> ! {
  loop {
    let value = adc.sample();
    serial.send("{value}");
    wait_millis(1000);
  }
}

async fn blink_task() -> ! {
  loop {
    led.toggle();
    wait_millis(1000);
  }
}
```

This toy example requires a bit more code, but it also clearly separates our
concerns. We use `main` to set up the logic, then there are two separate tasks
that each do different things. Given that the microcontroller is a resource
constrained environment, there is a fair bit of magic in the `spawn`ing and
execution of tasks.

There are two main libraries (that I'm aware of) that provide the infrastructure
to do this: [`rtic-rs`](https://rtic.rs) and [`embassy`](https://embassy.dev).
Each of these rely on hardware abstraction layers (HALs) that allow *almost* the
same code to be run on different MCUs. The [RTIC
documentation](https://rtic.rs/2/book/en/rtic_and_embassy.html) has an
interesting comparison of the aims of the RTIC project, compared to embassy:

> Embassy provides both Hardware Abstraction Layers (HALs), and an
> executor/runtime, while RTIC aims to only provide an execution framework. [In
> RTIC] the user is responsible for providing a PAC (peripheral access crate)
> and HAL implementation.

In other words, RTIC aims to be a lot lower level while embassy seems to be
taking a "batteries included" approach. In this post I want to go over my
experience using these two libraries to write the `switchy` firmware, and
outline what I love (and love slightly less) about these libraries. I decided to
write down my notes on using `embassy` after returning to `switchy` after a 10
month delay.

Both embassy and RTIC are amazing software projects, and I'm very excited to
have two solid options like these for writing rust code for embedded targets.
I've seen a few fairly complex bits of firmware written using the STM32 C++ HALs
and *hoo boy* does the rust code look nicer (to me at least).

So in short, these are my opinions and first impressions only, and probably
reflect as much on my own capacity to write embedded rust code as the libraries
themselves, so take everything I say here with a couple of hundred grains of
salt. My impressions are also relatively "high level", I'm not writing
performance critical or safety critical code so consider this a "hobbyist"
assessment of the two frameworks, likely riddled with errors.

## Getting started

Both projects have pretty good getting started guides, although RTIC requires a
bit of digging. The first thing on their home page is a discussion of whether
RTIC is an RTOS while embassy's home page emphasises *what* embassy is and shows
a minimal code example, which IMO is a better approach.

Either way, it only takes a little bit of scrolling or one or two clicks to find
a template. The [RTIC template](https://github.com/rtic-rs/defmt-app-template)
has a great README, while the embassy documentation points you to some examples
before moving on to a great walkthrough of [starting a new
project](https://embassy.dev/book/dev/new_project.html).

Both frameworks have a similar amount of mucking about getting targets, build
configurations and debugging set up. Sometimes the guides have worked for me,
and other times I've spend a few hours debugging random build errors and
incompatibilities. I think this will get better with time.

Both frameworks now rely on `async` fns, which I'm ok with but lots of people
seem to have issue with the "terrible async in lang X". To me the code is much
simpler and expressive with async - for instance if you're waiting for a message
this seems simpler than a polling loop:

```rust
receiver.next().await
```

## Configuring the microcontroller

Configuration is really the realm of the hardware abstraction layer, or HAL. As
mentioned, RTIC relies on you to bring your own HAL, while embassy includes a
bunch of HALs. The main complexity here seems to be driven by the complexity of
the ICs themselves - no code is directly transferrable as (for instance) an
STM32F4 handles ADCs differently to how an STM32F1 or an RP2040 does. I'd say
the [`stm32-rs`](https://github.com/stm32-rs) and
[`rp-hal`](https://github.com/rp-rs/rp-hal) used by RTIC are *probably* a bit
more mature here, but they aren't far off each other.

The configuration function for switchy in the RTIC version lives
[here](https://github.com/will-hart/switchy/blob/develop/src/configure.rs#L52).
A typical digital IO pin configuration might look like:

```rust
let gpioc = device_peripherals.GPIOC.split();
let pin = gpioc.pc3.into_push_pull_output();
```

For embassy, a similar RP2040 configuration might be:

```rust
let p = embassy_rp::init(config);
let pin = p.PIN_2;
```

I did have some issues getting USB HID to work with embassy on an STM32F401
microcontroller. For whatever reason the device just wouldn't be detected no
matter what I tried. Its possible the chip was faulty, but I changed to a RPi
Pico, spent about an hour converting the code base from STM32F4 to RP2040, and
it worked flawlessly.

## The Hardware Abstraction Layer

Both HALs rely on `embedded_hal` to provide common structures for
Pins, allowing re-use of device drivers between MCUs, which is a pretty feature
thing to have for somebody like me with a drawer full of different dev boards.

I've been successful in running both stm32 and embassy HALs on STM32F0, STM32F1,
STM32F4 and RP2040 targets, often with minimal code changes between MCUs thanks
to `embedded_hal`s.

My general impression here is that the `stm32-rs` / `rp-hal` HALs used with RTIC
are a bit more mature, but *feel* more varied in approach as they're from lots
of different projects. Embassy HALs felt more consistent between MCU families,
but maybe a little less mature in some cases(?).

## Resource sharing between tasks

There is often a requirement in non-trivial firmware to share resources or
state, or maintain global state for tasks. This might be something like whether
an LED should be on, or in the case of the USB input devices it might be a
current map of the state of buttons. Both
[RTIC](https://rtic.rs/2/book/en/by-example/channel.html) and
[embassy](https://docs.embassy.dev/embassy-sync/git/default/index.html) allow
sync structures with things like `queues` and `channels` for passing data
between tasks in a pretty straightforward way.

RTIC and embassy do differ though on how resources are shared globally. Embassy
takes a fairly standard approach of requiring all resources to be statically
allocated. This requires a lot of `static` types or the use of something like
[`StaticCell`](https://docs.rs/static_cell/latest/static_cell/). Its a bit of a
mouthful to write code this way in rust, but it is fairly obvious and direct. To
quote an "industry source" that I discussed this with:

> rust is exposing a constraint that's already there [in C++ firmware], but I'm
> finding it annoying to write [in rust].

Here is an example from my keyboard firmware:

```rust
let channel: &'static mut KeyboardActionChannel = {
    static CHANNEL: StaticCell<KeyboardActionChannel> = StaticCell::new();
    CHANNEL.init_with(|| KeyboardActionChannel::new())
};

// spawn a task and pass in the reference to our channel
unwrap!(spawner.spawn(send_dummy_key_presses(channel)));
```

A limitation of embassy tasks is that they cannot accept generic function
arguments, which includes non-static lifetimes. Often I found myself stumbling
over this and fighting with the compiler.

RTIC uses a more "magical" macro-based approach to
[resources](https://rtic.rs/2/book/en/by-example/resources.html). There are
`shared` resources and `local` resources. Shared resources are available to any
task, usually accessed through a mutex, while local resources are available only
to a single task. This model works very well when it works, but I found the
macro approach often resulted in obscure hard-to-debug errors because if I made
a mistake in my resource initialisation code the error was reported somewhere
else (i.e. in the macro), and often took a bit of digging to work out. An
example of how this works (adapted from the docs linked above) is:

```rust
#[rtic::app(device = stm32f401, dispatchers = [EXTI1])]
mod app {
    //.. use blah;

    #[shared]
    struct Shared {
      driver: MyDeviceDriver,
    }

    #[local]
    struct Local {
        local_to_foo: i64,
    }

    #[init]
    fn init(_: init::Context) -> (Shared, Local) {
        foo::spawn().unwrap();

        // get GPIOs here

        let driver: MyDeviceDriver::new(/* move in a bunch of GPIOs */);

        (
            Shared { driver },
            Local {
                local_to_foo: 0,
            },
        )
    }

    #[task(local = [local_to_foo], shared = [driver], priority = 1)]
    async fn foo(cx: foo::Context) {
        let local_to_foo = cx.local.local_to_foo;
        *local_to_foo += 1;

        cx.shared.driver.lock(|driver| {
          driver.do_something();
        });      
    }

}
```

Another challenge I found with RTIC's approach was that the task functions must
be `async` but the `init` function which initialises global resources was
`sync`. Some libraries (for instance for interfacing with `nrf24`) only came in
an async variant, meaning it was a real struggle to get them to work properly
with RTIC.

## Availability of community support and examples

Rust projects usually have very thorough API documentation and detailed
examples, and both RTIC and embassy are no exception here. There are tonnes of
examples for both. As the HAL and framework are the same for embassy, the
examples are a bit more coherent and unified, and *oh my* there are [a lot of
examples](https://github.com/embassy-rs/embassy/tree/main/examples) for
different MCUs.

The RTIC examples are [a bit more
sparse](https://github.com/rtic-rs/rtic-examples), and don't seem to have any v2
specific examples yet, however the HALs usually provide examples. Again this
means that you're a bit at the mercy of how mature the specific HAL is. For both
frameworks this is a function of their rapid development - some of the examples
get stale relatively quickly which can make finding relevant examples tricky at
times.

One thing that is missing for both frameworks is "intermediate" complexity
examples. For instance most of the embassy examples don't actually spawn
`tasks`, which is a core feature of the framework. The examples seemingly go
from "how to blink an LED" to "here is a huge repository for 3d printer
firmware", leaving little clue for the newcomer on how to sensibly structure an
application with complexity anywhere above "trivial". In some ways this should
be left up to the developer, but I felt like RTIC perhaps provided a bit welcome
more guidance here.

Often for the embassy examples there are HAL specific features that are
required. However as the examples for a particular MCU are all in one directory,
its a bit unclear which feature relates to which example. This isn't a big deal,
but adds a bit of friction to implementing examples into your own code. There
were also some non-obvious dependencies (for instance `portable_atomic` was
required for `thumbv6` target to use `static_cell`, which wasn't immediately
obvious when moving between targets).

## Conclusion

I love writing embedded rust code. For me, its easier to read and write than the
typical C++ code bases, while allowing a bit more power and flexibility than
something like Arduino.

There definitely some cons. I'm not 100% sure rust embedded in general is
*quite* ready for mission critical applications, although seems more than stable
enough for regular old firmware. The usual rust trade offs are multiplied in a
`no-std` environment - finnicky compiler errors, types and lifetime management,
and many of the "nicer" rust features like dynamically sized `Vec`s  are not
immediately available without an external crate. I'd say that usually rust
trades up front development time for less future debugging time, and I think
that is exacerbated in embedded.

There are definite pros to rust embedded though. The ecosystem is already very
strong with lots of drivers, crates, and wide MCU support from a single language
and coding environment. Once I've gotten past the initial hurdle of lifetimes,
device initialisation and so on, writing application logic has been an absolute
dream, and the code usually "just works".

I would happily reach for either embassy or RTIC. I think my own preference
would probably be to reach for embassy for simple projects, and RTIC for things
that are likely to be more complex, but really I think it would be hard to go
wrong using either for rust embedded development.
