---
title: Connecting Players with Firebase and Unity [Part 2]
summary: Part 2 of a tutorial on hacking firebase support into Unity (for desktop builds)
tags:
  - code
  - gamedev
authorName: Will Hart
publishedDateString: 23 Feb 2017
---

## Recap

In the [previous part](/firebase-and-unity-part-1) we looked at getting a
firebase database set up and importing the package into Unity. In this part we
are actually going to build out the "game". If you don't recall, in this example
we are going to have a button and a click counter stored on the server. It isn't
going to be a particularly exciting game, but should be enough to get us started
on the real-time database path.

> A reminder again as well that Firebase only has official support for
> Android/iOS build targets. I've managed to be a bit hacky and get it working
> in standalone, but please help me badger firebase directly for official
> standalone support!

## Creating a UI

Our first step is to build up a simple UGUI interface. As I said in the first
part, I'm going to assume you know how to do this and gloss over it fairly
quickly.

I did these steps to get the UI setup:

1. In the Lighting panel, remove the skybox
2. On the camera inspector, set the Clear Flags to Solid Colour and choose a
   background colour
3. Create a UI `Canvas` in the scene
4. Add a `Button` and `Text` to the canvas and mess about with layout anchors
   and text settings a bit so it looks like this:

![The resulting Unity Scene](/images/firebase_and_unity2/clickme.png)

## Creating a Firebase script

The next step is to create a C# script for handling the firebase interaction. I
named it `FirebaseClickHandler`, and started off with the following empty class
definition:

```cs
namespace FirebaseTest
{
#region Dependencies

    using Firebase;
    using Firebase.Database;
    using Firebase.Unity.Editor;
    using UnityEngine;
    using UnityEngine.UI;

    #endregion

    public class FirebaseClickHandler : MonoBehaviour
    {
        [SerializeField] private Text _counterText;
        private int _count = 0;

        private void Update()
        {
            _counterText.text = _count.ToString("N0");
        }
    }
}
```

Most of this is just standard C# setup for a MonoBehaviour, apart from the two
`using` statements for `Firebase` and `Firebase.Unity.Editor`. We are storing a
reference to the `Text` UI element we created earlier, and in the `Update`
method we just set the value of the Text to our counter.

If we add the script to our `Canvas`, hook up the references to the text object
and hit play at this point, our counter should just read `0` as in our
screenshot above.

## Getting the count from the database

The next thing we want to do is connect to the database and get the current
count. We can connect in the editor by writing the following in Awake:

```cs
private void Awake()
{
  FirebaseApp.DefaultInstance.SetEditorDatabaseUrl(
    "https://wh-unity-test.firebaseio.com/");
}
```

So here we are setting an Editor URL for testing, which is just our firebase URL
that we can see in the firebase console.

To read and write data, firebase has the concept of `references`. These are
essentially URLs which point to specific paths or data in the database and can
be used as a notification when the linked data changes, or as a way to read or
write data on that path. Add a private field at the top of our class (below
`_count`) to store the database reference:

```cs
private DatabaseReference _counterRef;
```

At the same time, why not change the default value of `_count` to -1, so that
we can see when our data is loaded from the database more easily. We can then
replace the `Awake` method with this:

```cs
private void Awake()
{
  FirebaseApp.DefaultInstance.SetEditorDatabaseUrl(
    "https://wh-unity-test.firebaseio.com/");

  _counterRef = FirebaseDatabase.DefaultInstance
        .GetReference("counter");

  _counterRef.ValueChanged += OnCountUpdated;
}

private void OnCountUpdated(object sender, ValueChangedEventArgs e)
{
  throw new System.NotImplementedException();
}
```

If we run the code now, we should get a `NotImplementedException` thrown, so our
`OnCountUpdated` method is being called when we "connect" our reference to the
database!

Let's implement the method now, so that we can display our value in the text. In
the body of the `OnCountUpdated` method, put the following:

```cs
if (e.DatabaseError != null)
{
  Debug.LogError(e.DatabaseError.Message);
  return;
}

if (e.Snapshot == null || e.Snapshot.Value == null) \_count = 0;
else \_count = int.Parse(e.Snapshot.Value.ToString());
```

We check for an error, then set the value of our `_count` according to what the
database value returns. The return value is in the `Snapshot` variable. Note
that we check for `e.Snapshot == null` - this is important because if there
isn't any data at the path, `e.Snapshot` will be null - this lets us set a
default.

> **NOTE** "Empty" database URLs will return null

If you hit play in the editor, you should see the a bit of a pause, then the
text value should be set to 0 as there isn't currently anything at the
`/counter` path:

![The counter path is currently empty](/images/firebase_and_unity2/browsefirebase.png)

While you are here, play around a bit - you can edit values in the database
through your browser. With the application running, change the count value to
some random numbers - the text field in the Unity game should update
automatically!

OK, I think we are now ready to move on to writing the counter value to the
database.

## Writing a value to the database

To write a value to the database, we use a similar approach to reading - i.e.
call a method on the `DatabaseReference` we created before. Add the following
public method to our `FirebaseClickHandler` class:

```cs
public void IncrementClickCounter()
{
  _counterRef.SetValueAsync(_count + 1);
}
```

Link this to our `Button` via the click handler.

![Hook up the method in the click handler](/images/firebase_and_unity2/inspector.png)

This bit is fun :) Tweak your windows so you can see the Unity game and the
firebase console side by side. Run the game and click the button. Now as we are
subscribing an event in `Awake`, we probably need to make sure that it gets
unsubscribed `OnDestroy`:

```cs
private void OnDestroy()
{
  _counterRef.ValueChanged -= OnCountUpdated;
}
```

At this stage, we have a workable system, albeit with two, fairly major issues:

1. If you build and run the game, you get a DLL Not Found exception
2. As our `IncrementClickCounter` uses our local value of count and adds 1, then if 100 people update the database at exactly the same time, then we may lose some of the increments (more below)

We'll start by addressing point #2, by using `Transactions`.

## Transactions

To clarify the issue - we are using our local value of `_count`, for example
`_count = 6` to send a `SetValueAsync` request with the value `_count + 1`. If
tonnes of people do this request at the same time (say 100 people try to set it
to 7) then our database will say `counter = 7` when what we actually want it to
say is counter = 106 (it was originally 6 and 100 people want to increment it.
We can manage this kind of situation by using a transaction.

A transaction in firebase runs from a `Reference` and receives the current data
value as `MutableData`. It "returns" the new data that should be set in the
database. Lets replace our `IncrementClickCounter` method with the following:

```cs
public void IncrementClickCounter()
{
  _counterRef.RunTransaction(data => {
    data.Value = \_count + 1;
    return TransactionResult.Success(data);
  }).ContinueWith(task => {
    if (task.Exception != null)
    Debug.Log(task.Exception.ToString());
  });
}
```

Its a tiny bit more code, but now our counter should be protected against race
conditions!

## Building for Desktop

Now a few paragraphs ago, I glossed over a `DLLNotFound` exception above when we
ran the built version of our game. This is due to no official support for Unity
Standalone. If you create a development build and look at the debug logs, this
is because and `App.dll` is missing. Checking this is in my plugins directory,
but only for Android, iOS and x86_64 builds. By changing the standalone
architecture to `x86_64` I was able to get this file included as part of the
build, and compile and run our example game.

![Using x86_64 architecture](/images/firebase_and_unity2/buildsettings.png)

I also had to modify the connection script in `Awake`, to set the database path
explicitly. There may be a better way to load in config, but this worked for me
as a quick hack:

```cs
#if UNITY_EDITOR
  FirebaseApp.DefaultInstance.SetEditorDatabaseUrl(
    "https://wh-unity-test.firebaseio.com/");
#else
  FirebaseApp.DefaultInstance.Options.DatabaseUrl =
    new System.Uri("https://wh-unity-test.firebaseio.com");
#endif
```

I haven't experimented much, but I suspect that a lot of the extra features of
firebase such as authentication may be unsupported in Standalone mode. This does
leave our firebase data open to abuse. We can mitigate this a little bit by
doing some additional validation in our database rules:

```json
".validate": "newData.isNumber() && newData.val() == data.val() + 1"
```

This means that the update will fail unless we are incrementing by one, which
should prevent people clearing or otherwise playing with the counter too much,
but at the end of the day without authentication we are a little open to
exploitation.

## Wrapping up

I really like firebase. I've used it in some web apps and have been very
pleasantly surprised, and I'd be stoked to be able to base some features on it
in a Standalone build of a Unity game. If you feel the same way, please get in
touch with firebase and tell them!

Otherwise, I hope this has given you some insight into how firebase can be used
and setup!
