---
layout: post
author: James
date: 2023-01-30 11:21:00 -05:00
image: lindsay-lohan-static.jpg
title: The limit does not exist
subtitle: Going beyond the native 64bit math in q/kdb+
tags: [kdb+, q, math]
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

#### Our First Attempt: Partial Products
First, we need a way to represent numbers larger than ~9 quintillion. While there may be several solutions to representing large numbers in an abstract way, I think the most straightforward and human-readable would be to represent each digit in the number as a single number in a vector of longs. In this way, the maximum numerical value of a long would be represented "9 2 2 3 3 7 2 0 3 6 8 5 4 7 7 5 8 0 6". 
Great, now in code: 
``` q
// accepts a number,string or list of numbers
// converts to list of longs
vec:{"J"$/:string x}
```

So we now have our numbers, or more correctly, our lists of numbers. How do we multiply these numbers together? 
One of the most common methods of multiplication is called partial products. This method multiplies each digit in one number by each other digit in the second number and summing the result. Still confused? Here, watch this video: 
<p style="text-align:center"><iframe width="560" height="315" src="https://www.youtube.com/embed/EupNW_6jPok" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></p>

One important thing to note here, is that in partial products we don't consider each digit individually, but rather consider each digit\*10<sup>n</sup> where n is the index of the digit counted from right to left. Because of this we are able to take advantage of the vecorization of one number, but the other must be multiplied by 10<sup>n</sup>. If I am making absolutely no sense, let's look at an example:
``` q
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
```

If you are thinking that was a softball question, that's because it was. In truth, I didnt want to dive too fast into harder problems because I need to explain the concept of digit promotion. If you watched the embedded video above, the digit promotion in that video occurs at about 2:10. When the numbers in a column add up to 10 or more, the tens digit gets promoted to the next column. 

Knowing the digits in x will always appear in order, we do not have to worry about multiplying each digit by 10<sup>n</sup>. However, to assign the appropriate weight to each digit on the right hand side we need to multiply by 10<sup>n</sup>. While this may resolve one side of the equation, our y variable is still subject to the same limitation as always. Let's look at an example of that:
``` q
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
```

We cannot weight our y variable properly, because the largest digits far exceed the size limit for longs in kdb+/q. However, by switching the x and y digits here, we are able to properly calculate the result, because we do not have to weight the x variable. 

``` q
x:1 2 3 1 2 3 1 2 3 1 2 3 1 2 3 1 2 3 1 2 3
y:3

// correctly weighting our y variable
1 * 3
```

To explain a different way, we are breaking up the y variable into parts based on the digit location. 

``` q
// 5 * 121,121
x:5				
y:1 2 1 1 2 1

5 * (100000 + 20000 + 1000 + 100 + 20 + 1)
	->	500000 + 100000 + 5000 + 500 + 100 + 5
	->	605605
```

The previous example also gives some insight into how we will tackle the problem of rounding. In two of the numbers in the partial sum, we had to perform digit promotion ("carry the one"). Lets take a look at that example again, but in a more q/kdb+ style to see that promotion a bit more clearly. 

``` q
// 5 * 121,121
x:5
y:1 2 1 1 2 1

5 * 1 0 0 0 0 0
5 *   2 0 0 0 0
5 *     1 0 0 0
5 *       1 0 0
5 *         2 0
5 *           1

// resolves to
5 0 0 0 0 0
 10 0 0 0 0
    5 0 0 0
	  5 0 0
	   10 0
	      5

// taking the sum
5 10 5 5 10 5

// taking the div[;10]
p:0 1 0 0 1 0

// multiply p by 10 and subtract
	5 10 5 5 10 5
  -	0 10 0 0 10 0	/ (10 * 0 1 0 0 1 0)

->  5 0 5 5 0 5

// shifting p to the left and add to previous 
	0 1 0 0 1 0 0	/ when shift in to left, add zero to the right
  +   5 0 5 5 0 5

->  0 6 0 5 6 0 5

// cut off leading 0
6 0 5 6 0 5
```

If there were any digits in the resulting sum that were greater than or equal to 10, then we would repeat the process until each digit is less than 10. 


So essentially we have created a method to multiply 1 large number (size dependent on memory and billion list limit) and 1 8-byte number. This would solve 99.999% of practical math problems, heck we can even get the answer to 2<sup>64</sup> right now. However, this limitation seems a 

<!-- INSERT MORE OF A TRANSITION HERE -->

Lets take a different approach. 

#### A Reimagined Attempt: Matrices
If you are having nightmarish flashbacks to highschool/college, I am sorry, but we must persist. For a quick refresher on matrix multiplication, khan academy has a pretty good video on it [here][mmu-video]

The main concept of matrix multiplication is described in the image below: ![mmu-image](assets/img/mmu-example.png)
The resulting digit in the first row and first column is the dot product of the first row of the first matrix and the first column of the second matrix. Similarly, the resulting digit in the first row and second column is the dot product of the first row of the first matrix and the second column of the second matrix. This is continued for each row/column until the resulting matrix is formed. 

One cool special case in matrix multiplication is the identity matrix. It is a square matrix that when multiplied by a second matrix, will return the second matrix. Lets see an example:
``` q 
(1 2 3)	  x	(1 0 0)    =	(1 2 3)
(4 5 6)		(0 1 0)	    	(4 5 6)
    		(0 0 1)

// Breakdown
1*1+2*0+3*0	1*0+2*1+3*0	1*0+2*0+3*1	->	1 2 3
4*1+5*0+6*0	4*0+5*1+6*0	4*0+5*0+6*1	->	4 5 6
```

By multiplying the identity matrix by a scalar, we can achieve the same results as multiplying the original matrix by a scalar
``` q 
(1 2 3)	  x	(1 0 0)	x 2
(4 5 6)		(0 1 0)	    
    		(0 0 1)

OR

(1 2 3)	  x	(2 0 0)    =	(2  4  6)
(4 5 6)		(0 2 0)	    	(8 10 12)
    		(0 0 2)

// Breakdown
1*2+2*0+3*0	1*0+2*2+3*0	1*0+2*0+3*2	->	2  4  6
4*2+5*0+6*0	4*0+5*2+6*0	4*0+5*0+6*2	->	8 10 12
```

But this scalar would still be subject to the same 8 byte limitation as any number in kdb+, unless...
``` q 
(1 2 3)	  x	(1 0 0)	x 315
(4 5 6)		(0 1 0)	    
    		(0 0 1)

OR

(1 2 3)	  x	(3 1 5 0 0)    =	( 3  7 16 13 15)
(4 5 6)		(0 3 1 5 0)	    	(12 19 43 31 30)
    		(0 0 3 1 5)
```

Wow, lets take a closer look at that example. This time we will focus on the top row of our first matrix. 
``` q 
(1 2 3)	  x	(1 0 0)	x 315
    		(0 1 0)	    
    		(0 0 1)

OR

(1 2 3)	  x	(3 1 5 0 0)    =	( 3  7 16 13 15)
    		(0 3 1 5 0)	    	
    		(0 0 3 1 5)

// Using our previously discussed rounding method
( 3  7 16 13 15) -> 3 8 7 4 5

// Why is this significant? 
123 * 315 = 38745			
```

Incredible. By replacing the 1s in our identity matrix with the vectorized representation of our scalar number, we are able to achieve a vectorized representation of the result. What's better is that at no point were we multiplying numbers greater than 10. With this method we have completely eliminated any 8 byte number limitations, our only limitation now is the size of the multiplication matrix. That limit is a bit more difficult, but it is at least restrained by the internal kdb+/q list limit of 2 illion items in a list. 

Before we get too carried away with the math of it all, lets get all this to work in code. 
``` q
// mmu function requires floats instead of longs
vec:{"F"$/:string x}

mult2:{[x;y]
	m:vec[y] mmu c (rotate[-1]@)\vec[x],(c:-1+count vec y)#0f;
	while[any 9<m;m:(0^next p)+m-10*p:div[;10]m:0f,m];
	(?[;1b]"b"$m)_m
}
```

[mmu-video]: https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:multiplying-matrices-by-matrices/v/matrix-multiplication-intro