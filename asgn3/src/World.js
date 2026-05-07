// MultiAttributeSize_Interleaved.js
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float; 
  attribute vec4 a_Position; 
  attribute vec2 a_UV; 
  varying vec2 v_UV; 
  uniform mat4 u_ModelMatrix; 
  uniform mat4 u_GlobalRotateMatrix; 
  uniform mat4 u_ViewMatrix; 
  uniform mat4 u_ProjectionMatrix; 
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 
    v_UV = a_UV; 
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float; 
  varying vec2 v_UV; 
  uniform vec4 u_FragColor; 
  uniform sampler2D u_Sampler0; 
  uniform int u_whichTexture; 
  void main() { 

    if (u_whichTexture == -2) { 
      gl_FragColor = u_FragColor; 

    } else if (u_whichTexture == -1) { 
      gl_FragColor = vec4(v_UV, 1.0,1.0); 
    
    } else if (u_whichTexture == 0) { 
      gl_FragColor = texture2D(u_Sampler0, v_UV); 

    } else { 
      gl_FragColor = vec4(1,.2,.2,1); 
    }

  }`


// setup 
let canvas;  
let gl; 
let a_Position; 
let a_UV; 
let u_FragColor; 
let u_Size; 
let u_ModelMatrix; 
let u_ProjectionMatrix; 
let u_ViewMatrix; 
let u_GlobalRotateMatrix; 
let u_Sampler0; 
let u_whichTexture;  

let n; // interleave vertex shader 

// camera 
let g_isDragging = false;
let g_lastX = 0;
let g_lastY = 0;
let g_rotateY = 0; // up/down
let g_rotateX = 0; // left/right

// performance 
let g_lastFrameTime = performance.now();
let g_fps = 0; 


function setupWebGL() { 
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
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

  // Get the storage location of a_UV
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

   // Get the storage location of a_PointSize, allocate buffer, & enable
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
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
  
  // get the storage location of u_ViewMatrix  
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix'); 
  if (!u_ViewMatrix) { 
    console.log('Failed to get the storage location of u_ViewMatrix'); 
    return; 
  }

  // get the storage location of u_ProjectionMatrix  
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix'); 
  if (!u_ProjectionMatrix) { 
    console.log('Failed to get the storage location of u_ProjectionMatrix'); 
    return; 
  }

  // get the storage location of u_ProjectionMatrix  
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0'); 
  if (!u_Sampler0) { 
    console.log('Failed to get the storage location of u_Sampler0'); 
    return; 
  }

  var identityM = new Matrix4(); 
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements); 

}

const POINT = 0; 
const TRIANGLE = 1; 
const CIRCLE = 2; 

let g_selectedColor=[1,1,1,1]; 
let g_selectedSize=5; 
let g_selectedType=POINT; 
let g_globalAngle=0; 
let g_yellowAngle=0; 
let g_magentaAngle=0; 
let g_yellowAnimation=false; 
let g_magentaAnimation=false; 

function addActionsForHtmlUI() { 

  // animation 
  document.getElementById('animationYellowOffButton').onclick = function() { g_yellowAnimation=false;};  
  document.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation=true;}; 
  document.getElementById('animationMagentaOffButton').onclick = function() { g_magentaAnimation=false;};  
  document.getElementById('animationMagentaOnButton').onclick = function() { g_magentaAnimation=true;};  

  document.getElementById('YellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });  
  document.getElementById('MagentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); }); 

  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev)} } 

  // camera 
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); }); 
}

function initTextures() { 

  var image = new Image();  
  if (!image) { 
    console.log('Failed to create the image object'); 
    return false; 
  }

  image.onload = function(){ sendTextureToTEXTURE0(image); }; 
  image.src = 'sky.jpg'; 

  return true; 
}

function sendTextureToTEXTURE0(image) { 
  var texture = gl.createTexture(); 
  if (!texture) { 
    console.log('Failed to create the texture object'); 
    return false; 
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // flip the image's y axis 
  // enable texture unti0 
  gl.activeTexture(gl.TEXTURE0); 
  // bind the texture object to the target 
  gl.bindTexture(gl.TEXTURE_2D, texture); 

  // set the texture parameters 
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); 
  // set the texture image 
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image); 

  // set the texture unit 0 to the sampler 
  gl.uniform1i(u_Sampler0, 0); 

  console.log('finished loadTexture'); 

}
function main() {

  // setup canvas and gl variables 
  setupWebGL(); 
  
  // setup GLSL shader programs and connect GLSL variables 
  connectVariablesToGLSL(); 
  // set up actions for the HTML UI elements 
  addActionsForHtmlUI(); 

  initTextures(); 

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // gl.clear(gl.COLOR_BUFFER_BIT); 

  // global camera 
  // canvas.onmousedown = function(ev) {
    // g_isDragging = true;
    // g_lastX = ev.clientX;
    // g_lastY = ev.clientY;
  // };

  // stop dragging 
  // canvas.onmouseup = function() {
    // g_isDragging = false;
  // };

  // is dragging
  // canvas.onmousemove = function(ev) {
    // if (!g_isDragging) return;

    // let dx = ev.clientX - g_lastX;
    // let dy = ev.clientY - g_lastY;

    // g_rotateX += dx * 0.5; // left/right
    // g_rotateY += dy * 0.5; // up/down

    // g_lastX = ev.clientX;
    // g_lastY = ev.clientY;
    
  // };

  // n = initVertexBuffers(gl);  
  // gl.drawArrays(gl.POINTS, 0, n); 

  requestAnimationFrame(tick); 
}

// tick vars 
var g_startTime=performance.now()/1000.0; 
var g_seconds=performance.now()/1000.0-g_startTime;  

function tick() { 
  
  // update time
  g_seconds = performance.now() / 1000.0 - g_startTime;
  // g_seconds=performance.now()/1000.0-g_startTime; 
  // console.log(performance.now()); 

  updateAnimationAngles(); 

  // updateAnimationAngles(); 
  renderAllShapes();  

  // sendTextToHTML("FPS: " + g_fps.toFixed(1), "fps"); 

  requestAnimationFrame(tick); 
} 


function updateAnimationAngles() { 

  if (g_yellowAnimation) { 
    g_yellowAngle = (45*Math.sin(g_seconds)); 
  }
  if (g_magentaAnimation) { 
    g_magentaAngle = (45*Math.sin(3*g_seconds)); 
  }
}

var g_eye=[0,0,3]; 
var g_at=[0,0,-100]; 
var g_up=[0,1,0]; 

// draw every shape that is supposed to be in the canvas
function renderAllShapes() { 

  var startTime = performance.now(); 

  var projMat=new Matrix4(); 
  projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100); 
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements); 

  var viewMat=new Matrix4(); 
  viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]); 
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements); 

  var globalRotMat=new Matrix4().rotate(g_globalAngle, 0,1,0); 
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements); 
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
  gl.clear(gl.COLOR_BUFFER_BIT); 

  var body = new Cube(); 
  body.color = [1,0,0,1]; 
  body.textureNum=0; 
  body.matrix.translate(-.25, -.75, 0); 
  body.matrix.rotate(-5,1,0,0); 
  body.matrix.scale(.5, .3, .5); 
  body.render(); 

  var yellow = new Cube(); 
  yellow.color = [1,1,0,1]; 
  yellow.matrix.setTranslate(0, -.5, 0); 
  yellow.matrix.rotate(-5,1,0,0); 
  yellow.matrix.rotate(-g_yellowAngle, 0,0,1); 
  var yellowCoordinatesMat=new Matrix4(yellow.matrix); 
  yellow.matrix.scale(.25, .7, .5); 
  yellow.matrix.translate(-.5, 0,0); 
  yellow.render(); 

  var magenta = new Cube(); 
  magenta.color = [1,0,1,1]; 
  magenta.textureNum=0; 
  magenta.matrix = yellowCoordinatesMat; 
  magenta.matrix.translate(0, .65, 0); 
  magenta.matrix.rotate(g_magentaAngle, 0,0,1); 
  magenta.matrix.scale(.3, .3, .3); 
  magenta.matrix.translate(-.5, 0, -.001); 
  magenta.render(); 

  var ground = new Cube(); 
  ground.matrix.translate(0,0,-1); 
  ground.matrix.scale(2,.1,2); 
  ground.render(); 
}

function sendTextToHTML(text, htmlID) { 
  var htmlElm = document.getElementById(htmlID); 
  if (!htmlElm) { 
    console.log("failed to get " + htmlID + " from HTML"); 
    return; 
  }
  htmlElm.innerHTML = text; 
}
