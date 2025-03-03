// Sphere.js
function sin(x) {
    return Math.sin(x);
}
function cos(x) {
    return Math.cos(x);
}

class Sphere {
    constructor() {
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = mat4.create(); // Use gl-matrix mat4
        this.textureNum = -2; // No texture, use color (matches student’s -2 for color rendering)
        this.verts32 = new Float32Array([]);
        this.vertexBuffer = null;
        this.normalBuffer = null;
    }

    initializeBuffers() {
        if (!gl || !shaderProgram) {
            console.error("WebGL context or shader program not available");
            return false;
        }

        const positions = [];
        const normals = [];
        const d = Math.PI / 10;
        const dd = Math.PI / 10;

        for (let t = 0; t < Math.PI; t += d) {
            for (let r = 0; r < 2 * Math.PI; r += d) {
                const p1 = [sin(t) * cos(r), sin(t) * sin(r), cos(t)];
                const p2 = [sin(t + dd) * cos(r), sin(t + dd) * sin(r), cos(t + dd)];
                const p3 = [sin(t) * cos(r + dd), sin(t) * sin(r + dd), cos(t)];
                const p4 = [sin(t + dd) * cos(r + dd), sin(t + dd) * sin(r + dd), cos(t + dd)];

                // First triangle (p1, p2, p4)
                positions.push(...p1, ...p2, ...p4);
                normals.push(...p1, ...p2, ...p4); // Normals are the same as vertices for a sphere

                // Second triangle (p1, p4, p3)
                positions.push(...p1, ...p4, ...p3);
                normals.push(...p1, ...p4, ...p3);
            }
        }

        // Create and bind vertex buffer
        this.vertexBuffer = gl.createBuffer();
        if (!this.vertexBuffer) {
            console.error("Failed to create vertex buffer for Sphere");
            return false;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // Create and bind normal buffer
        this.normalBuffer = gl.createBuffer();
        if (!this.normalBuffer) {
            console.error("Failed to create normal buffer for Sphere");
            return false;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        return true;
    }

    render() {
        if (!this.initializeBuffers()) {
            console.error("Failed to initialize buffers for Sphere");
            return;
        }

        const rgba = this.color;
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_whichTexture"), this.textureNum);
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
        const vertexCount = this.verts32.length / 3; // Should match positions length / 3
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    }
}

// Export for use in other files
window.Sphere = Sphere;