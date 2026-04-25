class Cube { 
  // Constructor
  //constructor() { 
    //this.type='cube'; 
    // this.position = [0.0, 0.0, 0.0]; 
    //this.color = [1.0,1.0,1.0,1.0]; 
    // this.size = 5.0; 
    // this.segments = 10; 
    //this.matrix = new Matrix4();
    constructor() {
      this.color = [1,1,1,1];
      this.matrix = new Matrix4();

      // Each cube has its OWN vertices
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
  }

  // Render this shape 
  render() { 
    
    const v = this.vertices; 
    // var xy = this.position; 
    var rgba = this.color;  
    
    // Pass the color of a point to u_FragColor variable 
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); 

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements); 
 
    // front of cube 
    // x / y / z 
    //drawTriangle3D( [0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0 ]); 
    //drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0 ]); 

    drawTriangle3D([v.A[0],v.A[1],v.A[2], v.C[0],v.C[1],v.C[2], v.B[0],v.B[1],v.B[2]]);
    drawTriangle3D([v.A[0],v.A[1],v.A[2], v.D[0],v.D[1],v.D[2], v.C[0],v.C[1],v.C[2]]); 

    // back of cube 
    //drawTriangle3D( [0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0 ]); 
    //drawTriangle3D( [0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0 ]);  

    drawTriangle3D([v.E[0],v.E[1],v.E[2], v.G[0],v.G[1],v.G[2], v.F[0],v.F[1],v.F[2]]);
    drawTriangle3D([v.E[0],v.E[1],v.E[2], v.H[0],v.H[1],v.H[2], v.G[0],v.G[1],v.G[2]]); 

    // 'lighting' 
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);  

    // left of cube  
    //drawTriangle3D( [0.0,0.0,1.0, 0.0,0.0,0.0, 0.0,1.0,1.0 ]); 
    //drawTriangle3D( [0.0,1.0,0.0, 0.0,0.0,0.0, 0.0,1.0,1.0 ]);

    drawTriangle3D([v.E[0],v.E[1],v.E[2], v.A[0],v.A[1],v.A[2], v.H[0],v.H[1],v.H[2]]);
    drawTriangle3D([v.D[0],v.D[1],v.D[2], v.A[0],v.A[1],v.A[2], v.H[0],v.H[1],v.H[2]]);  

    // right of cube 
    //drawTriangle3D( [1.0,0.0,1.0, 1.0,0.0,0.0, 1.0,1.0,1.0 ]); 
    //drawTriangle3D( [1.0,1.0,0.0, 1.0,0.0,0.0, 1.0,1.0,1.0 ]); 

    drawTriangle3D([v.F[0],v.F[1],v.F[2], v.B[0],v.B[1],v.B[2], v.G[0],v.G[1],v.G[2]]);
    drawTriangle3D([v.C[0],v.C[1],v.C[2], v.B[0],v.B[1],v.B[2], v.G[0],v.G[1],v.G[2]]);  

    // top of cube 
    //drawTriangle3D( [0.0,1.0,0.0, 0.0,1.0,1.0, 1.0,1.0,1.0 ]); 
    //drawTriangle3D( [0.0,1.0,0.0, 1.0,1.0,1.0, 1.0,1.0,0.0 ]); 

    drawTriangle3D([v.D[0],v.D[1],v.D[2], v.H[0],v.H[1],v.H[2], v.G[0],v.G[1],v.G[2]]);
    drawTriangle3D([v.D[0],v.D[1],v.D[2], v.G[0],v.G[1],v.G[2], v.C[0],v.C[1],v.C[2]]);  

    // bottom of cube 
    //drawTriangle3D( [0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,1.0 ]); 
    //drawTriangle3D( [0.0,0.0,0.0, 1.0,0.0,1.0, 1.0,0.0,0.0 ]); 

    drawTriangle3D([v.A[0],v.A[1],v.A[2], v.E[0],v.E[1],v.E[2], v.F[0],v.F[1],v.F[2]]);
    drawTriangle3D([v.A[0],v.A[1],v.A[2], v.F[0],v.F[1],v.F[2], v.B[0],v.B[1],v.B[2]]); 
  }
}
