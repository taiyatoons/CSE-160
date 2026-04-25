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
let g_upperLegAngle=0; 
let g_lowerLegAngle=0; 
let g_footAngle=0; 
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

  document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_upperLegAngle = this.value; renderScene(); });  
  document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_lowerLegAngle = this.value; renderScene(); }); 
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
  var body = new Cube(); 
  body.color = [1.0,0.0,0.0,1.0]; 
  //var bodyCoordinatesMat=new Matrix4(body.matrix); 
  body.matrix.translate(-.3, 0, 0); 
  body.matrix.scale(0.6, .4, .8); 

  // top right 
  body.vertices.C[1] += 0.2;
  // top left 
  body.vertices.D[1] += 0.2;
  // back/top right  
  body.vertices.G[1] -= 0.4; 
  // back/top left 
  body.vertices.H[1] -= 0.4;

  // back/bottom left 
  body.vertices.F[1] -= 0.5;
  body.vertices.F[2] += 0.07;
  // back/bottom right 
  body.vertices.E[1] -= 0.5;
  body.vertices.E[2] += 0.07;

  // front/bottom right 
  body.vertices.B[1] -= 0.4;
  body.vertices.B[2] -= 0.05;
  // front/bottom left 
  body.vertices.A[1] -= 0.4;
  body.vertices.A[2] -= 0.05;
  body.render(); 
  // --------------------------------------------------



  // right leg ----------------------------------------
  var frontright = new Cube(); 
  frontright.color = [1.0,1.0,1.0]; 
  frontright.matrix.translate(.13, -.35, 0); 

  frontright.matrix.translate(0, 0.35, 0); 
  frontright.matrix.rotate(-g_upperLegAngle, 1, 0, 0); 
  frontright.matrix.translate(0, -0.35, 0); 

  var upperLegMatrix = new Matrix4(frontright.matrix); 

  frontright.matrix.scale(0.25, .7, .2); 

  // front/bottom right 
  frontright.vertices.B[1] += 0.1;
  frontright.vertices.B[2] -= 0.3; 
  // front/bottom left 
  frontright.vertices.A[1] += 0.1;
  frontright.vertices.A[2] -= 0.3;
  frontright.render() 



  var frontright2 = new Cube(); 
  frontright2.color = [1.0,0.0,1.0, 1.0]; 
  frontright2.matrix = new Matrix4(upperLegMatrix); 
  frontright2.matrix.translate(0.004, -.5, 0); 
  
  frontright2.matrix.translate(0, .64, 0); 
  frontright2.matrix.rotate(-g_lowerLegAngle, 1,0,0);
  frontright2.matrix.translate(0, -.64, 0); 
  
  var lowerLegMatrix = new Matrix4(frontright2.matrix)
  
  frontright2.matrix.scale(0.24, .68, .18); 

  // top right 
  frontright2.vertices.C[1] -= 0.1;
  frontright2.vertices.C[2] -= 0.25;

  // top left 
  frontright2.vertices.D[1] -= 0.1;
  frontright2.vertices.D[2] -= 0.25;

  frontright2.render() 



  var frontfootR = new Cube(); 
  frontfootR.color = [1.0,0.0,0.0, 1.0]; 
  frontfootR.matrix = new Matrix4(lowerLegMatrix); 
  frontfootR.matrix.translate(-0.006, -0.02, -0.023); 


  frontfootR.matrix.translate(0, .1, 0); 
  frontfootR.matrix.rotate(-g_footAngle, 1,0,0);
  frontfootR.matrix.translate(0, -.1, 0); 

  frontfootR.matrix.scale(0.25, .1, .22);

  frontfootR.render() 
 // -----------------------------------------------------


  // left leg -----------------------------------------
  var frontleft = new Cube(); 
  frontleft.color = [1.0,1.0,1.0]; 
  frontleft.matrix.translate(-.4, -.35, 0); 

  frontleft.matrix.translate(0, 0.35, 0); 
  frontleft.matrix.rotate(-g_upperLegAngle, 1, 0, 0); 
  frontleft.matrix.translate(0, -0.35, 0); 

  var upperLegMatrix = new Matrix4(frontleft.matrix); 

  frontleft.matrix.scale(0.25, .7, .2); 

  // front/bottom right 
  frontleft.vertices.B[1] += 0.1;
  frontleft.vertices.B[2] -= 0.3; 
  // front/bottom left 
  frontleft.vertices.A[1] += 0.1;
  frontleft.vertices.A[2] -= 0.3;
  frontleft.render() 



  var frontright2 = new Cube(); 
  frontright2.color = [1.0,0.0,1.0, 1.0]; 
  frontright2.matrix = new Matrix4(upperLegMatrix); 
  frontright2.matrix.translate(0.004, -.5, 0); 
  
  frontright2.matrix.translate(0, .64, 0); 
  frontright2.matrix.rotate(-g_lowerLegAngle, 1,0,0);
  frontright2.matrix.translate(0, -.64, 0); 
  
  var lowerLegMatrix = new Matrix4(frontright2.matrix)
  
  frontright2.matrix.scale(0.24, .68, .18); 

  // top right 
  frontright2.vertices.C[1] -= 0.1;
  frontright2.vertices.C[2] -= 0.25;

  // top left 
  frontright2.vertices.D[1] -= 0.1;
  frontright2.vertices.D[2] -= 0.25;

  frontright2.render() 



  var frontfootR = new Cube(); 
  frontfootR.color = [1.0,0.0,0.0, 1.0]; 
  frontfootR.matrix = new Matrix4(lowerLegMatrix); 
  frontfootR.matrix.translate(-0.006, -0.02, -0.023); 


  frontfootR.matrix.translate(0, .1, 0); 
  frontfootR.matrix.rotate(-g_footAngle, 1,0,0);
  frontfootR.matrix.translate(0, -.1, 0); 

  frontfootR.matrix.scale(0.25, .1, .22);

  frontfootR.render() 
  // -------------------------------------------------



  // back right leg ---------------------------------
  var backright = new Cube(); 
  backright.color = [1.0,1.0,1.0]; 
  backright.matrix.translate(.13, -.45, .55); 

  backright.matrix.translate(0, 0.35, 0); 
  //backright.matrix.rotate(-g_upperLegAngle, 1, 0, 0); 
  backright.matrix.translate(0, -0.35, 0); 

  //var upperLegMatrix = new Matrix4(backright.matrix); 

  backright.matrix.scale(0.25, .7, .2); 

  // top right 
  backright.vertices.C[1] -= 0.1;
  backright.vertices.C[2] -= 0.1;

  // top left 
  backright.vertices.D[1] -= 0.1;
  backright.vertices.D[2] -= 0.25;

  // front/bottom right 
  backright.vertices.B[1] -= .03;
  backright.vertices.B[2] += 0.05; 
  // front/bottom left 
  backright.vertices.A[1] -= 0.03;
  backright.vertices.A[2] += 0.05;

  // back/bottom left 
  backright.vertices.E[1] += 0.2;
  backright.vertices.E[2] += 0.65;
  // back/bottom right 
  backright.vertices.F[1] += 0.2;
  backright.vertices.F[2] += 0.65;

  backright.render() 



  var backright2 = new Cube(); 
  backright2.color = [1.0,0.0,1.0, 1.0]; 
  //backright2.matrix = new Matrix4(upperLegMatrix); 
  backright2.matrix.translate(0.135, -.9, 0.65); 
  
  //backright2.matrix.translate(0, .64, 0); 
  //backright2.matrix.rotate(-g_lowerLegAngle, 1,0,0);
  //backright2.matrix.translate(0, -.64, 0); 
  
  //var lowerLegMatrix = new Matrix4(backright2.matrix)
  
  backright2.matrix.scale(0.24, .68, .18); 

  // top right 
  backright2.vertices.C[1] -= 0.0;
  backright2.vertices.C[2] -= 0.55;

  // top left 
  backright2.vertices.D[1] -= 0.1;
  backright2.vertices.D[2] -= 0.55;

  // back/top right  
  backright2.vertices.G[1] -= 0.1;
  backright2.vertices.G[2] += 0.2; 
  // back/top left 
  backright2.vertices.H[1] -= 0.1;
  backright2.vertices.H[2] += 0.15;


  // front/bottom right 
  backright2.vertices.B[2] -= .3;
  backright2.vertices.B[1] += 0.15; 
  // front/bottom left 
  backright2.vertices.A[2] -= 0.3;
  backright2.vertices.A[1] += 0.15;


  // back/bottom left 
  backright2.vertices.E[1] += 0.15;
  backright2.vertices.E[2] -= 0.1;
  // back/bottom right 
  backright2.vertices.F[1] += 0.15;
  backright2.vertices.F[2] -= 0.1;

  backright2.render() 



  var backfootR = new Cube(); 
  backfootR.color = [1.0,0.0,0.0, 1.0]; 
  //frontfootR.matrix = new Matrix4(lowerLegMatrix); 
  backfootR.matrix.translate(0.13, -0.87, .594);


  //frontfootR.matrix.translate(0, .1, 0); 
  //frontfootR.matrix.rotate(-g_footAngle, 1,0,0);
  //frontfootR.matrix.translate(0, -.1, 0); 

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
