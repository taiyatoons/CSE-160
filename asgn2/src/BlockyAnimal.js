// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position; 
  uniform mat4 u_ModelMatrix; 
  void main() {
    gl_Position = u_ModelMatrix * a_Position; 
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

    // get the storage location of u_ModelMatrix 
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix'); 
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix'); 
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

function addActionsForHtmlUI() { 
  
}

function main() {

  // setup canvas and gl variables 
  setupWebGL(); 
  
  // setup GLSL shader programs and connect GLSL variables 
  connectVariablesToGLSL(); 
  // set up actions for the HTML UI elements 
  addActionsForHtmlUI(); 

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);

  // gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0); // red
  renderAllShapes(); 
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

// draw every shape that is supposed to be in the canvas
function renderAllShapes() { 
 
  // Check the time at the start of this function 


  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw a test triangle 
  drawTriangle3D( [-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0]); 
  

  // Draw a cube 
  var body = new Cube(); 
  body.color = [1.0,0.0,0.0,1.0]; 
  body.matrix.translate(-.25, -.5, 0.0); 
  body.matrix.scale(0.5, 1, .5); 
  body.render(); 

  var leftArm = new Cube(); 
  leftArm.color = [1,1,0,1]; 
  leftArm.matrix.translate(.7, 0, 0.0); 
  leftArm.matrix.rotate(45, 0, 0, 1); 
  leftArm.matrix.scale(0.25, .7, .5); 
  leftArm.render(); 

}

function sendTextToHTML(text, htmlID) { 
  var htmlElm = document.getElementById(htmlID); 
  if (!htmlElm) { 
    console.log("failed to get " + htmlID + " from HTML"); 
    return; 
  }
  htmlElm.innerHTML = text; 
}
