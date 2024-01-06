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

var bg;

h = 120;

let visibleEnemies = [];
let lastEnemySpawnTime = 0;
let enemySpawnInterval; // interval tussen spawns in milliseconden (5 seconden)

let enemyImage;
let maxVisibleEnemies = 10;
let currentEnemies = 0;

let lives = 5; // Initial number of lives
let enemiesHit = 0; // Counter for enemies hit

let playerHit = false;

let gameOver = false; // Variable to track game over state

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
}

// --------------------------------------------------------------------------------------------------------- SETUP

function setup() {
  createCanvas(1200, 600);
  img = images[currentImageIndex];

  yPos = height - h;
  ySpeed = 0;
  isJumping = false;

  spawnEnemy(); // Initial spawn of enemy
  displayLives();

}

// --------------------------------------------------------------------------------------------------------- DRAW
function draw() {
  clear();

  background('green');

  if (bgX > 0) {
    bgX = bgX % 1200;
  } else if (bgX < -1200) {
    bgX = 0;
  }

  let bgPosX = (width - bg.width) / 2 + bgX;
  let bgPosY = (height - bg.height) / 2;

  if (keyIsDown(RIGHT_ARROW)) {
    bgX -= 2;
    Enemy.speed = Enemy.speed + 2;
  } else if (keyIsDown(LEFT_ARROW)) {
    bgX += 2;
    Enemy.speed = Enemy.speed + 2;
  }

  bg.resize(1200, 600);
  image(bg, bgPosX - 1200, bgPosY);
  image(bg, bgPosX, bgPosY);
  image(bg, bgPosX + 1200, bgPosY);

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

  if (!keyIsDown(RIGHT_ARROW) && !keyIsDown(LEFT_ARROW) && !(keyIsDown(' ') || keyIsDown('a'))) {
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
        width / 2.5 - 40, yPos - 50, 60, 130, // Player rectangle
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

  // ----------------------------------------------------------------------------------------------------- LIVES CHECK
  
  if (lives <= 0) {
    gameOver = true;
  }


  displayLives();
  removeOffscreenEnemies();

}

// --------------------------------------------------------------------------------------------------------- KEYPRESS

function keyPressed() {
  lastKeyPressTime = millis();

  if (keyIsDown(RIGHT_ARROW)) {
    direction = 1;
    currentImageIndex = 2;
    img = images[currentImageIndex];
  } else if (keyIsDown(LEFT_ARROW)) {
    direction = -1;
    currentImageIndex = 2;
    img = images[currentImageIndex];
  } else if (key === ' ') {
    currentImageIndex = 3;
    img = images[currentImageIndex];
    if (!isJumping) {
      ySpeed = -15;
      isJumping = true;
    }
  } else if (key === 'a') {
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
    setTimeout(spawnEnemy, random(2000, 3000));
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
    this.speed = 4;
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

// ---------------------------------------------------------------------------------------------------- DISPLAY LIVES

function displayLives() {

  let displayImageX1 = 20; 
  let displayImageX2 = width - 235; 
  let displayImageY = 20; 

  let displayTextX1 = 60; 
  let displayTextX2 = width - 190; 

  let displayTextY = 42;

  // Display levens
  image(heartImage, displayImageX1, displayImageY);
  heartImage.resize(30, 30);

  textSize(20);
  fill(255);
  text(lives + "/5", displayTextX1, displayTextY);
 
  // Display vijand-hits
  image(enemyImageDis, displayImageX2, displayImageY);
  enemyImageDis.resize(30, 30);
  
  textSize(20);
  fill(255);
  text("Enemies Hit: " + enemiesHit + "/" + maxVisibleEnemies, displayTextX2, displayTextY);
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
  text("GAME OVER", width / 2, height / 2 - 50);
  textSize(20);
  text("Press 'Enter' to continue", width / 2, height / 2 + 20);
  pop();
}

function resetGame() {
  gameOver = false;
  lives = 5;
  enemiesHit = 0;
  visibleEnemies = [];
  spawnEnemy();
  currentImageIndex = 0;
  img = images[currentImageIndex];
  yPos = height - h;
  ySpeed = 0;
  isJumping = false;
  bgX = 0; // Reset bgX to 0
  direction = 1;
  playerHit = false;
  displayLives();
  bg.resize(1200, 600); // Resize the background image
  bgX = 0; // Reset bgX after resizing
}




