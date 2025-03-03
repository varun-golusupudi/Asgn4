// Cone.js
class Cone {
    constructor(radius, height, segments) {
        if (radius <= 0 || height <= 0 || segments < 3) {
            throw new Error('Invalid parameters for Cone');
        }
        this.type = 'cone';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = mat4.create();
        this.radius = radius;
        this.height = height;
        this.segments = segments;
        this.vertexBuffer = null;
        this.normalBuffer = null;
    }

    initializeBuffers() {
        if (!gl || !shaderProgram) {
            console.error("WebGL context or shader program not available");
            return false;
        }

        const baseVertices = [];
        const apexVertex = [0, 0, this.height];
        const positions = [];
        const normals = [];

        // Base vertices
        for (let i = 0; i < this.segments; i++) {
            const theta = (i / this.segments) * 2 * Math.PI;
            const x = this.radius * Math.cos(theta);
            const y = this.radius * Math.sin(theta);
            baseVertices.push(x, y, 0);
        }

        // Normals for cone (simplified, pointing outward)
        for (let i = 0; i < this.segments; i++) {
            const theta = (i / this.segments) * 2 * Math.PI;
            const nx = Math.cos(theta);
            const ny = Math.sin(theta);
            const nz = -this.height / Math.sqrt(this.height * this.height + this.radius * this.radius); // Pointing downward
            // Side triangles (apex to base)
            positions.push(...apexVertex, ...baseVertices.slice(i * 3, i * 3 + 3), ...baseVertices.slice(((i + 1) % this.segments) * 3, ((i + 1) % this.segments) * 3 + 3));
            normals.push(0, 0, 1, nx, ny, nz, nx, ny, nz); // Apex normal points up, sides point outward

            // Base triangles (pointing down)
            positions.push(0, 0, 0, ...baseVertices.slice(i * 3, i * 3 + 3), ...baseVertices.slice(((i + 1) % this.segments) * 3, ((i + 1) % this.segments) * 3 + 3));
            normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1);
        }

        // Create and bind vertex buffer
        this.vertexBuffer = gl.createBuffer();
        if (!this.vertexBuffer) {
            console.error("Failed to create vertex buffer for Cone");
            return false;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // Create and bind normal buffer
        this.normalBuffer = gl.createBuffer();
        if (!this.normalBuffer) {
            console.error("Failed to create normal buffer for Cone");
            return false;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        return true;
    }

    drawTriangle(vertices, normals) {
        drawTriangle3D(vertices, normals);
    }

    render() {
        if (!this.initializeBuffers()) {
            console.error("Failed to initialize buffers for Cone");
            return;
        }

        const rgba = this.color;
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_whichTexture"), -2); // Use color
        gl.uniform4f(gl.getUniformLocation(shaderProgram, "u_FragColor"), rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "u_modelMatrix"), false, this.matrix);

        // Calculate normal matrix
        let normalMatrix = mat3.create();
        mat3.normalFromMat4(normalMatrix, this.matrix);
        gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "u_normalMatrix"), false, normalMatrix);

        // Bind buffers and set attributes
        const a_position = gl.getAttribLocation(shaderProgram, "a_position");
        if (a_position !== -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_position);
        } else {
            console.error("a_position attribute not found in shader");
            return;
        }

        const a_normal = gl.getAttribLocation(shaderProgram, "a_normal");
        if (a_normal !== -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_normal);
        } else {
            console.error("a_normal attribute not found in shader");
            return;
        }

        // Draw (calculate vertex count dynamically)
        const vertexCount = this.segments * 6; // 2 triangles per segment * 3 vertices
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    }
}

// Export for use in other files
window.Cone = Cone;