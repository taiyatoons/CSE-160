// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  canvas = document.getElementById('cnv1');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color

  let v1 = new Vector3([2.25, 2.25, 0]); 
  drawVector(v1, "red")
}

function drawVector(v, color) {  
  console.log(v)

  ctx.strokeStyle = color; // color of stroke 

  let cx = canvas.width/2; // for drawing from center of x coord 
  let cy = canvas.height/2; // center of y coord 

  scaled_x = v.elements[0] * 20 
  scaled_y = v.elements[1] * 20 

  ctx.beginPath(); 
  ctx.moveTo(cx, cy); 
  ctx.lineTo(cx + scaled_x, cy - scaled_y); 
  ctx.stroke(); 
  
}

function handleDrawEvent() { 

  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas 
  ctx.fillRect(0, 0, canvas.width, canvas.height);  

  let x1 = document.getElementById("v1_x").value; // get v1 inputs 
  let y1 = document.getElementById("v1_y").value; 

  let x2 = document.getElementById("v2_x").value; // get v2 inputs 
  let y2 = document.getElementById("v2_y").value; 
  
  let v1 = new Vector3([x1, y1, 0]); 
  let v2 = new Vector3([x2, y2, 0]);
  drawVector(v1, "red") // draw vector 
  drawVector(v2, "blue")
}