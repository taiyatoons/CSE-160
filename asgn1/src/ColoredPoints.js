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

let graphTriangles = [ 

  // main butterfly back 
  [4, 7.1, 6, 17.2, 8.2, 9.55, 0.0, 0.0, 0.0], 
  [4, 7.1, 2, 16.5, 5.2, 12.3, 0.0, 0.0, 0.0],
  [4, 7, 7.5, 6, 8, 3.3, 0.0, 0.0, 0.0],
  [4, 7, 8, 7.7, 8.8, 4.8, 0.0, 0.0, 0.0],

  // inner (gradient) 
  [4.3, 7.6, 6, 16, 7.9, 9.7, 0.0, 0.0, 0.0, "rainbow"], 
  [4.1, 8, 2.5, 15.3, 4.9, 12.3, 0.0, 0.0, 0.0, "rainbow"],
  [4.7, 6.9, 7.7, 7.4, 8.3, 5.4, 0.0, 0.0, 0.0, "rainbow"], 
  [4.7, 6.65, 7.3, 5.5, 7.6, 4, 0.0, 0.0, 0.0, "rainbow"],

  // inner inner
  [5, 8.6, 6, 14, 7.3, 9.8, 1.0, 1.0, 1.0], 
  [4.2, 9, 3.3, 13.5, 4.8, 11.5, 1.0, 1.0, 1.0],
  [5.3, 6.8, 7.5, 7.2, 7.8, 5.9, 1.0, 1.0, 1.0], 
  [5.3, 6.4, 7., 5.65, 7.2, 4.7, 1.0, 1.0, 1.0],

  // left eye 
  [3.3, 10.3, 4.1, 10.6, 3.5, 8.7, 0.0, 0.0, 0.0],  
  [3.7, 8.9, 4.1, 10.6, 3.5, 8.7, 0.0, 0.0, 0.0], 
  // inner 
  [3.5, 10.2, 3.9, 10.4, 3.55, 9, 0.0, 1.0, 0.0],
  // inner inner 
  [3.55, 10.2, 3.8, 10.3, 3.54, 9.1, 1.0, 1.0, 1.0],

  // right eye 
  [4.4, 8.6, 4, 9, 4.5, 10.7, 0.0, 0.0, 0.0],
  [4.4, 8.6, 5.3, 10.5, 4.5, 10.7, 0.0, 0.0, 0.0],
  // inner 
  [4.35, 8.9, 4.15, 9, 4.6, 10.55, 0.0, 1.0, 0.0],
  [4.35, 8.9, 5.1, 10.4, 4.6, 10.55, 0.0, 1.0, 0.0],
  // inner inner 
  [4.37, 9, 4.2, 9, 4.67, 10.4, 1.0, 1.0, 1.0],
  [4.27, 8.88, 4.95, 10.3, 4.65, 10.4, 1.0, 1.0, 1.0],

  // left-most sparkle 
  [2.5, 7, 2.3, 6, 2.7, 6, 0.0, 0.0, 0.0, "bluegreen"],
  [1.5, 6, 2.5, 6.2, 2.5, 5.8, 0.0, 0.0, 1.0, "bluegreen"],
  [3.5, 6, 2.5, 6.2, 2.5, 5.8, 0.0, 0.0, 1.0, "bluegreen"], 
  [2.5, 5, 2.3, 6, 2.7, 6, 0.0, 0.0, 1.0, "bluegreen"],

  // 2nd left sparkle 
  [3.9, 5.3, 4.1, 5.3, 4, 5.9, 1.0, 0.0, 1.0, "pinkpurple"],
  [3.9, 5.2, 4, 4.7, 4.1, 5.2, 1.0, 0.0, 1.0, "pinkpurple"], 
  [3.3, 5.3, 4, 5.2, 4, 5.4, 1.0, 0.0, 1.0, "pinkpurple"],  
  [4.7, 5.3, 4, 5.2, 4, 5.4, 1.0, 0.0, 1.0, "pinkpurple"],  

  // 1st right sparkle 
  [10, 5, 9.9, 4, 10.1, 4, 0.0, 1.0, 1.0, "bluegreen"],
  [9, 4, 9.9, 4.1, 10.1, 3.9, 0.0, 1.0, 1.0, "bluegreen"], 
  [11, 4, 9.9, 4.1, 10.1, 3.9, 0.0, 1.0, 1.0, "bluegreen"], 
  [10, 3, 9.9, 4, 10.1, 4, 0.0, 1.0, 1.0, "bluegreen"],

  // 2nd right sparkle 
  [11, 11, 11.2, 9, 10.8, 9, 0.0, 1.0, 0.0, "yellowgreen"], 
  [9, 9, 11, 9.2, 11, 8.8, 0.0, 1.0, 0.0, "yellowgreen"],
  [13, 9, 11, 9.2, 11, 8.8, 0.0, 1.0, 0.0, "yellowgreen"],
  [11, 7, 11.2, 9, 10.8, 9, 0.0, 1.0, 0.0, "yellowgreen"],

  // 3rd right sparkle 
  [16, 5.5, 13.5, 5.7, 13.5, 5.3, 0.0, 0.0, 1.0, "bluegreen"], 
  [11, 5.5, 13.5, 5.7, 13.5, 5.3, 0.0, 0.0, 1.0, "bluegreen"], 
  [13.5, 8, 13.3, 5.5, 13.7, 5.5, 0.0, 1.0, 1.0, "bluegreen"], 
  [13.5, 3, 13.3, 5.5, 13.7, 5.5, 0.0, 1.0, 1.0, "bluegreen"], 

  // 'K' sparkle 
  [19.5, 12.5, 17.8, 11, 18.2, 11, 1.0, 1.0, 1.0, "yellowgreen"], 
  [16, 11, 18, 11.2, 18, 10.8, 1.0, 1.0, 1.0, "yellowgreen"], 
  [16.5, 9.5, 17.8, 11, 18.2, 11, 1.0, 1.0, 1.0, "yellowgreen"], 
  [18, 9, 17.8, 11, 18.2, 11, 1.0, 1.0, 1.0, "yellowgreen"], 
  [18, 13, 17.8, 11, 18.2, 11, 1.0, 1.0, 0.0], // top right of k 
  [16.5, 12.5, 17.8, 11, 18.2, 11, 1.0, 1.0, .0], // top left of k 
  [20, 11, 18, 11.2, 18, 10.8, 1.0, 1.0, 0.0], // bottom right of k 
  [19.5, 9.5, 17.8, 11, 18.2, 11, 1.0, 1.0, 0.0], // bottom left of k 

  // 'H' sparkles 
  [19, 8, 21, 8.2, 21, 7.8, 1.0, 1.0, 1.0, "yellowgreen"],
  [21, 10, 20.8, 8, 21.2, 8, 1.0, 1.0, 0.0], // top left of h  
  [23, 8, 21, 8.2, 21, 7.8, 1.0, 1.0, 0.0], // 1/2 of middle of h 
  [21, 6, 20.8, 8, 21.2, 8, 1.0, 1.0, 0.0], // bottom left of h 

  [25.5, 8.1, 23.6, 7.9, 23.6, 8.3, 1.0, 1.0, 1.0, "yellowgreen"], 
  [23.5, 10.3, 23.3, 8.3, 23.7, 8.3, 1.0, 1.0, 0.0], // top right of h 
  [20.5, 8.1, 23.5, 7.9, 23.5, 8.3, 1.0, 1.0, 0.0], // 1/2 of middle of h 
  [23.5, 6, 23.3, 8.3, 23.7, 8.3, 1.0, 1.0, 0.0], // bottom right of h 

  // little dots 
  [12.3, 2.3, 12.7, 2.3, 12.7, 2.6, 0.0, 1.0, 1.0], 
  [12.3, 2.3, 12.7, 2.6, 12.3, 2.6, 0.0, 1.0, 1.0], 

  [12.6, 1.3, 13, 1.3, 13, 1.6, 1.0, 0.0, 1.0],
  [12.6, 1.3, 13, 1.6, 12.6, 1.6, 1.0, 0.0, 1.0], 

  [13.4, 2, 13.8, 2, 13.8, 2.3, 0.0, 0.0, 1.0], 
  [13.4, 2, 13.4, 2.3, 13.8, 2.3, 0.0, 0.0, 1.0], 

  [15, 3, 15.4, 3, 15, 3.3, 0.0, 1.0, 0.0], 
  [15, 3.3, 15.4, 3, 15.4, 3.3, 0.0, 1.0, 0.0], 

  [16.5, 2, 16.5, 1.7, 16.9, 2, 1.0, 1.0, 0.0], 
  [16.5, 1.7, 16.9, 1.7, 16.9, 2, 1.0, 1.0, 0.0], 

  [17.7, 2.1, 17.7, 2.4, 18.1, 2.4, 1.0, 0.0, 0.0], 
  [18.1, 2.1, 17.7, 2.1, 18.1, 2.4, 1.0, 0.0, 0.0], 

  [19.3, 1.6, 19.7, 1.6, 19.3, 1.3, 1.0, 0.0, 1.0], 
  [19.7, 1.3, 19.7, 1.6, 19.3, 1.3, 1.0, 0.0, 1.0], 

  [8, 17, 8, 16.6, 8.5, 17, 1.0, 0.0, 0.0], 
  [8.5, 16.6, 8, 16.6, 8.5, 17, 1.0, 0.0, 0.0], 

  [9, 18, 9, 17.8, 9.3, 18, 0.0, 1.0, 1.0], 
  [9.3, 17.8, 9, 17.8, 9.3, 18, 0.0, 1.0, 1.0], 

  [11.6, 13, 12, 13, 12, 13.3, 0.0, 0.0, 1.0], 
  [11.6, 13, 11.6, 13.3, 12, 13.3, 0.0, 0.0, 1.0], 

]; 

function setupWebGL() { 
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas); 
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true}); // helps fps performance 
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

  // // Get the storage location of a_Position
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
  document.getElementById('clearButton').onclick = function() { g_shapesList=[]; renderAllShapes();}; 

  document.getElementById('drawButton').onclick = function() { drawGraphImage();}; 
  document.getElementById('pongButton').onclick = function() { playPong();}; 

  document.getElementById('pointButton').onclick = function() { g_selectedType=POINT}; 
  document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE}; 
  document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE}; 

  // Color slider events 
  document.getElementById('redSlide').addEventListener('mouseup',   function() { g_selectedColor[0] = this.value/100; });  
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });  
  document.getElementById('blueSlide').addEventListener('mouseup',  function() { g_selectedColor[2] = this.value/100; });  

  document.getElementById('sizeSlide').addEventListener('mouseup',  function() { g_selectedSize = this.value; });  
  document.getElementById('segSlide').addEventListener('mouseup',  function() { g_selectedSegs = this.value; });  
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


  // drawGraphImage(); 
}


var g_shapesList = []; 

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_size = [];    // The array to store the size of a point 
 
function click(ev) {

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

function graphToWebGL(x, y) { 
  let webglX = (x / 26) * 2 - 1; 
  let webglY = (y / 20) * 2 - 1; 
  return [webglX, webglY]; 

}

function drawGraphTriangle(x1, y1, x2, y2, x3, y3) { 
  let [ax, ay] = graphToWebGL(x1, y1); 
  let [bx, by] = graphToWebGL(x2, y2); 
  let [cx, cy] = graphToWebGL(x3, y3); 

  drawTriangle([
    ax, ay,
    bx, by,
    cx, cy

  ]);

}

function drawGraphImage() { 

  // make bg white 
  gl.uniform4f(u_FragColor, 1, 1, 1, 1);

  // Full canvas (clip space)
  drawTriangle([
    -1, -1,
     1, -1,
    -1,  1
  ]);

  drawTriangle([
    -1,  1,
     1, -1,
     1,  1
  ]);
   
  // draw the image 
  for (let i = 0; i < graphTriangles.length; i++) { 
    let t = graphTriangles[i]; 
    
    let x1 = t[0], y1 = t[1];
    let x2 = t[2], y2 = t[3];
    let x3 = t[4], y3 = t[5];

    let gradientType = t[9]; 

    if (gradientType) { // drawing triangles with gradients 
      drawGradientTriangle(x1, y1, x2, y2, x3, y3, gradientType);
    } else { // drawing triangles without gradients 
      let r = t[6], g = t[7], b = t[8];
      gl.uniform4f(u_FragColor, r, g, b, 1.0);
      drawGraphTriangle(x1, y1, x2, y2, x3, y3);
    }

  }

} 

// Color based on position (gradient)
function gradientColor(t, type) {
  if (type === "rainbow") {
    return [
      Math.abs(Math.sin(Math.PI * t)),
      Math.abs(Math.sin(Math.PI * t + 2)),
      Math.abs(Math.sin(Math.PI * t + 4))
    ];
  }

  if (type === "bluegreen") {
    return [
      0.0,
      0.9 + 0.6 * Math.sin(Math.PI * t),
      0.9 + 0.9 * Math.cos(Math.PI * t)
    ];
  }

  if (type === "yellowgreen") {
    return [
      0.2 + 0.5 * Math.sin(Math.PI * t), // red
      1.0,                               // strong green
      0.0
    ];
  }

  if (type === "pinkpurple") {
    return [
      0.8 + 0.2 * Math.sin(Math.PI * t),
      0.0,
      0.8 + 0.2 * Math.cos(Math.PI * t)
    ];
  }

  // fallback (white)
  return [1,1,1];
}

function drawGradientTriangle(x1, y1, x2, y2, x3, y3, type) {

  let steps = 20; // more = smoother gradient

  for (let i = 0; i < steps; i++) {
    let t1 = i / steps;
    let t2 = (i + 1) / steps;

    // Interpolate between vertices
    let ax = x1 + (x2 - x1) * t1;
    let ay = y1 + (y2 - y1) * t1;

    let bx = x1 + (x3 - x1) * t1;
    let by = y1 + (y3 - y1) * t1;

    let cx = x1 + (x2 - x1) * t2;
    let cy = y1 + (y2 - y1) * t2;

    let dx = x1 + (x3 - x1) * t2;
    let dy = y1 + (y3 - y1) * t2;

    let [r, g, b] = gradientColor(t1, type); 
    gl.uniform4f(u_FragColor, r, g, b, 1.0);

    // Draw two small triangles (a quad split)
    drawGraphTriangle(ax, ay, bx, by, cx, cy);
    drawGraphTriangle(bx, by, cx, cy, dx, dy);
  }

}