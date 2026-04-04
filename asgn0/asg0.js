// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('cnv1');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color

}

function handleDrawEvent() { 
  let v1 = document.getElementById("name").value; 
  console.log(v1)

  ctx.strokeStyle = 'red'; // color of stroke 

  let cx = canvas.width/2; // for drawing from center of x coord 
  let cy = canvas.height/2; // center of y coord 
  ctx.beginPath(); 
  ctx.moveTo(cx, cy); 
  ctx.lineTo(cx + 75, cy + 20); 
  ctx.stroke(); 
  
}