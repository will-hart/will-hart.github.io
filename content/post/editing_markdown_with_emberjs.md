+++
title = "Editing Markdown with Ember.js"
description = "A quick tutorial on building a custom EmberJS text editor using demarcate.js"
date = 2013-06-21

aliases = ["/editing_markdown_with_emberjs", "/post/editing_markdown_with_emberjs"]

[taxonomies]
tag = ["code", "tutorials"]
+++

If you read my rather lengthy [beginning ember.js
tutorial](/an-emberjs-beginners-tutorial) you may have an inkling that I'm
rather taken with the new kid on the block. I recently started thinking of ways
that I could use my demarcate editor in Ember applications.

## The DemarcateEditor view

The answer turned out to be incredibly simple, thanks to some code from [Kasper
Tidemann](https://github.com/KasperTidemann/ember-contenteditable-view/blob/master/ember-contenteditable-view.js).
By adding only a couple of lines, I've taken Kasper's code and turned it into a
demarcate backed WYSIWYG Markdown editor. You can see the ~~live demo~~ (no
longer available) and as usual, the source is on
[github](https://github.com/will-hart/ember_demarcate_adapter_example).

> **NOTE** At the moment you need to be on the develop branch of demarcate to
> access 2.0 features.

To make the `contenteditable` view demarcate enabled, I had to change two lines of
code. In the `didInsertElement` I added a line:

```javascript
demarcate.enable(this.$().get(0));
```

Which simply takes the view's DOM wrapper and enables it as a demarcate editor.
To parse the DOM tree into markdown when the contents of the view's `div` changes,
I added a call to `Ember.run.debounce` in the `keyUp` method:

```javascript
Ember.run.debounce({'component': this}, function () { 
    this.component.set('markdown', demarcate.parse());
}, 1000);
```

The `Ember.run.debounce` is quite a nifty little Ember function. "Debouncing" is
a common theme in microcontroller hardware design. It refers to the real life
effect where pushing a button may actually result in a rapidly oscillating or
"bouncing" electrical signal. This needs to be smoothed or "debounced" so that
the micro-controller only reacts to a button being pushed once.

In this case, as parsing a large HTML DOM into markdown may take a bit of
effort, we don't want to do this every time the user presses a key. The `debounce`
method basically sets a timer (in this case for 1000 milliseconds) and restarts
the timer if the function is called again during the timeout period. In other
words, the call to `debounce` in this case makes `demarcate.parse()` wait for a
pause in `keyPress` events longer than 1 second.

## A demo application

Creating a demo application requires only a few lines of code. First I create an
Ember application:

```javascript
App = Ember.Application.create();
```

I also define an Application controller:

```javascript
App.ApplicationController = Ember.ObjectController.extend({
    editorHTML: "<h1>Instructions</h1>Edit <strong>your</strong> document here, and <i>see</i> the Markdown appear  next door &gt;&gt;",
    markdown: "# Instructions\n\nEdit your **document** here, and *see* the Markdown appear next door >>"
});
```

This has two properties - `editorHTML` which will be bound to the the current
HTML of the contenteditable, and `markdown` which will be bound to the parsed
markdown of the contenteditable. Here, I've hard coded the HTML and markdown
strings to initialise the values. In real life you will probably have Markdown
stored in a database and will use something like `showdown.js` or your backend's
Markdown parser to build up the HTML.

Finally, to make the HTML and markdown render correctly (and safely) in the
browser, a little handlebars helper is required. This just makes the text safe
(strips tags) and converts newlines to `<br>` tags.

```javascript
Ember.Handlebars.registerBoundHelper('breaklines', function(text) {
    text = Ember.Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Ember.Handlebars.SafeString(text);
});
```

All we need then is a template in our index.html:

```html
<script type="text/x-handlebars" id="application">
    <div class="editor">
        {{view Ember.DemarcateEditor valueBinding="editorHTML" markdownBinding="markdown"}}
    </div>
    
    <div class="output-wrapper">
        <div class="markdown">
            {{breaklines markdown}}
        </div>
        <div class="html">
            {{breaklines editorHTML}}
        </div>
    </div>
</script>
```

This just includes the `Ember.DemarcateEditor` view in the template (which is
defined in a separate file) and then outputs the HTML and markdown in the view
for comparison. Of course some CSS is required so it doesn't look too horrible.

> **Note** that for the view I've included markdownBinding="markdown". This is
> because the value of the contenteditable is it's HTML, so a separate binding
> is used for the markdown output.

## Building an Ember.Component

If you listen to the Ember experts talk - for instance [this video on
Components](http://www.youtube.com/watch?v=zC7o1YkmkG0)
- then Ember's Components are the future. Basically they are reusable bits of
interface which provide a simple interface for binding data and responding to
events. We can convert our DemarcateEditor view into an Ember.Component quite
easily.

Firstly, we need to add a template to our `index.html`:

```html
<script type="text/x-handlebars" id="components/demarcate-editor">
    {{editorHTML}}
</script>
```

This fairly trivial bit of code simply creates a template (note the
`components/` in front of the ID, which tells Ember its a component template)
and outputs the `editorHTML` variable using a Handlebars tag. Next we need to
update our `application` template so that it imports the Component rather than
the View. This turns out to be quite simple as well.

Replace the line

```javascript
{{view Ember.DemarcateEditor valueBinding="editorHTML" markdownBinding="markdown"}}
```

with the line

```javascript
{{demarcate-editor value=editorHTML markdown=markdown}}
```

Ember recognises that the `{{demarcate-editor ...}}` tag is a reference to a
`DemarcateEditorComponent` object. It also realises that we want a template with
ID `components/demarcate-editor` to render the component. The `value` and
`markdown` attributes are bindings to variables on the controller scope, even
though we don't have the `Binding` keyword which the view requires. In this
case, our Application controller has properties `editorHTML` and `markdown`, and
the Component will reference these properties.

> **NOTE** As the properties passed to the component are bound, when the
> Component changes the properties then these changes will propogate to any
> reference within the template, and also back up in to the controller itself.
> Similarly, if another component or the controller changes the property, then
> the changes will automatically propogate into the component.

We also need to do is to provide the code behind the component. In this case,
its a simple matter of renaming our view to a component.

```javascript
Ember.DemarcateEditor = Em.View.extend({ ... });
```

becomes

```javascript
App.DemarcateEditorComponent = Em.Component.extend({ ... });
```

The naming is important - the words must be capitalised, and the last word must
be `Component`. When searching for the correct class to use, Ember removes the
word `Component`, replaces each word with its lowercase equivalent and separates
them with dashes. In this instance, `DemarcateEditorComponent` becomes
`demarcate-editor` which we used in our template above.

## Component vs View

There was little difference between the implementation of an `Ember.Component`
and an `Ember.View` and the functionality itself was identical. Both provide a
way to encapsulate particular behaviours in a reusable front-end class. They
make your templates neater and more concise. In addition, the restricted
interface provided by Components makes them easy and predictable to use. Ember's
Components try to predict the way that the HTML specification will evolve in the
coming years so are a good tool for new applications.

Either way, building an Ember / demarcate editor proved to be a piece of cake!
