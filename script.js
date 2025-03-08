// Main game variables
let move_speed = 240; // pixels per second
let gravity = 24; // pixels per second squared

// DOM elements
let gojo = document.querySelector(".gojo");
let img = document.getElementById("gojo-1");
let sound_points = new Audio("sound effects/point.mp3");
let sound_die = new Audio("sound effects/yowai-mo.mp3");
let gojo_sound = new Audio("sound effects/gojo-hora-hora.mp3");
let background_music = new Audio("sound effects/jjk-op.mp3"); // Add background music if available
background_music.loop = true;

// Game elements
let gojo_props = gojo.getBoundingClientRect();
let background_props = document.querySelector(".background").getBoundingClientRect();
let score_val = document.querySelector(".score_val");
let score_title = document.querySelector(".score_title");
let message = document.querySelector(".message");

// Game state
let game_state = "Start"; // Start, Play, End
let lastTime = 0; // For framerate independence
let gojo_dy = 0; // Vertical velocity
let jumpPressed = false;
let muted = false;
let highScore = localStorage.getItem("highScore") || 0;

// Game constants
const jump_force = -450; // pixels per second (negative for upward)

// Create UI elements when the page loads
function createGameUI() {
  // Create main UI container if it doesn't exist
  let gameUI = document.getElementById("game-ui");
  if (!gameUI) {
    gameUI = document.createElement("div");
    gameUI.id = "game-ui";
    document.body.appendChild(gameUI);
  } else {
    // Clear existing content
    gameUI.innerHTML = '';
  }
  
  // Create menu screen
  const menuScreen = document.createElement("div");
  menuScreen.id = "menu-screen";
  menuScreen.className = "menu-screen";
  menuScreen.innerHTML = `
    <h1>Jujutsu Kaisen<br>Flappy Gojo</h1>
    <div class="high-score">High Score: ${highScore}</div>
    <button class="start-btn" id="start-btn">START GAME</button>
    <div class="controls">
      CONTROLS<br>Press SPACE or UP ARROW to fly<br>Tap screen on mobile
    </div>
  `;
  gameUI.appendChild(menuScreen);
  
  // Create game over screen
  const gameOverScreen = document.createElement("div");
  gameOverScreen.id = "game-over-screen";
  gameOverScreen.className = "game-over-screen";
  gameOverScreen.innerHTML = `
    <h1>GAME OVER</h1>
    <h2>Weak Loser</h2>
    <div class="final-score" id="final-score">Your Score: 0</div>
    <div class="new-high-score" id="new-high-score">NEW HIGH SCORE!</div>
    <button class="restart-btn" id="restart-btn">PLAY AGAIN</button>
    <button class="menu-btn" id="menu-btn">MAIN MENU</button>
  `;
  gameUI.appendChild(gameOverScreen);
  
  // Create mute button (moved to right side)
  const muteBtn = document.createElement("button");
  muteBtn.id = "mute-btn";
  muteBtn.className = "mute-btn";
  muteBtn.innerHTML = muted ? "🔇" : "🔊";
  gameUI.appendChild(muteBtn);
  
  // Add event listeners for buttons
  document.getElementById("start-btn").addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    resetGame();
  });
  
  document.getElementById("restart-btn").addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    resetGame();
  });
  
  document.getElementById("menu-btn").addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    showMainMenu();
  });
  
  document.getElementById("mute-btn").addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleMute();
  });
}

// Toggle sound on/off
function toggleMute() {
  muted = !muted;
  
  // Update all audio
  sound_points.muted = muted;
  sound_die.muted = muted;
  gojo_sound.muted = muted;
  if (background_music) background_music.muted = muted;
  
  // Update button
  const muteBtn = document.getElementById("mute-btn");
  if (muteBtn) muteBtn.innerHTML = muted ? "🔇" : "🔊";
}

// Show main menu
function showMainMenu() {
  game_state = "Start";
  img.style.display = "none";
  
  // Update high score
  const highScoreDisplay = document.querySelector(".high-score");
  if (highScoreDisplay) {
    highScoreDisplay.textContent = `High Score: ${highScore}`;
  }
  
  // Show menu, hide other screens
  const menuScreen = document.getElementById("menu-screen");
  const gameOverScreen = document.getElementById("game-over-screen");
  
  if (menuScreen) menuScreen.style.display = "flex";
  if (gameOverScreen) gameOverScreen.style.display = "none";
  
  // Update original message element
  if (message) message.style.display = "none";
  
  // Stop background music
  if (background_music) {
    background_music.pause();
    background_music.currentTime = 0;
  }
}

// Show game over screen
function showGameOver(score) {
  // Check for high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    const newHighScoreElem = document.getElementById("new-high-score");
    if (newHighScoreElem) newHighScoreElem.style.display = "block";
  } else {
    const newHighScoreElem = document.getElementById("new-high-score");
    if (newHighScoreElem) newHighScoreElem.style.display = "none";
  }
  
  // Update final score
  const finalScoreElem = document.getElementById("final-score");
  if (finalScoreElem) {
    finalScoreElem.textContent = `Your Score: ${score}`;
  }
  
  // Show game over screen, hide others
  const menuScreen = document.getElementById("menu-screen");
  const gameOverScreen = document.getElementById("game-over-screen");
  
  if (menuScreen) menuScreen.style.display = "none";
  if (gameOverScreen) gameOverScreen.style.display = "flex";
  
  // Hide original message
  if (message) message.style.display = "none";
}

// Event listeners
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && game_state !== "Play") {
    resetGame();
  }
  
  if ((e.key === "ArrowUp" || e.key === " ") && game_state === "Play" && !jumpPressed) {
    jumpPressed = true;
    img.src = "images/gojo3.png";
    gojo_dy = jump_force / 60; // Initial jump velocity
    if (!muted) gojo_sound.play();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp" || e.key === " ") {
    jumpPressed = false;
    img.src = "images/gojo1.png";
  }
});

// Touch event listeners for mobile
document.addEventListener("touchstart", (e) => {
  // Check if touch is on a button
  if (e.target.tagName.toLowerCase() === 'button') return;
  
  if (game_state !== "Play") {
    // Don't start game if clicking UI elements
    if (e.target.closest('#menu-screen') || e.target.closest('#game-over-screen')) return;
    
    resetGame();
  } else if (!jumpPressed) {
    jumpPressed = true;
    img.src = "images/gojo3.png";
    gojo_dy = jump_force / 60; // Initial jump velocity
    if (!muted) gojo_sound.play();
  }
});

document.addEventListener("touchend", (e) => {
  // Only reset jump if not touching a button
  if (e.target.tagName.toLowerCase() !== 'button') {
    jumpPressed = false;
    img.src = "images/gojo1.png";
  }
});

// Reset game
function resetGame() {
  // Remove obstacles
  document.querySelectorAll(".curse").forEach((e) => {
    e.remove();
  });
  
  // Reset player
  img.style.display = "block";
  gojo.style.top = "40vh";
  gojo_dy = 0; // Reset velocity
  
  // Reset game state
  game_state = "Play";
  
  // Reset score
  score_val.innerHTML = "0";
  score_title.innerHTML = "Score : ";
  
  // Hide menus - FIXED: Ensure menu is hidden when game starts
  const menuScreen = document.getElementById("menu-screen");
  const gameOverScreen = document.getElementById("game-over-screen");
  
  if (menuScreen) menuScreen.style.display = "none";
  if (gameOverScreen) gameOverScreen.style.display = "none";
  if (message) message.style.display = "none";
  
  // Start background music
  if (background_music && !muted) {
    background_music.currentTime = 0;
    background_music.play();
  }
  
  // Reset time
  lastTime = performance.now();
  
  // Start game
  play();
}

// End game
function endGame(reason) {
  game_state = "End";
  
  if (background_music) {
    background_music.pause();
  }
  
  if (reason === "collision") {
    if (!muted) sound_die.play();
    const score = parseInt(score_val.innerHTML);
    showGameOver(score);
  } else if (reason === "boundary") {
    const score = parseInt(score_val.innerHTML);
    showGameOver(score);
  }
}

// Main game loop
function play() {
  function gameLoop(currentTime) {
    // If game is over, don't continue the loop
    if (game_state !== "Play") return;
    
    // Calculate delta time in seconds
    let deltaTime = 0;
    if (lastTime !== 0) {
      deltaTime = (currentTime - lastTime) / 1000;
    }
    lastTime = currentTime;
    
    // Limit delta time to prevent large jumps
    const limitedDelta = Math.min(deltaTime, 0.1);
    
    // Update obstacles
    moveObstacles(limitedDelta);
    
    // If game ended in moveObstacles, don't continue
    if (game_state !== "Play") return;
    
    // Update player
    updatePlayer(limitedDelta);
    
    // If game ended in updatePlayer, don't continue
    if (game_state !== "Play") return;
    
    // Create new obstacles
    createObstacles(limitedDelta);
    
    // Continue the game loop only if still playing
    if (game_state === "Play") {
      requestAnimationFrame(gameLoop);
    }
  }
  
  function moveObstacles(deltaTime) {
    // Calculate how far to move objects based on time
    const moveAmount = move_speed * deltaTime;

    let jogo = document.querySelectorAll(".curse");
    jogo.forEach((element) => {
      let curse_props = element.getBoundingClientRect();
      gojo_props = gojo.getBoundingClientRect();

      if (curse_props.right <= 0) {
        element.remove();
      } else {
        if (
          gojo_props.left + 20 < curse_props.left + curse_props.width &&
          gojo_props.left + gojo_props.width - 20 > curse_props.left &&
          gojo_props.top + 50 < curse_props.top + curse_props.height &&
          gojo_props.top + gojo_props.height - 50 > curse_props.top
        ) {
          endGame("collision");
          return; // Exit the function early
        } else {
          if (
            curse_props.right < gojo_props.left &&
            curse_props.right + moveAmount >= gojo_props.left &&
            element.increase_score === "1"
          ) {
            const newScore = parseInt(score_val.innerHTML) + 1;
            score_val.innerHTML = newScore;
            if (!muted) sound_points.play();
          }
          element.style.left = (curse_props.left - moveAmount) + "px";
        }
      }
    });
  }
  
  function updatePlayer(deltaTime) {
    // Apply gravity with time scaling
    gojo_dy += gravity * deltaTime;
    
    // Move gojo based on velocity and delta time
    const currentTop = parseFloat(window.getComputedStyle(gojo).getPropertyValue('top'));
    const newTop = currentTop + (gojo_dy * deltaTime * 60); // Scale to make jump feel right
    
    gojo.style.top = newTop + "px";
    
    // Update gojo properties for collision detection
    gojo_props = gojo.getBoundingClientRect();
    
    // Check for collisions with boundaries
    if (gojo_props.top <= 0 || gojo_props.bottom >= background_props.bottom) {
      endGame("boundary");
      return; // Exit the function early
    }
  }
  
  let curse_separation_timer = 0;
  const curse_creation_interval = 1.9; // seconds between curse creation
  
  function createObstacles(deltaTime) {
    // Accumulate time until we reach the creation interval
    curse_separation_timer += deltaTime;
    
    if (curse_separation_timer > curse_creation_interval) {
      curse_separation_timer = 0;

      let curse_posi = Math.floor(Math.random() * 43) + 8;

      let curse_images = [
        "url('images/jogo.png') no-repeat center",
        "url('images/Hanami.png') no-repeat center",
        "url('images/Mahito.png') no-repeat center",
        "url('images/sukuna.png') no-repeat center"
      ];

      function random_curse(arr) {
        let randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
      }

      let curse_width = window.innerWidth <= 480 ? 40 : 14; // Match the CSS for mobile
      let curse_height = window.innerWidth <= 480 ? 60 : 70;
      let curse_gap = 35;

      // Top pipe
      let curse_sprite_inv = document.createElement("div");
      curse_sprite_inv.className = "curse";
      curse_sprite_inv.style.top = curse_posi - 70 + "vh";
      curse_sprite_inv.style.left = "100vw";
      curse_sprite_inv.style.background = random_curse(curse_images);
      curse_sprite_inv.style.backgroundSize = "contain";
      curse_sprite_inv.style.height = curse_height + "vh";
      curse_sprite_inv.style.width = curse_width + (window.innerWidth <= 480 ? "vw" : "vw");
      curse_sprite_inv.style.transform = "scale(1, -1)";

      document.body.appendChild(curse_sprite_inv);

      // Bottom pipe
      let curse_sprite = document.createElement("div");
      curse_sprite.className = "curse";
      curse_sprite.style.top = curse_posi + curse_gap + "vh";
      curse_sprite.style.left = "100vw";
      curse_sprite.style.background = random_curse(curse_images);
      curse_sprite.style.backgroundSize = "contain";
      curse_sprite.style.height = curse_height + "vh";
      curse_sprite.style.width = curse_width + (window.innerWidth <= 480 ? "vw" : "vw");
      curse_sprite.increase_score = "1";

      document.body.appendChild(curse_sprite);
    }
  }

  // Initialize time before starting game loop
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

// Initialize the game UI when the page loads
window.onload = function() {
  createGameUI();
  showMainMenu();
};