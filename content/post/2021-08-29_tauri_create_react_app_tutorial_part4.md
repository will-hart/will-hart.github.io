+++
title = "Tauri and Create React App Part 4 - Extending commands"
description = "Part 4 of a tutorial for setting up Tauri (an electron alternative) and Create React App. Here we extend our hook and command to support multiple counters."

aliases = ["/20210829_tauri_create_react_app_tutorial_part4", "/post/20210829_tauri_create_react_app_tutorial_part4"]

[taxonomies]
tag = ["tutorials", "code"]
+++

## Recap

In [part 1](/post/20210826_tauri_create_react_app_tutorial_part1) of this tutorial series we set up a Tauri and create-react-app app and added a basic non-functional counter. In [part 2](/post/20210827_tauri_create_react_app_tutorial_part2) we created and invoked a command for incrementing our counter. In [part 3](/post/20210828_tauri_create_react_app_tutorial_part3) we created and invoked a command for incrementing our counter.

In this part, we will update our command and hooks to support multiple different counters indexed by ID.

## Basic concept

If you recall from [part 3 of this series](/post/20210830_tauri_create_react_app_tutorial_part3), the `useSWR` uses the first argument as a `key` to cache queries. The key can be an array, and the key is passed to the `fetcher` function as arguments. We're going to use the key to store a `counterId` variable that we can use to maintain separate counters. We'll also need to update our commands in the rust code to support an ID.

## Update our hook to support counter Ids

We need to update our `useInvoke` hook in `useInvoke.tsx` to support this new requirement. We can start by updating the fetcher to take an `id` as an argument:

```typescript
export const invokeFetcher = async <TArgs extends Record<string, any>, TResult>(
  command: string,
  id: number,
  args: TArgs
): Promise<TResult> => invoke<TResult>(command, { id, ...args })
```

The main change here is that we are now taking an `id` as a second argument, and spreading it into the args sent to the invoke command. We then need to update our `useInvoke` hook to:

```typescript
export const useInvoke = <TResult>(
  id: number,
  getCommand: string,
  setCommand: string
) => {
  // run the invoke command to get by ID
  const { data, error, mutate } = useSWR<TResult>(
    [getCommand, id, null],
    invokeFetcher
  )

  // create an update function
  const update = useCallback(
    async (newData: TResult) => {
      mutate(await invoke(
        setCommand,
        { id, ...newData }
      ), false)
    },
    [mutate, id, setCommand]
  )

  // unchanged
}
```

We now pass the `id` to the hook, which is used as part of the `key` in `useSWR`. In our `update` function we add the `id` into the data payload sent to `invoke`. Other than that, not a lot has changed.

## Updating our front end

It would be nice at this point to factor out the `Counter` into a new component. This lets us pass the `counterId` as a prop. Create a new file, `Counter.tsx` and add the following:

```typescript
import { useInvoke } from "./useInvoke";

const defaultArgs = { delta: 1 }

const Counter = ({ counterId }: { counterId: number }) => {
  const { data: counter, update } = useInvoke(
    counterId,
    'get_counter',
    'increment_counter'
  )

  return (
    <div>
      <button onClick={() => update(defaultArgs)}>increment</button>
      Counter {counterId}: {counter}
    </div>
  )
}

export default Counter
```

This is basically copied over from our previous implementation inside `App.tsx`. Speaking of which, we can now use our `Counter` component inside `App.tsx`:

```typescript
import Counter from './Counter'

const App = () => {
  return (
    <div>
      <Counter counterId={1} />
      <Counter counterId={1} />
      <Counter counterId={2} />
    </div>
  )
}

export default App;
```

We're using three counters here, but two of them point to `counterId == 1`. If we run the app now it kind of works, the counters with `id == 1` increment together and the counter with `id == 2` increments separately. However you can see that the two counters are linked, i.e. they're modifying the same underlying counter, but only the counters with the same `id` visually update when the increment action is invoked.

## Updating the rust command

To fix this, we need to extend our commands in `src-tauri/src/main.rs`. Here is the code:

```rust
use tauri::{async_runtime::RwLock, State};

type InnerState = RwLock<HashMap<i32, i32>>;

#[tauri::command]
async fn increment_counter(
  state: State<'_, InnerState>,
  id: i32,
  delta: i32,
) -> Result<i32, String> {
  println!("Incrementing counter {} by {}", id, delta);

  let mut hashmap = state.write().await;
  let next_value = *hashmap.get(&id).unwrap_or(&0) + delta;
  hashmap.insert(id, next_value);

  Ok(next_value)
}

#[tauri::command]
async fn get_counter(state: State<'_, InnerState>, id: i32) -> Result<i32, String> {
  println!("Getting counter value for counter {}", id);

  let hashmap = state.read().await;
  Ok(*hashmap.get(&id).unwrap_or(&0))
}
```

We're doing quite a bit here. First of all we've removed the `AtomicI32` and replaced it with a `RwLock<HashMap<i32, i32>>`. The main condition here is that our `State` can be managed across threads. Here we're using a read-write lock to make sure that there can be multiple reads but only one write at a time. We also added a bit more logging so we can see which `counterId` is being get or set in the logs.

> Note that we've used a `RwLock<HashMap>` here as our state, but in reality could use any `Send + Sync` type, i.e. one that supports threading. This might be a database, or a file store or something like that in a more complex app. In addition, the inner state type (currently `i32`) could be anything that supports `serde::Serialize`.

We also need to update the way our state is created in the `main()` function. Change the line with `manage` to:

```rust
  // tauri::Builder
    .manage(RwLock::new(HashMap::<i32, i32>::new()))
```

At this point we can also remove a bunch of unused imports in the `main.rs` file. If we run the app we can see that the counters behave as we'd expect, each incrementing separately and the counters using the same ID updating at the same time.

## Building the app

Now that we are done developing the app, lets build it and see how large the binary is and how much memory it uses. To build the app,

```bash
yarn tauri build
```

The build can take a while as the CRA is built and the rust parts are compiled in release mode. Once it is built we can look in `src-tauri/target/release`. In the `bundle` folder there is an `msi` installer we can use, but there should be a `counter-app.exe` directly in the `release` folder. Mine is about 7MB.

![The binary size of the built Tauri app](/images/tauri-step2-binary.png)

If I run the application I can check the memory footprint. (After first clicking the increment buttons a bunch of times to make sure everything is working!). Its a fairly slim application, but with basically no CPU and about 50MB of RAM its perfectly acceptible out of the box.

![The resource usage of the built Tauri app](/images/tauri-step2-resources.png)

> That's it, our counter tutorial app is complete! In this part we extended our command here to support counters with different IDs. The code for this tutorial can be found [here on github](https://github.com/will-hart/tauri-cra-tutorial/tree/0f664071e266d45c153efeabf43c09d588c5c907). Part 3 of the tutorial [can be found here](/post/20210828_tauri_create_react_app_tutorial_part3).
