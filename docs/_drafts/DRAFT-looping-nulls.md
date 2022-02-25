---
layout: post
author: james
date: 2022-02-25 16:21:00 -05:00
title: Extreme Numbers
---
### **Examining edge case numbers in q/kdb+**

Documentation around how numbered datatypes work in q/kdb+ is very sparse and scattered around the site in various sections. After my own struggles with the upper/lower limits of these datatypes, I have decided to compile some information that I have learned by scouring the KX website or through my own trial & error processes. The three datatypes that we will be exploring are shorts, longs and ints. Floats and reals have been excluded from this post for simplicity. Each of these three datatypes acts similarly when reaching the maximum/minimum limit, unless explicitly stated assume that the described behavior is consistent across each datatype. If you are unfamiliar with kdb+ datatypes, you can read about them from the KX website [here][kx-datatypes]. 

### Sticky Nulls

This concept was originally discovered and tested from the KX website before the redesign. When I am able to find the link to the exerpt that first demonstrated this concept, I will link it here. 
In q/kdb+ the null value is consistent across most arithmetic operators. Once a null is reached, it is nearly impossible to revert to a previous value. Lets look at the following examples: 
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

### Numbers are circular (longs and ints)

Although never explicitly stated in the documentation, this concept was discovered through experimentation and makes sense logically. That is, whole numbers in kdb+ will cycle from 0j to 0Wj to 0Nj to -0Wj and all the way back to 0j. Lets see how that looks in practice:
{% highlight q %}
maxi:2147483646i            // upper int limit
mini:-2147483646i            // lower int limit
maxj:9223372036854775806    // upper long limit
minj:-9223372036854775806   // lower long limit

// Positive inifinity is 1 unit beyond the upper limit
q) maxi+1i      // 0Wi
q) maxj+1j      // 0W

// Negative infinity is 1 unit below the lower limit
q) mini-1i      // -0Wi
q) minj-1j      // -0W

// Null value is 1 unit beyond the upper limit or 1 unit below the lower limit
q) maxi+2i      // 0Ni
q) maxj+2j      // 0N
q) mini-2i      // 0Ni
q) minj-2j      // 0N

// Nulls are still sticky
q) 2j+maxj+2j   // 0N
q) 2i+maxi+2i   // 0Ni

{% endhighlight %}
Looking at this behavior, we can conclude that null and zero act as the 12 and 6 on an analog clock. They are the furthest separated digits, while postitive and negative infinity are only 2 units away. This can cause some unexpected behavior when performing arithmetic near the datatype limit: 
{% highlight q %}
q) maxi+10i     // -2147483640i
q) mini*10i     // 20i
q) maxj*maxi    // -4294967292j
{% endhighlight %}
This behavior is unique to the integer and long data type because of the way q/kdb+ handles signed numbers. For more infomation, you can read about two's compliment [here][2s-complement].

[kx-datatypes]: https://code.kx.com/q/basics/datatypes/
[kx-range&domain]: https://code.kx.com/q/ref/add/#range-and-domains
[2s-complement]: https://en.wikipedia.org/wiki/Two%27s_complement