// Cube.js
class Cube {
    constructor() {
        // Vertex data for the cube
        this.cubeVerts32 = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,
            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,
            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,
            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,
            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0
        ];

        // Normal data (matching vertices)
        this.normals = [
            // Front face
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            // Back face
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            // Top face
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            // Bottom face
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            // Right face
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            // Left face
           -1.0,  0.0,  0.0,
           -1.0,  0.0,  0.0,
           -1.0,  0.0,  0.0,
           -1.0,  0.0,  0.0
        ];

        // Default transform matrix
        this.matrix = mat4.create();
        
        // Initialize properties that will be set later
        this.vertexBuffer = null;
        this.normalBuffer = null;
        this.color = [1.0, 0.0, 0.0, 1.0]; // Red by default
        this.textureNum = -1; // Default texture
    }

    initializeBuffers() {
        // Check if WebGL context is available
        if (!window.gl) {
            console.error("WebGL context not available for Cube initialization");
            return false;
        }

        try {
            // Create and bind vertex buffer
            this.vertexBuffer = window.gl.createBuffer();
            if (!this.vertexBuffer) {
                console.error("Failed to create vertex buffer for Cube");
                return false;
            }
            window.gl.bindBuffer(window.gl.ARRAY_BUFFER, this.vertexBuffer);
            window.gl.bufferData(window.gl.ARRAY_BUFFER, new Float32Array(this.cubeVerts32), window.gl.STATIC_DRAW);

            // Create and bind normal buffer
            this.normalBuffer = window.gl.createBuffer();
            if (!this.normalBuffer) {
                console.error("Failed to create normal buffer for Cube");
                return false;
            }
            window.gl.bindBuffer(window.gl.ARRAY_BUFFER, this.normalBuffer);
            window.gl.bufferData(window.gl.ARRAY_BUFFER, new Float32Array(this.normals), window.gl.STATIC_DRAW);

            return true;
        } catch (error) {
            console.error("Error initializing Cube buffers:", error);
            return false;
        }
    }

    render() {
        // Safety checks
        if (!window.gl) {
            console.error("WebGL context not available during Cube render");
            return;
        }
        
        if (!this.vertexBuffer || !this.normalBuffer) {
            console.error("Cube buffers not initialized");
            return;
        }
        
        try {
            // CRITICAL FIX: Check if attribLocations exists
            if (!window.attribLocations) {
                console.error("Attribute locations not available during Cube render");
                return;
            }

            const uniformLocations = window.uniformLocations;
            if (!uniformLocations) {
                console.error("Uniform locations not available during Cube render");
                return;
            }
            
            // Set model matrix
            window.gl.uniformMatrix4fv(uniformLocations.u_modelMatrix, false, this.matrix);

            // Set normal matrix (inverse transpose of model matrix)
            const normalMatrix = mat4.create();
            mat4.invert(normalMatrix, this.matrix);
            mat4.transpose(normalMatrix, normalMatrix);
            window.gl.uniformMatrix4fv(uniformLocations.u_normalMatrix, false, normalMatrix);

            // Set material properties
            // Use a default color if u_materialColor is not available
            if (uniformLocations.u_materialColor) {
                window.gl.uniform3fv(uniformLocations.u_materialColor, 
                                     this.color.length >= 3 ? this.color.slice(0, 3) : [1.0, 0.0, 0.0]);
            }

            // Set vertex positions
            window.gl.bindBuffer(window.gl.ARRAY_BUFFER, this.vertexBuffer);
            // CRITICAL FIX: Use undefined check with typeof instead of just undefined check
            if (typeof window.attribLocations.a_position === 'number' && 
                window.attribLocations.a_position >= 0) {
                window.gl.vertexAttribPointer(
                    window.attribLocations.a_position,
                    3,          // 3 components per vertex
                    window.gl.FLOAT,
                    false,      // Don't normalize
                    0,          // No stride
                    0           // Start at beginning of buffer
                );
                window.gl.enableVertexAttribArray(window.attribLocations.a_position);
            } else {
                console.error("Invalid a_position attribute location:", window.attribLocations.a_position);
                return;
            }

            // Set normals
            window.gl.bindBuffer(window.gl.ARRAY_BUFFER, this.normalBuffer);
            // CRITICAL FIX: Use undefined check with typeof instead of just undefined check
            if (typeof window.attribLocations.a_normal === 'number' && 
                window.attribLocations.a_normal >= 0) {
                window.gl.vertexAttribPointer(
                    window.attribLocations.a_normal,
                    3,          // 3 components per normal
                    window.gl.FLOAT,
                    false,      // Don't normalize
                    0,          // No stride
                    0           // Start at beginning of buffer
                );
                window.gl.enableVertexAttribArray(window.attribLocations.a_normal);
            } else {
                console.error("Invalid a_normal attribute location:", window.attribLocations.a_normal);
                // We can still render without normals, so don't return
            }

            // Draw the cube
            window.gl.drawArrays(window.gl.TRIANGLE_FAN, 0, 4);  // Front face
            window.gl.drawArrays(window.gl.TRIANGLE_FAN, 4, 4);  // Back face
            window.gl.drawArrays(window.gl.TRIANGLE_FAN, 8, 4);  // Top face
            window.gl.drawArrays(window.gl.TRIANGLE_FAN, 12, 4); // Bottom face
            window.gl.drawArrays(window.gl.TRIANGLE_FAN, 16, 4); // Right face
            window.gl.drawArrays(window.gl.TRIANGLE_FAN, 20, 4); // Left face
        } catch (error) {
            console.error("Error rendering Cube:", error);
        }
    }

    renderfast() {
        // Simplified rendering for light marker
        if (!window.gl) {
            console.error("WebGL context not available during Cube renderfast");
            return;
        }
        
        if (!this.vertexBuffer) {
            console.error("Cube vertex buffer not initialized for renderfast");
            return;
        }

        // CRITICAL FIX: Check if attribLocations exists
        if (!window.attribLocations) {
            console.error("Attribute locations not available during Cube renderfast");
            return;
        }

        try {
            if (window.uniformLocations && window.uniformLocations.u_modelMatrix) {
                window.gl.uniformMatrix4fv(window.uniformLocations.u_modelMatrix, false, this.matrix);
            }
            
            if (window.uniformLocations && window.uniformLocations.u_materialColor) {
                window.gl.uniform3fv(window.uniformLocations.u_materialColor, [1.0, 1.0, 0.0]); // Yellow for light
            }
            
            window.gl.bindBuffer(window.gl.ARRAY_BUFFER, this.vertexBuffer);
            // CRITICAL FIX: Use undefined check with typeof instead of just undefined check
            if (typeof window.attribLocations.a_position === 'number' && 
                window.attribLocations.a_position >= 0) {
                window.gl.vertexAttribPointer(
                    window.attribLocations.a_position,
                    3, window.gl.FLOAT, false, 0, 0
                );
                window.gl.enableVertexAttribArray(window.attribLocations.a_position);
            } else {
                console.error("Invalid a_position attribute location:", window.attribLocations.a_position);
                return;
            }
            
            // Simple draw without normal calculations
            window.gl.drawArrays(window.gl.TRIANGLE_FAN, 0, 4);
            window.gl.drawArrays(window.gl.TRIANGLE_FAN, 4, 4);
            window.gl.drawArrays(window.gl.TRIANGLE_FAN, 8, 4);
            window.gl.drawArrays(window.gl.TRIANGLE_FAN, 12, 4);
            window.gl.drawArrays(window.gl.TRIANGLE_FAN, 16, 4);
            window.gl.drawArrays(window.gl.TRIANGLE_FAN, 20, 4);
        } catch (error) {
            console.error("Error in renderfast:", error);
        }
    }
}

// Make the Cube class available globally
window.Cube = Cube;