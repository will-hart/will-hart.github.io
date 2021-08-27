---
title: Tauri and Create React App Part 2 - Commands
summary: Part 2 of a tutorial for setting up Tauri (an electron alternative) and Create React App. Here we run through setting up and invoking a command written in rust.
tags:
  - code
  - random
  - projects
  - tutorials
authorName: Will Hart
publishedDateString: 26 Aug 2021
---

## Recap

In [part 1](/20210826_tauri_create_react_app_tutorial_part1) of this tutorial series we set up a Tauri and create-react-app app and added a basic non-functional counter. We worked out how to run the app with one command and use the built-in hot reloading to reload the app.

In this part, we will write a basic rust command and invoke it from the client side to update our counter in the app.

## What are commands

Commands are the way that Tauri supports exchanging data and actions between the web and rust parts of the code base. Tauri provides a JavaScript API for "invoking" commands in the rust code.

> Commands are just rust functions that are registered when the Tauri app is built.

## Writing a command

Lets start by writing a simple rust command. Open up `src-tauri/src/main.rs`, and above the `main()` function add the following:

```rust
use std::sync::atomic::{AtomicI32, Ordering};
use tauri::State;

#[tauri::command]
fn increment_counter(state: State<AtomicI32>, delta: i32) -> Result<i32, String> {
  println!("Incrementing counter by {}", delta);
  Ok(state.fetch_add(delta, Ordering::SeqCst) + delta)
}
```

We've imported a few things to store a thread-safe number, and we've created a function that takes a `tauri::State` which contains an `AtomicI32` and a second argument is a delta which we use to increment our counter. The function is a one liner which uses `fetch_add` to update our atomic integer. We then return the previous value (returned by `fetch_add` plus the delta).

We then need to update our tauri `main()` function to insert our state and register the commands. Update the main function to look like this:

```rust
  tauri::Builder::default()
    .manage(AtomicI32::from(0))
    .invoke_handler(tauri::generate_handler![increment_counter])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
```

The two new lines are the `manage` and `invoke_handler` lines. The first line tells Tauri to "manage" our state, in this case our atomic integer. The second line `invoke_handler` registers our handlers. If we want multiple handlers we can do:

```rust
tauri::generate_handler![my_command, another_command, a_third_command]
```

If you look back at your terminal now you should see some activity as the Tauri app reloads in response to the changes. This is all we need to do to set up the commands in the backend.

## Invoking the command on the front end

Now we can return to the `App.tsx` to use (or invoke) our command. We want to invoke the command when the app first loads to get the current value of the counter. We can do this with a `useEffect` before the `return` in `App.tsx`. It should look something like this:

```typescript
import { useEffect, useState } from "react";
import { invoke } from '@tauri-apps/api'

const App = () => {
  const [counter, setCounter] = useState(-1)

  useEffect(() => {
    invoke('increment_counter', { delta: 0 }).then((result) => setCounter(result as number))
  }, [setCounter])

  return (
    <div>
      <button>Increment</button> {counter}
    </div>
  )
}
```

When the app reloads you should see a message in the terminal:

```bash
Incrementing counter by 0
```

The counter next to the button should also say `0`, which is the value we set in the server. We can verify that this number does come from the rust code by changing line 18 in `main.rs` from `.manage(AtomicI32::from(0))` to `.manage(AtomicI32::from(5))`. When the app reloads the counter should start on 5.

We now want the counter to update when we hit the "increment" button. We can create a callback for this:

```typescript
const increment = useCallback(async () => {
  const result = await invoke('increment_counter', { delta: 1 }) as number
  setCounter(result)
}, [setCounter])
```

We can then update the button to:

```jsx
<button onClick={increment}>increment</button>
```

After reloading click the button. The console should print:

```bash
Incrementing counter by 1
```

and the counter should increment by 1 for each click!

## Handling errors

If the rust function returns an `Err(some_string)` then this is passed through to the invoke function on the web side. As `invoke` is just a promise, this means we could do something like:

```typescript
invoke(...).then(result => ...).catch(console.error)
```

> We now have commands invoked from the web side executing rust code and handling the result. The code for this tutorial can be found [here on github](https://github.com/will-hart/tauri-cra-tutorial/tree/f373bf1dbe9a21101e1a2b1cd6b8d8969e94e0b4). Part 1 of the tutorial [can be found here](/20210826_tauri_create_react_app_tutorial_part1) and part 3 of the tutorial [can be found here](/20210828_tauri_create_react_app_tutorial_part3).
