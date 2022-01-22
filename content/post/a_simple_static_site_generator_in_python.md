+++
title = "A simple static site generator in Python"
description = "A description of a simple static site generator I built in Python"
date = 2014-03-18

aliases = ["/a_simple_static_site_generator_in_python", "/post/a_simple_static_site_generator_in_python"]

[taxonomies]
tag = ["tutorials", "code"]
+++

## What is a static site generator?

A static site generator is a bit of code which takes input files, for instance
from Markdown files or from another source on the web, and builds a website from
it. For it to be static, the website is usually just plain HTML. Static site
generators are handy because they remove a lot of the complexity of using a
server based site such as Wordpress or a custom Django blog, and instead let you
just focus on the content. They are better than traditional HTML web pages
because they let you apply templates to style your HTML pages just like any
other server based site.

When I needed to make a manual for the data acquisition system I have been
building, I decided I wanted to write the content in Markdown and use a static
site generator to build the web pages for me. These pages (when ready) can then
be dropped onto a web server or github pages.

## Why make my own?

I've used [Pelican](http://www.getpelican.com/) on a number of sites including
the one you are browsing at the minute, and have found it to be pretty good. Yet
as the software matures they are splintering the code base, putting plugins in
one repository, themes in another and the core site generator in a third. This
means I have to install and maintain three different repositories and bits of
software on my computer to generate a static site. This is a pain. It also means
that since I got it working on my Linux install and haven't really been bothered
to get it working on my Windows machine, every time I want to update the site I
have to reboot into Linux.

So for the manual I looked around and there are [a lot of different site
generator options](http://staticsitegenerators.net/) - over 230 to be exact. A
lot of the more popular ones have all the bells and whistles, plugins, command
line tools, test servers, different input formats, you name it. At the end of
the day all I want to do is to take a bunch of Markdown files, convert them into
HTML and spit out a website with the same directory structure as my input files.
Rather than download 230 tools until I found one that worked I just decided to
bake my own.

## How it works

> The source code is available (MIT licensed) [in this
> gist](https://gist.github.com/will-hart/9609188) or [on my
> website](/python-static-site-generator)

The generator uses `Jinja2` for templates and `Markdown2` for rendering
Markdown. It uses the `metadata` Markdown extra so that you can specify the
template and any context variables for the template in your Markdown. A Markdown
document with metadata could look like:

```markdown
---
title: My cool article
keywords: article, cool, my, python, ftw
template: index.html
---

# This is a Markdown document

There are many like it but this is mine
```

Thats it - normal Markdown for the most part. If you don't specify a template in
the metadata then `index.html` will be used and if you haven't got an
`index.html` in your templates folder the script gives up and dies. The
generator relies on a set directory structure:

```txt
root
 |----src
 |     |---- # your markdown files in here in any directory structure you like
 | 
 |----templates
 |     |---- # your Jinja2 templates go here
 |     |----static
 |     |    |---- # CSS files, javascript, etc go in the static folder
```

When you run the generator it converts all the Markdown files in the `src`
directory into HTML, applies the correct template from the templates folder and
puts it all in the `output` folder. It copies the `static` directory to build as
well so you have your CSS and javascript.

This approach makes it really easy to link between files or insert images. All
you have to do is write the Markdown as you normally would. I add an images
folder to the src folder and throw all my images in there. By setting the
`STATIC_DIRS` variable in the script I can ensure the images get copied over to
the build directory.

To build a site, assuming you have downloaded the script as `build.py` you just
run

```bash
$ python build.py
```
