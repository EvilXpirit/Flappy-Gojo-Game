let move_speed = 3;
let gravity = 0.4;

let gojo = document.querySelector(".gojo");
let img = document.getElementById("gojo-1");
let sound_points = new Audio("sound effects/point.mp3");
let sound_die = new Audio("sound effects/yowai-mo.mp3");
let gojo_sound = new Audio("sound effects/gojo-hora-hora.mp3");

let gojo_props = gojo.getBoundingClientRect();

let background_props = document
  .querySelector(".background")
  .getBoundingClientRect();

let score_val = document.querySelector(".score_val");

let message = document.querySelector(".message");
let score_title = document.querySelector(".score_title");

let game_state = "Start";
img.style.display = "none";
message.classList.add("messageStyle");

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && game_state !== "Play") {
      resetGame();
    }
  });
  
  // Add touch event listener for mobile devices
  document.addEventListener("touchstart", (e) => {
    if (game_state !== "Play") {
      resetGame();
    }
  });
  
  function resetGame() {
    document.querySelectorAll(".curse").forEach((e) => {
      e.remove();
    });
    img.style.display = "block";
    gojo.style.top = "40vh";
    game_state = "Play";
    message.innerHTML = "";
    score_title.innerHTML = "Score : ";
    score_val.innerHTML = "0";
    message.classList.remove("messageStyle");
    play();
  }
  


function play() {
  function move() {
    if (game_state !== "Play") return;

    let jogo = document.querySelectorAll(".curse");
    jogo.forEach((element) => {
      let curse_props = element.getBoundingClientRect();
      gojo_props = gojo.getBoundingClientRect();

      if (curse_props.right <= 0) {
        element.remove();
      } else {
        if (
          gojo_props.left + 20 < curse_props.left + curse_props.width && //Horizontal Overlap (Left Side of Bird and Right Side of Pipe) This checks if the left side of the bird is to the left of the right side of the pipe.
          gojo_props.left + gojo_props.width - 20> curse_props.left && //Horizontal Overlap (Right Side of Bird and Left Side of Pipe) It ensures that the bird's right edge has crossed the pipe's left edge. 
          gojo_props.top + 50 < curse_props.top + curse_props.height && //Vertical Overlap (Top Side of Bird and Bottom Side of Pipe) It ensures that the bird's top edge is above the pipe's bottom edge.
          gojo_props.top + gojo_props.height - 50 > curse_props.top //Vertical Overlap (Bottom Side of Bird and Top Side of Pipe) It ensures that the bird's bottom edge is below the pipe's top edge.
        ) {
          game_state = "End";
          sound_die.play();
          gojo_sound.pause();
          message.innerHTML =
            "Game Over".fontcolor("red") +   "<br> Weak Loser".fontcolor("red").fontsize('4rem') + "<br>Press Enter To Restart";
          message.classList.add("messageStyle");
          img.style.display = "none";
          return;
        } else {
          if (
            curse_props.right < gojo_props.left &&
            curse_props.right + move_speed >= gojo_props.left &&
            element.increase_score === "1"
          ) {
            score_val.innerHTML = parseInt(score_val.innerHTML) + 1;
            sound_points.play();
          }
          element.style.left = curse_props.left - move_speed + "px";
        }
      }
    });
    requestAnimationFrame(move);
  }
  requestAnimationFrame(move);

  let gojo_dy = 0;
  function apply_gravity() {
    if (game_state !== "Play") return;
    gojo_dy += gravity;
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" || e.key === " ") {
        img.src = "images/gojo3.png";
        gojo_dy = -7.6;
        gojo_sound.play();
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "ArrowUp" || e.key === " ") {
        img.src = "images/gojo1.png";
        // gojo_sound.play();
      }
    });
    
    document.addEventListener("touchstart", () => {
        img.src = "images/gojo3.png";
        gojo_dy = -7.6;
        gojo_sound.play();
      });
    
      // Event listener for touchend (Mobile)
      document.addEventListener("touchend", () => {
        img.src = "images/gojo1.png";
      });

    if (gojo_props.top <= 0 || gojo_props.bottom >= background_props.bottom) {
      game_state = "End";
      message.style.left = "28vw";
      window.location.reload();
      message.classList.remove("messageStyle");
      return;
    }
    gojo.style.top = gojo_props.top + gojo_dy + "px";
    gojo_props = gojo.getBoundingClientRect();
    requestAnimationFrame(apply_gravity);
  }
  requestAnimationFrame(apply_gravity);

  let curse_seperation = 0;
  let curse_gap = 35;

  function create_curse() {
    if (game_state !== "Play") return;

    if (curse_seperation > 115) {
      curse_seperation = 0;

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

      let curse_width = window.innerWidth <= 480 ? 50 : 14; // 60vw for mobile, 14vw for larger screens
      let curse_height = window.innerWidth <= 480 ? 70 : 70;

      // Top pipe
      let curse_sprite_inv = document.createElement("div");
      curse_sprite_inv.className = "curse";
      curse_sprite_inv.style.top = curse_posi - 70 + "vh";
      curse_sprite_inv.style.left = "100vw";
      curse_sprite_inv.style.background = random_curse(curse_images);
      curse_sprite_inv.style.backgroundSize = "contain";
    //   curse_sprite_inv.style.height = "70vh";
      curse_sprite_inv.style.height = curse_height + "vh";
    //   curse_sprite_inv.style.width = "14vw";
    curse_sprite_inv.style.width = curse_width + "vw";
      // curse_sprite_inv.style.transformOrigin = "center";
      curse_sprite_inv.style.transform = "scale(1, -1)";

      document.body.appendChild(curse_sprite_inv);

      // Bottom pipe
      let curse_sprite = document.createElement("div");
      curse_sprite.className = "curse";
      curse_sprite.style.top = curse_posi + curse_gap + "vh";
      curse_sprite.style.left = "100vw";
      curse_sprite.style.background = random_curse(curse_images);
      curse_sprite.style.backgroundSize = "contain";
    //   curse_sprite.style.height = "70vh";
    curse_sprite.style.height = curse_height + "vh";
      curse_sprite.style.width = curse_width + "vw";
    //   curse_sprite.style.width = "14vw";
      curse_sprite.increase_score = "1";

      document.body.appendChild(curse_sprite);
    }
    curse_seperation++;
    requestAnimationFrame(create_curse);
  }

  requestAnimationFrame(create_curse);
}
