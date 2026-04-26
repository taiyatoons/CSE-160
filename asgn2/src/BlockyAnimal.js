// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position; 
  uniform mat4 u_ModelMatrix; 
  uniform mat4 u_GlobalRotateMatrix; 
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() { 
    gl_FragColor = u_FragColor;
  }`

let canvas; 
let gl; 
let a_Position; 
let u_FragColor; 
let u_Size; 
let u_ModelMatrix; 
let u_GlobalRotateMatrix; 

function setupWebGL() { 
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas); 
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});  // helps fps performance 
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST); 
}

function connectVariablesToGLSL() { 
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // get the storage location of u_ModelMatrix 
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix'); 
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix'); 
    return; 
  }

  // get the storage location of u_GlobalRotateMatrix  
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix'); 
  if (!u_GlobalRotateMatrix) { 
    console.log('Failed to get the storage location of u_GlobalRotateMatrix'); 
    return; 
  }

  var identityM = new Matrix4(); 
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements); 

}

// Constants 
const POINT = 0; 
const TRIANGLE = 1; 
const CIRCLE = 2; 

// denoted 'g_' for global variable -- UI globals 
let g_selectedColor=[1.0,1.0,1.0,1.0]; 
let g_selectedSize=5; 
let g_selectedType=POINT; 
let g_selectedSegs=5; 


let g_globalAngle=0; 

// front legs 
let g_upperLegAngle=0; 
let g_lowerLegAngle=0; 
let g_footAngle=0;  

// back legs 
let g_backUpperLegAngle=0; 
let g_backLowerLegAngle=0; 
let g_backFootAngle=0;

let g_magentaAngle=0; 
let g_yellowAnimation=false; 
let g_magentaAnimation=false; 

function addActionsForHtmlUI() { 

  // magenta animation 
  document.getElementById('animationMagentaOffButton').onclick = function() { g_magentaAnimation=false;};  
  document.getElementById('animationMagentaOnButton').onclick = function() { g_magentaAnimation=true;}; 

  // yellow animation 
  document.getElementById('animationYellowOffButton').onclick = function() { g_yellowAnimation=false;};  
  document.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation=true;};  

  document.getElementById('upperLegSlide').addEventListener('mousemove', function() { g_upperLegAngle = this.value; renderScene(); });  
  document.getElementById('lowerLegSlide').addEventListener('mousemove', function() { g_lowerLegAngle = this.value; renderScene(); }); 
  document.getElementById('footSlide').addEventListener('mousemove', function() { g_footAngle = this.value; renderScene(); }); 

  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderScene(); }); 

}

function main() {

  // setup canvas and gl variables 
  setupWebGL(); 
  
  // setup GLSL shader programs and connect GLSL variables 
  connectVariablesToGLSL(); 
  // set up actions for the HTML UI elements 
  addActionsForHtmlUI(); 

  canvas.onmousedown = click; 
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { renderScene() } }; 

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);

  // gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0); // red
  // renderScene(); 
  requestAnimationFrame(tick); 
}

var g_startTime=performance.now()/1000.0; 
var g_seconds=performance.now()/1000.0-g_startTime; 

function tick() { 

  g_seconds=performance.now()/1000.0-g_startTime; 
  // console.log(performance.now()); 

  updateAnimationAngles(); 

  renderScene(); 

  requestAnimationFrame(tick); 
}
var g_shapesList = []; 

function click(ev) {

  let [x,y] = convertCoordinatesEventToGL(ev);  
  g_shapesList.push([x, y]);

  // draw every shape that is supposed to be in the canvas 
  renderScene(); 

} 

function updateAnimationAngles() { 
  if (g_yellowAnimation) { 
    g_yellowAngle = (45*Math.sin(g_seconds)); 
  }
  if (g_magentaAnimation) { 
    g_magentaAngle = (45*Math.sin(3*g_seconds)); 
  }

}

// draw every shape that is supposed to be in the canvas
function renderScene() { 
 
  // Check the time at the start of this function 

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat=new Matrix4().rotate(g_globalAngle,0,1,0); 
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements); 
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // gl.clear(gl.COLOR_BUFFER_BIT); 

  // Draw a test triangle 
  // drawTriangle3D( [-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0]); 
  

  // drawCube() 

  // main body -------------------------------------------
  // Draw a cube (red) 
  let body = new Cube("body"); 
  body.color = [0.9,0.9,0.9,1.0]; 
  //var bodyCoordinatesMat=new Matrix4(body.matrix); 
  body.matrix.translate(-.3, 0, 0); 
  body.matrix.scale(0.6, .4, .8); 

  body.render(); 
  // --------------------------------------------------

  
  // head ------------------------------------------- 
  let headBase = new Cube();
  headBase.color = [1,1,0,1];

  headBase.matrix.rotate(90, 0, 1, 0); 

  // attach to body space (tweak this!)
  headBase.matrix.translate(-0.525, 0.15, -0.22);


  // tilt head downward like your sketch
  headBase.matrix.rotate(-25, 0,0,1);

  let headMatrix = new Matrix4(headBase.matrix);

  // small connector piece (optional)
  headBase.matrix.scale(0.2, 0.2, 0.2);

  headBase.render();


  let headTop = new Cube();
  headTop.color = [0.9,0.9,0.9,1.0];
  headTop.matrix = new Matrix4(headMatrix);

  // position forward
  headTop.matrix.translate(0.5, 0.1, 0);

  // slight tilt
  headTop.matrix.rotate(20, 0,0,1);

  let headTopMatrix = new Matrix4(headTop.matrix);

  headTop.matrix.scale(0.45, 0.45, 0.45);

  headTop.render();


  
  let snout = new Cube();
  snout.color = [0.85,0.85,0.85,1.0];
  snout.matrix = new Matrix4(headMatrix);

  snout.matrix.translate(0.7, 0., 0.085);
  snout.matrix.rotate(20, 0,0,1);

  let snoutMatrix = new Matrix4(snout.matrix);

  snout.matrix.scale(0.25, 0.25, 0.25);
  snout.render();



  let earL = new Cube("earL");
  earL.color = [1,1,1,1]; 
  earL.matrix = new Matrix4(headTopMatrix);

  earL.matrix.translate(0.03, .2, -.048);
  earL.matrix.rotate(30, 0,0,1);

  let earLMatrix = new Matrix4(earL.matrix);

  earL.matrix.scale(0.5, 0.3, 0.05);

  earL.render();


  
  let earR = new Cube("earR");
  earR.color = [1,1,1,1]; 
  earR.matrix = new Matrix4(headTopMatrix);

  earR.matrix.translate(0.03, .2, .45);
  earR.matrix.rotate(30, 0,0,1);

  let earRMatrix = new Matrix4(earR.matrix);

  earR.matrix.scale(0.5, 0.3, 0.05);

  earR.render();
    

  let tusk = new Cube();
  tusk.color = [1,1,1,1];
  tusk.matrix = new Matrix4(snoutMatrix);

  tusk.matrix.translate(0., .15, -0.05);
  tusk.matrix.rotate(-20, 0,0,1);

  tusk.matrix.scale(0.4, 0.05, 0.05);
  tusk.render();

  let tuskR = new Cube();
  tuskR.color = [1,1,1,1];
  tuskR.matrix = new Matrix4(snoutMatrix);

  tuskR.matrix.translate(0., .15, 0.25);
  tuskR.matrix.rotate(-20, 0,0,1);

  tuskR.matrix.scale(0.4, 0.05, 0.05);
  tuskR.render(); 

  let trunk1 = new Cube();
  trunk1.color = [0.7,0.7,0.7,1];
  trunk1.matrix = new Matrix4(snoutMatrix);

  trunk1.matrix.translate(0.14, -0.24, .05);
  trunk1.matrix.rotate(10, 0,0,1);

  let trunk1Matrix = new Matrix4(trunk1.matrix);

  trunk1.matrix.scale(0.15, 0.25, 0.15);
  trunk1.render();

  let trunk2 = new Cube();
  trunk2.color = [0.65,0.65,0.65,1];
  trunk2.matrix = new Matrix4(trunk1Matrix);

  trunk2.matrix.translate(0.05, -0.21, .01);
  trunk2.matrix.rotate(10, 0,0,1);

  let trunk2Matrix = new Matrix4(trunk2.matrix);

  trunk2.matrix.scale(0.13, 0.23, 0.13);
  trunk2.render();

  let trunk3 = new Cube();
  trunk3.color = [0.6,0.6,0.6,1];
  trunk3.matrix = new Matrix4(trunk2Matrix);

  trunk3.matrix.translate(.04, -0.2, 0.003);
  trunk3.matrix.rotate(10, 0,0,1);

  trunk3.matrix.scale(0.12, 0.2, 0.12);
  trunk3.render();

  let eyeL = new Cylinder();
  eyeL.color = [0,0,0,1];
  eyeL.matrix = new Matrix4(headTopMatrix);

  // position stays the same
  eyeL.matrix.translate(0.2, 0.2, 0.43);
  eyeL.matrix.rotate(90, 1, 0, 0)
  // flatten it into a "disk-like" eye
  eyeL.matrix.scale(0.03, 0.03, 0.07);

  eyeL.render(); 

  let eyeR = new Cylinder();
  eyeR.color = [0,0,0,1];
  eyeR.matrix = new Matrix4(headTopMatrix);

  // position stays the same
  eyeR.matrix.translate(0.2, 0.2, -0.01);
  eyeR.matrix.rotate(90, 1, 0, 0)
  // flatten it into a "disk-like" eye
  eyeR.matrix.scale(0.03, 0.03, 0.07);

  eyeR.render(); 
  // ------------------------------------------------


  // front right leg ----------------------------------------
  let frontright = new Cube("frontright"); 
  frontright.color = [0.7,0.7,0.7,1]; 
  frontright.matrix.translate(.13, -.35, 0); 

  frontright.matrix.translate(0, 0.35, 0); 
  frontright.matrix.rotate(-g_upperLegAngle, 1, 0, 0); 
  frontright.matrix.translate(0, -0.35, 0); 

  var upperLegMatrix = new Matrix4(frontright.matrix); 

  frontright.matrix.scale(0.25, .7, .2); 

  frontright.render() 



  var frontright2 = new Cube("frontright2"); 
  frontright2.color = [0.65,0.65,0.65,1]; 
  frontright2.matrix = new Matrix4(upperLegMatrix); 
  frontright2.matrix.translate(0.004, -.5, 0); 
  
  frontright2.matrix.translate(0, .64, 0); 
  frontright2.matrix.rotate(-g_lowerLegAngle, 1,0,0);
  frontright2.matrix.translate(0, -.64, 0); 
  
  var lowerLegMatrix = new Matrix4(frontright2.matrix)
  
  frontright2.matrix.scale(0.24, .68, .18); 

  frontright2.render() 



  var frontfootR = new Cube(); 
  frontfootR.color = [0.6,0.6,0.6,1]; 
  frontfootR.matrix = new Matrix4(lowerLegMatrix); 
  frontfootR.matrix.translate(-0.006, -0.02, -0.023); 


  frontfootR.matrix.translate(0, .1, 0); 
  frontfootR.matrix.rotate(-g_footAngle, 1,0,0);
  frontfootR.matrix.translate(0, -.1, 0); 

  frontfootR.matrix.scale(0.25, .1, .22);

  frontfootR.render() 
 // -----------------------------------------------------


  // front left leg -----------------------------------------
  var frontleft = new Cube("frontleft"); 
  frontleft.color = [0.7,0.7,0.7,1]; 
  frontleft.matrix.translate(-.4, -.35, 0); 

  frontleft.matrix.translate(0, 0.35, 0); 
  frontleft.matrix.rotate(-g_upperLegAngle, 1, 0, 0); 
  frontleft.matrix.translate(0, -0.35, 0); 

  var upperLegMatrix = new Matrix4(frontleft.matrix); 

  frontleft.matrix.scale(0.25, .7, .2); 

  frontleft.render() 



  var frontright2 = new Cube("frontleft2"); 
  frontright2.color = [0.65,0.65,0.65,1]; 
  frontright2.matrix = new Matrix4(upperLegMatrix); 
  frontright2.matrix.translate(0.004, -.5, 0); 
  
  frontright2.matrix.translate(0, .64, 0); 
  frontright2.matrix.rotate(-g_lowerLegAngle, 1,0,0);
  frontright2.matrix.translate(0, -.64, 0); 
  
  var lowerLegMatrix = new Matrix4(frontright2.matrix)
  
  frontright2.matrix.scale(0.24, .68, .18); 

  frontright2.render() 



  var frontfootR = new Cube(); 
  frontfootR.color = [0.6,0.6,0.6,1]; 
  frontfootR.matrix = new Matrix4(lowerLegMatrix); 
  frontfootR.matrix.translate(-0.006, -0.02, -0.023); 


  frontfootR.matrix.translate(0, .1, 0); 
  frontfootR.matrix.rotate(-g_footAngle, 1,0,0);
  frontfootR.matrix.translate(0, -.1, 0); 

  frontfootR.matrix.scale(0.25, .1, .22);

  frontfootR.render() 
  // -------------------------------------------------



  // back right leg ---------------------------------
  let backright = new Cube("backright"); 
  backright.color = [0.7,0.7,0.7,1]; 
  backright.matrix.translate(.13, -.45, .55); 

  backright.matrix.translate(0, 0.35, 0); 
  backright.matrix.rotate(-g_backUpperLegAngle, 1, 0, 0); 
  backright.matrix.translate(0, -0.35, 0); 

  var backUpperLegMatrix = new Matrix4(backright.matrix); 

  backright.matrix.scale(0.25, .7, .2); 

  backright.render() 



  var backright2 = new Cube("backright2"); 
  backright2.color = [0.65,0.65,0.65,1]; 
  backright2.matrix = new Matrix4(backUpperLegMatrix); 
  backright2.matrix.translate(0.005, -.45, 0.1); 
  
  backright2.matrix.translate(0, .34, 0); 
  backright2.matrix.rotate(-g_backLowerLegAngle, 1,0,0);
  backright2.matrix.translate(0, -.34, 0); 
  
  var backLowerLegMatrix = new Matrix4(backright2.matrix)
  
  backright2.matrix.scale(0.24, .68, .18); 

  backright2.render() 



  var backfootR = new Cube(); 
  backfootR.color = [0.6,0.6,0.6,1]; 
  backfootR.matrix = new Matrix4(backLowerLegMatrix); 
  backfootR.matrix.translate(-0.005, 0.03, -.056);


  frontfootR.matrix.translate(0, .1, 0); 
  frontfootR.matrix.rotate(-g_backFootAngle, 1,0,0);
  frontfootR.matrix.translate(0, -.1, 0); 

  backfootR.matrix.scale(0.25, .1, .22);

  backfootR.render() 
  // ------------------------------------------------ 


  // back left leg ----------------------------------
  let backleft = new Cube("backleft"); 
  backleft.color = [0.7,0.7,0.7,1]; 
  backleft.matrix.translate(-.4, -.45, .55); 

  backleft.matrix.translate(0, 0.35, 0); 
  backleft.matrix.rotate(-g_backUpperLegAngle, 1, 0, 0); 
  backleft.matrix.translate(0, -0.35, 0); 

  var backUpperLegMatrix = new Matrix4(backleft.matrix); 

  backleft.matrix.scale(0.25, .7, .2); 

  backleft.render() 



  var backright2 = new Cube("backleft2"); 
  backright2.color = [0.65,0.65,0.65,1]; 
  backright2.matrix = new Matrix4(backUpperLegMatrix); 
  backright2.matrix.translate(0.005, -.45, 0.1); 
  
  backright2.matrix.translate(0, .34, 0); 
  backright2.matrix.rotate(-g_backLowerLegAngle, 1,0,0);
  backright2.matrix.translate(0, -.34, 0); 
  
  var backLowerLegMatrix = new Matrix4(backright2.matrix)
  
  backright2.matrix.scale(0.24, .68, .18); 

  backright2.render() 



  var backfootR = new Cube(); 
  backfootR.color = [0.6,0.6,0.6,1]; 
  backfootR.matrix = new Matrix4(backLowerLegMatrix); 
  backfootR.matrix.translate(-0.005, 0.03, -.056);


  frontfootR.matrix.translate(0, .1, 0); 
  frontfootR.matrix.rotate(-g_backFootAngle, 1,0,0);
  frontfootR.matrix.translate(0, -.1, 0); 

  backfootR.matrix.scale(0.25, .1, .22);

  backfootR.render()  
  // ------------------------------------------------

}

function graphToWorld(x, y, z = 0) {
  // map 0–25 → roughly -1 to +1 (or whatever scale you want)
  let wx = (x / 25) * 2 - 1;
  let wy = (y / 20) * 2 - 1;

  return [wx, wy, z];
} 

function placeCubeFromGraph(x, y, z, sx, sy, sz, color) {
  let [wx, wy, wz] = graphToWorld(x, y, z);

  let m = new Matrix4();
  m.translate(wx, wy, wz);
  m.scale(sx, sy, sz);

  let c = new Cube();
  c.matrix = m;

  if (color) c.color = color;

  c.render();
} 

function sendTextToHTML(text, htmlID) { 
  var htmlElm = document.getElementById(htmlID); 
  if (!htmlElm) { 
    console.log("failed to get " + htmlID + " from HTML"); 
    return; 
  }
  htmlElm.innerHTML = text; 
}
