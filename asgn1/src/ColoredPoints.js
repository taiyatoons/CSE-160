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

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position; 
  uniform float u_Size; 
  void main() {
    gl_Position = a_Position; 
    gl_PointSize = u_Size; 
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

let currentMode = "paint"; 

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

  // get the storage location of u_Size 
  u_Size = gl.getUniformLocation(gl.program, 'u_Size'); 
  if (!u_Size) { 
    console.log('Failed to get the storage location of u_Size'); 
    return; 
  }

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

function addActionsForHtmlUI() { 

  // Button events 
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; }; 
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; }; 
  document.getElementById('clearButton').onclick = function() { 
    g_shapesList=[]; 
    if (currentMode === "paint") { 
      renderAllShapes();
    }
  }; 

  document.getElementById('drawButton').onclick = function() { drawGraphImage();}; 

  document.getElementById('exitButton').onclick = function() { 
    currentMode = "paint"; 
    renderAllShapes();
  }; 
  document.getElementById('pongButton').onclick = function() { 
    currentMode = "pong"; 
    playPong();
  }; 

  document.getElementById('pointButton').onclick = function() { g_selectedType=POINT}; 
  document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE}; 
  document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE}; 

  // Color slider events 
  document.getElementById('redSlide').addEventListener('mouseup',   function() { g_selectedColor[0] = this.value/100; });  
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });  
  document.getElementById('blueSlide').addEventListener('mouseup',  function() { g_selectedColor[2] = this.value/100; });  

  document.getElementById('sizeSlide').addEventListener('mouseup',  function() { g_selectedSize = this.value; });  
  document.getElementById('segSlide').addEventListener('mouseup',  function() { g_selectedSegs = this.value; });  

  // up / down key events 
  document.addEventListener("keydown", (e) => {
    if (e.key === "w") keys.w = true;
    if (e.key === "s") keys.s = true;
    if (e.key === "ArrowUp") keys.arrowUp = true;
    if (e.key === "ArrowDown") keys.arrowDown = true;
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "w") keys.w = false;
    if (e.key === "s") keys.s = false;
    if (e.key === "ArrowUp") keys.arrowUp = false;
    if (e.key === "ArrowDown") keys.arrowDown = false;
  });
  
}

function main() {

  // setup canvas and gl variables 
  setupWebGL(); 
  
  // setup GLSL shader programs and connect GLSL variables 
  connectVariablesToGLSL(); 
  // set up actions for the HTML UI elements 
  addActionsForHtmlUI(); 

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click; // click function 
  // canvas.onmousemove = click; 
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } }; 

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0); // red

}


var g_shapesList = []; 

function click(ev) {

  if (currentMode != "paint") { 
    return; 
  }
  // extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev); 

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

// extract the event click and return it in WebGL coordinates 
function convertCoordinatesEventToGL(ev) { 
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]); 
}

// draw every shape that is supposed to be in the canvas
function renderAllShapes() { 

  // Check the time at the start of this function 
  var startTime = performance.now(); 

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //  var len = g_points.length;
  var len = g_shapesList.length; 
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();  
  }

  var duration = performance.now() - startTime; 
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot"); 

}

function sendTextToHTML(text, htmlID) { 
  var htmlElm = document.getElementById(htmlID); 
  if (!htmlElm) { 
    console.log("failed to get " + htmlID + " from HTML"); 
    return; 
  }
  htmlElm.innerHTML = text; 
}
