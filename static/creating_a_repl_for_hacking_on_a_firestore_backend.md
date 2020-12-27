---
title: Creating a REPL for hacking on a firestore backend
subtitle: Using a node REPL to simplify playing around with a firestore backend.
tags:
  - tutorials
authorName: Will Hart
publishedDateString: 3 Nov 2018
---

When developing firestore based apps (especially for the server) I often find it
a bit tricky to inspect "intermediate" query results, or just to play around
with data, test queries and so on. I found a few admin interfaces but they
generally appear to be for the realtime database and almost universally have no
commits for 1-2 years.

![A custom firestore REPL running in a node console](/images/firestore-repl.png)

Ideally I'd just be able to type commands into a terminal and try queries out.
It turns out using a node repl this is very easy to do. I found some
instructions for [building your own
REPL](https://derickbailey.com/2014/07/02/build-your-own-app-specific-repl-for-your-nodejs-app/),
and adapted them for firestore admin.

Here is what my REPL looks like:

```typescript
//repl.ts

import * as repl from "repl"
import initFirestoreAdmin from "./src/initAdmin"
// used by my functions to init admin with credentials etc

const admin = initFirestoreAdmin()
const firestore = admin.firestore()

const replServer = repl.start({
  prompt: "fb > ",
})

replServer.context.firestore = firestore
replServer.context.admin = admin

// I can also save typing by doing things like:
replServer.context.userId = "my_firestore_user_id"

// or by adding functions
replServer.context.withUser = (query) =>
  query.where("userId", "==", replServer.context.userId)
```

I'm coding in typescript, so I also `yarn add --dev ts-node` so I don't have to
bother with compiling the ts file. I can then add a script to my `package.json`:

```json
"scripts": {
  ...,
  "repl": "./node_modules/.bin/ts-node repl.ts
}
```

I can start the repl from the root directory with `yarn repl`. A prompt appears,
and I can start typing in firestore queries:

```typescript
// get the pages collection
fb >
  firestore
    .collection("pages")
    .get()
    .then((result) => console.log(result))

// get a user's pages
fb >
  withUser(firestore.collection("pages"))
    .get()
    .then((result) => console.log(result.size))
```

Using this approach you could also pull in any of your application code (for
instance GraphQL resolvers), and have a ready built console application version
for your app.

## A note on async/await

By default, the node `repl` doesn't support `async`/`await`. It's available
under a feature flag in node 10+, but doesn't appear to be available in ts-node
yet. You can provide async functionality by installing
[async-repl](https://github.com/ownadi/async-repl) and using it as follows:

```typescript
// inside repl.ts
import \* as stubber from 'async-repl/stubber'

//
//set up your repl as above...
//

stubber(replServer)
```

Now in your repl you can do the following:

```typescript
fb > const docs = await firestore.collection('documents').get()
```
