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

Addition
This next step is what makes the difference between addition and multiplication


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

