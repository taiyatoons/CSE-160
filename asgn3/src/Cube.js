class Cube {
  constructor() {
    this.color = [1,1,1,1];
    this.matrix = new Matrix4();
    this.textureNum = 0;
    this.useTexture = true;
  }

  render() {

    if (g_textures.length < 4) return; 

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // 🚨 safety check (fixes async texture crash)
    if (!g_textures[this.textureNum]) return;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, g_textures[this.textureNum]);
    gl.uniform1i(u_Sampler0, 0);

    if (!this.useTexture) {
      gl.uniform1f(u_texColorWeight, 0.0);
      gl.uniform4f(u_FragColor,
        this.color[0],
        this.color[1],
        this.color[2],
        this.color[3]
      );
      
    } else {
      gl.uniform1f(u_texColorWeight, 1.0);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
} 

function initCubeBuffer() {

  const vertices = new Float32Array([
    // positions        // UVs (simple mapping placeholder)

    // front
    0,0,0,  1,1,0,  1,0,0,
    0,0,0,  0,1,0,  1,1,0,

    // top
    0,1,0,  0,1,1,  1,1,1,
    0,1,0,  1,1,1,  1,1,0,

    // right
    1,0,0,  1,1,0,  1,1,1,
    1,0,0,  1,1,1,  1,0,1,

    // left
    0,0,0,  0,1,1,  0,1,0,
    0,0,0,  0,0,1,  0,1,1,

    // back
    0,0,1,  1,0,1,  1,1,1,
    0,0,1,  1,1,1,  0,1,1,

    // bottom
    0,0,0,  1,0,1,  1,0,0,
    0,0,0,  0,0,1,  1,0,1
  ]);

  const uvs = new Float32Array([
    // Each face uses SAME UV layout

    0,0,  1,1,  1,0,
    0,0,  0,1,  1,1,

    0,0,  1,0,  1,1,
    0,0,  1,1,  0,1,

    0,0,  1,0,  1,1,
    0,0,  1,1,  0,1,

    0,0,  1,0,  1,1,
    0,0,  1,1,  0,1,

    0,0,  1,0,  1,1,
    0,0,  1,1,  0,1,

    0,0,  1,0,  1,1,
    0,0,  1,1,  0,1
  ]);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  const uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_UV);
} 
