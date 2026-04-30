class Cube { 
    constructor(type="default") {
      this.color = [1,1,1,1];
      this.matrix = new Matrix4();

      // independent vertices (transform cube independently)
      this.vertices = {
        A: [0,0,0],
        B: [1,0,0],
        C: [1,1,0],
        D: [0,1,0],
        E: [0,0,1],
        F: [1,0,1],
        G: [1,1,1],
        H: [0,1,1],
    };

    // body transforms ----------------------------
    if (type === "body") {
      // top right 
      this.vertices.C[1] += 0.2; 
      // top left 
      this.vertices.D[1] += 0.2; 
      // back/top right 
      this.vertices.G[1] -= 0.4; 
      // back/top left 
      this.vertices.H[1] -= 0.4; 
      // back/bottom left 
      this.vertices.F[1] -= 0.5; 
      this.vertices.F[2] += 0.07; 
      // back/bottom right 
      this.vertices.E[1] -= 0.5; 
      this.vertices.E[2] += 0.07; 
      // front/bottom right 
      this.vertices.B[1] -= 0.4; 
      this.vertices.B[2] -= 0.05; 
      // front/bottom left 
      this.vertices.A[1] -= 0.4; 
      this.vertices.A[2] -= 0.05;
    }
    // ------------------------------------------------------- 

    // front right leg transforms ----------------------------
    if (type === "frontright") {
      // front/bottom right 
      this.vertices.B[1] += 0.1;
      this.vertices.B[2] -= 0.3; 
      // front/bottom left 
      this.vertices.A[1] += 0.1;
      this.vertices.A[2] -= 0.3;
    }
    if (type === "frontright2") {
      // top right 
      this.vertices.C[1] -= 0.1;
      this.vertices.C[2] -= 0.25;

      // top left 
      this.vertices.D[1] -= 0.1;
      this.vertices.D[2] -= 0.25;
    }
    // ------------------------------------------------------- 

    // front left leg transforms -----------------------------
    if (type === "frontleft") {
      // front/bottom right 
      this.vertices.B[1] += 0.1;
      this.vertices.B[2] -= 0.3; 
      // front/bottom left 
      this.vertices.A[1] += 0.1;
      this.vertices.A[2] -= 0.3;
    }
    if (type === "frontleft2") {
      // top right 
      this.vertices.C[1] -= 0.1;
      this.vertices.C[2] -= 0.25;

      // top left 
      this.vertices.D[1] -= 0.1;
      this.vertices.D[2] -= 0.25; 
    } 
    // ------------------------------------------------------- 

    // back right leg transforms ----------------------------- 
    if (type === "backright"){ 
      // top right 
      this.vertices.C[1] -= 0.1;
      this.vertices.C[2] -= 0.1;

      // top left 
      this.vertices.D[1] -= 0.1;
      this.vertices.D[2] -= 0.25;

      // front/bottom right 
      this.vertices.B[1] -= .03;
      this.vertices.B[2] += 0.05; 
      // front/bottom left 
      this.vertices.A[1] -= 0.03;
      this.vertices.A[2] += 0.05;

      // back/bottom left 
      this.vertices.E[1] += 0.2;
      this.vertices.E[2] += 0.65;
      // back/bottom right 
      this.vertices.F[1] += 0.2;
      this.vertices.F[2] += 0.65;
    } 
    if (type === "backright2") { 
      // top right 
      this.vertices.C[1] -= 0.0;
      this.vertices.C[2] -= 0.55;

      // top left 
      this.vertices.D[1] -= 0.1;
      this.vertices.D[2] -= 0.55;

      // back/top right  
      this.vertices.G[1] -= 0.1;
      this.vertices.G[2] += 0.2; 
      // back/top left 
      this.vertices.H[1] -= 0.1;
      this.vertices.H[2] += 0.15;


      // front/bottom right 
      this.vertices.B[2] -= .3;
      this.vertices.B[1] += 0.15; 
      // front/bottom left 
      this.vertices.A[2] -= 0.3;
      this.vertices.A[1] += 0.15;


      // back/bottom left 
      this.vertices.E[1] += 0.15;
      this.vertices.E[2] -= 0.1;
      // back/bottom right 
      this.vertices.F[1] += 0.15;
      this.vertices.F[2] -= 0.1;
    }
    // ------------------------------------------------------- 

    // back left leg transforms ------------------------------ 
    if (type === "backleft") { 
      // top right 
      this.vertices.C[1] -= 0.1;
      this.vertices.C[2] -= 0.1;

      // top left 
      this.vertices.D[1] -= 0.1;
      this.vertices.D[2] -= 0.25;

      // front/bottom right 
      this.vertices.B[1] -= .03;
      this.vertices.B[2] += 0.05; 
      // front/bottom left 
      this.vertices.A[1] -= 0.03;
      this.vertices.A[2] += 0.05;

      // back/bottom left 
      this.vertices.E[1] += 0.2;
      this.vertices.E[2] += 0.65;
      // back/bottom right 
      this.vertices.F[1] += 0.2;
      this.vertices.F[2] += 0.65;
    }
    if (type === "backleft2") { 
      // top right 
      this.vertices.C[1] -= 0.0;
      this.vertices.C[2] -= 0.55;

      // top left 
      this.vertices.D[1] -= 0.1;
      this.vertices.D[2] -= 0.55;

      // back/top right  
      this.vertices.G[1] -= 0.1;
      this.vertices.G[2] += 0.2; 
      // back/top left 
      this.vertices.H[1] -= 0.1;
      this.vertices.H[2] += 0.15;


      // front/bottom right 
      this.vertices.B[2] -= .3;
      this.vertices.B[1] += 0.15; 
      // front/bottom left 
      this.vertices.A[2] -= 0.3;
      this.vertices.A[1] += 0.15;


      // back/bottom left 
      this.vertices.E[1] += 0.15;
      this.vertices.E[2] -= 0.1;
      // back/bottom right 
      this.vertices.F[1] += 0.15;
      this.vertices.F[2] -= 0.1;
    }
    // ------------------------------------------------------- 

    // ear transforms ---------------------------------------- 
    if (type === "earL") { 
      // top left 
      this.vertices.C[1] -= 0.1;
      this.vertices.C[2] -= 0.1;
    }
    if (type === "earR") {  
      // top right 
      this.vertices.G[1] -= 0.1;
      this.vertices.G[2] -= 0.1;
    }
    // ------------------------------------------------------- 
  }

  // Render this shape 
  render() { 
    
    const v = this.vertices; 
    var rgba = this.color;  
    
    // Pass the color of a point to u_FragColor variable 
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); 

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements); 
 
    // front of cube 
    // x / y / z 
    drawTriangle3D([v.A[0],v.A[1],v.A[2], v.C[0],v.C[1],v.C[2], v.B[0],v.B[1],v.B[2]]);
    drawTriangle3D([v.A[0],v.A[1],v.A[2], v.D[0],v.D[1],v.D[2], v.C[0],v.C[1],v.C[2]]); 

    // back of cube 
    drawTriangle3D([v.E[0],v.E[1],v.E[2], v.G[0],v.G[1],v.G[2], v.F[0],v.F[1],v.F[2]]);
    drawTriangle3D([v.E[0],v.E[1],v.E[2], v.H[0],v.H[1],v.H[2], v.G[0],v.G[1],v.G[2]]); 

    // 'lighting' 
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);  

    // left of cube  
    drawTriangle3D([v.E[0],v.E[1],v.E[2], v.A[0],v.A[1],v.A[2], v.H[0],v.H[1],v.H[2]]);
    drawTriangle3D([v.D[0],v.D[1],v.D[2], v.A[0],v.A[1],v.A[2], v.H[0],v.H[1],v.H[2]]);  

    // right of cube 
    drawTriangle3D([v.F[0],v.F[1],v.F[2], v.B[0],v.B[1],v.B[2], v.G[0],v.G[1],v.G[2]]);
    drawTriangle3D([v.C[0],v.C[1],v.C[2], v.B[0],v.B[1],v.B[2], v.G[0],v.G[1],v.G[2]]);  

    // top of cube 
    drawTriangle3D([v.D[0],v.D[1],v.D[2], v.H[0],v.H[1],v.H[2], v.G[0],v.G[1],v.G[2]]);
    drawTriangle3D([v.D[0],v.D[1],v.D[2], v.G[0],v.G[1],v.G[2], v.C[0],v.C[1],v.C[2]]);  

    // bottom of cube 
    drawTriangle3D([v.A[0],v.A[1],v.A[2], v.E[0],v.E[1],v.E[2], v.F[0],v.F[1],v.F[2]]);
    drawTriangle3D([v.A[0],v.A[1],v.A[2], v.F[0],v.F[1],v.F[2], v.B[0],v.B[1],v.B[2]]); 
  }
}
