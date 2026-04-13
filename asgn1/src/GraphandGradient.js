// -------------------- Render drawing functions -------------------------


// converts the graph paper metrics (26x20) to webGL 
function graphToWebGL(x, y) { 
  let webglX = (x / 26) * 2 - 1; // width 
  let webglY = (y / 20) * 2 - 1; // height 
  return [webglX, webglY]; 

}

// draws a triangle with graph paper vertex values  
function drawGraphTriangle(x1, y1, x2, y2, x3, y3) { 
  let [ax, ay] = graphToWebGL(x1, y1); // point 1 
  let [bx, by] = graphToWebGL(x2, y2); // point 2 
  let [cx, cy] = graphToWebGL(x3, y3); // point 3 

  // draw 
  drawTriangle([ 
    ax, ay,
    bx, by,
    cx, cy

  ]);

}

// automatically renders the image from the graphTriangles dictionary 
function drawGraphImage() { 
   
  if (currentMode != "paint") { 
    return; 
  } 

  // draw the image 
  for (let i = 0; i < graphTriangles.length; i++) { 
    let t = graphTriangles[i]; 
    
    let x1 = t[0], y1 = t[1]; // point 1 
    let x2 = t[2], y2 = t[3]; // point 2  
    let x3 = t[4], y3 = t[5]; // point 3 

    let gradientType = t[9]; // gradient value 

    if (gradientType) { // drawing triangles with gradients 
      drawGradientTriangle(x1, y1, x2, y2, x3, y3, gradientType); // overrides rgb values 
    } else { // drawing triangles without gradients 
      let r = t[6], g = t[7], b = t[8]; // uses rgb values insteadn 
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
      0.2 + 0.5 * Math.sin(Math.PI * t), 
      1.0,                               
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

  // white if gradient doesn't work for some reason 
  return [1,1,1];
}


// draws triangles with gradient values 
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

    // Draw two small triangles 
    drawGraphTriangle(ax, ay, bx, by, cx, cy);
    drawGraphTriangle(bx, by, cx, cy, dx, dy);
  }

}
