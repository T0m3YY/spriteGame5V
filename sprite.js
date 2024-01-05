let img;
let currentImageIndex = 0;
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

let enemies = [];
let lastEnemySpawnTime = 0;
let enemySpawnInterval; // interval tussen spawns in milliseconden (5 seconden)

let enemyImage;

function preload() {
  bg = loadImage("spriteFotos/background1.jpg");
  for (let i = 0; i < 4; i++) {
    images[i] = loadImage('spriteFotos/Bninja' + (i + 1) + '.png');
  }
  enemyImage = loadImage('spriteFotos/Enemy.png');
}

function setup() {
  createCanvas(1200, 600);
  img = images[currentImageIndex];

  yPos = height - h;
  ySpeed = 0;
  isJumping = false;

  // Voeg een startvijand toe
  spawnEnemy();
}

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
  } else if (keyIsDown(LEFT_ARROW)) {
    bgX += 2;
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

  // Teken vijanden
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update();
    enemies[i].display();
  }

  // Verwijder vijanden die uit beeld zijn
  removeOffscreenEnemies();

  // Controleer of het tijd is om een nieuwe vijand te spawnen
  if (millis() - lastEnemySpawnTime > enemySpawnInterval) {
    spawnEnemy();
  }
}

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

function spawnEnemy() {
  let randomInterval = random(2000, 5000);
  enemySpawnInterval = randomInterval;

  let randomX;

  if (direction === -1) {
    randomX = random(0, 400);
  } else {
    randomX = width/2 + random(50, 400);
  }

  let randomY = random(100, height - 100);

  // Beperk de spawnpositie tot het zichtbare gebied
  randomX = constrain(randomX, 0, width);
  randomY = constrain(randomY, 0, height);

  let randomDirection = floor(random(3)) - 1; // -1, 0 of 1

  enemies.push(new Enemy(randomX, randomY, randomDirection));

  lastEnemySpawnTime = millis();

  // Plan de volgende spawn
  setTimeout(spawnEnemy, enemySpawnInterval);
}


function removeOffscreenEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].x < 0 || enemies[i].x > width) {
      enemies.splice(i, 1);
    }
  }
}

class Enemy {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = random(2,4);
    this.image = enemyImage; // Gebruik de vooraf geladen en aangepaste afbeelding

  }

  update() {
    this.x += this.speed * this.direction;
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.direction, 1);

    image(this.image, 0, 0);
    this.image.resize(40, 40); // Wijzig de grootte van de vijandafbeelding hier

    pop();
  }
}
