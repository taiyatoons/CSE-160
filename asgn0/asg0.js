// DrawTriangle.js (c) 2012 matsuda
let v1, v2, v3, v4; 

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

  v1 = new Vector3([2.25, 2.25, 0]); 
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

  let x1 = Number(document.getElementById("v1_x").value); // get v1 inputs 
  let y1 = Number(document.getElementById("v1_y").value); 

  let x2 = Number(document.getElementById("v2_x").value); // get v2 inputs 
  let y2 = Number(document.getElementById("v2_y").value); 
  
  v1 = new Vector3([x1, y1, 0]); 
  v2 = new Vector3([x2, y2, 0]);
  drawVector(v1, "red") // draw vector 
  drawVector(v2, "blue")
}

function handleDrawOperationEvent() { 

  handleDrawEvent(); 

  let scalar = Number(document.getElementById("scalar").value); // get scalar input 

  let operation = document.getElementById("ops").value; 

  if (operation == "add") { 
    v3 = new Vector3().set(v1).add(v2);
    drawVector(v3, "green")
  }
  else if (operation == "sub") { 
    v3 = new Vector3().set(v1).sub(v2);
    drawVector(v3, "green")
  }
  else if (operation == "mul") { 
    v3 = new Vector3().set(v1).mul(scalar);
    v4 = new Vector3().set(v2).mul(scalar);  
    drawVector(v3, "green") 
    drawVector(v4, "green")
  }
  else if (operation == "div") { 
    v3 = new Vector3().set(v1).div(scalar);
    v4 = new Vector3().set(v2).div(scalar);
    drawVector(v3, "green") 
    drawVector(v4, "green") 
  }
  else if (operation == "mag") { 

    let mag1 = v1.magnitude()
    console.log("Magnitude v1:", mag1)
    
    let mag2 = v2.magnitude()
    console.log("Magnitude v2:", mag2)
  } 
  else if (operation == "norm") { 

    let norm1 = new Vector3().set(v1).normalize()
    let norm2 = new Vector3().set(v2).normalize() 

    drawVector(norm1, "green") 
    drawVector(norm2, "green") 
  } 
  else if (operation == "angle") { 

    angleBetween(v1, v2) 
  }
  else if (operation == "area") { 

    areaTriangle(v1, v2) 
  }
}

function angleBetween(v1, v2) { 

  let angle = 0; 
  let dot = Vector3.dot(v1, v2) 

  let mag1 = v1.magnitude() 
  let mag2 = v2.magnitude() 

  if (mag1 != 0 && mag2 != 0) { 
    let cos = dot / (mag1 * mag2) 
    angle = Math.acos(cos) 
  }

  console.log("Angle:", angle * 180 / Math.PI)
}

function areaTriangle(v1, v2) { 

  let area = 0; 

  let cross = Vector3.cross(v1, v2) 
  let para_area = cross.magnitude() 

  area = 0.5 * para_area  

  console.log("Area of the triangle:", area)
}