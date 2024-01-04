let img;
let currentImageIndex = 0;
let images = [];

let lastKeyPressTime = 0;
let switchImageDelay = 1000; // 1.5 seconds
let direction = 1; 

let yPos = 0;
let ySpeed;
let isJumping;

let x = 0;

var bg;
var bgX = 0;

h = 120;

function preload() {
  bg = loadImage("spriteFotos/background1.jpg");

  for (let i = 0; i < 4; i++) {
    images[i] = loadImage('spriteFotos/Bninja' + (i + 1) + '.png');
  }
}

function setup() {
  createCanvas(1200, 600);
  img = images[currentImageIndex];

  yPos = height - h;
  ySpeed = 0;
  isJumping = false;

}

function draw() {
  clear();
  background('green');

  // Handle wrap-around for moving to the left
  if (x > 0) {
    x = x % 1200;
  } else if (x < -1200) {
    x = 0;
  }

  let bgPosX = (width - bg.width) / 2 + x;
  let bgPosY = (height - bg.height) / 2;

  if (keyIsDown(RIGHT_ARROW)) {
    x -= 2;
  } else if (keyIsDown(LEFT_ARROW)) {
    x += 2;
  }

  bg.resize(1200, 600);

  bg3 = image(bg, bgPosX - 1200, bgPosY);
  bg1 = image(bg, bgPosX, bgPosY);
  bg2 = image(bg, bgPosX + 1200, bgPosY);

  
  if (isJumping) {
    yPos += ySpeed;
    ySpeed += 0.5; // voeg zwaartekracht toe
  }

  // Controleer of het element de onderkant van het canvas heeft bereikt
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

    // Restoring the transformations to prevent affecting other elements
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
}

function keyPressed() {
  lastKeyPressTime = millis(); 

  if (keyIsDown(RIGHT_ARROW)) {
    direction = 1;
    currentImageIndex = 2;
    img = images[currentImageIndex];
  } 
  else if (keyIsDown(LEFT_ARROW)) {
    direction = -1;
    currentImageIndex = 2; 
    img = images[currentImageIndex];
  } 
  else if (key === ' ') {
    currentImageIndex = 3;
    img = images[currentImageIndex];
    if (!isJumping) {
      ySpeed = -15; 
      isJumping = true;
    }
  } 
  else if (key === 'a') {
    currentImageIndex = 1;
    img = images[currentImageIndex];
  } 
  else {
    currentImageIndex = 0;
    img = images[currentImageIndex];
  }
}
