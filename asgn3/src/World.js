// MultiAttributeSize_Interleaved.js
// Vertex shader program

// Kyra Hannah 
// klhannah@ucsc.edu 

// NOTE TO GRADER:  

//  -   Blocky world randomly generates holes every time you reload
//  -   Controls: wasd to move, click canvas to control camera, left click to remove block, right click to place one, q and e to pan left/right, r to move up, f to mvoe down 
//  -   there's supposed to be dino fossils placed in the world, also some-what randomly generated between three models, though i'll be honest, I couldn't quite implement it in time 
//  -  you can see the white of the fossil texture when moving underneath the map 
//  -   the code is VERY messy. I'm sorry. I will update the live submission soon, so to whichever poor soul reads the zip file, if you have trouble, check that 
//  -   console has some info on dino placement, though these are just debug comments, really 
//  -   when clicking canvas, camera does a 180, just turn around to see world

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
    gl_Position =
        u_ProjectionMatrix *
        u_ViewMatrix *
        u_GlobalRotateMatrix *
        u_ModelMatrix *
        a_Position;

    v_UV = a_UV;
}
`;

// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;

varying vec2 v_UV;

uniform vec4 u_FragColor;
uniform sampler2D u_Sampler;
uniform float u_texColorWeight;

void main() {

    vec4 texColor = texture2D(u_Sampler, v_UV);

    gl_FragColor = mix(
        u_FragColor,
        texColor,
        u_texColorWeight
    );
}
`;


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
let u_Sampler; 
let u_texColorWeight; 

let n; // interleave vertex shader 

// textures 
const AIR = 0;
const DIRT = 1;
const FOSSIL = 2;
const STONE = 3;
const GRASS = 4; 

let g_sharedCube; 

let g_textures = []; 

// camera 
let g_isDragging = false;
let g_lastX = 0;
let g_lastY = 0;
let g_rotateY = 0; // up/down
let g_rotateX = 0; // left/right

// performance 
let g_lastFrameTime = performance.now();
let g_fps = 0; 

let g_dinoStructures = []; 

function getStructureBounds(structure) {
  let minY = Infinity, maxY = -Infinity;

  for (const b of structure) {
    minY = Math.min(minY, b[1]);
    maxY = Math.max(maxY, b[1]);
  }

  return {
    minY,
    maxY,
    height: maxY - minY
  };
}

function getGroundY(x, z) {
  for (let y = WORLD_Y - 1; y >= 0; y--) {
    if (g_world[x][y][z] !== AIR) {
      // ensure it's actually surface (air above it)
      if (y === WORLD_Y - 1 || g_world[x][y + 1][z] === AIR) {
        return y;
      }
    }
  }
  return 0;
}

function getStructureXZBounds(structure) {
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const b of structure) {
    minX = Math.min(minX, b[0]);
    maxX = Math.max(maxX, b[0]);
    minZ = Math.min(minZ, b[2]);
    maxZ = Math.max(maxZ, b[2]);
  }

  return {
    width: maxX - minX,
    depth: maxZ - minZ
  };
}

async function loadDinoStructures() {

    const files = [
        "dinos/stego.json",
        "dinos/bronchiosaurus.json",
        "dinos/crescenthorn.json"
    ];

    for (const file of files) {

        const response = await fetch(file);

        const data = normalizeStructure(await response.json());
        g_dinoStructures.push(data);
    }

    console.log("Loaded dinos:",
        g_dinoStructures);
} 

function normalizeStructure(structure) {

    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;

    for (const b of structure) {

        minX = Math.min(minX, b[0]);
        minY = Math.min(minY, b[1]);
        minZ = Math.min(minZ, b[2]);
    }

    return structure.map(b => [
        b[0] - minX,
        b[1] - minY,
        b[2] - minZ
    ]);
} 

function setupWebGL() { 
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});  // helps fps performance 
  gl = canvas.getContext("webgl"); 
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST); 

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
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
  u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler'); 
  if (!u_Sampler) { 
    console.log('Failed to get the storage location of u_Sampler'); 
    return; 
  }

  // get the storage location of u_texColorWeight   
  u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
  if (!u_texColorWeight) {
    console.log('Failed to get u_texColorWeight');
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

  let isPointerLocked = false;

  // steals mouse
  canvas.onclick = () => canvas.requestPointerLock();

  document.addEventListener("mousemove", (ev) => {
    if (document.pointerLockElement !== canvas) return;

    g_camera.yaw   -= ev.movementX * g_camera.sensitivity;
    g_camera.pitch -= ev.movementY * g_camera.sensitivity;

    // clamp pitch (prevents flipping)
    g_camera.pitch = Math.max(-89, Math.min(89, g_camera.pitch));

    g_camera.updateDirectionFromAngles();
  });

  canvas.addEventListener("mousedown", (ev) => {
    if (ev.button === 0) {
      digBlock();
    }
    else if (ev.button === 2) {
      placeBlock();
    }
  });

  canvas.addEventListener("contextmenu", (ev) => ev.preventDefault());

  // canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev)} }; 

  // canvas.onmousedown = function(ev) { digBlock(); };

  // canvas.oncontextmenu = function(ev) { ev.preventDefault(); placeBlock(); };

  // camera 
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); }); 
}

function initTextures() {

    const files = [
        "dirt.jpg",
        "grass.jpg",
        "fossil.jpg",
        "stone.jpg"
    ];

    for (let i = 0; i < files.length; i++) {

        const image = new Image();

        image.onload = function () {

            const tex = gl.createTexture();

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, tex);

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_MIN_FILTER,
                gl.NEAREST
            );

            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_MAG_FILTER,
                gl.NEAREST
            );

            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_S,
                gl.CLAMP_TO_EDGE
            );

            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_T,
                gl.CLAMP_TO_EDGE
            );

            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGB,
                gl.RGB,
                gl.UNSIGNED_BYTE,
                image
            );

            g_textures[i] = tex;
        };

        image.src = files[i];
    }
} 

function blockToTexture(block) {
  switch (block) {
    case DIRT: return 0;
    case GRASS: return 1;
    case FOSSIL: return 2;
    case STONE: return 3;
    default: return 0;
  }
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
  gl.uniform1i(u_Sampler, 0); 

  console.log('finished loadTexture'); 

}

async function main() {

  // setup canvas and gl variables 
  setupWebGL(); 
  
  // setup GLSL shader programs and connect GLSL variables 
  connectVariablesToGLSL();  
  initCubeBuffer();  

  // for camera.js access 
  g_camera = new Camera(canvas);  
  g_sharedCube = new Cube(); 
  
  await loadDinoStructures(); 

  mainWorldSetup(); 
  // generateWorld();   

  // set up actions for the HTML UI elements 
  addActionsForHtmlUI(); 

  // camera 
  document.onkeydown = keydown; 

  initTextures(); 

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // gl.clear(gl.COLOR_BUFFER_BIT); 

  // mouse camera 
  canvas.onmousedown = function(ev) {
    g_isDragging = true;
    g_lastX = ev.clientX;
  };

  canvas.onmouseup = function() {
    g_isDragging = false;
  };

  canvas.onmousemove = function(ev) {

    if (!g_isDragging) { 
      return; 
    }

    let dx = ev.clientX - g_lastX;

    if (dx > 0) {
      g_camera.panRight();
    } else {
      g_camera.panLeft();
    }

    g_lastX = ev.clientX;
    
  };

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

function keydown(ev) { 
  //if (ev.keyCode == 39) { // right arrow 
    //g_eye[0] += .2; 
  //} else if (ev.keyCode == 37) { // left arrow 
  //  g_eye[0] -= .2; 
  //}

  //renderAllShapes(); 
  if (ev.keyCode == 87) { // W
    let f = g_camera.getForwardFlat();
    g_camera.eye = g_camera.eye.add(f);
    g_camera.at = g_camera.at.add(f);
  }

  else if (ev.keyCode == 83) { // S
    let f = g_camera.getForwardFlat();
    g_camera.eye = g_camera.eye.subtract(f);
    g_camera.at = g_camera.at.subtract(f);
  }

  else if (ev.keyCode == 65) { // A
    let r = g_camera.getRightFlat();
    g_camera.eye = g_camera.eye.subtract(r);
    g_camera.at = g_camera.at.subtract(r);
  }

  else if (ev.keyCode == 68) { // D
    let r = g_camera.getRightFlat();
    g_camera.eye = g_camera.eye.add(r);
    g_camera.at = g_camera.at.add(r);
  }

  else if (ev.keyCode == 81) { // Q
    g_camera.panLeft();
  }

  else if (ev.keyCode == 69) { // E
    g_camera.panRight();
  }

  else if (ev.keyCode == 82) { // R
    g_camera.moveUp();
  }

  else if (ev.keyCode == 70) { // F 
    g_camera.moveDown();
  } 

  g_camera.updateView(); 
  renderAllShapes();
  console.log(ev.keyCode); 

}

// var g_eye=[0,0,3]; 
// var g_at=[0,0,-100]; 
// var g_up=[0,1,0]; 
var g_camera; // =new Camera(); 

const WORLD_X = 64;
const WORLD_Y = 32;
const WORLD_Z = 64;

let g_world = []; 

function drawWorld() {

    const cube = g_sharedCube;

    const px = Math.floor(g_camera.eye.x + WORLD_X / 2);
    const pz = Math.floor(g_camera.eye.z + WORLD_Z / 2);

    const VIEW_DISTANCE = 64;
    const VIEW_DISTANCE_SQ =
        VIEW_DISTANCE * VIEW_DISTANCE;

    for (let x = 0; x < WORLD_X; x++) {

        for (let y = 0; y < WORLD_Y; y++) {

            for (let z = 0; z < WORLD_Z; z++) {

                const block = g_world[x][y][z];

                if (block === AIR)
                    continue;

                // skip hidden blocks
                if (isBlockHidden(x, y, z))
                    continue;

                // distance culling
                const dx = x - px;
                const dz = z - pz;

                if (
                    dx * dx + dz * dz >
                    VIEW_DISTANCE_SQ
                ) {
                    continue;
                }

                cube.textureNum =
                    blockToTexture(block);

                cube.useTexture = true;

                cube.matrix.setIdentity();

                cube.matrix.translate(
                    x - WORLD_X / 2,
                    y - 1,
                    z - WORLD_Z / 2
                );

                cube.render();
            }
        }
    }
}

// for random world generation 
function generateWorld() {

  g_world = new Array(WORLD_X);

  const SURFACE_HEIGHT = 18;
  const DIRT_DEPTH = 6;

  for (let x = 0; x < WORLD_X; x++) {
    g_world[x] = new Array(WORLD_Y);

    for (let y = 0; y < WORLD_Y; y++) {
      g_world[x][y] = new Array(WORLD_Z);

      for (let z = 0; z < WORLD_Z; z++) {

        let height = SURFACE_HEIGHT;

        if (y > height) {
          g_world[x][y][z] = AIR;
        }
        else if (y === height) {
          g_world[x][y][z] = GRASS;
        }
        else if (y > height - DIRT_DEPTH) {
          g_world[x][y][z] = DIRT;
        }
        else {
          g_world[x][y][z] = STONE;
        }
      }
    }
  }
  // let skeletonIndex = Math.floor(Math.random() * 3);
  // let skeleton = skeletons[skeletonIndex];

  // loadSkeleton(skeleton, 32, 2, 32);
}


function placeStructure(structure, startX, startY, startZ, blockType = FOSSIL) {

  let placed = 0;
  let skipped = 0;

  for (const block of structure) {

    const x = startX + block[0];
    const y = startY + block[1];
    const z = startZ + block[2];

    if (!inBounds(x, y, z)) {
      skipped++;
      continue;
    }

    if (
      g_world[x][y][z] === STONE ||
      g_world[x][y][z] === DIRT
    ) {
      g_world[x][y][z] = blockType;
      placed++;
    }
  }

  console.log("Structure placed:", placed, "Skipped:", skipped);
}

function carveCave(cx, cy, cz, radius) {

  radius = 3 + Math.random() * 5;  

  for (let x = -radius; x <= radius; x++) {
    for (let y = -radius; y <= radius; y++) {
      for (let z = -radius; z <= radius; z++) {

        let nx = Math.floor(cx + x);
        let ny = Math.floor(cy + y);
        let nz = Math.floor(cz + z);

        if (!inBounds(nx, ny, nz)) continue;

        let dist = Math.sqrt(x * x + y * y + z * z);

        if (dist < radius) {
          g_world[nx][ny][nz] = AIR;
        }
      }
    }
  }
}

function isAir(x, y, z) {

  if (
    x < 0 || x >= WORLD_X ||
    y < 0 || y >= WORLD_Y ||
    z < 0 || z >= WORLD_Z
  ) {
    return true;
  }

  return g_world[x][y][z] === AIR;
} 

function isBlockHidden(x, y, z) {

  return (
    !isAir(x + 1, y, z) &&
    !isAir(x - 1, y, z) &&
    !isAir(x, y + 1, z) &&
    !isAir(x, y - 1, z) &&
    !isAir(x, y, z + 1) &&
    !isAir(x, y, z - 1)
  );
}

function assertWorld() {
  if (!g_world || !g_world[0] || !g_world[0][0]) {
    console.error("World not initialized correctly");
  }
} 

function mainWorldSetup() {

  generateWorld();
  assertWorld();

  // caves
  for (let i = 0; i < 20; i++) {
    carveCave(
      Math.floor(Math.random() * WORLD_X),
      Math.floor(Math.random() * WORLD_Y),
      Math.floor(Math.random() * WORLD_Z),
      3 + Math.random() * 4
    );
  }

  const randomDino =
  g_dinoStructures[Math.floor(Math.random() * g_dinoStructures.length)];

  const boundsY = getStructureBounds(randomDino);
  const boundsXZ = getStructureXZBounds(randomDino);

  // safe XZ spawn
  const dx = 8 + Math.floor(Math.random() * (WORLD_X - boundsXZ.width - 16));
  const dz = 8 + Math.floor(Math.random() * (WORLD_Z - boundsXZ.depth - 16));

  // reliable terrain
  const groundY = getGroundY(dx, dz);

  // vertical offset
  const FLOAT = 3;

  let dy = groundY + FLOAT - boundsY.minY;

  // clamp inside world
  dy = Math.max(0, Math.min(dy, WORLD_Y - boundsY.height - 1));

  console.log("Placing dino at:", dx, dy, dz);
  console.log("Dino size:", randomDino.length);
  //console.log("Dino height:", bounds.height);

  placeStructure(randomDino, 32, dy, dz, FOSSIL);
}

function getTargetBlock(maxDist = 6) {
  let dir = g_camera.at.subtract(g_camera.eye);
  dir = dir.divide(dir.length());

  let pos = g_camera.eye;

  let lastEmpty = null;

  for (let i = 0; i < maxDist * 10; i++) {
    let step = i * 0.1;

    let p = new Vector(
      pos.x + dir.x * step,
      pos.y + dir.y * step,
      pos.z + dir.z * step
    );

    let x = Math.floor(p.x + WORLD_X / 2);
    let y = Math.floor(p.y);
    let z = Math.floor(p.z + WORLD_Z / 2);

    if (!inBounds(x,y,z)) continue;

    if (g_world[x][y][z] === AIR) {
      lastEmpty = { x, y, z };
      continue;
    }

    return {
      hit: { x, y, z },
      place: lastEmpty
    };
  }

  return null; 
}

function digBlock() {
  let res = getTargetBlock();
  if (!res) return;

  g_world[res.hit.x][res.hit.y][res.hit.z] = AIR;
}

function placeBlock(type = DIRT) {
  let res = getTargetBlock();
  if (!res || !res.place) return;

  g_world[res.place.x][res.place.y][res.place.z] = type;
}

function inBounds(x,y,z) {
  return (
    x >= 0 && x < WORLD_X &&
    y >= 0 && y < WORLD_Y &&
    z >= 0 && z < WORLD_Z
  );
}

// draw every shape that is supposed to be in the canvas
function renderAllShapes() { 

  var startTime = performance.now(); 

  //var projMat=new Matrix4(); 
  //projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100); 
  //gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements); 

  //var viewMat=new Matrix4(); 

  gl.uniformMatrix4fv( 
    u_ProjectionMatrix,
    false,
    g_camera.projectionMatrix.elements
  );

  gl.uniformMatrix4fv(
    u_ViewMatrix,
    false,
    g_camera.viewMatrix.elements
  ); 

  var globalRotMat=new Matrix4().rotate(g_globalAngle, 0,1,0); 
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements); 
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
  // gl.clear(gl.COLOR_BUFFER_BIT); 

  gl.disable(gl.CULL_FACE);

  var sky = g_sharedCube;

  sky.useTexture = false;
  sky.color = [0.4, 0.7, 1.0, 1.0];
  sky.matrix.setIdentity();
  sky.matrix.scale(200,200,200);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();
  gl.enable(gl.CULL_FACE);

  drawWorld(); 
  
  //var body = new Cube(); 
  //body.color = [1,0,0,1]; 
  //body.textureNum=0; 
  //body.matrix.translate(0, -.75, 0);  
  //body.matrix.scale(10, 0, 10); 
  //body.matrix.translate(-.5, 0, -.5);  
  //body.render(); 

  //var body = new Cube(); 
  //body.color = [1,0,0,1]; 
  //body.matrix.translate(-.25, -.75, 0); 
  //body.matrix.rotate(-5, 1,0,0); 
  //body.matrix.scale(.5, .3, .5); 

  //var yellow = new Cube(); 
  //yellow.color = [1,0,0,1]; 
  //yellow.matrix.setTranslate(0, -.5, 0); 
  //yellow.matrix.rotate(-5,1,0,0); 
  //yellow.matrix.rotate(-g_yellowAngle, 0,0,1); 
  //var yellowCoordinatesMat=new Matrix4(yellow.matrix); 
  //yellow.matrix.scale(.25, .7, .5); 
  //yellow.matrix.translate(-.5, 0,0); 
  //yellow.render(); 

  //var magenta = new Cube(); 
  //magenta.color = [1,0,1,1]; 
  //magenta.textureNum=0; 
  //magenta.matrix = yellowCoordinatesMat; 
  //magenta.matrix.translate(0, .65, 0); 
  //magenta.matrix.rotate(g_magentaAngle, 0,0,1); 
  //magenta.matrix.scale(.3, .3, .3); 
  //magenta.matrix.translate(-.5, 0, -.001); 
  //magenta.render(); 

  //var ground = new Cube(); 
  //ground.matrix.translate(0,0,-1); 
  //ground.matrix.scale(2,.1,2); 
  //ground.render(); 
}

function sendTextToHTML(text, htmlID) { 
  var htmlElm = document.getElementById(htmlID); 
  if (!htmlElm) { 
    console.log("failed to get " + htmlID + " from HTML"); 
    return; 
  }
  htmlElm.innerHTML = text; 
}
