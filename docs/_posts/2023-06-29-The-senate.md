---
layout: post
author: James
date: 2023-06-29 10:20:00 -05:00
categories: blog
tags: [kdb+, q, python, ai]
image: 
title: "The Senate"
subtitle: "Solving leetcode question #649"
redirect_from: /The-Senate
---
A question I have been hearing a lot from my millions (probably billions) of smart, dedicated, passionate, loving fans and subscribers is "James, it has been too long since you graced my eyeballs with the beauty of your kdb+/q programming. When are you going to post another blog?". 
Well friends, that day is today. Coming in a scorching 5 months ahead of my current blog rate, I decided to drop a little q nugget

Adopting a very efficient and entertaining strategy from a frequent contributer to the KX Community, [Jonathon Kane](https://community.kx.com/t5/user/viewprofilepage/user-id/2510), I decided to walk you all through the approach I would take to solve a Leetcode problem. As a fun twist at the end, if we have time, I will ask ChatGPT to solve the same problem and compare our solution/performance. 

The problem premise is as follows: 
>In the world of Dota2, there are two parties: the Radiant and the Dire.
>
>The Dota2 senate consists of senators coming from two parties. Now the Senate wants to decide on a change in the Dota2 game. The voting for this change is a round-based procedure. In each round, each senator can exercise one of the two rights:
>
>- **Ban one senator's right:** A senator can make another senator lose all his rights in this and all the following rounds.   
>- **Announce the victory:** If this senator found the senators who still have rights to vote are all from the same party, he can announce the victory and decide on the change in the game.
>
>Given a string `senate` representing each senator's party belonging. The character `'R'` and `'D'` represent the Radiant party and the Dire party.Then if there are `n` senators, the size of the given string will be `n`.
>
>The round-based procedure starts from the first senator to the last senator in the given order. This procedure will last until the end of voting. All the senators who have lost their rights will be skipped during the procedure.
>
>Suppose every senator is smart enough and will play the best strategy for his own party. Predict which party will finally announce the victory and change the Dota2 game. The output should be `"Radiant"` or `"Dire"`.
>
>**Example 1:**
```
`Input:` senate = "RD"
`Output:` "Radiant"
`Explanation: `
The first senator comes from Radiant and he can just ban the next senator's right in round 1. 
And the second senator can't exercise any rights anymore since his right has been banned. 
And in round 2, the first senator can just announce the victory since he is the only guy in the senate who can vote.
```
>**Example 2:**
```
`Input:` senate = "RDD"
`Output:` "Dire"
`Explanation: `
The first senator comes from Radiant and he can just ban the next senator's right in round 1. 
And the second senator can't exercise any rights anymore since his right has been banned. 
And the third senator comes from Dire and he can ban the first senator's right in round 1. 
And in round 2, the third senator can just announce the victory since he is the only guy in the senate who can vote.
```
>
>**Constraints:**
>- `n == senate.length`
>- `1 <= n <= 104`
>- `senate[i]` is either `'R'` or `'D'`.

Let's break that down. There are two parties in the senate, `Dire` and `Radiant`, which we will represent as `R` and `D` and they have an obscure/unjust method of voting.  
Hmm, sounds familiar. I wonder if their party colors are Red and Blue respectively? Do they have party animals? I wonder if one is an elephant and the other is a donkey. I bet they are voting over something like the national debt crisis.

Regardless, they have a cut-throat voting procedure where instead of voting on issues a single party is allowed to ban another senator from voting. This will happen in a circular manner until there is only one party remaining and they can unanimously vote on the issue. 

Let's see a diagram : 
< insert senate explaination gif/code/image>

One of the key concepts in this question is communicated to you very subtley. "Suppse every senator is smart enoug and will play the best strategy for his own party". What is the best strategy? Well I will let you play around with that app for a bit before I give it straight up. 

#### The Best Strategy
OR you can keep reading. 
Here's the spoiler, there is only one best move for the current party and that is to vote out the next opposing party in line. This will create more opportunities for nearby party members to vote off opposing party members. 

Ok, so here is Chuck Shumers's strategy, I mean, Kevin McCarthy's strategy, I mean... shit, actually none of those guys.  
Today, we are talking about fictional and honorable members of the fictional senate where no one has alternative personal/financial dependencies on ballots they are elligible to vote on. 
< insert demonstration of optimal strategy >

#### Calculating the best strategy
OK, so we know the best strategy, but that doesn't mean we know how to calculate the best strat in the least amount of time. Lets look at the most basic implementation of this strat in kdb+/q:
``` q
PARTIES:"DR";
partyDict:"DR"!("Dire";"Radiant");
superMajority:{[x] first where 2<=3*(count each group x)%count x}
ban1:{[x] cp:first where x<>x 0; 1 rotate raze (cp#;_[cp+1])@\:x}
func:{[senate] $null winner:superMajority senate; .z.s ban1 senate; :partyDict winner}
```
Wow. A lot to unpack there for some qbies, let's go through it togther. If you are already a qGod and read kdb+/q faster than you read english you can skip ahead ![here](this page but further on) @Arthur_Whitney ;) 

**In the first line of code:**  
``` PARTIES:"DR";```
I am doing 1 simple thing, 'set the party's representation to the string of "D" or "R"', I suppose you could use symbols, integers or even boolens for this function, but strings keeps us as close to the leetcode interpretation as possible. 

**In the second line of code:**  
``` partyDict:"DR"!("Dire";"Radiant"); ```
I am creating a mapping between the input variables and the output variables. It should be noted that if you use a different party representation in the step above, those values should be used in the key values of the follwong code. I.E. `PARTIES:01b;partyDict:01b!("Dire";"Radiant")`

**In the third line of code:**
``` supermajority:{[x] first where 2<=3*(count each group x)%count x} ```
Probably the most obscure of the base code lines, this line is establishing a stop point. When senators can ban each other, the majority ruling no longer becomes the 50% metric, but the 66.67% metric. If one party has 2/3rds (66.67%) of the senate, the other party has 1/3rd of the senate. This means that no matter the order, the 


In the secon
[python-supernums]: https://www.codementor.io/@arpitbhayani/how-python-implements-super-long-integers-12icwon5vk
[gh-bigmath]: https://gist.github.com/jbetz34/9ef3c420a07aef5a83311d18bf0d4b18
[mmu-video]: https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:multiplying-matrices-by-matrices/v/matrix-multiplication-intro