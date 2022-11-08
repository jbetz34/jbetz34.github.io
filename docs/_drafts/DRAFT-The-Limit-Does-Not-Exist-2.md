---
layout: post
author: james
date: 2022-11-07 16:21:00 -05:00
image: the-mean-girls-lindsay-lohan.gif
title: The limit does not exist
subtitle: Going beyond the native 64bit math in q/kdb+
---
Native math in q/kdb+ is limited by the maximum size of the resultant number's datatype. The largest datatype in q/kdb+ is a "long" which is takes 8 bytes of data. In different languages this datatype might be refered to as "bigint","int64" or "long long", all referring to the same 8 byte numerical datatype. The limit on native numerical calculations q/kdb+ is only 8 bytes of data, that feels a bit tight. Given that numbers in q/kdb+ are signed (positive/negative), that means the largest number you can acurately calculate is 9,223,372,036,854,775,806.

_Pathetic._

To top it off, Python has a library "BigNumber" that supports numbers with any values and many operations with them. To admit that a bunch of snake-charmers could out perform our far superior language? *shudders* 
I will not stand idly by while python runs laps around us. 

If we are the same type of weird you have probably thought to yourself:
"What is the maximum object size that can be encrypted with the sha-256 hashing algorithm?"
and quickly ran to google for the answer. If you're not that weird, then I'll save you the trip to google and just tell you. It's 2<sup>63</sup>-1 bytes.
Sure, 2<sup>63</sup>-1, but what does that number even look like?
Let's ask google: 
![google 2^63](/path/to/image)
... thanks google. 
Calculator app?
![calc 2^63](/path/to/image)
not helpful.
Kdb? 
![kdb 2^63](/path/to/image)
Yikes. 

If you're thinking, "why not just do it in python?", <a href="https://www.python.org">here is the door.</a> 

Now that it's just us serious programmers, let's talk about what we need to do to bypass this limit. 

First, we need a way to represent numbers larger than ~9 quintillion. While there may be several solutions to representing large numbers in an abstract way, I think the most straightforward and human-readable would be to represent each digit in the number as a single number in a vector of longs. In this way, the maximum numerical value of a long would be represented "9 2 2 3 3 7 2 0 3 6 8 5 4 7 7 5 8 0 6". 
Great, now in code: 
{% highlight q %}
// accepts a number,string or list of numbers
// converts to list of longs
vec:{"J"$/:string x}
{% endhighlight %}

So we now have our numbers, or more correctly, our lists of numbers. How do we multiply these numbers together? 
One of the most common methods of multiplication is called partial products. This method multiplies each digit in one number by each other digit in the second number and summing the result. Still confused? Here, watch this video: 
<p style="text-align:center"><iframe width="560" height="315" src="https://www.youtube.com/embed/EupNW_6jPok" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></p>

One important thing to note here, is that in partial products we don't consider each digit individually, but rather consider each digit\*10<sup>n</sup> where n is the index of the digit counted from right to left. Because of this we are able to take advantage of the vecorization of one number, but the other must be multiplied by 10<sup>n</sup>. If I am making absolutely no sense, let's look at an example:
{% highlight q %}
// our two numbers 3 * 121 = 363
x:3;y:1 2 1;

// multiply each digit by each of the other digits
x*/:100 10 1*'y
300  // (3*100)
60  // (3*20)
3  // (3*1)

// sum 
sum x*/:100 10 1*'y
363

// generic partial products code
sum vec[x]*/:{x*prd each #\:[;10]reverse til count x}vec y;
{% endhighlight %}

If you are thinking that was a softball question, that's because it was. In truth, I didnt want to dive too fast into harder problems because I need to explain the concept of digit promotion. If you watched the embedded video above, the digit promotion in that video occurs at about 2:10. When the numbers in a column add up to 10 or more, the tens digit gets promoted to the next column. 

Knowing the digits on x will always appear in order, we do not have to worry about multiplying each digit by 10<sup>n</sup>. However, to assign the appropriate weight to each digit on the right hand side we need to multiply by 10<sup>n</sup>. While this may resolve one side of the equation, our y variable is still subject to the same limitation as always. Let's look at an example of that:
{% highlight q %}
// our two numbers 3 * 123,123,123,123,123,123,123
x:3;
y:1 2 3 1 2 3 1 2 3 1 2 3 1 2 3 1 2 3 1 2 3

// correctly weighting our y variable
100000000000000000000 * 1
10000000000000000000  * 2
1000000000000000000   * 3
100000000000000000    * 1
10000000000000000     * 2
1000000000000000      * 3
100000000000000       * 1
10000000000000        * 2
1000000000000         * 3
100000000000          * 1
10000000000           * 2
1000000000            * 3
100000000             * 1
10000000              * 2
1000000               * 3
100000                * 1
10000                 * 2
1000                  * 3
100                   * 1
10                    * 2
1                     * 3
{% endhighlight %}

We cannot weight our y variable properly, because the largest digits far exceed the size limit for longs in kdb+/q. However, by switching the x and y digits here, we are able to properly calculate the result, because we do not have to weight the x variable. So essentially we have created a method to multiply 1 large number (size dependent on memory and billion list limit) and 1 8-byte number. This would solve 99.999% of practical math problems, heck we can even get the answer to 2<sup>64</sup> right now. 


<!-- USELESS JUNK START -->

INTRO: 
- Example problem: ‘number error
- Talk about integers, int32, int64, longs – i.e. their limits
	C++ version of long is “long long”, 64bit signed. Min/Max numbers specified by 2^63
- Talk about bignum in python and other languages
	bignum: https://levelup.gitconnected.com/how-python-represents-integers-using-bignum-f8f0574d0d6b
- https://code.kx.com/q/basics/math/
- https://code.kx.com/q/ref/add/
- https://code.kx.com/q/ref/multiply/

- Talk about the objective/scope (bignum in q, mult,add,pwr, no negatives/fractions)

In mathematics, an integer is any whole number within the range of all negative and positive numbers including zero. It exists as an unbounded set with equal magnitude on both the positive and negative side. In computing, this is not so easy to achieve. On your computer, numbers are stored as binary digits, or bits, and take up space in memory. Since your computer only has so much memory, the number you create can only be so large. For type casted programming languages such as q/kdb+, the size of a number is even more limited. In the case of a long datatype in q/kdb+, a number is limited to 8bytes or 64bits.
While q/kdb+ is super fast with complex vector calculations, it has its limitations. Mainly, the ability to exceed 9,223,372,036,854,775,806 in either direction. 1 more beyond and you reach negative and positive infinity. 2 more beyond and you reach a null. 3+ more beyond and you will start to loop back down in the opposite direction. It should be noted that nulls are “sticky”, meaning that the null will override any math you intend to perform. 
The numerical value in q/kdb+ (since V3.0) is a long datatype, a signed 64bit integer. With the first digit representing the sign (positive or negative), that leaves 63 bits to determine the size of the number. The limit can then be calculated as [-263 , 263 -1]
There are other programming languages that have determined a way around this limitation, such as python. Bignum arithmetic in python allows numbers to expand to any magnitude that can be contained in memory. More information can be found here: https://levelup.gitconnected.com/how-python-represents-integers-using-bignum-f8f0574d0d6b
The objective of this exploratory paper is to achieve mathematics to a reasonable limit beyond that which is available by default means. If possible, it would be a nice achievement to calculate a googol (10100) or dare I even say, a googolplex (10googol). Not all mathematical operations will be included in this scope, fractions and negative numbers will not be addressed. 

<!-- USELESS JUNK END -->

I




CONTENT:
- Break down the subcomponents of multiplication/addition
- Walk through each step and how you programmed for it

To begin to understand how to approach this problem, it will make sense to examine how addition and multiplication is calculated by hand. In addition, each digit is added to the corresponding digit in the second number and any sum over 10 is carried over to the next digit. This process repeats for every digit until both numbers have been added completely. 
In multiplication, the typical approach taught in U.S. schools would be to use partial multiplication. This involves multiplying one number by each digit of the other number and summing the offset result. Look at this example below:
 
What makes these techniques especially appealing is that they only consider one digit at a time from each number when calculating the result. If instead of treating a number as a long we treated it as a list of longs, where each index represented a different digit, we may be able to perform mathematical operations on the list of digits. 

Lets break that down for each operation and see how it is performed in q/kdb+. 

Preprocessing
The first step before any calculations can be done is to convert the number from some expected input into an input that we can use. As mentioned before, we are looking to convert a number into a list of digits. The best way to do this would be to cast the number to a string and cast each individual character back to a long. This will handle multiple input types atomic number types, enlisted number types and numerical strings. To handle this action the function vec can be used to vectorize the input. 
Provide code evidence here




ADD
Subcomponents:
Vectorize- 
align digits
sum/carry

MULTIPLY
Subcomponents:
Vectorize-
Create partial sums
align digits
sum/carry

BONUS:: POWER
multiply over y take x


CONCLUSION:
- all for fun
- google can’t even do this shit
- possible future improvements

