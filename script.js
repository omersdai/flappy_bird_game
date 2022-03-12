const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.height = 600;
canvas.width = 1000;

// Actions
const [JUMP] = ['jump'];

const actionMap = {
  ' ': JUMP,
};

const gravity = 0.25;
const frequency = 250;

const staticPillar = {
  color: 'red',
  width: 100,
  gap: 200,
};

let bird;
let pillars;
let distance;
let score;
let gameStatus;

const [CONTINUE, END] = ['continue', 'end'];

function createBird() {
  return {
    x: 150,
    y: 250,
    radius: 20,
    color: 'black',
    dx: 0,
    dy: 0,
    jump: -5,
    speed: 2, // horizontal
  };
}

function addPillar() {
  const pillar = {
    x: canvas.width + staticPillar.width,
    y: getRandomHeight(),
  };
  pillars.push(pillar);
}

// Game
function initializeGame() {
  bird = createBird();
  pillars = [];
  score = 0;
  distance = 0;
  gameStatus = CONTINUE;
  addPillar();

  update();
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas

  if (distance >= frequency) {
    distance = 0;
    addPillar();
  }
  moveObjects();
  detectCollusion();

  drawBird();
  drawPillars();

  if (gameStatus === CONTINUE) {
    requestAnimationFrame(update);
  }
}

function drawBird() {
  const { x, y, radius, color } = bird;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  ctx.fill();
}

function drawPillars() {
  pillars.forEach((pillar) => {
    const { color, width, gap } = staticPillar;
    const { x, y } = pillar;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillRect(x, 0, width, y);

    ctx.beginPath();
    ctx.fillRect(x, y + gap, width, canvas.height - y - gap);
  });
}

function moveObjects() {
  bird.dy += gravity;
  bird.y += bird.dy;

  const pillar = pillars[0];
  if (pillar.x + staticPillar.width < 0) {
    pillars.shift();
    console.log('pillar removed');
  }
  pillars.forEach((pillar) => {
    pillar.x -= bird.speed;
  });

  distance += bird.speed;
  // console.log(distance);
}

function detectCollusion() {
  const { y, radius } = bird;
  if (y < radius || y > canvas.height - radius || hitPillar()) {
    gameStatus = END;
  }
}

function hitPillar() {
  const { x, y, radius } = bird;
  const { width, gap } = staticPillar;
  for (const pillar of pillars) {
    if (
      x + radius >= pillar.x &&
      x - radius <= pillar.x + width &&
      !(y - radius >= pillar.y && y + radius <= pillar.y + gap)
    ) {
      return true;
    }
  }
  return false;
}

document.addEventListener('keydown', (e) => {
  const action = actionMap[e.key];

  switch (action) {
    case JUMP:
      bird.dy = bird.jump;
      break;
  }
});

function getRandomHeight() {
  return (
    50 + Math.floor(Math.random() * (canvas.height - staticPillar.gap - 100))
  );
}

initializeGame();
