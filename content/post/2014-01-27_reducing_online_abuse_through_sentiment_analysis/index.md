+++
title = "Reducing online abuse through sentiment analysis"
description = "A look at how to use Sentiment Analysis to detect 'star wars tweets', in the context of addressing abusive behaviour on social media platforms"

aliases = ["/reducing_online_abuse_through_sentiment_analysis", "/post/reducing_online_abuse_through_sentiment_analysis"]

[taxonomies]
tag = ["code", "projects", "tutorials"]

[extra]
use_maths = true
+++

## Cleaning up Twitter

Recently the issue of on-line abuse has received a lot of play time in the news.
In the UK several prominent female figures were sent death threats through
Twitter after they campaigned to have a female (other than the Queen) on a UK
bank note. Articles such as this one by [Pacific Standard
Magazine](http://www.psmag.com/navigation/health-and-behavior/women-arent-welcome-internet-72170/)
present a chilling picture of the state of on-line media and its treatment of
women, and the lack of a clear policy from law enforcement agencies. As a result
of the UK episode two people were arrested and jailed, however many more escaped
without penalty.

The explosion of on-line media has generated a range of compelling, complex and
large scale issues that we have only slowly begun to adapt to. For instance, how
much should Twitter and other social media outlets be required to police what
goes on using their services? In the past phone companies were not held to
account for what people said over the phone lines. However tweets and the
facebook posts are both public and persistent. Does this impose a new burden of
responsibility for these companies? And if there is, what can they actually do
about it?

From wild supposition I would imagine that you can divide the abusers into two
different groups. The first is those who are doing it for "a bit of a laugh",
without considering the impact it has on the victim. The second group are
potentially conducting this behaviour as as symptom of wider social or mental
issues. The behaviour of the first group is probably open to influence, through
making them aware that what they are doing has both social and legal
consequences. However, the second category of abuser is unlikely to be managed
through actions undertaken by Twitter.

## What can be done?

From a technical standpoint, one possible way to "jolt" the first group into
modifying their behaviour is through a visual cue in the browser. Something that
alerts the user if the tweet they have typed (and are about to "send") appears
to be abusive. For instance, the message could read:

> WARNING - the message you have typed appears to be abusive. Your IP address
> has been logged and on-line abuse can be a criminal offence.

Upon seeing a message like this, the casual abuser could hopefully be prevented
from hitting the "send" button.

Determining if a tweet is "good" or "bad" falls under a the heading of a
"classification problem". In these problems a computer must categorise a data
point, usually based on a small and finite number of possible states. In the
case of natural language (i.e. text), this technique is frequently known as
"sentiment analysis", and is supposedly used by business such as Amazon to
detect the tone of reviews written on their site. This involves an algorithm
which looks over a sentence or slab of text, and tries to work out if the mood
of the text is positive or negative based on the prevalence of certain words or
word patterns. In the remainder of this article I'll attempt to build a
classifying algorithm for tweets, and see if it could have applicability to
"cleaning up Twitter".

## Sentiment analysis

The basic approach is often quite simple:

1. Count the number of times words appear in the text
2. Work out which words are more common in good or bad text and see if these are
   present in our text
3. See if there are more good or bad words in our text

The first part involves some basic string manipulation, and is often referred to
as "vectorisation" of text. For short sentences like Tweets (with 160
characters) this would be quite easy to do. One complication may be that the use
of abbreviations and "text speak" (or whatever the kids are calling it these
days) would mean that the number of words that would need to be tracked as good
or bad would grow.

A number of different rules can be applied to perform steps 2 and 3. The most
common of these use some sort of probability theory - for instance the
probability that the word "LeBron" will appear in a tweet if it is about the NBA
can be calculated. Some sort of formula can then be calculated to determine how
likely it is that a tweet is good or bad based on this probabilities. This type
of technique, as we shall see, is usually referred to as some form of *Bayesian
classification*.

## Classifying tweets

### Approach

To perform this task, I decided to use a *Naive Bayes* approach, which makes
some simplifying assumptions and uses *Bayes Rule* to mathematically formulate
the problem. In words, we are trying to answer the following question:

> What is the probability the tweet is bad given it has the following words in
> it: ....

The word *given* has a specific role in probability - for instance
$P(apple|fruit)$ means "the probability we have an apple given we have a fruit".
If you don't remember your high school probability - if we are holding an
object, the probability it is an apple rather than any of the other objects in
the universe is, for instance, 0.00001%. However if we are told that what we are
holding is a fruit, the probability that object we are holding is an apple given
we are holding a fruit becomes much higher, say 30% if my fruit bowl is anything
to go by.

The Naive Bayes approach relies on some simple rules to formulate our word
problem above. into mathematical symbols. This could look something like the
following (from the `scikit-learn` documentation):

$$P(y|x_1, ..., x_n) = \frac{P(y)\Pi_{i=1}^nP(x_i|y)}{P(x_1, ..., x_n)}$$
​

Where `y` is the "good"/"bad" classification and `x` variables are the words in
the tweet.

If this is gibberish to you, don't despair its not really necessary to
understand the maths in detail. All this is saying is that to work out if the
tweet is bad - given the presence of a whole bunch of words - we multiply
together the probability that each of the words is present given the tweet is
known to be bad - $\Pi_{i=1}^nP(x_i|y)$. For instance, words such as `the` and
`you` may be equally likely to be present in good or bad tweets, whilst other
words are much more likely to be present in bad tweets alone.

### An Example

If our tweet contains the words "Chocolate tastes great", then the mathematical
formulation would become:

$$P(bad|chocolate,tastes,great)=\frac{P(bad)\times P(chocolate|bad)\times P(tastes|bad)\times P(great|bad)}{P(chocolate,tastes,great)}$$

Where $P(chocolate)$ is the probability the tweet contains the word "chocolate".
The probability the tweet is good would be given by:

$$P(good|chocolate,tastes,great)=\frac{P(good)\times P(chocolate|good)\times P(tastes|good)\times P(great|good)}{P(chocolate,tastes,great)}$$

To work out if the tweet is good or bad, we can just compare which of these
probability is greater, e.g.

$$P(good|chocolate,tastes,great) > P(bad|chocolate,tastes,great)$$

As the denominator of the fraction is the same on both probabilities, we only
need to compare the top lines of the fraction.

I tend to code in Python given the wide range of libraries available for
scientific computing. Classification problems are no exception, as Python's
`scikit-learn` includes Naive Bayes functionality based on the mathematical
formulation above. `scikit-learn` can be installed by typing into the command
line:

```bash
pip install scipy
pip install scikit-learn
```

> On Windows I've found it easier to use a Python installation such as WinPython
> for these kinds of tasks as pip sometimes seems to struggle with building
> packages on Windows. On Linux the above should work without a hitch.

### Building a probability matrix

As we can see from the slightly horrible maths expression we used above, a Naive
Bayes just multiplies together a whole bunch of probabilities. This problem can
be made much easier for computers if we pre-build our probabilities, a process
known as *training* our algorithm. This requires a data set of known results - a
"training set" - which helps us build a probability matrix. This has the likely
outcomes (good/bad tweet) as rows and the recorded words as columns. The values
in the matrix indicate the conditional probabilities - the chance the word is in
the tweet if it is either good or bad. For instance the following simplified
matrix could exist to determine if a tweet is related to the Star Wars movies:

```
|---------|-------|------|
| Word    |  Bad  | Good |
|---------|-------|------|
| Wookie  | 0.56  | 0.03 | 
| Star    | 0.75  | 0.19 |
| Wars    | 0.79  | 0.32 |
| Ireland | 0.04  | 0.13 |
|---------|-------|------|
```

Reading across, we can see that the probability the tweet contains the word
"wookie" given it is bad (i.e. related to Star Wars) is 0.56 or 56%. This matrix
is quite small, and in a real life situation would likely contain thousands of
columns. Storing and traversing this efficiently is quite a complex task!

### What does a training data set look like?

To train our Naive Bayes classifier we need some kind of learning data set. This
would contain as many tweets as we could find and a flag to indicate which of
these is considered "bad". As I don't really want to upload and work with a data
set filled with despicable words and phrases, we will continue with our example
of detecting if our tweets are related to the Star Wars movies. For instance the
following (made up) tweets are considered Star Wars related:

> Luke Skywalker is not MY father    
> Darth Vader spotted in the Dagobah system    
> My Jedi mind tricks are amazing - just got a pay rise    
> Episode 1 is horrendous

Whilst the following would not be related:

> My coffee tastes like bilge water    
> It's raining cats and dogs    
> Sometimes I look at the stars and cry    
> New satellites are taking war to the stars

From looking at some of these made up examples, it is clear that this problem is
more difficult than first thought. For instance:

- Should the tweet about "Jedi mind tricks" be considered to be about Star Wars?
  Its referring to Star Wars but is not directly related
- without context, how do we know if "Episode 1 is horrendous" is Star Wars
  based?
- Other tweets such as the last one talk about "star" and "wars" but are not
  related to "Star Wars" - only by reading the context and proximity of words
  can we work out whether this tweet should count

This is a weakness of the "bag of words" approach we are using here, and can
easily lead to "false positives" - where we incorrectly identify a tweet as
"Star Warsy" - or "false negatives" - where we say a tweet is not related to
Star Wars when it is. Whilst a percentage of false positives is probably
unavoidable, the objective is to improve the accuracy as much as possible so
that these false classifications are the exception rather than the rule. In
general a larger training dataset will make the classifier more likely to
correctly group our tweets.

The training set should be as large as possible but also as close to "reality"
as possible. For instance, a review of the equations above show that the final
classification is also dependent on the probability that a tweet is good or bad
- $P(y)$. This means that we should ensure the dataset is representative of real
life data - if we increase the proportion of bad tweets in our training dataset
then we increase the likelihood the algorithm will classify a tweet as bad.

### Gathering the data

In a real life situation we would probably need to gather thousands of tweets,
manually classify each one and then split this data into training and testing
data sets. This task would be quite time intensive. Luckily for a demonstration
like this we can create a basic twitter API script in Python to do a good
approximation of this task for us. There are quite a few different twitter APIs
written in Python, but the one that seemed to work the best for me was `tweepy`. I
installed this in the usual way (`pip install tweepy`) and then wrote some very
simple code to search for tweets.

```python
from tweepy import API as TweepyApi, OAuthHandler

def search_tweets(search, count=15):
    
    auth = OAuthHandler(
        MY_SETTINGS.consumer_key,
        MY_SETTINGS.consumer_secret
    )
    auth.set_access_token(
        MY_SETTINGS.access_token_key,
        MY_SETTINGS.access_token_secret
    )

api = TweepyApi(auth)

result = api.search(q=search, count=count, lang='en')
return [x.text.encode('ascii', 'ignore').replace('\n', '') for x in result]
```

`MY_SETTINGS` is a dictionary I imported from another file with my API
credentials - so that they are hidden from github. To get 20 tweets about star
wars, I can run the following:

```python
star_wars_tweets = search_tweets("star wars", 20)
```

This takes care of the bad tweets. To get the "good" tweets, we need a wide
sampling of random tweets. I played around with the streaming `sample()` API but
found that no matter what I did it denied my credentials - maybe I'm missing
something obvious? In the end I just decided to get some tweets for a few
unrelated topics such as "emberjs", "nba", "superbowl", "science" and "bieber".
Whilst this data set will be definition be incomplete (and reduce accuracy) its
a simple way to get enough data for a proof of concept.

By wrapping this code in a class and adding some helper functions I was able to
generate several hundred good tweets and 200 bad tweets in very short order. I
could repeat this process (after a short break to allow new tweets to
accumulate) to get another bunch of test data.

### Building the classifier

The next step was to build the classifier itself. Lets jump straight into some
code.

```python
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.naive_bayes import MultinomialNB

def train(expected):
    """
    Teaches the classifier based on the data set passed in the constructor
    """

    # use a utility function to load the data set and expected results (0 = good, 1 = bad)
    raw_data, expected = load_dataset()

    # STEP 1: vectorise the text
    vectoriser = CountVectorizer(lowercase=True, strip_accents='unicode')
    res = self.vectoriser.fit_transform(raw_data)

    # STEP 2: Apply "Term Frequency times Inverse Document Frequency" methodology
    transformer = TfidfTransformer()
    res = self.transformer.fit_transform(res)
    
    # STEP 3: use a multinomial classifier to generate probabilities
    self.classifier = MultinomialNB()
    self.classifier.fit(res, expected)
```

Using `scikit-learn`, building a classifier is very simple, and only three main
steps were required.

1. We 'vectorise' the text using a `CountVectorizer`. In English this means that
   we count the number of times each word appears in the tweets and create a
   dictionary with the word as a key and the count as the value.
2. We 'transform' the data using the `TfidfTransformer`. This is a useful
   operation to apply for text analysis - it basically accounts for the fact
   that words will be more frequent in longer tweets, and some words are popular
   in both "good" and "bad" tweets. Clearly the length issue is not too much of
   a problem with tweets given the character limit, but the "idf" part (Inverse
   Document Frequency) reduces the impact of words that are common in both types
   of tweets.
3. We train the classifier using a `MultinomialNB` (Multinomial Naive Bayes)
   classifer. This uses our training set to calculate the probability table we
   discussed earlier.

The `load_dataset()` method simply takes a text file and generates a list, with
each item being a tweet or a 0/1 indicating if it is good or bad. The `expected`
variable is a `numpy` array. It is possible to combine the three steps into a
single `Pipeline`, however I found that it was easier to implement
`load_dataset` as a generator when I did not - making it easier to parse larger
files.

### Testing the classifier

With these 20 or so lines we have built a Naive Bayes classifier. We can test
the classifier (once trained) on a single tweet by doing the following:

```python
classifier.predict("A tweet about Star Wars")
```

Putting together a quick script made it simple to gather the training and test
data, train the classifier and then run the test data, displaying results.
Running this four times I got:

```
Tested 120 tweets, got 102 correct (85%)
Tested 120 tweets, got 109 correct (91%)
Tested 120 tweets, got 117 correct (98%)
Tested 120 tweets, got 113 correct (94%)
```

The number presumably improved where there were more similar tweets in the two
datasets (i.e. if I ran the commands in quick succession then there was more
duplication between the test and training set and hence a higher accuracy).
Despite this, 85-90% seems to be a fairly good accuracy with such a small
training set.

## Validating tweets

### Client side?

Having demonstrated that we can (with relatively good accuracy) classify Star
Wars tweets using Python and `scikit-learn`, we need to find a way that it could
be integrated with Twitter. One option would be to use a javascript client side
library that would test the tweet as it was typed. This javascript would
undertake the following steps:

1. "Vectorise" the tweet, breaking into words and counting occurrences
2. Use a static probability matrix, multiplying the required values to generate
   a probability of "good" (!$P(good)$!) and a probability of "bad" $P(bad)$
3. If $P(good) >= P(bad)$ then the tweet is good, and conversely if $P(bad) >
   P(good)$ then the tweet is bad
4. Display a warning if the tweet is bad

We can access the probability matrix generated by `scikit-learn` to save to file
by running

```python
classifier.feature_log_prob_
```

The big issue here is that for our test simple dataset this array was 2 rows,
773 columns. This was obtained by:

```python
print classifier.feature_log_prob_.shape
```

Once our matrix is stored in an ASCII encoded file, we can estimate how much
download bandwidth it would take up. Assuming 1 byte per character and with each
probability having a length of 12 bytes including punctuation, the simple matrix
generated from our training set above gives us a file size of around 20kB:

$$1\text{ byte}\times 12\text{ characters}\times 2\text{ rows}\times 773\text{ columns} = 18,552\text{ bytes}$$

To perform this operation client side, we would therefore need to download at
least 20kB of probability matrix. Given the emphasis placed on minimising
download amounts, this makes client side validation unlikely to be viable.

### Server side

Another approach would be to use a simple web service approach, where the tweet
could be periodically sent to the server and analysed, and the web service could
return "0" if the tweet is classified as good, or "1" if the tweet is bad. This
is pretty similar to the spam detection services offered by companies such as
Askimet. In Python, something like this is very implemented with one of the many
light weight web frameworks such as Tornado or Flask. A flask app which
performed this could be as simple as the following (where the `TweetClassifier` is
a class implementing our classification code above):

```python
from flask import Flask, request
from flask_cors import cross_origin
import os

from tweet_classifier import TweetClassifier

app = Flask(__name__)
classifier = TweetClassifier()

if not os.path.isfile("train_data.txt"):
    classifier.fetch_data()
classifier.train("train_data.txt")

@app.route("/", methods=["GET"])
@cross_origin()
def validate_tweet():
    tweet = request.args.get('tweet')
    return str(classifier.classify(tweet))

app.run()
```

If this was saved in a file called `run_server.py`, setting up the server would be
as simple as

```python
python run_server.py
```

The code above would set up a `route`, or a "web page" which would answer `GET`
requests to the url `/` (e.g. `http://127.0.0.1/`) and return a response with
`0` or `1`. A simple `index.html` page (assuming the server is running at
`127.0.0.1`) would look like the following, using jQuery for the AJAX request:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Check a tweet</title>
    </head>
    <body>
        <input type="text" value="You are an awesome person" id="phrase" />
        <button id="check_phrase">Check</button>
        <div id="result"></div>

        <script src="http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min.js" type="text/javascript"></script>
        <script type="text/javascript">
            $("#check_phrase").click(function(e) {
                e.preventDefault();
  
                $.ajax({
                    type: 'GET',
                    url: 'http://127.0.0.1:5000/',
                    data: {
                        tweet: $("#phrase").val()
                    },
                    success: function(data, status, xhr) {
                        $("#result").html(data);
                    }
                });
            });
        </script>
    </body>
</html>
```

Visiting the `index.html` page shows an input box. We can type something in the
box, click the "Check" button, and in a short time either `0` or `1` will be
displayed below the tweet.

## Accuracy

Its clear after a little bit of testing that the accuracy depends to a large
extent on the quality of the training data. I tested with about 2,400 tweets as
training data and found that the accuracy was fairly good for items like:

> Star Wars Episode 7 being released!    
> C3PO is a rockstar    
> Luke Skywalker, I am your father    
> JJ Abrams directing Episode 7

However due to the narrowly defined training set (for instance only six or seven
categories were used for "good" tweet data) statements like the following were
false positives due to the amount of discussion about the new Star Wars movies
being made:

> Harry Potter Episode 7 is boring    
> JJ Abrams directed Lost

Some false negatives were also found due to only 200 "bad" tweets being used:

> 3PO is a robot

Despite these issues, the method produced something that could detect well over
half of Star Wars related tweets that I typed in in only a few hours of work.
Accuracy could be improved by gathering a broader range of random tweets
(presuming that the Twitter streaming API can be made to return anything other
than a 401 response code!) or by cherry picking and searching specific Star Wars
related terms where performance is poor. It is also possible that detecting
abusive tweets could be a little easier given certain words are exceedingly
common in these types of tweets but not in everyday speech.

Additionally the use of N-grams, which are very short phrases could also improve
the algorithm. For instance a tweet could possibly include a phrase such as
"this millennium I want to fly a falcon" and not be related to Star Wars, whilst
a tweet "I like the Millennium Falcon" is far more likely to be related.

## Effectiveness

The best that could be hoped from a system like this is that it would reduce
"casual" abuse, or at the very least make people think twice before sending a
horrible tweet. For many on the edge of society it is likely that a visual
warning would provide no deterrence whatsoever.

Additionally, the performance impact on a high volume site such as Twitter would
be considerable. Something like 400 million tweets a day are made, and for each
one to be passed through an "abuse" web service would require considerable
financial investment in terms of servers, support and so on. A client side
approach is technically feasible but unlikely to work given the large
probability matrix that would need to be downloaded in order for it to work. A
quick bit of research shows that a number of sentiment analysis APIs already
exist on-line, some are listed in [this blog post](http://blog.mashape.com/post/48757031167/list-of-20-sentiment-analysis-apis).

All in all, as an investigation of sentiment analysis and Naive Bayes methods
the approach was a success but in terms of making a real dent in on-line abuse,
sadly it seems unlikely to provide any great benefits.

> The full source code of the application and the article can be found at
> [https://github.com/will-hart/twitter_sentiment](https://github.com/will-hart/twitter_sentiment
)
