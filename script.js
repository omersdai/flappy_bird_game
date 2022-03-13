const scoreEl = document.getElementById('gameScore');
const bestScoreEl = document.getElementById('bestScore');
const resetBtn = document.getElementById('resetBtn');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.height = 600;
canvas.width = 1000;

const BEST_SCORE = 'flappyBirdBestScore';

// Actions
const [JUMP] = ['jump'];

const actionMap = {
  ' ': JUMP,
};

const gravity = 0.6;
const frequency = 250;

const staticPillar = {
  color: 'red',
  width: 100,
  gap: 180,
};

let bird;
let pillars;
let distance;
let score;
let gameStatus;
let interval;

const [START, CONTINUE, END] = ['start', 'continue', 'end'];

function createBird() {
  return {
    x: 150,
    y: 250,
    radius: 20,
    color: 'black',
    dx: 0,
    dy: 0,
    jump: -10,
    speed: 2, // horizontal
  };
}

function createPillar() {
  return {
    x: canvas.width + staticPillar.width,
    y: getRandomHeight(),
    isPassed: false,
  };
}

// Game
function startGame() {
  bird = createBird();
  pillars = [createPillar()];
  score = 0;
  distance = 0;
  gameStatus = CONTINUE;

  scoreEl.innerText = score;
  bestScore = parseInt(localStorage.getItem(BEST_SCORE));

  update();
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas

  if (distance >= frequency) {
    distance = 0;
    pillars.push(createPillar());
  }
  moveObjects();
  detectCollusion();

  drawBird();
  drawPillars();

  if (gameStatus === CONTINUE) {
    interval = requestAnimationFrame(update);
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
  if (pillar.x + staticPillar.width < 0) pillars.shift();

  pillars.forEach((pillar) => {
    pillar.x -= bird.speed;
    if (!pillar.isPassed && pillar.x + staticPillar.width / 2 < bird.x) {
      scoreEl.innerText = ++score;
      if (bestScore < score) {
        bestScore = score;
        bestScoreEl.innerText = bestScore;
        localStorage.setItem(BEST_SCORE, bestScore);
      }
      pillar.isPassed = true;
    }
  });

  distance += bird.speed;
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

function initializeGame() {
  if (!localStorage.getItem(BEST_SCORE)) localStorage.setItem(BEST_SCORE, '0');
}

document.addEventListener('keydown', (e) => {
  const action = actionMap[e.key];

  switch (action) {
    case JUMP:
      bird.dy = bird.jump;
      break;
  }
});

resetBtn.addEventListener('click', (e) => {
  cancelAnimationFrame(interval);
  e.target.blur();
  startGame();
});

function getRandomHeight() {
  return (
    50 + Math.floor(Math.random() * (canvas.height - staticPillar.gap - 100))
  );
}

initializeGame();
