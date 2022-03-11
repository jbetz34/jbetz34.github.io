---
layout: post
author: james
date: 2022-02-25 16:21:00 -05:00
title: The limit does not exist
subtitle: Going beyond the native 64bit math in q/kdb+
---

#### **{{ page.subtitle}}**
After working long enough with q/kdb+, all the work starts to feel a bit monotonous. "Build the fastest *this*", or "the largest *that*", a table with a billion records, intraday writedowns, optimal queries, blah, blah, blah... If this was all Arthur Whitney had in mind when he wrote the language, he could have stopped after q-sql statements. I mean, think about it, does anyone actually use the cosine function? It is hard to say everything Arthur had intended this language to be used for, but there is one thing he definitely did not intend it to be used for, big math, and that's exactly what we are going to do. 

<!-- excerpt-end -->

![the-mean-girls-lindsay-lohan](/assets/images/the-mean-girls-lindsay-lohan.gif)
