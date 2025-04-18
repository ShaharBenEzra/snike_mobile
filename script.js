const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const grid = 20; // הגודל של כל ריבוע בגריד
let rows, columns; // מספר השורות והעמודות
let score = 0;
let snake = [{ x: 10, y: 10 }];
let goX = 0, goY = 0;
let lastDirection = { x: 0, y: 0 };

let food = {
  x: Math.floor(Math.random() * grid),
  y: Math.floor(Math.random() * grid)
};

let bestScore = 0;
let pointsPerApple = 3;

const foodSound = new Audio('food.mp3');
const moveSound = new Audio('move.mp3');
const gameOverSound = new Audio('gameover.mp3');
const backgroundMusic = new Audio('background.mp3');

const appleImage = new Image();
appleImage.src = 'apple.jpg';

backgroundMusic.loop = true;
gameOverSound.loop = false;

backgroundMusic.volume = 0.3;

document.addEventListener("keydown", (ev) => {
  if (ev.key === "ArrowLeft" && lastDirection.x !== 1) {
    goX = -1; goY = 0;
    lastDirection = { x: -1, y: 0 };
    moveSound.cloneNode().play();
  }
  if (ev.key === "ArrowRight" && lastDirection.x !== -1) {
    goX = 1; goY = 0;
    lastDirection = { x: 1, y: 0 };
    moveSound.cloneNode().play();
  }
  if (ev.key === "ArrowUp" && lastDirection.y !== 1) {
    goX = 0; goY = -1;
    lastDirection = { x: 0, y: -1 };
    moveSound.cloneNode().play();
  }
  if (ev.key === "ArrowDown" && lastDirection.y !== -1) {
    goX = 0; goY = 1;
    lastDirection = { x: 0, y: 1 };
    moveSound.cloneNode().play();
  }
});

// הגדרת משתנים למגע
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", (ev) => {
  const touch = ev.touches[0];
  touchStartX = touch.pageX;
  touchStartY = touch.pageY;
});

document.addEventListener("touchmove", (ev) => {
  if (ev.touches.length > 1) return; // רק מגע אחד

  const touch = ev.touches[0];
  const diffX = touch.pageX - touchStartX;
  const diffY = touch.pageY - touchStartY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 0 && lastDirection.x !== -1) { // ימינה
      goX = 1; goY = 0;
      lastDirection = { x: 1, y: 0 };
      moveSound.cloneNode().play();
    } else if (diffX < 0 && lastDirection.x !== 1) { // שמאלה
      goX = -1; goY = 0;
      lastDirection = { x: -1, y: 0 };
      moveSound.cloneNode().play();
    }
  } else {
    if (diffY > 0 && lastDirection.y !== -1) { // למטה
      goX = 0; goY = 1;
      lastDirection = { x: 0, y: 1 };
      moveSound.cloneNode().play();
    } else if (diffY < 0 && lastDirection.y !== 1) { // למעלה
      goX = 0; goY = -1;
      lastDirection = { x: 0, y: -1 };
      moveSound.cloneNode().play();
    }
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    draw();
  });

  touchStartX = touch.pageX;
  touchStartY = touch.pageY;

  ev.preventDefault();
});

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  rows = Math.floor(canvas.height / grid); // מספר השורות על פי גובה ה-canvas
  columns = Math.floor(canvas.width / grid); // מספר העמודות על פי רוחב ה-canvas

  // מיקום האוכל יתעדכן בהתאם לגודל החדש
  food = {
    x: Math.floor(Math.random() * columns),
    y: Math.floor(Math.random() * rows)
  };
}

function startGame() {
  score = 0;
  snake = [{ x: 10, y: 10 }];
  goX = 0;
  goY = 0;
  lastDirection = { x: 0, y: 0 };
  food = {
    x: Math.floor(Math.random() * grid),
    y: Math.floor(Math.random() * grid)
  };
  document.getElementById("score1").textContent = score;

  backgroundMusic.currentTime = 0;
  backgroundMusic.play();

  const difficulty = document.getElementById("difficultySelect").value;
  setDifficulty(difficulty);
}

let withWalls = false;

function onWallsChange() {
  const wallOption = document.getElementById("wallsSelect").value;
  withWalls = wallOption === "withWalls";
  showMessage("Game reset due to wall option change");
  startGame();
}

function gameLoop() {
  if (goX === 0 && goY === 0) return;

  const head = {
    x: snake[0].x + goX,
    y: snake[0].y + goY
  };

  if (withWalls) {
    // בדיקה מדויקת יותר לגבולות
    if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows) {
      showGameOver();
      return;
    }
  } else {
    // המשך הלולאה מהצד השני של המסך
    if (head.x < 0) head.x = columns - 1;
    if (head.x >= columns) head.x = 0;
    if (head.y < 0) head.y = rows - 1;
    if (head.y >= rows) head.y = 0;
  }

  if (snake.some((part) => part.x === head.x && part.y === head.y)) {
    showGameOver();
    return;
  } else {
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += pointsPerApple;
      food = {
        x: Math.floor(Math.random() * columns),
        y: Math.floor(Math.random() * rows)
      };
      foodSound.play();
    } else {
      snake.pop();
    }
  }

  document.getElementById("score1").textContent = score;
  draw();
}

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const part of snake) {
    if (part === snake[0]) {
      ctx.fillStyle = "lime";
    } else {
      ctx.fillStyle = "#006400";
    }
    ctx.fillRect(part.x * grid, part.y * grid, grid - 2, grid - 2);
  }

  ctx.fillStyle = "red";
  ctx.fillRect(food.x * grid, food.y * grid, grid - 2, grid - 2);
}

let gameInterval;

const pointsMap = {
  withoutWalls: { easy: 1, medium: 3, hard: 5 },
  withWalls: { easy: 3, medium: 6, hard: 10 }
};

function onDifficultyChange() {
  showMessage("Game reset due to difficulty change");
  startGame();
}

function setDifficulty(difficulty) {
  if (gameInterval) clearInterval(gameInterval);

  const wallKey = withWalls ? "withWalls" : "withoutWalls";
  pointsPerApple = pointsMap[wallKey][difficulty];

  switch (difficulty) {
    case "easy": gameInterval = setInterval(gameLoop, 300); break;
    case "medium": gameInterval = setInterval(gameLoop, 150); break;
    case "hard": gameInterval = setInterval(gameLoop, 50); break;
  }
}

setDifficulty("medium");

function showMessage(text) {
  const msg = document.getElementById("message");
  msg.textContent = text;
  msg.classList.remove("hidden");
  msg.classList.add("visible");

  setTimeout(() => {
    msg.classList.remove("visible");
    msg.classList.add("hidden");
  }, 2000);
}

function showRules() {
  document.getElementById("rulesModal").classList.remove("hidden");
}

function hideRules() {
  document.getElementById("rulesModal").classList.add("hidden");
}

function showGameOver() {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  gameOverSound.play();

  if (score > bestScore) {
    bestScore = score;
  }

  document.getElementById("finalScore").textContent = score;
  document.getElementById("bestScore").textContent = bestScore;

  document.getElementById("gameOverModal").classList.remove("hidden");
}

function hideGameOver() {
  document.getElementById("gameOverModal").classList.add("hidden");
}

function toggleSettings() {
  const settingsModal = document.getElementById('settingsModal');
  settingsModal.classList.toggle('hidden');
  settingsModal.classList.toggle('visible');
}

resizeCanvas();  // Make sure to initialize the grid size on load
