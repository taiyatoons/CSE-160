class Camera { 
    constructor() { 

        this.canvas = canvas; 

        this.fov = 60; 

        this.eye=new Vector(0,0,3); 
        this.at=new Vector(0,0,-100); 
        this.up=new Vector(0,1,0); 

        this.viewMatrix = new Matrix4();
        this.projectionMatrix = new Matrix4();

        this.updateView();
        this.updateProjection();
    }

    updateView() {
        this.viewMatrix.setLookAt(
            this.eye.x, this.eye.y, this.eye.z,
            this.at.x, this.at.y, this.at.z,
            this.up.x, this.up.y, this.up.z
        );
    }

    updateProjection() {
        var near = .1; 
        var far = 1000; 
        this.projectionMatrix.setPerspective(
            this.fov, // fov 
            this.canvas.width / this.canvas.height, // aspect 
            near, // near 
            far // far 
        );
    }

    forward() { 
        var f = this.at.subtract(this.eye); 
        f=f.divide(f.length()); 
        this.at=this.at.add(f); 
        this.eye=this.eye.add(f);    
        this.updateView();     
    }

    back() { 
        var f = this.at.subtract(this.eye); 
        f=f.divide(f.length()); 
        this.at=this.at.subtract(f); 
        this.eye=this.eye.subtract(f);  
        this.updateView();       
    }

    left() { 
        var f = this.at.subtract(this.eye); 
        f=f.divide(f.length()); 
        var s=this.up.cross(f); 
        s=s.divide(s.length()); 
        this.at=this.at.add(s); 
        this.eye=this.eye.add(s);      
        this.updateView();   
    }

    right() { 
        var f = this.at.subtract(this.eye); 
        f=f.divide(f.length()); 
        var s=f.cross(this.up); 
        s=s.divide(s.length()); 
        this.at=this.at.add(s); 
        this.eye=this.eye.add(s);  
        this.updateView();       
    }

    panLeft() {

        var f = this.at.subtract(this.eye);

        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(5, this.up.x, this.up.y, this.up.z);

        var f_prime = rotationMatrix.multiplyVector3(
            new Vector3([f.x, f.y, f.z])
        );

        this.at = new Vector(
            this.eye.x + f_prime.elements[0],
            this.eye.y + f_prime.elements[1],
            this.eye.z + f_prime.elements[2]
        );

        this.updateView();
    }

    panRight() {

        var f = this.at.subtract(this.eye);

        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-5, this.up.x, this.up.y, this.up.z);

        var f_prime = rotationMatrix.multiplyVector3(
            new Vector3([f.x, f.y, f.z])
        );

        this.at = new Vector(
            this.eye.x + f_prime.elements[0],
            this.eye.y + f_prime.elements[1],
            this.eye.z + f_prime.elements[2]
        );

        this.updateView();
    }
}