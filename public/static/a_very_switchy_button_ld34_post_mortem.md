---
title: A very switchy button, LD34 Post-Mortem
summary: A look at my Ludum Dare 34 entry, a game to scratch that switch switching itch.
tags:
  - gamedev
authorName: Will Hart
publishedDateString: 20 Dec 2015
---

![Screenshot of the game in action](/images/switchy-button-ld34.png)

[Play the game here](http://ludumdare.com/compo/ludum-dare-34/?action=preview&uid=50407) | [View the source code here](https://github.com/will-hart/ludum_react_boilerplate/tree/ld34)

## The Concept

I had the idea for Button Simulator, my LD34 entry, while watching a crappy
science fiction movie. The characters sat at their space ship consoles, flicking
switches and pressing buttons. There was something strangely entertaining about
the experience - the link between human and machine - a sense of power, and a
satisfaction in being able to control the world around you with just a flick of
your fingers.

I suppose its also the same little itch that DCS A-10 and its hard-core
simulator siblings scratch, or [this mission control
desk](https://www.youtube.com/watch?v=j6zseFi070E). But how to translate a
switch flicking simulation into something that was fun to play and could be
completed in a weekend?

I suppose I completed the process back to front - instead of using the theme to
generate a game idea, I used the theme to flavour the game idea I already had!
In the final days leading up to the theme announcement I took the 20 final
themes and wrote a short paragraph - a "hook" - for as many themes as I could
that set out how my game idea would fit into each theme. My hook for the
"growing" theme was:

> "Last year's crop wasn't that great,
> and unfortunately we had to let Freddy go...
> ...from altitude.
> Don't let the crop die"

This turned out to be pretty close to the final intro text. Even if my approach
was back to front it meant that although I wasn't ecstatic about the themes that
were announced, at least I had something ready to go.

## Making the game

My last Ludum Dare entry was probably the worst thing I have ever publicly
released. I wasn't happy with it at all, and I think it was because I didn't
have a solid concept in mind before I started, and as such was a bit all over
the place. This time I decided to do a lot more planning and so I spent the
morning of the first day jotting down some thoughts and scribbling out the UI.
My idea was that there was a relatively old fashioned computer terminal that
controlled the growth of a crop. You had to flick switches and turn dials to
manage light, food and water, and keep the crop growing.

I had decided ahead of time to make the game using React.js and Redux. I've
played around with web interfaces using these technologies, but I was curious to
apply the Redux/Flux methodology to a game. (If you aren't aware of React/Flux
then its worth reading up on, if nothing else as another way to approach
application design) As it turned out React was very well suited to the type of
game I made and I felt it helped me develop very rapidly and relatively bug
free. Hot reloading (i.e. when you save the source the changes get immediately
injected into the browser) is a massive productivity increase, particularly when
playing around with styles and layout.

I could probably have made more use of ES6 and javascript features, in
particular a lot of my game logic could have been simplified using a few calls
to Array.reduce(), and I should probably have used selectors for some of my UI
code, however overall I'm happy with the way the code base turned out. Would I
use React again for another LD entry? Depending on the type of game, yes I
probably would.

I used Inkscape for the graphics and Audacity to make the sounds. The sounds
effects were all bundled in a single file and I used Howler.js to treat them as
a sound sprite. I think the buttons have a really nice tactile feel to them, and
at least some of you agree.

## How it was received

Most comments have been positive, although time will tell what people have
actually rated the game!

I did wonder a bit about the difficulty level. As I made it and am aware of the
logic, I can win quite easily. However for other players (although its not meant
to be an easy game) a lot of the comments have been that its a bit confusing and
challenging. I did put in some help tucked away in one corner which explains a
lot of the mechanics (and one of the game screenshots shows the help screen),
but many players didn't seem to find the option.

I'm a bit torn about this feedback - the "plot" of the game is that you have no
idea what you are doing, so providing any sort of help is kind of breaking that
premise. At the same time the game is meant to be fun. I think in future I'll
make the help button a bit more prominent.

## What now?

I'm thinking of making the game into a sort of multiplayer party game that I can
play with my mates. This could probably be done in React using RethinkDB and
websockets, however in this case I think I'll do it in Unity as I want to try
out Forge Networking. I do want to bring a lot of the React/Flux mentality to
the C# version though, where appropriate, particularly the idea of a single
global state - although I think I'll discard some of the immutability Flux
favours for its state.

[Play the game here](http://ludumdare.com/compo/ludum-dare-34/?action=preview&uid=50407) | [View the source code here](https://github.com/will-hart/ludum_react_boilerplate/tree/ld34)
