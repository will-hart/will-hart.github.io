---
title: demarcate.js 2 redesign
tags:
  - code
  - projects
authorName: Will Hart
publishedDateString: 25 Aug 2013
---

## Background

demarcate.js is an "in-place" editor for Markdown that is free and open source.
It is designed to be a text editor which integrated directly into the browser
and lets you edit in a what-you-see-is-what-you-get (WYSIWYG) way. When you are
finished editing - **HEY PRESTO!** - without having to type any Markdown you
have a properly formatted Markdown document. demarcate.js is [available on
github](https://github.com/will-hart/demarcate.js).

## Issues with version 1.x.x

demarcate.js was an experiment which grew out of my desire for a browser text
editor that could easily push out Markdown. However version 1.x.x did have some
issues:

1. mobile browsers weren't supported
2. the UI was a bit clunky to use
3. the UI code was a bit ugly
4. it required jQuery and showdown to operate

With this in mind I embarked on a review of demarcate.js.

## contentEditable

The first thing I decided was that the clunky textarea based editing had to go.
It required a lot of hackish code to resize the `textarea` based on formatting,
and needed a lot of DOM editing and removal. I decide to use the
[contentEditable](https://developer.mozilla.org/en-US/docs/Web/HTML/Content_Editable)
feature that virtually all modern browsers
([http://caniuse.com/#search=contenteditable](http://caniuse.com/#search=contenteditable))
support. This allows a much richer UI and through use of a few shortcut keys can
be made to work closely to a "desktop" word processor.

## Modularity

In working on Blitz Logger recently I've had to think a lot about modularity.
One of the upsides of this is that I've had a bit more practice. demarcate.js
now exposes a single `parse` function which is used to convert the HTML DOM into
Markdown. This parser self-registers against the demarcate library and is a
separate object in its own right. This makes it much easier now to override the
Markdown parser with a custom one such as the jQuery based parser from version
1.1.4 or even perhaps a restructured text one?

## Coming Soon

Demarcate.js 2.0 is nearly ready for release. You can have a look at the develop
branch on github.
