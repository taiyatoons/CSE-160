// Kyra Hannah 
// klhannah@ucsc.edu  

// NOTE TO GRADER: 
 
//  - the pong bot is beatable! There is no win condition, but the bot is intentionally 
//    imperfect to make scoring points possible 
//  - ball speed increases after each paddle hit, capped 
//    as ~3x speed 
//  - IMPORTANT: My drawing does contain the letters 'KH' as required, 
//    they are located on the right-most sparkles, and are a solid yellow 
//    instead of a gradient, as the other sparkles are (the 'K' is rotated 
//    slightly counter-clockwise)

// ---------------- pong functions ------------------- 
const TOP_LIMIT = 1;
const BOTTOM_LIMIT = -1;

const BALL_SPEED = 0.6;
const MAX_SPEED = 3.0; 
const PADDLE_SPEED = 1.2; // units per second (with delta time)
const PADDLE_WIDTH = 0.03;
const PADDLE_HEIGHT = 0.35;

const BALL_MAX_BOUNCE_ANGLE = 2;
const BALL_SIZE = 0.02; 
const BALL_RADIUS = BALL_SIZE; 


let p1_score = 0; 
let p2_score = 0;

let botError = 0; 

let lastTime = 0;

let ball = {
  x: 0,
  y: 0,
  vx: BALL_SPEED,
  vy: 0
};

let paddle_left = {
  x: -0.935,
  y: 0,
  height: PADDLE_HEIGHT,
  speed: PADDLE_SPEED
};

let paddle_right = {
  x: 0.935,
  y: 0,
  height: PADDLE_HEIGHT,
  speed: PADDLE_SPEED
};

let keys = { 
  w: false, 
  s: false, 
  arrowUp: false, 
  arrowDown: false 
}


function playPong() { 

  lastTime = 0;

  p1_score = 0;
  p2_score = 0; 

  ball.x = 0;
  ball.y = 0;

  ball.vx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  ball.vy = (Math.random() * 2 - 1) * BALL_SPEED;

  paddle_left.y = 0;
  paddle_right.y = 0;

  g_shapesList = []; 

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(callback); 

}

function callback(time) {

  // needs to be in pong mode to run
  if (currentMode !== "pong") { 
    return; 
  }

  if (!lastTime) lastTime = time;

  let deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0); 

  sendTextToHTML("P1: " + p1_score + " | P2: " + p2_score, "numdot"); 

  updatePaddles(deltaTime);
  updateBall(deltaTime);

  drawBall(ball.x, ball.y);

  drawPaddles(); 

  console.log("pong running");

  requestAnimationFrame(callback);
}

function drawBall() {
  let x = ball.x;
  let y = ball.y;
  let size = 0.02;

  drawTriangle([
    x - size, y + size,
    x - size, y - size,
    x + size, y + size
  ]);

  drawTriangle([
    x + size, y - size,
    x - size, y - size,
    x + size, y + size
  ]);
}

function drawPaddles() { 

  let width = 0.03; 
   
  let lp_left = paddle_left.x - width/2; 
  let lp_right = paddle_left.x + width/2; 
  let lp_top = paddle_left.y + paddle_left.height/2; 
  let lp_bottom = paddle_left.y - paddle_left.height/2;  

  let rp_left = paddle_right.x - width/2; 
  let rp_right = paddle_right.x + width/2; 
  let rp_top = paddle_right.y + paddle_right.height/2; 
  let rp_bottom = paddle_right.y - paddle_right.height/2;   
 
  // left paddle 
  drawTriangle([
    lp_left,  lp_top,
    lp_right, lp_top,
    lp_right, lp_bottom
  ]); 
  drawTriangle([
    lp_left,  lp_top,
    lp_right, lp_bottom,
    lp_left, lp_bottom
  ]);

  // right paddle
  drawTriangle([
    rp_left,  rp_top,
    rp_right, rp_top,
    rp_right,  rp_bottom
  ]);
  drawTriangle([
    rp_left,  rp_top,
    rp_right, rp_bottom,
    rp_left,  rp_bottom
  ]);

}

function resetBall(direction) {
  ball.x = 0;
  ball.y = 0;
  ball.vx = BALL_SPEED * direction;
  ball.vy = 0;

  botError = (Math.random() - 0.5) * 0.3; 
} 

function updateBall(dt) {
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // wall bounce
  if (ball.y + BALL_RADIUS >= TOP_LIMIT) {
    ball.y = TOP_LIMIT - BALL_RADIUS;
    ball.vy *= -1;
  }

  if (ball.y - BALL_RADIUS <= BOTTOM_LIMIT) {
    ball.y = BOTTOM_LIMIT + BALL_RADIUS;
    ball.vy *= -1;
  } 

  // scoring
  if (ball.x < -1) {
    p2_score += 1;
    resetBall(1);
    return;
  }
  if (ball.x > 1) {
    p1_score += 1;
    resetBall(-1);
    return;
  }

  // check paddle collisions 
  checkPaddleCollision(paddle_left);
  checkPaddleCollision(paddle_right);
}

function updatePaddles(dt) {
  let move = paddle_left.speed * dt;

  if (keys.w || keys.arrowUp) {
    paddle_left.y += move;
  }
  if (keys.s || keys.arrowDown) {
    paddle_left.y -= move;
  }

  // clamp left paddle
  let half = paddle_left.height / 2;

  if (paddle_left.y + half > TOP_LIMIT) { 
    paddle_left.y = TOP_LIMIT - half;
  } 
  if (paddle_left.y - half < BOTTOM_LIMIT) { 
    paddle_left.y = BOTTOM_LIMIT + half;
  }

  // clamp right paddle 
  let right_half = paddle_right.height / 2;

  if (paddle_right.y + right_half > TOP_LIMIT) { 
    paddle_right.y = TOP_LIMIT - right_half;
  } 
  if (paddle_right.y - right_half < BOTTOM_LIMIT) { 
    paddle_right.y = BOTTOM_LIMIT + right_half; 
  }

  
  // bot right paddle 

  // only react when ball is moving toward the bot
  let target;

  if (ball.vx > 0) 
    {
    // incorrectly predict where ball will be
    let prediction = ball.y + ball.vy * 0.3;
    // botError
    target = prediction + botError;

  } else {
    // return to center when ball is going away
    target = 0;
  }

  let botMaxSpeed = 0.6; // lower = easier 
  // move toward target
  let diff = target - paddle_right.y;
  // clamp movement to max speed
  let bot_move = Math.max(-botMaxSpeed, Math.min(botMaxSpeed, diff));

  // apply movement
  paddle_right.y += bot_move * dt;

}

function checkPaddleCollision(paddle) {

  let halfW = PADDLE_WIDTH / 2;
  let halfH = paddle.height / 2;

  let left = paddle.x - halfW;
  let right = paddle.x + halfW;
  let top = paddle.y + halfH;
  let bottom = paddle.y - halfH;

  if (
    ball.x + BALL_RADIUS >= left &&
    ball.x - BALL_RADIUS <= right &&
    ball.y + BALL_RADIUS >= bottom &&
    ball.y - BALL_RADIUS <= top
  ) {

  if (
      (paddle === paddle_left && ball.vx < 0) ||
      (paddle === paddle_right && ball.vx > 0)
    ) {

      // compute hit position (-1 to 1)
      let hitY = (ball.y - paddle.y) / paddle.height;

      // clamp
      hitY = Math.max(-1, Math.min(1, hitY));

      // reverse X direction
      ball.vx = -ball.vx;
      // apply angle
      ball.vy = hitY * 1.2; 

      // increase speed
      ball.vx *= 1.05;
      ball.vy *= 1.05;
    
      // cap speed 
      ball.vx = Math.sign(ball.vx) * Math.min(Math.abs(ball.vx), MAX_SPEED);
      ball.vy = Math.sign(ball.vy) * Math.min(Math.abs(ball.vy), MAX_SPEED);

      // prevent sticking inside paddle
      if (ball.vx > 0) {
        ball.x = right + BALL_RADIUS
      } else {
        ball.x = left - BALL_RADIUS 
      }
    }
  }

}