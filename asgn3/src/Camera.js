class Camera { 
    constructor() { 

        this.canvas = canvas; 

        this.fov = 60; 

        this.eye = new Vector(32, 20, 32);
        this.at = new Vector(5, 5, 32);
        this.up=new Vector(0,1,0); 

        this.yaw = 0;
        this.pitch = 0;
        this.sensitivity = 0.1;

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

    updateDirectionFromAngles() {
        let radYaw = this.yaw * Math.PI / 180;
        let radPitch = this.pitch * Math.PI / 180;

        let dir = new Vector(
            Math.cos(radPitch) * Math.sin(radYaw),
            Math.sin(radPitch),
            Math.cos(radPitch) * Math.cos(radYaw)
        );

        this.at = this.eye.add(dir);
        this.updateView();
    }

    getForwardFlat() {
        let f = this.at.subtract(this.eye);

        // remove Y component so we stay grounded
        f.y = 0;

        return f.divide(f.length());
    }

    getRightFlat() {
        let f = this.getForwardFlat();
        return new Vector(-f.z, 0, f.x);
    } 
    // getForward() {
        // let f = this.at.subtract(this.eye);
        // return f.divide(f.length());
    // }

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

    moveUp() {
        var u = this.up;
        u = u.divide(u.length()); // normalize just in case

        this.eye = this.eye.add(u);
        this.at = this.at.add(u);

        this.updateView();
    }

    moveDown() {
        var u = this.up;
        u = u.divide(u.length());

        this.eye = this.eye.subtract(u);
        this.at = this.at.subtract(u);

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