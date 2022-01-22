+++
title = "Thesis writing in Markdown - pandemic and pandoc"
description = "A description of the build system I'm using to build my PhD thesis in markdown and LaTeX"
date = 2019-05-16

aliases = ["/thesis_writing_in_markdown_pandoc_and_pandemic", "/post/thesis_writing_in_markdown_pandoc_and_pandemic"]

[taxonomies]
tag = ["tutorials", "phd"]
+++

I'm in the closing stages of my PhD (I hope), and beginning to write up some
chapters. As my PhD is heavy on analysis, data and modelling, I've found writing
in Word or LaTeX to have a lot of shortcomings that I'd really like to overcome.
Word is simple to use but citations are a bit clunky and the typography isn't
particularly nice. On the other hand, LaTeX looks nicer but is a lot more work
to get right. There are also some complications - for instance, what if I just
want to build one chapter at a time?

I guess I've been spoiled for choice in the Node / Python / C# worlds where you
can usually just type yarn build or yarn start and out pops a functional web
app. Is there a similar build system for academic documents? It turns out there
isn't, at least not a good one, but it isn't too hard to cobble together a
Frankenstein to do the job.

What features would a build system have? The first step was to work out what
sort of features a thesis build system would have. The core requirements are:

1. **Citations and a bibliography**,
2. **Variable substitution**, so that analysis results can be exported to JSON
   files and then the values automagically inserted in the correct location in
   the text,
3. **Build up multi-part figures**,
4. **Automatic cross references**, I don't want to have to think about fixing
   `Figure 6.15` when I insert a figure in between, and I want to be able to
   reference between chapters even if they are in separate documents,
5. **Single command build**, being able to compile the document with one click
   or CLI command

There are some nice to have features as well:

1. **Write in a plain text language**, i.e. Markdown? as much as possible
2. **Build the entire document or single chapters**, so I can send a chapter to
   a supervisor for review
3. **Various export formats**, so that I can send Word, Markdown, LaTeX or PDF
   formats as required

## Wait, doesn't this already exist?

Well, yes in a word, `pandoc` does a lot of these things already. In the list
above there are only a few things that I don't think pandoc can do out of the
box - building multi-part figures and building entire document or single
chapters (although this could probably be achieved with a batch file or
similar). However managing the different commands required for all the export
formats and options that I want to build would be a bit tricky.

Luckily, I found [`pandemic`](https://github.com/lionel-rigoux/pandemic) which
is a `pandoc` CLI for building documents from "recipes". pandemic `recipes`
allow multiple export formats, and different filter combinations and so on per
recipe. It also has `prehooks` which let you define CLI commands that should run
before pandoc to either preprocess the document or run side effects.

Once a recipe is defined, pandemic can be used to build up a chapter by running
a single CLI command:

```bash
pandemic publish manuscript.md
```

Or if a particular recipe is required:

```bash
pandemic publish -f tex manuscript.md
```

## Cobbling it together

At this point I got a bit medieval and cobbled together what can only be
described as an abomination!

Using PowerShell scripts, pandoc and pandemic I set up a document build system
that converts the raw Markdown documents to LaTeX after running some filters,
copies the files to a build directory, merges all the chapters into a single
document and builds it several times with XeLaTeX. I used a `handlebars` prehook
for `pandemic` to swap variables in the form `{{{variable_name}}}` in the text
from files output by my Jupyter notebooks. I manually run commands for
`it-figures`, my node library for building multi-part figures on each chapter.

By running a separate command I can output a chapter in a standalone tex file. A
single chapter is built like this:

```powershell
function BuildChapter {
  Param([String]$chap)

  Write-Output "Building Chapter $chap"

  # build figures using `it-figures`

  Set-Location .\$chap\figures
  figures b panels.json

  # build the manuscript

  Set-Location ..\
  pandemic publish manuscript.md

  Set-Location .\_public

  # add a few newlines to the markdown to force a latex break

  Add-Content -Path manuscript.build -Value "`r`n`r`n"

  Move-Item -Path manuscript.build -Destination ..\..\.build\$chap.md -Force

  New-Item -ItemType Directory -Force -Path ..\..\.build\.tex\$chap\images
  Copy-Item ..\images\* ..\..\.build\.tex\$chap\images\ -Force -Recurse
  New-Item -ItemType Directory -Force -Path ..\..\.build\.tex\$chap\figures
  Copy-Item ..\figures\* ..\..\.build\.tex\$chap\figures\ -Force -Recurse

  Set-Location ..\..\
}
```

Then the document is built like this

```powershell
function BuildDocument {
  Param([String]$chaps)

  Set-Location .\.build

  cat $chaps | pandoc -s --top-level-division=chapter --template ..\template\thesis.tex -f markdown -t latex -F pandoc-crossref -M "crossrefYaml=..\template\crossref_settings.yaml" --natbib -o .\.tex\thesis.tex

  Set-Location .\.tex

  xelatex -quiet thesis.tex
  biber thesis.bcf
  xelatex -quiet thesis.tex
  xelatex thesis.tex

  Move-Item -Path thesis.pdf -Destination ..\..\thesis.pdf -Force
  Move-Item -Path thesis.tex -Destination ..\..\thesis.tex -Force

  Set-Location ..\..\
}
```

I'm not sure if this overly complicated approach is a good one, but it lets me
write in Markdown, and automatically update figures and variables in my text if
the analysis changes, and then publish in LaTeX with only a single command. This
is quite satisfying, although if something goes wrong it will probably take
quite a while to sort out.

I'm guessing that before I start getting serious feedback from my supervisors
I'll probably "eject" from the build system and go back to working in pure
LaTeX. At that point it will be handy to be able to run diffs on the text I get
back from my supervisors without having to convert to and from Markdown.

In the meantime, at least I'm entertained?
