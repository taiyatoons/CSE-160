class Cube { 
    constructor() {
      this.type='cube'; 
      this.color = [1,1,1,1];

      this.matrix = new Matrix4(); 
      this.textureNum=-2; 
      this.cubeVerts32 = new Float32Array([ 
        0,0,0, 1,1,0, 1,0,0, 
        0,0,0, 0,1,0, 1,1,0, 
        0,1,0, 0,1,1, 1,1,1, 
        0,1,0, 1,1,1, 1,1,0, 
        1,1,0, 1,1,1, 1,0,0, 
        1,0,0, 1,1,1, 1,0,1, 
        0,1,0, 0,1,1, 0,0,0, 
        0,0,0, 0,1,1, 0,0,1, 
        0,0,0, 0,0,1, 1,0,1, 
        0,0,0, 1,0,1, 1,0,0, 
        0,0,1, 1,1,1, 1,0,1, 
        0,0,1, 0,1,1, 1,1,1  
      ]); 
      this.cubeVerts= [ 
      0,0,0, 1,1,0, 1,0,0, 
      0,0,0, 0,1,0, 1,1,0, 
      0,1,0, 0,1,1, 1,1,1, 
      0,1,0, 1,1,1, 1,1,0, 
      1,1,0, 1,1,1, 1,0,0, 
      1,0,0, 1,1,1, 1,0,1, 
      0,1,0, 0,1,1, 0,0,0, 
      0,0,0, 0,1,1, 0,0,1, 
      0,0,0, 0,0,1, 1,0,1, 
      0,0,0, 1,0,1, 1,0,0, 
      0,0,1, 1,1,1, 1,0,1, 
      0,0,1, 0,1,1, 1,1,1 
      ]; 

  }

  // Render this shape 
  render() { 
    
    var rgba = this.color;  
    
    gl.uniform1i(u_whichTexture, this.textureNum); 

    // Pass the color of a point to u_FragColor variable 
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); 

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements); 
 
    // front of cube 
    // x / y / z 
    drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]); 
    drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);  

    // 'lighting' 
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);  

    // top of cube 
    drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);
    drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);  

    // pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);  
  
    // back of cube 
    drawTriangle3D([0,0,1, 1,1,1, 1,0,1]);
    drawTriangle3D([0,0,1, 0,1,1, 1,1,1]); 

    // left of cube  
    drawTriangle3D([0,0,1, 0,0,0, 0,1,1]);
    drawTriangle3D([0,1,0, 0,0,0, 0,1,1]);  

    // right of cube 
    drawTriangle3D([1,0,1, 1,0,0, 1,1,1]);
    drawTriangle3D([1,1,0, 1,0,0, 1,1,1]);  

    // bottom of cube 
    drawTriangle3D([0,0,0, 0,0,1, 1,0,1]);
    drawTriangle3D([0,0,0, 1,0,1, 1,0,0]); 
  }

  renderfast() { 
    
    var rgba = this.color;  
    
    // gl.uniform1i(u_whichTexture, this.textureNum); 

    // Pass the color of a point to u_FragColor variable 
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); 

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements); 
 
    var allverts=[]; 
    // front of cube 
    // x / y / z 
    allverts=allverts.concat( [0,0,0, 1,1,0, 1,0,0]); 
    allverts=allverts.concat( [0,0,0, 0,1,0, 1,1,0]); 

    // 'lighting' 
    // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);  

    // top of cube 
    allverts=allverts.concat( [0,1,0, 0,1,1, 1,1,1]); 
    allverts=allverts.concat( [0,1,0, 1,1,1, 1,1,0]); 

    // pass the color of a point to u_FragColor uniform variable
    // gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);  
  
    // right of cube 
    allverts=allverts.concat( [1,1,0, 1,1,1, 1,0,0]); 
    allverts=allverts.concat( [1,0,0, 1,1,1, 1,0,1]); 

    // left of cube  
    allverts=allverts.concat( [0,1,0, 0,1,1, 0,0,0]); 
    allverts=allverts.concat( [0,0,0, 0,1,1, 0,0,1]); 

    // back of cube 
    allverts=allverts.concat( [0,0,1, 1,1,1, 1,0,1]); 
    allverts=allverts.concat( [0,0,1, 0,1,1, 1,1,1]); 

    // bottom of cube 
    allverts=allverts.concat( [0,0,0, 0,0,1, 1,0,1]); 
    allverts=allverts.concat( [0,0,0, 1,0,1, 1,0,0]); 
 
    drawTriangle3D(allverts); 
  }

  renderfaster() { 

    var rgba = this.color;  
    
    gl.uniform1i(u_whichTexture, -2); 

    // Pass the color of a point to u_FragColor variable 
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); 

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements); 
  
    if (g_vertexBuffer==null) { 
      initTriangle3D(); 
    }

    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cubeVerts), gl.DYNAMIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 36); 
  }

}
