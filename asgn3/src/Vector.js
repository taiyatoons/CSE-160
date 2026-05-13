class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v) {
        return new Vector(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z
        );
    }

    subtract(v) {
        return new Vector(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z
        );
    }

    multiply(s) {
        return new Vector(
            this.x * s,
            this.y * s,
            this.z * s
        );
    }

    divide(s) {
        return new Vector(
            this.x / s,
            this.y / s,
            this.z / s
        );
    }

    length() {
        return Math.sqrt(
            this.x * this.x +
            this.y * this.y +
            this.z * this.z
        );
    }

    cross(v) {
        return new Vector(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }
} 