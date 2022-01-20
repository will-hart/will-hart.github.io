---
title: Ludum Dare 32 Postmortem - Colour Rocket
summary: A post mortem of the game I build for Ludum Dare 32 - Colour Rocket
tags:
  - gamedev
authorName: Will Hart
publishedDateString: 27 Apr 2015
---

A couple of weekends ago I participated in my first [Ludum
Dare](http://www.ludumdare.com/) - LD32. The theme for the event was "*an
unconventional weapon*". If you aren't familiar, Ludum Dare is basically a
weekend long game jam where you make a game from scratch in 48 hours. In the
"compo" version you need to make all assets - art, code, music and gameplay -
within the 48 hours... oh yeah and you have to do it on your own.

My game was called [Colour
Rocket](http://ludumdare.com/compo/ludum-dare-32/?action=preview&uid=50407) and
the concept was an "infinite runner" inspired asteroid dodger, where you aim was
to guide a rocket to an enemy planet through flying asteroids, and use it to
return colour to a darkened universe.

At about 5pm on the final day of Ludum Dare, I decided I'd had enough. I put
down my keyboard and picked up my baby daughter for a cuddle. She has since
forgiven me for ignoring her for the best part of a day. This left me with a
fully functional, complete but very minimal game with only three levels. I'm
pretty happy that I was able to get that far.

## Toolset

I picked a fairly standard free toolset early on:

- Unity to make the game,
- Blender for artwork, and
- Sunvox for music

## What worked

### Music

With the exception of one or two minor volume issues, I'm pretty happy with the
music I made. There is a different song for each menu screen or level, and
although they aren't going to win any prizes, given its the first time I've
tried to make music I don't think the songs are too horrendous.

### Artwork

The artwork was very basic low poly stuff and I quite like the look of the black and white planets before colour is returned to the universe. Its very basic as a few comments have noted, but yeah "programmer art".

![Programmer art at its finest (size: 900x500px)](/images/ld32-colour-rocket.png)

### Controller

I tried something a bit different with the player controller. The player's
rocket is always at `(0,0,0)`, and the asteroids move around the player. I can't
really say I have a logical reason for doing it this way other than it meant I
didn't have to think about the camera or moving cleanup/spawn regions. In the
end I think this worked ok.

## What didn't work

There were a couple of areas where the game clearly fell short. Although its
promising to think that most of these would have been easily solved if I'd spent
more time on them! In no particular order...

### Obstacles

My method for slinging asteroids towards the player was to spawn a whole lot at the back of the screen. However this lead to disconcerting "pop in" in the background as asteroids were recycled. As the asteroids were rigid bodies with collisions, it also meant that the target planet effectively carved a tunnel in to the asteroid field that would sometimes let the player travel through the whole level without touching the controls... oops!

![Going through an asteroid tunnel (size: 900x500px)](/images/ld32-colour-rocket-2.png)

I fixed the pop in issue by running a coroutine to gradually scale asteroids up
from 0 to 1 as they were spawned in, but the difficulty and asteroid placement
proved to be a bit more difficult. I tried adding some pre-existing asteroids
which improved things a bit, but I think if I'd had more time I should have:

- created some more larger static obstacles,
- created more asteroid spawn points to the sides, shooting asteroids across the
  player's path
- had the target planets move around instead of sitting still 

### User Feedback and

UI Many of the comments so far have been along the lines of "the controls
stopped working". At first I thought this was a weird bug I hadn't seen, then I
realised that it was probably related to one of the game mechanics I'd
implemented.

So that players can't just mash the controls non-stop, the rocket has a limited
amount of fuel. The idea was to make the player chose between getting hit by an
asteroid and running out of fuel by moving too much. (Move around too much and
you lose the ability to manoeuvre).

On realising that players were thinking of a game mechanic as a big, my first
reaction was in truth a bit defensive...

> well, it mentions fuel on the first screen and there is a fuel bar on the GUI,
> so it should be obvious, right? RIGHT?!?!?!!?!".

Then I realised that the comments were actually letting me know that the game
mechanic was a bit too obscure. To be "intuitive", every important player action
in the game needs to have visual or audio feedback.

It wasn't enough to hope the player read three paragraphs of text, or noticed a
small fuel bar in one corner of the screen - I needed flashing text, colour or
sounds to notify the user they were about to run afoul of a crucial game
mechanic.

This is even more important in something like Ludum Dare where players may only
spend a minute or two with your game.

## What I learned

To summarise, there were two main lessons for me from this Ludum Dare entry:

1. Don't get defensive about feedback - listen to what the players are saying,
   and try to work out why they are saying it. 
2. Audio and visual cues are critical for communicating game mechanics. 

I enjoyed the weekend a lot, and I've been playing and enjoying some of the
other entries. Bring on the next Ludum Dare!