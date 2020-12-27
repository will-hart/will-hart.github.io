---
title: Switched to Ghost
tags:
  - random
authorName: Will Hart
publishedDateString: 27 Apr 2015
---

I had a look at my website the other day and I realised that the last time I
posted anything was March 2014, over a year ago. Prompted by an [article on
dailyjs](http://dailyjs.com/2015/04/23/migrating-dailyjs-to-ghost/) I decided to
give [ghost](https://ghost.org/) a go.

I've had my eye on ghost for some time but never made the plunge as I couldn't
work out a neat way to redirect my old static website URLs to a new ghost
instance. The dailyjs article is quite straightforward, it just uses a JSON file
to describe URL redirects and sets up listeners in an express app which contains
Ghost. My implementation is very slighlty different as it lets me use the ghost
config file to specify the base URL, which is useful for testing. The entire
code is trivial at about 20 lines.

```javascript
var ghost = require('ghost');
var express = require('express');
var app = express();

var redirects = require('./redirects.json');

ghost({config: __dirname + '/ghost-config.js'}).then(function(ghostServer) {
  app.use(ghostServer.rootApp);

  redirects.forEach(function(redirect) {
    console.log('Redirecting %s to %s', redirect[0], newUrl);

    app.get(redirect[0], function(req, res) {
      res.redirect(redirect[1]);
    });
  });

  ghostServer.start(app);
});
```

My `redirects.json` file looks like:

```json
[
    [
        "/charlieplexing-leds-with-arduino.html",
        "http://www.williamhart.info/charlieplexing-leds-with-arduino/"
    ],
    ....
    ...
]
```

I'm not setting myself a target or anything like that but going back to a CMS
should make it easier to post new articles when something comes to mind (for
instance updating my old Ember tutorial which is past overdue!)

> **NOTE** I've since noticed that disqus comments haven't properly migrated
> over. I've mapped them in the disqus interface using a CSV file but they don't
> appear on the post. I'll keep investigating.