let img;
var currentImageIndex = 0;
let images = [];

let lastKeyPressTime = 0;
let switchImageDelay = 1000; // 1 second
let direction = 1;

let yPos = 0;
let ySpeed;
let isJumping;

let bgX = 0;

h = 120;

let visibleEnemies = [];
let lastEnemySpawnTime = 0;
let enemySpawnInterval; 

let enemyImage;
let currentEnemies = 0;
let maxVisibleEnemies = 10; //------- data.json level


var time1ENEMY = 2000; //------- data.json level
var time2ENEMY = 3000; //------- data.json level
var speedENEMY = 4;

let lives; //------- data.json level
let maxLives;
let levelGame;

let enemiesHit = 0; //------- data.json total/game

let playerHit = false;
let gameOver = false; 

var meterTotStop = 800;
let distanceToStopEnd;


var keyPrRR = 39; //------- data.json controls optional
var keyPrRL = 37; //------- data.json controls optional
var keyPrJU = 32; //------- data.json controls optional
var keyPrAT = 65; //------- data.json controls optional

let timer;
let countdownDuration = 10000;

// --------------------------------------------------------------------------------------------------------- PRELOAD

function preload() {
  bg = loadImage("spriteFotos/background1.jpg");

  for (let i = 0; i < 4; i++) {
    images[i] = loadImage('spriteFotos/Bninja' + (i + 1) + '.png');
  }
  enemyImage = loadImage('spriteFotos/Enemy.png');
  enemyImageDis = loadImage('spriteFotos/Enemy.png');

  ninjaProne = loadImage('spriteFotos/BninjaProne.png');

  heartImage = loadImage('spriteFotos/Hartje.png'); // Load heart image

  stopEnd = loadImage('spriteFotos/stopEnd.png');
}

// --------------------------------------------------------------------------------------------------------- SETUP

function setup() {
  createCanvas(1200, 600,);

  if (gameStarted) {

    shouldRunGameLogic = true;

    img = images[currentImageIndex];

    yPos = height - h;
    ySpeed = 0;
    isJumping = false;

    spawnEnemy(); // Initial spawn of enemy
    displayLives();
  }

}

// --------------------------------------------------------------------------------------------------------- DRAW
function draw() {


  if (shouldRunGameLogic) {
    clear();

    background('green');

    if (bgX > 0) {
      bgX = bgX % 1200;
    } else if (bgX < -1200) {
      bgX = 0;
    }

    let bgPosX = (width - bg.width) / 2 + bgX;
    let bgPosY = (height - bg.height) / 2;

    if (keyIsDown(keyPrRR)) {
      bgX -= 2;
      Enemy.speed = Enemy.speed + 2;
      meterTotStop -= 2;
    } else if (keyIsDown(keyPrRL)) {
      bgX += 2;
      Enemy.speed = Enemy.speed + 2;
      meterTotStop += 2;
    }

    bg.resize(1200, 600);
    image(bg, bgPosX - 1200, bgPosY);
    image(bg, bgPosX, bgPosY);
    image(bg, bgPosX + 1200, bgPosY);

    // ----------------------------------------------------------------------------------------------------- END STOP

    distanceToStopEnd = abs(width / 2.5 - meterTotStop);

    if (!gameOver) {
      if (enemiesHit >= maxVisibleEnemies) {
        stopEnd.resize(70, 160);
        image(stopEnd, meterTotStop, height - 260);
        updateDistanceIndicator(distanceToStopEnd);

        // Check if the player is in the specified range and start the timer
        if (distanceToStopEnd >= 0 && distanceToStopEnd <= 100) {
          if (!timer) {
            timer = millis();
          }

          // Calculate elapsed time
          let elapsedTime = millis() - timer;

          // Check if 10 seconds have passed
          if (elapsedTime >= countdownDuration) {
            // Game over
            gameOver = true;
            timer = null; // Reset the timer
          }
          
          displayTimer(elapsedTime);
          
        } else {
          // Reset the timer if the player is not in the specified range
          timer = null;
        }
      }
    }


    if (enemiesHit >= maxVisibleEnemies) {
      stopEnd.resize(70, 160)
      image(stopEnd, meterTotStop, height - 260);
      updateDistanceIndicator(distanceToStopEnd);
    }

    // -------------------------------------------------------------------------------------------------------------
    
    if (isJumping) {
      yPos += ySpeed;
      ySpeed += 0.5;
    }

    if (yPos > height - h) {
      yPos = height - h;
      ySpeed = 0;
      isJumping = false;
    }

    push();
    translate(width / 2.5, yPos);
    scale(direction, 1);
    imageMode(CENTER);
    image(img, 0, 0);
    scale(1 / direction, 1);
    translate(-width / 2, -yPos);
    pop();

    for (let i = 0; i < images.length; i++) {
      if (i === 1) {
        images[i].resize(210, 100);
      } else if (i === 0) {
        images[i].resize(60, 100);
      } else if (i === 3) {
        images[i].resize(80, 80);
      } else {
        images[i].resize(100, 100);
      }
    }

    if (!keyIsDown(keyPrRR) && !keyIsDown(keyPrRL) && !(keyIsDown(keyPrJU) || keyIsDown(keyPrAT))) {
      if (millis() - lastKeyPressTime > switchImageDelay && currentImageIndex !== 0) {
        currentImageIndex = 0;
        img = images[currentImageIndex];
      }
    }

    // ----------------------------------------------------------------------------------------------------- GAME OVER
    
    if (gameOver) {
      drawGameOverScreen();
      if (keyIsDown(ENTER) && millis() - lastKeyPressTime > 5) {
        resetGame();
        lastKeyPressTime = millis();
      }
      return; // Skip the rest of the draw function when the game is over
    }


    // -------------------------------------------------------------------------------------------------- COLLIDECHECK

    for (let i = 0; i < visibleEnemies.length; i++) {
      visibleEnemies[i].update();
      visibleEnemies[i].display();

      if (currentImageIndex === 1) { // Assuming Bninja2.png is the attack image index
        let attackWidth = images[currentImageIndex].width;
        let attackHeight = images[currentImageIndex].height;
        let attackYOffset = 15; // Adjust this value as needed

        if (checkCollision(
          width / 2.5 - attackWidth / 2, yPos - attackHeight / 2 + attackYOffset, attackWidth, attackHeight - 2 * attackYOffset, // Player attack area
          visibleEnemies[i].x - visibleEnemies[i].image.width / 2, visibleEnemies[i].y - visibleEnemies[i].image.height / 2, // Enemy area
          visibleEnemies[i].image.width, visibleEnemies[i].image.height
        )) {
          visibleEnemies.splice(i, 1);
          enemiesHit++;
        }
      } else {
        // Your existing collision check for other images
        if (checkCollision(
          width / 2.5 + 20, yPos - 50, 60, 130, // Player rectangle
          visibleEnemies[i].x - 20, visibleEnemies[i].y - 20, 40, 40 // Enemy rectangle
        )) {
          if (!playerHit) {
            lives -= 1;
            img = ninjaProne;
            ninjaProne.resize(80, 100);
            playerHit = true;
            setTimeout(() => {
              img = images[currentImageIndex];
              playerHit = false;
            }, 1000);
          }
        }
      }
    }

    // -------------------------------------------------------------------------------------------------------- CHECKS
    
    if (lives <= 0) {
      gameOver = true;
    }

    

    displayLives();
    removeOffscreenEnemies();
  }  
}

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////

//////////////////////////// FUNCTIES FUNCTIES /////////////////////////
//////////////////////////// FUNCTIES FUNCTIES /////////////////////////
//////////////////////////// FUNCTIES FUNCTIES /////////////////////////

////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////


// --------------------------------------------------------------------------------------------------------- KEYPRESS

function keyPressed() {
  lastKeyPressTime = millis();

  if (keyIsDown(keyPrRR)) {
    direction = 1;
    currentImageIndex = 2;
    img = images[currentImageIndex];
  } else if (keyIsDown(keyPrRL)) {
    direction = -1;
    currentImageIndex = 2;
    img = images[currentImageIndex];
  } else if (keyIsDown(keyPrJU)) {
    currentImageIndex = 3;
    img = images[currentImageIndex];
    if (!isJumping) {
      ySpeed = -15;
      isJumping = true;
    }
  } else if (keyIsDown(keyPrAT)) {
    currentImageIndex = 1;
    img = images[currentImageIndex];
  } else {
    currentImageIndex = 0;
    img = images[currentImageIndex];
  }
}

// --------------------------------------------------------------------------------------------------------- SPAWNENEMY

function spawnEnemy() {
  if (visibleEnemies.length < maxVisibleEnemies) {

    let randomX = random(700, 1200);
    let randomY = random(200, height - 100);

    randomX = constrain(randomX, 0, width);
    randomY = constrain(randomY, 0, height);

    let newEnemy = new Enemy(randomX, randomY, -1);
    visibleEnemies.push(newEnemy);

    // Herhaal spawnEnemy na een willekeurige tijd
    setTimeout(spawnEnemy, random(time1ENEMY, time2ENEMY)); //------- data.json level
  }
}

function removeOffscreenEnemies() {
  for (let i = visibleEnemies.length - 1; i >= 0; i--) {
    if (visibleEnemies[i].x < 0 || visibleEnemies[i].x > width) {
      visibleEnemies.splice(i, 1);
    }
  }
}

// --------------------------------------------------------------------------------------------------------- ENEMY

class Enemy {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speedENEMY; //------- data.json level
    this.image = enemyImage;
  }

  update() {
    this.x += this.speed * this.direction;
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.direction, 1);

    image(this.image, 0, 0);
    this.image.resize(40, 40);

    pop();
  }
}

// ----------------------------------------------------------------------------------------------------- DISPLAY

function displayLives() {

  let displayImageX1 = 20; 
  let displayImageX2 = width - 235; 
  let displayImageY = 20; 

  let displayTextX1 = 60; 
  let displayTextX2 = width - 190; 

  let displayTextY = 42;

  // ----------------------------------------------------------------- levens

  image(heartImage, displayImageX1, displayImageY);
  heartImage.resize(30, 30);

  textSize(20);
  fill("black");
  text(lives + "/" + maxLives, displayTextX1, displayTextY);


  // ----------------------------------------------------------------- level

  fill(0, 0, 0, 130); // 204 represents 80% transparency
  rect(width/2.5 - 60, displayTextY - 25, 105, displayTextY - 5, 30);
  noStroke();

  textSize(20);
  fill(255);
  text("Level " + levelGame, width/2.5 - 40, displayTextY);


  // ----------------------------------------------------------------- vijand 

  image(enemyImageDis, displayImageX2, displayImageY);
  enemyImageDis.resize(30, 30);
  
  textSize(20);
  fill("black");
  text("Enemies Hit: " + enemiesHit + "/" + maxVisibleEnemies, displayTextX2, displayTextY);
}

// --------------------------------------------------------------------------------------------------------- TIMER

function displayTimer(elapsedTime) {
  push();
  fill(255);
  textSize(20);
  textAlign(RIGHT, CENTER);

  let remainingTime = countdownDuration - elapsedTime;
  let seconds = Math.ceil(remainingTime / 1000);

  text(`Time: ${seconds}s`, width/2 - 20, height - 30);
  pop();
}

// --------------------------------------------------------------------------------------------------------- COLLIDE

function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 &&
         x1 + w1 > x2 &&
         y1 < y2 + h2 &&
         y1 + h1 > y2;
}

// -------------------------------------------------------------------------------------------------- GAME OVER SCREEN

function drawGameOverScreen() {
  push();
  // Draw a semi-transparent overlay
  fill(0, 0, 0, 164); // 204 represents 80% transparency
  rect(0, 0, width, height);

  // Display "GAME OVER" and instructions
  textAlign(CENTER, CENTER);
  textSize(60);
  fill(255);

  if (lives > 0) {
    text("YOU WON!!!", width / 2, height / 2 - 50);
  } else {
    text("GAME OVER", width / 2, height / 2 - 50);
  }
  textSize(20);
  text("Press 'Enter' to continue", width / 2, height / 2 + 20);

  // Display additional information in a white box
  fill(255);
  rect(width / 2 - 150, height / 2 + 80, 300, 100, 30); // Adjust the size of the white box as needed

  // Display player's lives and kills
  textSize(18);
  fill(0);

  text(`Lifes: ${lives}`, width / 2, height / 2 + 120);
  text(`Kills: ${enemiesHit}`, width / 2, height / 2 + 150);
  
  pop();
}


function resetGame() {
  gameOver = false;
  timer = null;

  lives = maxLives;

  enemiesHit = 0;
  visibleEnemies = [];

  currentImageIndex = 0;
  img = images[currentImageIndex];

  yPos = height - h;
  ySpeed = 0;
  isJumping = false;

  direction = 1;
  playerHit = false;

  spawnEnemy();

  displayLives();

  bg.resize(1200, 600); // Resize the background image
  bgX = 0; // Reset bgX after resizing
}

// --------------------------------------------------------------------------------------------------- DISTANCE

function updateDistanceIndicator(distanceToStopEnd) {
  push();
  fill(225, 225, 0, 220);
  noStroke();
  rect(width - 200, height - 150, 70, 30, 20); // Display the yellow block

  fill(0);
  textSize(15);
  textAlign(CENTER, CENTER);
  text(nf(distanceToStopEnd, 0, 0) + "m", width - 165, height - 135); // Display the text
  pop();
}





