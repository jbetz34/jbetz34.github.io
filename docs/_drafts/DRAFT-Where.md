---
layout: post
author: james
date: 2025-05-30
title: 
subtitle:
---
#### **{{page.subtitle}}**

A fellow q-thusiast recently put me onto the [ksimple][ksimple-github] repo, which provides an insight into the mind of Arthur Whitney as he writes a new iteration of k and challenges the reader to extend upon the basic functionality contained within. After spending an embarrassing amount of time struggling to implement the monadic **&**, or `where` in q, I had an epiphany about the logical simplicity of the function. Rather than fill people's LinkedIn feed with unsolicited q/k jargon, you can read about this epiphany here.

For many qbies (and reluctant quants), their first exposure to `where` comes in a q-sql statement; perhaps the one from Chapter 1.16 in 'Q for Mortals', which comes before any reference to the standalone `where` function. At first glance and perhaps because of the way we teach the keyword, the function puts up a facade that betrays what I believe to be the true underbelly of the function. 

<!-- excerpt-end -->
Lets start by taking a look at what may be a qbie's first exposure to the `where` keyword (from [Q for Mortals][q4m3-ch1.16])
``` q
q)update c3:10*c3 from t where c2=`a
c1   c2 c3
-----------
1000 a  100
1001 b  20
1002 c  30
1003 a  400
1004 b  50
1005 a  600
```

A qbie can be forgiven for looking at the above statement and (with a pinch of sql knowledge) extrapolating how they think the `where` function works. I'll admit that I had my own strongly held misconceptions of the function during my first few years with the language. With truthy/falsey functions like `not`(~) and `cond`($), it can be tempting assume `where` is a function that returns the index of all truthy items in a list:
``` python
# for any python devs that accidentally stumbled onto this blog (turn back now)
def where (x: list[int]) -> list[int]:
    return [ i for i,v in enumerate(x) if v ]
```
In practice, because of the abundance of q-sql statements and lack of non-boolean arguments to the function, your assumption would hold true 95% of the time. Cue absolute terror when a qbie runs the `where` function over a list of positive integers-

![confused-meme][/assets/img/confused-meme.gif]

Illusion shattered. Ok, so the `where` function does this wierd thing when you pass a list of integers - noted. If you are like me, you file this info away in the cobwebbed corner of your brain and keep joyfully plugging away with boolean lists. Maybe you even make it seven years without having to think about it ever again, but eventually you come face to face with a `where <int list>` in the wild (probably implemented by some qgod) and now you are responsible for refactoring the code. So let's checkout what the [KX Reference][kx-where] has to say: 
>Where x is a vector of non-negative integers: returns a vector containing, for each item of x, that number of copies of its index.
>Where x is a boolean, the result is the indices of the 1s. Thus where is often used after a logical test

_The examples provided in the ref page can be quite useful if you are unfamiliar, in which case I recommend you take a look at the page linked above._

For nearly all qdevs, this is a succinct enough solution that will solve all your questions about `where` in the future. Pythonically you could represent the logic as: 
``` python
def where (x: list[int]) -> list[int]:
    if 1<max(x):
        return sum([ [i]*v for i,v in enumerate(x) if v], []) # sum to flatten lists
    else:
        return [ i for i,v in enumerate(x) if v ]
```
After reading the ksimple implementation, type checking and implementing two different solutions depending on input doesn't seem like the Athur Whitney way. This is the source of my epiphany, there are not two different solutions based on input, but 1 solution that elegently covers both situations. In fact, the solution has been in front of us the whole time, if we were only observant enough to notice: 
``` python 
def where (x: list[int]) -> list[int]:
    return sum([ [i]*v for i,v in enumerate(x) ], []) # again, sum is only to flatten lists here
```

[ksimple-githup]:https://github.com/kparc/ksimple
[q4m3-ch1.16]:https://code.kx.com/q4m3/1_Q_Shock_and_Awe/#116-q-sql-101
[kx-where]:https://code.kx.com/q/ref/where/
