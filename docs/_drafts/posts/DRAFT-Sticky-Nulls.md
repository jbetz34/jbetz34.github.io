---
layout: post
author: james
date: 2022-02-25 16:21:00 -05:00
title: Stick to It
subtitle: Sticky Nulls
---
#### **{{page.subtitle}}**

This concept was originally discovered and tested from the KX website before the redesign. When I am able to find the link to the exerpt that first demonstrated this concept, I will link it here. 
In q/kdb+ the null value is consistent across most arithmetic operators. Once a null is reached, it is nearly impossible to revert to a previous value. 

<!-- excerpt-end -->

Lets look at the following examples: 
{% highlight q %}
q) (0Nj;0Ni;0Nh) + (1j;1i;1h)
0N
0Ni
0Ni  // short arithmetic results in int datatype

q) (0Nj;0Ni;0Nh) - (1j;1i;1h)
0N
0Ni
0Ni

q) (0N;0Ni;0Nh) * (2j;2i;2h)
0N
0Ni
0Ni

q) (0N;0Ni;0Nh) % (2j;2i;2h)
0n 0n 0n
{% endhighlight %}
Notice how none of the operators seemed to have any effect. This is the feature of the 'sticky null', nulls are not able to perform arithmetic operators. One interesting point is that any short arithmetic (arithmetic including two short datatypes) results in an integer datatype. This behavior is noted in the 'Range and domains' diagram in the [KX 'Add' documentation][kx-range&domain].

[kx-range&domain]: https://code.kx.com/q/ref/add/#range-and-domains