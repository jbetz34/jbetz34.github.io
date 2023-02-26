// 2048 - James Betz

// INITIAL VARIABLES
let testFrame = [
    [ 512, 1024, 2048, 4096 ],
    [ 16, 64, 128, 256 ],
    [ 8, 16, 32, 32 ],
    [ 2, 2, 4, 4 ]
]
let gameFrame = [
    [ null, null, null, null ],
    [ null, null, null, null ],
    [ null, null, null, null ],
    [ null, null, null, null ]
];
let prevFrame = [
    [ null, null, null, null ],
    [ null, null, null, null ],
    [ null, null, null, null ],
    [ null, null, null, null ]    
];
let colorDict = {
    "standard"  :   {    // taken from play.2048.co
        null    :   ["rgb(238,228,218, 0.35)","#f9f6f2"],
        2       :   ["#eee4da","#776e65"],
        4       :   ["#eee1c9","#776e65"],
        8       :   ["#f3b27a","#f9f6f2"],
        16      :   ["#f69664","#f9f6f2"],
        32      :   ["#f77c5f","#f9f6f2"],
        64      :   ["#f75f3b","#f9f6f2"],
        128     :   ["#edd073","#f9f6f2"],
        256     :   ["#edcc62","#f9f6f2"],
        512     :   ["#edc950","#f9f6f2"],
        1024    :   ["#edc53f","#f9f6f2"],
        2048    :   ["#edc22e","#f9f6f2"],
        4096    :   ["#3c3a33","#f9f6f2"],
    },
    "gradient"  :   {
        null    :   ["rgb(238,228,218, 0.35)","#f9f6f2"],
        2       :   ["#d66c5c","#f9f6f2"],
        4       :   ["#de8a50","#f9f6f2"],
        8       :   ["#e7a745","#f9f6f2"],
        16      :   ["#efc539","#f9f6f2"],
        32      :   ["#cbda3e","#f9f6f2"],
        64      :   ["#9fd24f","#f9f6f2"],
        128     :   ["#72CA60","#f9f6f2"],
        256     :   ["#46c271","#f9f6f2"],
        512     :   ["#3dad8d","#f9f6f2"],
        1024    :   ["#3598aa","#f9f6f2"],
        2048    :   ["#2c83c6","#f9f6f2"],
        4096    :   ["#6528ad","#f9f6f2"],
    },
    "palette"  :   {
        null    :   ["rgb(238,228,218, 0.35)","#f9f6f2"],
        2       :   ["#4f8c9d","#f9f6f2"],
        4       :   ["#0df38f","#f9f6f2"],
        8       :   ["#97127b","#f9f6f2"],
        16      :   ["#6eae3d","#f9f6f2"],
        32      :   ["#553a76","#f9f6f2"],
        64      :   ["#8ae1f9","#f9f6f2"],
        128     :   ["#294d46","#f9f6f2"],
        256     :   ["#d6bcf5","#f9f6f2"],
        512     :   ["#0b29d0","#f9f6f2"],
        1024    :   ["#f27ff5","#f9f6f2"],
        2048    :   ["#056e12","#f9f6f2"],
        4096    :   ["#fa2e55","#f9f6f2"],
    },
    "salmon-sushi" : {
        // fonts : { dark: #808080, light: #ffffff }
        // old color: 
        null    : ["rgb(238,228,218, 0.35)","#f9f6f2"],
        2       :   ["#e7f2f8","#808080"],
        4       :   ["#c0e0e9","#808080"],
        8       :   ["#99ceda","#808080"], 
        16      :   ["#74bdcb","#ffffff"],  
        32      :   ["#96b6d9","#ffffff"],
        64      :   ["#b8afa7","#ffffff"],
        128     :   ["#daa895","#ffffff"],
        256     :   ["#ffa384","#ffffff"],
        512     :   ["#f9b996","#ffffff"],
        1024    :   ["#f3cfa8","#808080"],
        2048    :   ["#efe7bc","#808080"],
        4096    :   ["#b1d2c3","#808080"],
    },
    "seabreeze" : {
        null    :   ["rgb(238,228,218, 0.35)","#f9f6f2"],
        2       :   ["#e7f2f8","#7f7f7f"],
        4       :   ["#d2e8f0","#7f7f7f"],
        8       :   ["#bddfe8","#7f7f7f"],
        16      :   ["#a8d5df","#7f7f7f"],
        32      :   ["#93cbd7","#ffffff"],
        64      :   ["#7ec2cf","#ffffff"],
        128     :   ["#81bbc5","#ffffff"],
        256     :   ["#9ab6b8","#ffffff"],
        512     :   ["#b3b1ab","#ffffff"],
        1024    :   ["#ccac9e","#ffffff"],
        2048    :   ["#e6a891","#ffffff"],
        4096    :   ["#ebedda","#7f7f7f"],
    },
    "school" : {
        null    :   ["rgb(238,228,218, 0.35)","#f9f6f2"],
        2       :   ["#e63946","#e6e6e6"],
        4       :   ["#e96e74","#e6e6e6"],
        8       :   ["#eca2a2","#e6e6e6"],
        16      :   ["#efd7cf","#808080"],
        32      :   ["#eaf7ec","#808080"],
        64      :   ["#d6eee7","#808080"],
        128     :   ["#c3e6e3","#808080"],
        256     :   ["#afddde","#808080"],
        512     :   ["#96c9d1","#808080"],
        1024    :   ["#7bafbf","#808080"],
        2048    :   ["#6095ae","#e6e6e6"],
        4096    :   ["#82374f","#e6e6e6"],
    },
    "marguerita":   {
        null    :   ["rgb(238,228,218, 0.35)","#f9f6f2"],
        2       :   ["#0a7029", "#eff3d9"], // dark: 677227
        4       :   ["#368422", "#eff3d9"], // light: edf3e9
        8       :   ["#63981a", "#eff3d9"],
        16      :   ["#8fac13", "#eff3d9"],
        32      :   ["#bbc00b", "#535e13"],
        64      :   ["#e8d404", "#535e13"],
        128     :   ["#f9de07", "#535e13"],
        256     :   ["#efde16", "#535e13"],
        512     :   ["#e5de25", "#535e13"],
        1024    :   ["#dcdf34", "#535e13"],
        2048    :   ["#d2df43", "#535e13"],
        4096    :   ["#73ac81", "#eff3d9"],
    },
};
let colorTheme = colorDict["standard"];
let score = 0;
let win = false;

// TOUCH MOVEMENT FOR MOBILE
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

var xStart = null;
var yStart = null;

function getTouches(evt) {
    console.log('enter getTouches')
    return evt.touches || evt.originalEvent.touches
}
function handleTouchStart(evt) {
    console.log('enter handleTouchStart')
    const firstTouch = getTouches(evt)[0];
    xStart = firstTouch.clientX;
    yStart = firstTouch.clientY;
}
function handleTouchMove(evt) {
    console.log('enter handleTouchMove')
    if (!xStart || !yStart) {
        return;
    };
    
    var xEnd = evt.touches[0].clientX;
    var yEnd = evt.touches[0].clientY;
    var xDiff = xStart - xEnd;
    var yDiff = yStart - yEnd;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        // x direction is dominant
        if (xDiff > 0) {  
            // left swipe
            gameFrame = move(0)
            render()
        } else {  
            // right swipe
            gameFrame = move(2)
            render()
        }
    } else {
        if (yDiff > 0) {  
            // up swipe
            gameFrame = move(1)
            render()            
        } else {  
            // down swipe
            gameFrame = move(3)
            render()
        }        
    }
    // reset values
    xStart = null;
    yStart = null;
}

// MOVEMENT FOR ARROW KEYS
document.onkeydown = checkKey;
function checkKey(e) {
    e = e || window.event;
    if (e.keyCode == '38') {    
        // up arrow
        gameFrame = move(1)
        render()
    }
    else if (e.keyCode == '40') {
        // down arrow
        gameFrame = move(3)
        render()
    }
    else if (e.keyCode == '37') {
        // left arrow
        gameFrame = move(0)
        render()
    }
    else if (e.keyCode == '39') {
        // right arrow
        gameFrame = move(2)
        render()
    }
}

// UTILITY FUNCITON - COPY GRID WITHOUT REFERENCE
function clone (e) {
    copy = []; l = copy.length = e.length
    for (var i=0; i<l; i++) { 
        copy[i] = [i] 
    }
    for (i in e.flat()) {
        copy[Math.floor(i/l)][i%l] = e.flat()[i]
    }
    return copy
}

// GENERATE RANDOM NEW BLOCKS
function generate2or4 () {
    return 2 * Math.floor(Math.random()+1.1)  // 90% chance of 2
}
function generateRandomBlock(grid = gameFrame) {
    empty = [];
    grid.flat().forEach( function (e,i) {
        (e === null) ? empty = empty.concat([i]) : false
    });
    index = empty[(Math.floor(Math.random()*empty.length))]
    num = generate2or4(); row = Math.floor(index/4); col = index%4
    grid[row][col] = num
    return grid
}

// PRIMARY MOVEMENT FUNCTIONS 
function leftShift (grid = gameFrame) {
    for (var i=0; i<4; i++) {
        row = grid[i].filter(e => e!= null)
        row = row.concat([null, null, null, null])
        row.length = 4
        grid[i] = row
    }
    return grid
}
function leftCompress (grid = gameFrame, test=false) {
    for (var i=0; i <4; i++) {
        for (var c=0; c<4; c++) {
            if (grid[i][c] === null) { continue }
            else if (grid[i][c] === grid[i][c+1]) {
                grid[i][c] *= 2
                grid[i][c+1] = null
                if (!test) {score += grid[i][c]}
            }
        }
    }
    return grid
}
function leftRotate (grid = gameFrame) {
    copy = clone(grid)
    for (var i=0; i<4; i++) {
        for (var c=0; c<4; c++) {
            copy[3-c][i] = grid[i][c]
        }
    }
    return copy
}

// SECONDARY MOVE FUNCITONS
function move (n, grid=gameFrame, test=false) {
    copy = clone(grid)
    for (var i=0; i<4; i++) {
        if (i === n) {
            copy = leftShift( leftCompress( leftShift (copy), test))
        }
        copy = leftRotate(copy)
    }
    if (grid.toString() != copy.toString()) {
      //  if (!test) { prevFrame = clone(grid) }
        grid = generateRandomBlock(copy)
    }
    return grid
}

// RENDER GAME FRAME TO HTML
function render () {
    grid = gameFrame.flat()    
    text = document.querySelectorAll(".grid-text")
    grid.forEach(function (e, i){
        text[i].innerText = (e === null) ? "" : e
        text[i].style.backgroundColor = colorTheme[e][0]
        text[i].style.color = colorTheme[e][1]
    })
    document.getElementById("score").innerText = "Current Score: "+ score.toString()
    endGame(gameFrame)
}

//function undo (grid=prevFrame) {
//    gameFrame = grid
//    render()
//}

function endGame (grid) {
    copy = clone(grid)
    for (var i=0;i<4;i++) { copy = move(i, copy, true) }

    if (copy.toString() == grid.toString()) {
        // if the grid is unable to change, you lose
        document.getElementById('lose').style.display = "flex"
    }
    else if (win) { 
        // if you already have won, you wont see the message again
    }
    else if ( grid.flat().filter(cell => cell == 2048).length > 0) {
        // if you won, show the win message
        document.getElementById("win").style.display = "flex"
        win = true
    }
}

// BUTTON FUNCITONS
function keepPlaying () {
    document.getElementById("win").style.display = "none"
}
function changeTheme (theme) {
    if (Object.keys(colorDict).includes(theme.value)) {
        colorTheme = colorDict[theme.value]
        render()
    }
}

// TEST FUNCTIONS
function testTheme (t) {
    gameFrame = testFrame
    colorTheme = colorDict[t]
    render()
}

// GAME INITIALIZATION
function initialize () {
    console.log('enter initialize')
    score = 0
    document.getElementById('win').style.display = "none"
    document.getElementById('lose').style.display = "none"
    gameFrame = [
        [ null, null, null, null ],
        [ null, null, null, null ],
        [ null, null, null, null ],
        [ null, null, null, null ]
    ]
    generateRandomBlock()
    generateRandomBlock()
    render()
    console.log('exit initialize')
}
