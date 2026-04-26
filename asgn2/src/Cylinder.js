class Cylinder {
  constructor() {
    this.color = [1,1,1,1];
    this.matrix = new Matrix4();
    this.segments = 30;
  }

  render() {
    const rgba = this.color;
    const seg = this.segments;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    let angleStep = 360 / seg;
    let r = 0.5;   // radius
    let h = 1.0;   // height

    for (let angle = 0; angle < 360; angle += angleStep) {
      let a1 = angle * Math.PI / 180;
      let a2 = (angle + angleStep) * Math.PI / 180;

      // circle points 
      let x1 = Math.cos(a1) * r;
      let z1 = Math.sin(a1) * r;

      let x2 = Math.cos(a2) * r;
      let z2 = Math.sin(a2) * r;

      // top
      drawTriangle3D([
        0, h, 0,
        x1, h, z1,
        x2, h, z2
      ]);

      // bottom
      drawTriangle3D([
        0, 0, 0,
        x2, 0, z2,
        x1, 0, z1
      ]);

      // sides 
      drawTriangle3D([
        x1, 0, z1,
        x1, h, z1,
        x2, h, z2
      ]);

      drawTriangle3D([
        x1, 0, z1,
        x2, h, z2,
        x2, 0, z2
      ]);
    }
  }
} 
