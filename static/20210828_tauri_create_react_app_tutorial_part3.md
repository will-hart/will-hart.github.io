---
title: Tauri and Create React App Part 3 - Commands as hooks
summary: Part 3 of a tutorial for setting up Tauri (an electron alternative) and Create React App. Here we create a hook for invoking "get/set" commands using the `useSWR` package.
tags:
  - code
  - random
  - projects
  - tutorials
authorName: Will Hart
publishedDateString: 26 Aug 2021
---

## Recap

In [part 1](/20210826_tauri_create_react_app_tutorial_part1) of this tutorial series we set up a Tauri and create-react-app app and added a basic non-functional counter. In [part 2](/20210827_tauri_create_react_app_tutorial_part2) we created and invoked a command for incrementing our counter.

In this part, we will write a generic hook for invoking and updating hook data. In theory this hook could be reused for both web APIs or invoked commands by changing the underlying `fetcher` used by `swr`.

## What is SWR

[SWR](https://swr.vercel.app/) stands for "stale while revalidate", which is a lightweight HTTP approach to managing requests to an API, caching data to improve load times and fetching updates in the background. The benefits of the react hook from the `swr` package are that it allows us to define queries by a key, and then easily re-fetch data when we make changes. It also supports optimistic UI, so in many ways is a simplified `@apollo/client` without requiring a GraphQL endpoint (although it supports GraphQL).

To install SWR, **first make sure that the Tauri app isn't running**. Then we can run

```bash
yarn add swr
```

Using the SWR library looks something like this:

```typescript
const { data, error } = useSWR('my/api', fetcher)
```

Here the `my/api` bit is a key that is use to refer to the specific query, while `fetcher` is some sort of wrapper over a function that calls the API to fetch the data. In the case of a web request, it might look something like this:

```typescript
const fetcher = (key: string) -> Promise<any> {
  return fetch(`myapi.com/${key}`).then(r => r.json())
}
```

Arguments can be provided to the fetcher by passing an array to the `useSWR` hook:

```typescript
const { data } = useSWR(['my/api', myId], fetcher)
```

This argument will be passed to the `fetcher`, and forms part of the `key` that uniquely identifies the query within the `swr` cache. We shouldn't dynamically create an object here (i.e. `useSWR(['my/api', { myId }])`) as this can prevent caching.

## Writing a fetcher that invokes commands

This bit is fairly straightforward. Instead of the key being the URL, here we can just assume the key is the name of the command we want to run. While we're at it, lets make the `invokeFetcher` generic so we can have a typed response. Create a new file, `useInvoke.ts` and add the following:

```typescript
export const invokeFetcher = async <TArgs extends Record<string, any>, TResult>(
  command: string,
  args: TArgs
): Promise<TResult> => invoke<TResult>(command, args)
```

The `invokeFetcher` has two type parameters, the first `TArgs` defines the arguments that are passed to the fetcher, here they must extend `Record<string, any>`. We also have a `TResult` type which determines what the invoked command should return. We don't attempt any error handling here, this is handled by `swr`.

## Using the fetcher in an swr hook

Now we can invoke a command via SWR. In our `App.tsx` from [part 2](/20210828_tauri_create_react_app_tutorial_part2) replace the `useEffect` with:

```typescript
const args = useRef({ delta: 0 })
const { data } = useSWR(['increment_counter', args.current], invokeFetcher)
useEffect(() => {
  setCounter(data as number)
}, [data, setCounter])
```

This does two things - firstly we create a `ref` to hold our arguments to aid with caching. Then we call `useSWR` with the name of the command and our arguments. Finally we just hook up an effect that updates our counter state whenever the data updates (we'll remove this in a later step). We can also leave the `invoke` command in the `useCallback` untouched for now.

> Note that the arguments for `useSWR` are in an object where the name of the fields corresponds to the arguments in the rust command function.

## Refactor our commands into get/set commands

This works pretty well, but we're kind of mixing our metaphors with the commands when we get the inital value. For instance we're passing a `delta` of `0` to get the current value which seems a little bit weird. Lets refactor our command into two commands - one to get the current value of the app state, and one to increment the state by a `delta`. We can add the `get_counter` hook quite easily:

```rust
#[tauri::command]
fn get_counter(state: State<AtomicI32>) -> Result<i32, String> {
  println!("Getting counter value");
  Ok(state.load(Ordering::SeqCst))
}
```

and we also have to make sure we register the new command:

```rust
// in the tauri::Builder in main.rs
.invoke_handler(tauri::generate_handler![increment_counter, get_counter])
```

We can now replace all our hooks with the following:

```typescript
const { data: counter, mutate } = useSWR('get_counter', invokeFetcher)

const increment = useCallback(async () => {
  const result = await invoke('increment_counter', { delta: 1 }) as number
  mutate(result, false)
}, [mutate])
```

The `useSWR` hook now calls `get_counter`, and then inside the `useCallback` we invoke the `increment_counter` function.

Another key difference here is we are now using a "bound `mutate`" function that is returned by the `useSWR` hook. This lets us tell `swr` it should refetch the data (in this case, invoke the `get_counter` command). We also pass the `result` to the `mutate` function so that the `counter` variable is updated optimistically, as well as `false` as a second argument to mutate. Passing false prevents the `get_counter` command from being invoked again when `mutate` is called. We no longer need to store the `counter` in state, or update when `data` updates so both these hooks have been removed.

> In this case our `increment_counter` variable returns the value, however in some cases we may not want to do this, or perhaps we've updated one part of our data which means another part should be re-fetched. In this case we can omit the second argument to `mutate`. If you make this change and run the code you should see that both "incrementing" and "getting" actions are logged.

## Write a generic hook

Lets refactor the invoke logic into a separate hook. At the bottom of `useInvoke.ts`, add a new hook function:

```typescript
export const useInvoke = <TArgs extends Record<string, any>, TResult>(
  args: TArgs,
  getCommand: string,
  setCommand: string
) => {
  // run the invoke command
  const { data, error, mutate } = useSWR<TResult>(
    [getCommand, args],
    invokeFetcher
  )

  // create an update function
  const update = useCallback(
    async (newData: TResult) => {
      mutate(await invoke(setCommand, { ...args }), false)
    },
    [args, mutate, setCommand]
  )

  return {
    data,
    fetching: !data,
    error,
    update,
  }
}

```

This is a fairly standard react hook which is mostly just the code we had previously in `App.tsx` moved over. We first call `useSWR` with our passed in command, the arguments and the `invokeFetcher`. We then create a callback for invoking the update command and cache it using `useCallback`. This assumes that the invoke command also returns the updated data, if it doesn't then we could replace the body of the `useCallback` with something like:

```typescript
async (newData: TResult) => {
  await invoke(setCommand, { ...args })
  mutate()
},
```

This would automatically refetch the data after the `setCommand` command is invoked.

> We're assuming here that the `args` provided to the hook is stable enough to be used as a key for `useSWR`. If necessary this can be cached using `useState` and compared when `args` changes.

We then need to update our `App.tsx` to use this new hook. We can replace everything except the return with:

```typescript
const { data: counter, update } = useInvoke(
  defaultArgs, 'get_counter', 'increment_counter'
)
```

The button in the `App` component should be updated to use the `update` function as well:

```jsx
<button onClick={update}>increment</button> {counter}
```

When the app reloads, the counter should work as before.

## Adding a second counter

To check that the hook is sharing data, we can add a second counter that uses the same data source as the first. Add a second `useInvoke` hook into `App.tsx` below the first:

```typescript
const { data: counter2, update: update2 } = useInvoke(
  defaultArgs, 'get_counter', 'increment_counter'
)
```

Then update our returned component:

```tsx
return (
  <div>
    <div><button onClick={update}>increment</button> {counter}</div>
    <div><button onClick={update2}>increment</button> {counter2}</div>
  </div>
)
```

Now when the app reloads there should be two counters. Clicking either increment button automatically updates both counters! As the `args` is the same for these two `useInvoke` hooks, they use the same data. In the next part of this series we'll take a look at how we can use separate counters.

> We've now built a generic hook that can invoke the command and manage the update logic for us. The code for this tutorial can be found [here on github](https://github.com/will-hart/tauri-cra-tutorial/tree/3dc42b87f00907e4245bd5c47d9d65a7eacc0316). Part 2 of the tutorial [can be found here](/20210827_tauri_create_react_app_tutorial_part2) and part 4 of the tutorial [can be found here](/20210829_tauri_create_react_app_tutorial_part3).
