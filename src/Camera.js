// Camera.js
// Simple camera implementation for WebGL

class Camera {
    constructor() {
        // Camera position and orientation
        this.eye = vec3.fromValues(0, 1, 5); // Camera position
        this.at = vec3.fromValues(0, 1, 0);   // Look-at point
        this.up = vec3.fromValues(0, 1, 0);   // Up vector
        
        // Movement parameters
        this.moveSpeed = 0.2;
        this.rotateSpeed = 0.05;
        
        // View matrix
        this.viewMatrix = mat4.create();
        this.updateViewMatrix();
    }
    
    updateViewMatrix() {
        mat4.lookAt(this.viewMatrix, this.eye, this.at, this.up);
        
        // Directly update the shader uniform if it exists
        if (window.gl && window.uniformLocations && window.uniformLocations.u_viewMatrix) {
            window.gl.uniformMatrix4fv(window.uniformLocations.u_viewMatrix, false, this.viewMatrix);
            
            // Also update the view position for lighting calculations
            if (window.uniformLocations.u_viewPos) {
                window.gl.uniform3fv(window.uniformLocations.u_viewPos, this.eye);
            }
        }
    }
    
    // Move camera forward along look direction
    moveForward(distance = this.moveSpeed) {
        console.log("Camera moveForward called");
        
        // Calculate forward direction (normalized)
        const forward = vec3.create();
        vec3.subtract(forward, this.at, this.eye);
        vec3.normalize(forward, forward);
        
        // Move eye and at points
        vec3.scaleAndAdd(this.eye, this.eye, forward, distance);
        vec3.scaleAndAdd(this.at, this.at, forward, distance);
        
        this.updateViewMatrix();
        console.log("Camera moved forward to position:", this.eye);
    }
    
    // Move camera backward along look direction
    moveBackward(distance = this.moveSpeed) {
        console.log("Camera moveBackward called");
        this.moveForward(-distance);
    }
    
    // Strafe camera left
    moveLeft(distance = this.moveSpeed) {
        console.log("Camera moveLeft called");
        
        // Calculate forward and left directions
        const forward = vec3.create();
        vec3.subtract(forward, this.at, this.eye);
        
        // Calculate left direction (cross product of up and forward)
        const left = vec3.create();
        vec3.cross(left, this.up, forward);
        vec3.normalize(left, left);
        
        // Move eye and at points
        vec3.scaleAndAdd(this.eye, this.eye, left, distance);
        vec3.scaleAndAdd(this.at, this.at, left, distance);
        
        this.updateViewMatrix();
        console.log("Camera moved left to position:", this.eye);
    }
    
    // Strafe camera right
    moveRight(distance = this.moveSpeed) {
        console.log("Camera moveRight called");
        this.moveLeft(-distance);
    }
    
    // Pan camera left (rotate around up axis)
    panLeft(angle = this.rotateSpeed) {
        console.log("Camera panLeft called");
        
        // Calculate direction vector from eye to at
        const direction = vec3.create();
        vec3.subtract(direction, this.at, this.eye);
        
        // Create rotation matrix around up axis
        const rotationMatrix = mat4.create();
        mat4.rotate(rotationMatrix, rotationMatrix, angle, this.up);
        
        // Apply rotation to direction vector
        vec3.transformMat4(direction, direction, rotationMatrix);
        
        // Update at point
        vec3.add(this.at, this.eye, direction);
        
        this.updateViewMatrix();
        console.log("Camera panned left, now looking at:", this.at);
    }
    
    // Pan camera right (rotate around up axis)
    panRight(angle = this.rotateSpeed) {
        console.log("Camera panRight called");
        this.panLeft(-angle);
    }
    
    // Move camera up
    moveUp(distance = this.moveSpeed) {
        console.log("Camera moveUp called");
        
        // Move along world up vector
        const worldUp = vec3.fromValues(0, 1, 0);
        vec3.scaleAndAdd(this.eye, this.eye, worldUp, distance);
        vec3.scaleAndAdd(this.at, this.at, worldUp, distance);
        
        this.updateViewMatrix();
        console.log("Camera moved up to position:", this.eye);
    }
    
    // Move camera down
    moveDown(distance = this.moveSpeed) {
        console.log("Camera moveDown called");
        this.moveUp(-distance);
    }
    
    // Set camera position and look-at point
    setPosition(eyeX, eyeY, eyeZ, atX, atY, atZ) {
        console.log("Camera position set directly");
        
        this.eye = vec3.fromValues(eyeX, eyeY, eyeZ);
        this.at = vec3.fromValues(atX, atY, atZ);
        this.updateViewMatrix();
        
        console.log("Camera position set to:", this.eye, "looking at:", this.at);
    }
}

// Set up the camera and make it available globally
function setupCamera() {
    console.log("Setting up camera...");
    window.g_camera = new Camera();
    console.log("Camera initialized at:", window.g_camera.eye);
    
    // Ensure the camera is available globally for direct access
    window.camera = window.g_camera;
}

// Make setup function available globally
window.setupCamera = setupCamera;