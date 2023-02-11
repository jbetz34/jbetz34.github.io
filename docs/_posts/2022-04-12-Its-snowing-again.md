---
layout: post 
title: "[Repost] Joy of q: It's snowing again"
author: James
date: 2022-04-12 00:00 -00:00
categories: projects
tags: [kdb+, q, JavaScript]
image: snow-scape.jpg 
subtitle: Simulating weather in q/kdb+
---
_This post was originally posted in KX Community. You can view that post [here][kxc-post]_

Inspired by a recent post from Stephen Taylor titled Joy of q: Let it snow , I decided to take a shot at my own improvements on the code he developed. I tried to keep the scope small, but as you will see, I might have gotten a little carried away. Even as I write this post, I am trying to resist the urge to go back and add more features to the script. Despite the feature bloat, I was still able to keep the code to just about 50 lines of q. Let me walk you through it...

#### Auto Refresh

After watching Stephen's videos of the snow falling, I couldn't help but hear him repeatedly pressing the refresh key to animate the screen. This is the first piece that I want to tackle; the script should auto refresh because no one wants to hit F5 that many times. There are two ways I see to do this, we could add a meta tag in the html response that would call a refresh or we could write an html script with a bit of JavaScript to open a websocket connection to our q process. Since neither method would interfere with each other, I think we will do both. 

<ins>Meta Tag Refresh</ins>

``` q
/ new constants
RFSH:1b / auto refresh
RATE:300 / static refresh rate (ms)
/ new functions
autoRefresh:{ssr[x;"<head><style>";"<head><meta http-equiv='refresh' content='",string[.001*RATE],"'><style>"] }
/ updated callback
.z.ph:{$[RFSH;autoRefresh;(::)] .h.hp disp Flakes::advance Flakes}
```

By using a string search and replace function, we are able to squeeze our meta tag into the response just before it gets sent back to the browser. This produces a nice snow fall effect without the need for clicking the  refresh button (unless you want to). However, if we don't mind a little bit of front-end development, we are capable of so much more. 

<ins>WebSockets Refresh</ins>

Here's a simple HTML script I wrote with JavaScript websockets to connect to a q process on port 5455:

``` html
<!doctype html>
<html>
<head>
<script>
    let ws = new WebSocket("ws://localhost:5455/");
    ws.onopen=function(e){
        ws.send(`${window.innerHeight},${window.innerWidth}`)
    };
    ws.onclose=function(e){};
    ws.onmessage=function(e){printSnow(e.data)};
    ws.onerror=function(e){window.alert("WS Error")};
function printSnow(n) {
    document.getElementById('sky').innerHTML = n;
}
</script>
<style>
    body{
        background-color:Black;
	    color:White;
	    font:10pt verdana;
	    text-align:justify
    }
</style>
<pre id='sky'></pre>
</head>
</html>
```

and the corresponding q code:

``` q
/ new functions
.z.ws:{
  h::neg .z.w;
  .z.ts[]; }
.z.ts:{
  @[h;;{:system"t 0"}] raze ,\:[;.h.br]disp Flakes::advance Flakes;
  system"t ",string[RATE]; }
```

A keen reader might have noticed that we changed the background color to black and text color to white; snow is white after all. The html script will attempt to open a websocket connection to our q process on port 5455 and if it is successful, it will send the console window size back to the q process (this will be used later). Once the q process receives the connection, it will save the handle and call the timer function. The timer function will set its own rate on every call, we will see why shortly. 

Now that we have our HTML script and our meta tag added, we can access this snow script in two different ways and effortlessly watch the snow fall. It's nice, but maybe just a little bit boring for my tastes. I want to add a more dynamic feel to the weather by changing wind, snow speed and snow density. 

#### Dynamic Weather

The weather is constantly changing, as we all know, but the snow.q script as it exists now doesn't seem to change much. The snow is generating and falling randomly, but it always falls to the right, with the same snowflake density and just about the same pace. This is a result of the constant WIND, FALL and RATE variables that we assigned earlier. We can add a bit of movement in these dimensions by adjusting these variables as a function of time. 

``` q
/ new constants
BORING:0b
/ new globals
W:0f;R:"0";F:0;
/ updated functions
advance:{[f]
  dwd:TRIG 7h$ f`d; / diminish with distance
  f:update r:r+dwd, c:c+getWind[]*dwd from f; / dynamic wind
  f:update r:r+dwd*(count[f]?2.)-1, c:c+dwd*(count[f]?2.)-1 from f; / jiggle
  f:delete from f where any each not f within'\:BOUNDS; 
  f upsert flip 0 1 1f*getFall[]?'RCD } 
autoRefresh:{ssr[x;"<head><style>";"<head><meta http-equiv='refresh' content='",getRRate[.001],"'><style>"] }
.z.ts:{
  @[h;;{:system"t 0"}] raze ,\:[;.h.br]disp Flakes::advance Flakes;
  system"t ",getRRate[1]; }
/ new functions
mrate:{6h$1000*.27+.25*sin 6.283185*x%300000} / moving rate 20i thru 520i every 5 min
srate:{sin 6.283185*x%100000} / moving rate -1. thru 1. every 100 sec
getRRate:{:R::string x*RFSH*$[BORING;RATE;mrate .z.t]} / dynamic refresh rate as product of x
getWind:{:W::first (-.5+1?1f)+$[BORING;WIND;srate[.z.t]+.005*mrate[.z.t]-270]} / dynamic wind + gust
getFall:{:F::$[BORING;FALL;first 0|7h$(-1+1?2.)+10*1+srate .z.t]} / dynamic fall rate
```

Now we can see why the timer function sets its own rate. After each .z.ts[] call the timer rate is updated with the new, dynamic refresh rate. This will automatically change the speed in which the snow falls as a factor of time. Each dynamic rate (WIND, FALL and RATE) follows some variation of a sinusoidal function with various amounts of noise added. Due to the randomness and time-dependence built into each dynamic function, it is necessary to store the most recent value in a global variable so that it can be accurately displayed at any point during operation. Whether you are debugging your code, or just casually watching your dynamic snow, you may become curious about the numbers behind it. So next we will build a way to nicely display those numbers on screen. 

#### Display Stats

Generating and displaying stats at the end of our snow text is relatively thanks to the .Q.s function:
 
``` q
/ new functions
sLine:{x,$[STAT;enlist .Q.s genStats[];""]} / display stats on screen
genStats:{([TIME:1#.z.T]REFRESH:1#RFSH;BORING:1#BORING;FALL:F;WIND:1#7h$100*W;RRATE:1#"I"$R)}
/ updated functions
.z.ph:{$[RFSH;autoRefresh;(::)] .h.hp sLine disp Flakes::advance Flakes}
.z.ts:{
  @[h;;{:system"t 0"}] raze sLine ,\:[;.h.br]disp Flakes::advance Flakes;
  system"t ",getRRate[1]; }
```

Notice how our global variables come in handy here to accurately track the WIND, FALL and REFRESH rates. Although this stat line could be achieved in one line, breaking it up adds a bit of readability. 

At this point, we are nearly done. We can access our snow using 2 different protocols, dynamically adjust the weather and display our weather stats on screen. I just wish the "sky" fit my browser window and the snow covered the entire screen. Let's see what we can do. 

#### Fit to Screen

Remember this function from our index.html? 

``` javascript
ws.onopen=function(e){
        ws.send(`${window.innerHeight},${window.innerWidth}`)
    };
```

It's finally time to put it to use. Here we will parse the string values into corresponding numerical types and base our FRAME shape on those values: 

``` q
/ new functions
updFrame:{[h;w] / update FRAME to window size
	@[;0 1;:;floor (-3+h%15.5;w%8.2)] each `FRAME`RCD;
	BOUNDS::`r`c`d!0,'RCD-1 }
/ updated functions
.z.ws:{
  h::neg .z.w;
  updFrame . "J"$","vs x;
  .z.ts[]; } 
```

This is hardly the bulletproof solution that I would like, but it does the trick (on my computer at least 😅). These conversions are based on trial and error with the 10pt verdana font that we use in the body of the index.html document and take into account the 3 lines that are reserved at the end for the stat line. These values may need to be updated for your personal browser if the snow is not displaying the way you would expect. It is also worth noting that while the HTTP method will reflect the changes made to the FRAME, it has no method to call updFrame[] so it will not fit to screen if this is the only protocol you use. 

#### Conclusion

If you have followed along to this point, you will have some pretty realistic snowfall generating on your screen, congratulations. Finally, I think I can say I am satisfied with my snow, there's not much else I can think to add. Is it over engineered? Maybe. But as summer quickly approaches, at least I know I can still bundle up in a warm blanket with a cup of hot chocolate and still watch the snow fall from my computer screen. 

Video: [link][screencastify]

Full Script: [link][qSnow] 


``` q
/ constants
FRAME:2#RCD:30 80 5 / rows; columns; depth
BOUNDS:`r`c`d!0,'RCD-1 / stay within
FALL:9 / flakes per cycle
PORT:5000+sum`long$"snow"
/ apparent movement diminishes with distance
TRIG:2*atan .5%1+til RCD 2 / https://elvers.us/perception/visualAngle/
WIND:0.3
RFSH:1b / auto refresh
RATE:300 / static refresh rate (ms)
STAT:0b / show refresh rate& wind
BORING:1b / are you boring?

/ globals
Flakes:([]r:0#0.;c:0#0.;d:0#0.) / row, col; depth
W:0f;R:"0";F:0; / realtime wind, refresh rate, fall

/ functions
disp:{FRAME#@[prd[FRAME]#" ";prd[FRAME]&FRAME sv x`r`c;:;"#**......."@x`d]} 7h$
advance:{[f]
  dwd:TRIG 7h$ f`d; / diminish with distance
  f:update r:r+dwd, c:c+getWind[]*dwd from f; / dynamic wind
  f:update r:r+dwd*(count[f]?2.)-1, c:c+dwd*(count[f]?2.)-1 from f; / jiggle
  f:delete from f where any each not f within'\:BOUNDS; 
  f upsert flip 0 1 1f*getFall[]?'RCD } 
autoRefresh:{ssr[x;"<head><style>";"<head><meta http-equiv='refresh' content='",getRRate[.001],"'><style>"] }
mrate:{6h$1000*.27+.25*sin 6.283185*x%300000} / moving rate 20i thru 520i every 5 min
srate:{sin 6.283185*x%100000} / moving rate -1. thru 1. every 100 sec
getRRate:{:R::string x*RFSH*$[BORING;RATE;mrate .z.t]} / dynamic refresh rate as product of x
getWind:{:W::first (-.5+1?1f)+$[BORING;WIND;srate[.z.t]+.005*mrate[.z.t]-270]} / dynamic wind + gust
getFall:{:F::$[BORING;FALL;first 0|7h$(-1+1?2.)+10*1+srate .z.t]} / dynamic fall rate
sLine:{x,$[STAT;enlist .Q.s genStats[];""]} / display stats on screen
genStats:{([TIME:1#.z.T]REFRESH:1#RFSH;BORING:1#BORING;FALL:F;WIND:1#7h$100*W;RRATE:1#"I"$R)}
updFrame:{[h;w] / update FRAME to window size
	@[;0 1;:;floor (-3+h%15.5;w%8.2)] each `FRAME`RCD;
	BOUNDS::`r`c`d!0,'RCD-1 }

/ callback
.z.ph:{$[RFSH;autoRefresh;(::)] .h.hp sLine disp Flakes::advance Flakes}
.z.ts:{
  @[h;;{:system"t 0"}] raze sLine ,\:[;.h.br]disp Flakes::advance Flakes;
  system"t ",getRRate[1]; }
.z.ws:{
  h::neg .z.w;
  updFrame . "J"$","vs x;
  .z.ts[]; } 

system "S ",string 6h$.01*.z.t
system "p ",string PORT
-1 "Listening on ",string PORT;
```


 Thanks for reading 😀 
What other snow features can you think to add? 


[kxc-post]: https://community.kx.com/t5/General/Joy-of-q-It-s-snowing-again/td-p/12237
[qSnow]: https://github.com/jbetz34/qSnow/
[screencastify]: https://watch.screencastify.com/v/CuB62FFiCTQAkZuECpma