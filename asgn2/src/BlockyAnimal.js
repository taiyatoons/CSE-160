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
let g_yellowAngle=0; 
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

  document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });  
  document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); }); 

  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); }); 

}

function main() {

  // setup canvas and gl variables 
  setupWebGL(); 
  
  // setup GLSL shader programs and connect GLSL variables 
  connectVariablesToGLSL(); 
  // set up actions for the HTML UI elements 
  addActionsForHtmlUI(); 

  canvas.onmousedown = click; 
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } }; 

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);

  // gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0); // red
  // renderAllShapes(); 
  requestAnimationFrame(tick); 
}

var g_startTime=performance.now()/1000.0; 
var g_seconds=performance.now()/1000.0-g_startTime; 

function tick() { 

  g_seconds=performance.now()/1000.0-g_startTime; 
  // console.log(performance.now()); 

  updateAnimationAngles(); 

  renderAllShapes(); 

  requestAnimationFrame(tick); 
}
var g_shapesList = []; 

function click(ev) {

  // extract the event click and return it in WebGL coordinates
  // let [x,y] = convertCoordinatesEventToGL(ev); 

  // create and store the new point 
  let point = new Triangle(); 
  if (g_selectedType==POINT) { 
  point = new Point(); 
  } else if (g_selectedType==TRIANGLE) { 
    point = new Triangle(); 
  } else { 
    point = new Circle(); 
  }
  point.position=[x,y]; 
  point.color=g_selectedColor.slice(); 
  point.size=g_selectedSize; 
  point.segments=g_selectedSegs; 
  g_shapesList.push(point); 

  // draw every shape that is supposed to be in the canvas 
  renderAllShapes(); 

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
function renderAllShapes() { 
 
  // Check the time at the start of this function 

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat=new Matrix4().rotate(g_globalAngle,0,1,0); 
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements); 
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT); 

  // Draw a test triangle 
  // drawTriangle3D( [-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0]); 
  

  // Draw a cube (red) 
  var body = new Cube(); 
  body.color = [1.0,0.0,0.0,1.0]; 
  body.matrix.translate(-.25, -.75, 0.0); 
  body.matrix.rotate(-5,1,0,0); 
  body.matrix.scale(0.5, .3, .5); 
  body.render(); 

  // yellow 
  var leftArm = new Cube(); 
  leftArm.color = [1,1,0,1]; 
  leftArm.matrix.setTranslate(0, -.5, 0.0); 
  leftArm.matrix.rotate(-5, 1, 0, 0); 
  leftArm.matrix.rotate(-g_yellowAngle, 0,0,1); 
  var yellowCoordinatesMat=new Matrix4(leftArm.matrix); 
  leftArm.matrix.scale(0.25, .7, .5); 
  leftArm.matrix.translate(-.5,0,0); 
  leftArm.render(); 

  // purple 
  var box = new Cube(); 
  box.color = [1,0,1,1]; 
  box.matrix = yellowCoordinatesMat; 
  box.matrix.translate(0,.65, 0); 
  box.matrix.rotate(g_magentaAngle,0,0,1); 
  box.matrix.scale(.3,.3,.3); 
  box.matrix.translate(-.5,0, -.001); 
  // box.matrix.translate(-.1,.1,.0,0); 
  // box.matrix.rotate(-30,1,0,0); 
  // box.matrix.scale(.2,.4,.2); 
  box.render(); 

}

function sendTextToHTML(text, htmlID) { 
  var htmlElm = document.getElementById(htmlID); 
  if (!htmlElm) { 
    console.log("failed to get " + htmlID + " from HTML"); 
    return; 
  }
  htmlElm.innerHTML = text; 
}
