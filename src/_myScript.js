/**
 * Created by jamie on 3/23/17.
 */
var _stage = document.getElementById("stage");
var _canvas = document.querySelector("canvas");
var surface = _canvas.getContext("2d");

const ROWS = 6;
const COLS = 7;
const SIZE = 100;
const SCROLL = 5;
var NUMOBSTACLE = 2;  // # of obstacle in a row

_stage.style.width = COLS * SIZE + "px";
_stage.style.height = ROWS * SIZE + "px";
_canvas.width = COLS * SIZE;
_canvas.height = ROWS * SIZE;

var map = [];
var obstacle = {};

var leftPressed = false;
var rightPressed = false;
var upPressed = false;
var downPressed = false;
var spaceBarPressed = false;

var enemyHit = 0;

var player = {x: SIZE * 3.5, y: SIZE * 5, speed: 10, dX: 0, dY: 0, image: null};
var enemy = {image: null};
var enemyArr = [];
var enemyNum = 2; //set at least how many enemies can generate in a row

//var numRocks = 2; // how many obstacle in a row

var missile = {x: player.x, y: player.y, size: 20, speed: 10, image: null};
var launchMissile = [];

//var missile = {
//x: player.x,
//    y: player.y,
//   speed: 10,
//   image:null,
//launch: function () {
//    var missileImg = new Image();
//    missileImg.src = "img/missile.png";
//    surface.drawImage(missile, player.x, player.y);
// }};

var uIval = setInterval(update, 33.34); // 30fps  33.34


initGame();

function initGame() {
    console.log("Initializing game...");

    var pImage = new Image();
    pImage.src = "img/Ship.png";
    player.image = pImage;

    var missileImg = new Image();
    missileImg.src = "img/missile.png";
    missile.image = missileImg;

    var enemyImg = new Image();
    enemyImg.src = "img/enemy.png";
    enemy.image = enemyImg;

    generateMap();
    //randomizeObjects();
    generateEnemies();


    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
}

function update() {

    movePlayer();
    scrollMap();
    moveEnemies();
    render();
    collisionCheck();
}

function generateMap() {
    console.log("generate Map");

    for (var row = 0; row < ROWS + 1; row++) {
        map[row] = [];

        for (var col = 0; col < COLS; col++) {
            var tempTile = {x: col * SIZE, y: row * SIZE, image: null}
            var path = Math.ceil(Math.random() * 7); // random 7 safe Path img
            tempTile.image = new Image();
            tempTile.image.src = "img/path" + path + ".png";
            map[row][col] = tempTile;
        }
    }
}

function scrollMap() {
    for (var row = 0; row < map.length; row++) {
        for (var col = 0; col < map[0].length; col++) {
            map[row][col].y += SCROLL;
        }
    }

    if (map[0][0].y >= 0) {

        for (row = 0; row < map.length; row++) {
            //console.log("map[row][col]="+map[row][col]+"row="+row+"col="+col);

            map.splice(7, 1);  //remove the off-screen row


            // new add-----

            var tempTile = {x: row * SIZE, y: -100, image: null, isObstacle: 0};
            tempTile.image = new Image();
            var path = Math.ceil(Math.random() * 7); // 1~7
            tempTile.image.src = "img/path" + path + ".png";
            map[row].unshift(tempTile);



            // new add---

            /*
             tempTile = {x: row * SIZE, y: -100, image: null, isObstacle: 0}; //set a new row above canvas
             tempTile.image = new Image();


             var obs = Math.ceil(Math.random()*6); // random 6 obstacle img
             var path = Math.ceil(Math.random()*7); // random 7 safe Path img

             var num = Math.ceil(Math.random() * 100);  //generate 1 to 100


             if (num >= 80) {    //set 20% obstacles
             tempTile.image.src = "img/obstacle"+obs+".png";
             tempTile.isObstacle = 1;
             } else {
             tempTile.image.src = "img/path"+path+".png";
             tempTile.isObstacle = 0;
             }

             map[row].unshift(tempTile);

             //map[row].unshift(tempTile); //add a new tempTile into the row


             // console.log("map[1][3]"+ map[1][3].isSafe);
             */
        }
        for (var i = 0; i < NUMOBSTACLE; i++) {
            var ranCol = Math.floor(Math.random() * map[0].length); //find a spot to put obstacle

            var obs = Math.ceil(Math.random() * 6); // 1~6
            var blockImg = new Image();
            blockImg.src = "img/obstacle" + obs + ".png";
            obstacle.image = blockImg;

            map[0][ranCol] = obstacle;
        }
    }
}

function randomObstacle(NUMOBSTACLE) {
    for (var i = 0; i < NUMOBSTACLE; i++) {
        var ranCol = Math.floor(Math.random() * map[0].length); //find a spot to put obstacle

        var obs = Math.ceil(Math.random() * 6); // 1~6
        var blockImg = new Image();
        blockImg.src = "img/obstacle" + obs + ".png";
        obstacle.image = blockImg;

        map[0][ranCol] = obstacle;
    }
}


function generateEnemies() {

    for (var row = 0; row < ROWS - 3; row++) {

        enemyArr[row] = [];

        var initX = Math.floor(Math.random() * 2); //toggle of initial position

        for (var col = 0; col < enemyNum; col++) {

            var num = Math.floor(Math.random() * 100); //for the rate of enemy

            var randXLeft = -1 * Math.floor(Math.random() * 3); // -2 ~ 0
            var randXRight = -1 * randXLeft + 8;    // 6 ~ 8

            var tempTile = {x: 0, y: row * SIZE, image: null, isEnemy: 0, moveRight: 0};

            if (initX === 1)
                enemyArr[row].direction = 0; // set the row's direction
            else
                enemyArr[row].direction = 1; // set the row's direction

            if (enemyArr[row].direction === 0) {
                tempTile.x = randXRight * SIZE;  //random enemy initial position from right to left
                tempTile.moveRight = 0;
            }
            else {
                tempTile.x = randXLeft * SIZE;   //random enemy initial position from left to right
                tempTile.moveRight = 1;
            }

            //console.log("enemyArr[" + row + "].direction =" + enemyArr[row].direction);

            tempTile.image = new Image();

            if (num % 5) {
                tempTile.image.src = "img/enemy.png";
                tempTile.isEnemy = 1;
            }
            enemyArr[row][col] = tempTile;


            // console.log("enemyArr["+row+"]["+col+"] isEnemy= " + enemyArr[row][col].isEnemy);
        }
    }
}


function moveEnemies() {

    for (var row = 0; row < ROWS - 3; row++) {

        for (var col = 0; col < enemyNum; col++) {

            if (enemyArr[row][col].isEnemy === 1 && enemyArr[row][col].moveRight === 1) {
                enemyArr[row][col].x += SCROLL;
                if (enemyArr[row][col].x >= 7 * SIZE) {
                    enemyArr[row][col].x = Math.ceil(Math.random() * 2) * -1 * SIZE;

                    console.log("enemyArr[" + row + "][" + col + "].x =" + enemyArr[row][col].x + " , " + "y = " + enemyArr[row][col].y)
                }
            }
            if (enemyArr[row][col].isEnemy === 1 && enemyArr[row][col].moveRight === 0) {
                enemyArr[row][col].x -= SCROLL;
                if (enemyArr[row][col].x <= -1 * SIZE) {
                    enemyArr[row][col].x = (Math.floor(Math.random() * 2) + 7) * SIZE;

                    console.log("enemyArr[" + row + "][" + col + "].x =" + enemyArr[row][col].x + " , " + "y = " + enemyArr[row][col].y)
                }
            }

            //console.log("enemyArr["+row+"]["+col+"].x =" + enemyArr[row][col].x +" , "+"y = "+ enemyArr[row][col].y)
        }
    }

}


function onKeyDown(event) {
    switch (event.keyCode) {
        case 37:    // Left
        case 65:    // A
            if (leftPressed === false)
                leftPressed = true;
            break;
        case 39:    // Right
        case 68:    // D
            if (rightPressed === false)
                rightPressed = true;
            break;
        case 38:    // Up
        case 87:    // W
            if (upPressed === false)
                upPressed = true;
            break;
        case 40:    // Down
        case 83:    // Down or S
            if (downPressed === false)
                downPressed = true;
            break;
        case 32:    //spacebar
            if (spaceBarPressed === false) {
                spaceBarPressed = true;
                fire();
            }
            break;
        default:
            break;
    }
}

function onKeyUp(event) {
    switch (event.keyCode) {
        case 37: // Left.
        case 65:
            leftPressed = false;
            break;
        case 39: // Right.
        case 68:
            rightPressed = false;
            break;
        case 38: // Up.
        case 87:
            upPressed = false;
            break;
        case 40: // Down.
        case 83:
            downPressed = false;
            break;
        case 32:
            // spaceBarPressed = false;
            break;
        default:
            break;
    }
}


function movePlayer() {
    /*
     var x=player.x-SIZE/2;
     var y=player.y-SIZE/2;
     console.log("player.x = " + x + " / player.y = "+ y);
     */

    if (leftPressed === true && player.x > SIZE / 2) {
        player.x -= player.speed;
        missile.x -= player.speed;
    }
    if (rightPressed === true && player.x < 700 - SIZE / 2) {
        player.x += player.speed;
        missile.x += player.speed;
    }
    if (upPressed === true && player.y > SIZE / 2) {
        player.y -= player.speed;
        missile.y -= player.speed;
    }
    if (downPressed === true && player.y < 600 - SIZE / 2) {
        player.y += player.speed;
        missile.y += player.speed;
    }
}


function fire() {

    //var newMissile = Object.create(missile);
    //newMissile.launch();
    //launchMissile.push(newMissile);

    intvId = setInterval(moveMissile, 20); // invoke moveMissile function every 20 milliseconds
}


function moveMissile() {

    missile.y -= missile.speed;     // move the missile 5 pixels upward each time this function is called

    if (missile.y <= 0) {
        clearInterval(intvId);
        missile.y = player.y; // position the missile back to original launching position
        spaceBarPressed = false;
    }

}


function render() {

    surface.clearRect(0, 0, _canvas.width, _canvas.height); // x, y, w, h

    // Render map...
    for (var row = 0; row < map.length; row++) {
        for (var col = 0; col < map[0].length; col++) {
            if (map[row][col].image !== null) {
                surface.drawImage(map[row][col].image,
                    map[row][col].x,
                    map[row][col].y);
            }
        }
    }


    // Render missile
    surface.drawImage(missile.image, missile.x - 10, missile.y - 40);

    // Render player...
    surface.drawImage(player.image, player.x - SIZE / 2, player.y - SIZE / 2);

    // Render enemies
    for (row = 0; row < ROWS - 3; row++) {
        for (col = 0; col < enemyNum; col++) {
            if (enemyArr[row][col].isEnemy === 1) {
                surface.drawImage(enemy.image,
                    enemyArr[row][col].x,
                    enemyArr[row][col].y);
            }
        }
    }
}


function collisionCheck() {

    for (var row = 0; row < map.length; row++) {
        for (var col = 0; col < map[0].length; col++) {

            //The ship hits obstacle
            if (map[row][col].isObstacle === 1 &&
                map[row][col].x < (player.x - SIZE / 2) + SIZE && map[row][col].x + SIZE > (player.x - SIZE / 2) &&
                map[row][col].y < (player.y - SIZE / 2) + SIZE && map[row][col].y + SIZE > (player.y - SIZE / 2)) {
                //window.alert("rock("+ row +"," + col +")= ("+ map[row][col].x +","+map[row][col].y+")");

                //window.alert("GAME OVER");
                //clearInterval(uIval);
                //console.log("HIT ROCK");

                //var x = player.x-SIZE/2;
                //var y = player.y-SIZE/2;
                //console.log("player.x = " + x + " / player.y = "+ y);
                //console.log("rock("+ row +"," + col +")= ("+ map[row][col].x +","+map[row][col].y+")");
            }

            /*
             //missile hits obstacle
             if (map[row][col].isObstacle === 1 &&
             //missile.x < map[row][col].x + SIZE && missile.x + SIZE > map[row][col].x &&
             missile.y <= map[row][col].y + SIZE ){

             clearInterval(intvId);
             missile.y = player.y; // position the missile back to original launching position
             spaceBarPressed = false;
             }
             */
        }
    }

    // missile hits enemy
    for (row = 0; row < ROWS - 3; row++) {

        for (col = 0; col < enemyNum; col++) {

            if (enemyArr[row][col].isEnemy === 1) {
                if (missile.x >= enemyArr[row][col].x && missile.x <= enemyArr[row][col].x + SIZE &&
                    missile.y >= enemyArr[row][col].y && missile.y <= enemyArr[row][col].y + SIZE) {

                    missile.y = player.y; // position the missile back to original launching position
                    spaceBarPressed = false;
                    clearInterval(intvId);

                    enemyArr[row][col].image = null;
                    enemyArr[row][col].isEnemy = 0;

                    console.log("missile.x = " + missile.x + " / missile.y = " + missile.y);
                    console.log("enemy(" + row + "," + col + ")= (" + enemyArr[row][col].x + "," + enemyArr[row][col].y + ")");

                    enemyHit += 10;

                    var randNum = Math.floor(Math.random() * 3);
                    var ranInit = Math.floor(Math.random() * 2);
                    enemyArr[randNum][col].image = enemy.image;
                    enemyArr[randNum][col].isEnemy = 1;

                    if (ranInit === 0) {
                        enemyArr[randNum][col].x = Math.ceil(Math.random() * 2) * -1 * SIZE;

                    }
                    else {
                        enemyArr[randNum][col].x = (Math.floor(Math.random() * 2) + 7) * SIZE;
                    }

                }

            }
            //console.log("enemy(x.y)"+"("+enemyArr[row][col].x+","+enemyArr[row][col].y+")")
        }
    }
    document.getElementById("score").innerHTML = "Score: " + enemyHit;
}
