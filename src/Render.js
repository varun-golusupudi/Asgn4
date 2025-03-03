// Render.js
// Helper function for converting degrees to radians
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

let cube = null;
let sphere = null;
let cone = null;
let lightMarkerCube = null;
let spotlightMarkerCube = null;
let then = 0;

let settings = {
    lightingOn: true,
    normalVisualization: false,
    spotlightOn: false,
    lightColor: [1.0, 1.0, 1.0], // White light
    lightAngle: 0,
    cameraAngle: 45,
    lightPos: [0.0, 3.0, -2.0], // Default light position
    spotlightPos: [0.0, 3.0, 0.0], // Default spotlight position
    spotlightDirection: [0.0, -1.0, 0.0], // Default spotlight direction (downward)
    spotlightCutoff: 20.0, // Spotlight cutoff angle in degrees
    runAnimation: false,
    footAngleR: 0,
    footAngleL: 0,
    footLiftR: 0,
    footLiftL: 0,
    bodyAngle: 0
};

let uniformLocations = null;

// Update UI based on current settings
function updateUI() {
    // Update button texts based on current settings
    try {
        const lightingToggle = document.getElementById('toggle-lighting');
        if (lightingToggle) {
            lightingToggle.textContent = settings.lightingOn ? "Toggle Lighting Off" : "Toggle Lighting On";
        }
        
        const normalVizToggle = document.getElementById('toggle-normal-viz');
        if (normalVizToggle) {
            normalVizToggle.textContent = settings.normalVisualization ? "Toggle Normal Visualization Off" : "Toggle Normal Visualization On";
        }
        
        const spotLightToggle = document.getElementById('toggle-spot-light');
        if (spotLightToggle) {
            spotLightToggle.textContent = settings.spotlightOn ? "Toggle Spot Light Off" : "Toggle Spot Light On";
        }
        
        const runAnimationBtn = document.getElementById('run-animation');
        if (runAnimationBtn) {
            runAnimationBtn.textContent = settings.runAnimation ? "Run Animation OFF" : "Run Animation ON";
        }
        
        // Update happiness display
        const happinessDisplay = document.querySelector('#happiness h2');
        if (happinessDisplay) {
            happinessDisplay.textContent = `Bunny's Happiness: ${window.bunnyHappiness || 0}`;
        }
    } catch (e) {
        console.error("Error updating UI:", e);
    }
}

function initRender() {
    console.log("=== Render Initialization Started ===");
    
    // Force initialize settings for spotlight to ensure they exist
    window.settings = window.settings || {};
    window.settings.lightingOn = window.settings.lightingOn !== undefined ? window.settings.lightingOn : true;
    window.settings.normalVisualization = window.settings.normalVisualization !== undefined ? window.settings.normalVisualization : false;
    window.settings.spotlightOn = window.settings.spotlightOn !== undefined ? window.settings.spotlightOn : false;
    window.settings.lightColor = window.settings.lightColor || [1.0, 1.0, 1.0];
    window.settings.lightAngle = window.settings.lightAngle !== undefined ? window.settings.lightAngle : 0;
    window.settings.cameraAngle = window.settings.cameraAngle !== undefined ? window.settings.cameraAngle : 45;
    window.settings.lightPos = window.settings.lightPos || [0.0, 3.0, -2.0];
    window.settings.spotlightPos = window.settings.spotlightPos || [0.0, 3.0, 0.0];
    window.settings.spotlightDirection = window.settings.spotlightDirection || [0.0, -1.0, 0.0];
    window.settings.spotlightCutoff = window.settings.spotlightCutoff !== undefined ? window.settings.spotlightCutoff : 20.0;
    
    console.log("Settings initialized:", window.settings);
    
    // Check if GL-Matrix is loaded properly
    if (typeof mat4 === 'undefined') {
        console.error("GL-Matrix library not loaded properly!");
        return false;
    }
    
    // CRITICAL: Check WebGL context and shader program
    if (!window.gl) {
        console.error("WebGL context not available in initRender");
        return false;
    }
    
    if (!window.shaderProgram) {
        console.error("Shader program not available in initRender");
        return false;
    }
    
    console.log("WebGL context and shader program are available");
    
    // Initialize required globals if they don't exist
    if (typeof window.g_map === 'undefined') {
        console.log("Initializing g_map");
        window.g_map = [];
        window.worldSize = 32; // Default world size
        window.carrotBlock = 1; // Default block type
        window.bunnyHappiness = 0;
    }
    
    if (typeof window.g_startTime === 'undefined') {
        window.g_startTime = performance.now() * 0.001;
        window.g_seconds = 0;
    }
    
    if (!window.g_camera) {
        console.log("Initializing g_camera");
        window.g_camera = { 
            eye: vec3.fromValues(0, 2, 5),
            at: vec3.fromValues(0, 0, 0),
            up: vec3.fromValues(0, 1, 0),
            viewMatrix: mat4.create(),
            updateViewMatrix: function() {
                mat4.lookAt(this.viewMatrix, this.eye, this.at, this.up);
            }
        };
        window.g_camera.updateViewMatrix();
    }

    // Get uniform locations from globals
    uniformLocations = window.uniformLocations;
    if (!uniformLocations) {
        console.error("Uniform locations not available in initRender");
        // Create essential uniform location mapping even if some were missing
        uniformLocations = {};
        const uniforms = [
            "u_modelMatrix", "u_viewMatrix", "u_projMatrix", 
            "u_normalMatrix", "u_viewPos", "u_lightPosition", 
            "u_spotlightPos", "u_lightColor", "u_lightOn", 
            "u_normalVisualization", "u_lightingOn", "u_lightDirection", 
            "u_limit", "u_materialColor", "u_shininess", "u_spotlightOn"
        ];
        
        for (const uniform of uniforms) {
            uniformLocations[uniform] = window.gl.getUniformLocation(window.shaderProgram, uniform);
            console.log(`Uniform location for ${uniform}:`, uniformLocations[uniform]);
        }
        
        window.uniformLocations = uniformLocations;
    }
    
    console.log("Uniforms loaded successfully:", Object.keys(uniformLocations).length);

    // Create and initialize objects
    try {
        console.log("Creating cube...");
        cube = new Cube();
        if (!cube) {
            console.error("Failed to create Cube instance");
        } else if (typeof cube.initializeBuffers !== 'function') {
            console.error("Cube.initializeBuffers is not a function");
            cube = null;
        } else if (!cube.initializeBuffers()) {
            console.error("Failed to initialize buffers for Cube");
            cube = null;
        } else {
            console.log("Cube created and buffers initialized successfully");
        }
    } catch (e) {
        console.error("Exception creating Cube:", e);
        cube = null;
    }

    try {
        console.log("Creating sphere...");
        sphere = new Sphere();
        if (!sphere) {
            console.error("Failed to create Sphere instance");
        } else if (typeof sphere.initializeBuffers !== 'function') {
            console.error("Sphere.initializeBuffers is not a function");
            sphere = null;
        } else if (!sphere.initializeBuffers()) {
            console.error("Failed to initialize buffers for Sphere");
            sphere = null;
        } else {
            console.log("Sphere created and buffers initialized successfully");
        }
    } catch (e) {
        console.error("Exception creating Sphere:", e);
        sphere = null;
    }

    try {
        console.log("Creating cone...");
        cone = new Cone(0.5, 1.0, 20);
        if (!cone) {
            console.error("Failed to create Cone instance");
        } else if (typeof cone.initializeBuffers !== 'function') {
            console.error("Cone.initializeBuffers is not a function");
            cone = null;
        } else if (!cone.initializeBuffers()) {
            console.error("Failed to initialize buffers for Cone");
            cone = null;
        } else {
            console.log("Cone created and buffers initialized successfully");
        }
    } catch (e) {
        console.error("Exception creating Cone:", e);
        cone = null;
    }

    try {
        console.log("Creating light marker...");
        lightMarkerCube = new Cube();
        if (!lightMarkerCube) {
            console.error("Failed to create Light Marker Cube instance");
        } else {
            lightMarkerCube.color = [2, 2, 0, 1]; // Yellow for light marker
            lightMarkerCube.textureNum = -2;
            if (typeof lightMarkerCube.initializeBuffers !== 'function') {
                console.error("LightMarkerCube.initializeBuffers is not a function");
                lightMarkerCube = null;
            } else if (!lightMarkerCube.initializeBuffers()) {
                console.error("Failed to initialize buffers for Light Marker Cube");
                lightMarkerCube = null;
            } else {
                console.log("Light marker cube created and buffers initialized successfully");
            }
        }
    } catch (e) {
        console.error("Exception creating Light Marker Cube:", e);
        lightMarkerCube = null;
    }
    
    try {
        console.log("Creating spotlight marker...");
        spotlightMarkerCube = new Cube();
        if (!spotlightMarkerCube) {
            console.error("Failed to create Spotlight Marker Cube instance");
        } else {
            spotlightMarkerCube.color = [0, 2, 2, 1]; // Cyan for spotlight marker
            spotlightMarkerCube.textureNum = -2;
            if (typeof spotlightMarkerCube.initializeBuffers !== 'function') {
                console.error("SpotlightMarkerCube.initializeBuffers is not a function");
                spotlightMarkerCube = null;
            } else if (!spotlightMarkerCube.initializeBuffers()) {
                console.error("Failed to initialize buffers for Spotlight Marker Cube");
                spotlightMarkerCube = null;
            } else {
                console.log("Spotlight marker cube created and buffers initialized successfully");
            }
        }
    } catch (e) {
        console.error("Exception creating Spotlight Marker Cube:", e);
        spotlightMarkerCube = null;
    }

    // Set up projection matrix
    try {
        console.log("Setting up projection matrix...");
        const projMatrix = mat4.create();
        // Use our toRadians function instead of glMatrix.glMatrix.toRadian
        mat4.perspective(projMatrix, toRadians(45), 800 / 600, 0.01, 1000.0);
        window.gl.uniformMatrix4fv(uniformLocations.u_projMatrix, false, projMatrix);
        console.log("Projection matrix set up successfully");
    } catch (e) {
        console.error("Exception setting up projection matrix:", e);
        return false;
    }

    // Set up a view matrix to see the scene initially
    try {
        console.log("Setting up initial view matrix...");
        const viewMatrix = mat4.create();
        const eye = vec3.fromValues(0, 2, 5);
        const center = vec3.fromValues(0, 0, 0);
        const up = vec3.fromValues(0, 1, 0);
        mat4.lookAt(viewMatrix, eye, center, up);
        window.gl.uniformMatrix4fv(uniformLocations.u_viewMatrix, false, viewMatrix);
        console.log("View matrix set up successfully");
    } catch (e) {
        console.error("Exception setting up view matrix:", e);
    }
    
    // Update UI to match initial settings
    updateUI();
    
    // Start the render loop
    console.log("Starting render loop");
    then = performance.now() * 0.001;
    window.requestAnimationFrame(render);
    
    console.log("=== Render Initialization Completed ===");
    return true;
}

function render(now) {
    try {
        now *= 0.001; // Convert to seconds
        const deltaTime = now - then;
        then = now;

        // Ensure WebGL context is still available
        if (!window.gl) {
            console.error("WebGL context lost during render");
            return;
        }

        // Update animations
        updateAnimations(now);

        // Update light position based on angles from UI
        const lightRadius = 5.0;
        settings.lightPos[0] = lightRadius * Math.cos(toRadians(settings.lightAngle));
        settings.lightPos[2] = lightRadius * Math.sin(toRadians(settings.lightAngle));

        // Update camera position based on angle from UI
        if (window.g_camera) {
            const cameraRadius = 5.0;
            const camX = cameraRadius * Math.cos(toRadians(settings.cameraAngle));
            const camZ = cameraRadius * Math.sin(toRadians(settings.cameraAngle));
            
            // Only update viewpoint if using orbit camera
            if (!window.cameraControlsActive) {
                window.g_camera.eye = vec3.fromValues(camX, 2.0, camZ);
                window.g_camera.at = vec3.fromValues(0, 0, 0);
                window.g_camera.updateViewMatrix();
            }
            
            // Set view matrix and camera position uniforms
            if (uniformLocations.u_viewMatrix) {
                window.gl.uniformMatrix4fv(uniformLocations.u_viewMatrix, false, window.g_camera.viewMatrix);
            }
            
            if (uniformLocations.u_viewPos) {
                window.gl.uniform3fv(uniformLocations.u_viewPos, window.g_camera.eye);
            }
        }

        // Set all lighting uniforms each frame
        if (uniformLocations.u_lightPosition) {
            window.gl.uniform3fv(uniformLocations.u_lightPosition, settings.lightPos);
        }
        
        if (uniformLocations.u_lightColor) {
            window.gl.uniform3fv(uniformLocations.u_lightColor, settings.lightColor);
        }
        
        if (uniformLocations.u_lightOn) {
            window.gl.uniform1i(uniformLocations.u_lightOn, settings.lightingOn ? 1 : 0);
        }
        
        if (uniformLocations.u_normalVisualization) {
            window.gl.uniform1i(uniformLocations.u_normalVisualization, settings.normalVisualization ? 1 : 0);
        }
        
        if (uniformLocations.u_lightingOn) {
            window.gl.uniform1i(uniformLocations.u_lightingOn, settings.lightingOn ? 1 : 0);
        }

        // Spotlight uniforms
        if (uniformLocations.u_spotlightPos) {
            window.gl.uniform3fv(uniformLocations.u_spotlightPos, settings.spotlightPos);
        }
        
        if (uniformLocations.u_lightDirection) {
            window.gl.uniform3fv(uniformLocations.u_lightDirection, settings.spotlightDirection);
        }
        
        if (uniformLocations.u_limit) {
            const limit = Math.cos(toRadians(settings.spotlightCutoff));
            window.gl.uniform1f(uniformLocations.u_limit, limit);
        }
        
        // Set spotlight on/off
        if (uniformLocations.u_spotlightOn) {
            window.gl.uniform1i(uniformLocations.u_spotlightOn, settings.spotlightOn ? 1 : 0);
        }

        // Clear the canvas
        window.gl.clearColor(0.2, 0.2, 0.2, 1.0); // Dark gray background
        window.gl.clear(window.gl.COLOR_BUFFER_BIT | window.gl.DEPTH_BUFFER_BIT);

        // Render objects in scene
        renderScene(deltaTime);

        // Continue the render loop
        window.requestAnimationFrame(render);
    } catch (e) {
        console.error("Exception in render loop:", e);
        // Still try to continue the render loop after an error
        window.requestAnimationFrame(render);
    }
}

function renderScene(deltaTime) {
    // Render light marker to show light position
    if (lightMarkerCube && typeof lightMarkerCube.render === 'function') {
        try {
            let modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, settings.lightPos);
            mat4.scale(modelMatrix, modelMatrix, [0.2, 0.2, 0.2]);
            lightMarkerCube.matrix = modelMatrix;
            lightMarkerCube.render();
        } catch (e) {
            console.error("Error rendering light marker:", e);
        }
    }
    
    // Render spotlight marker - Always render it for debugging
    if (spotlightMarkerCube && typeof spotlightMarkerCube.render === 'function') {
        try {
            let modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, settings.spotlightPos);
            mat4.scale(modelMatrix, modelMatrix, [0.3, 0.3, 0.3]); // Make it larger
            spotlightMarkerCube.matrix = modelMatrix;
            spotlightMarkerCube.render();
            
            // Render a visual indicator of the spotlight direction
            if (cone && typeof cone.render === 'function' && settings.spotlightOn) {
                try {
                    let directionMatrix = mat4.create();
                    mat4.translate(directionMatrix, directionMatrix, settings.spotlightPos);
                    
                    // Rotate the cone to point in the spotlight direction
                    // For a downward direction we need to rotate around X by 180 degrees
                    mat4.rotateX(directionMatrix, directionMatrix, Math.PI);
                    
                    // Scale for a narrow cone
                    mat4.scale(directionMatrix, directionMatrix, [0.2, 0.5, 0.2]);
                    
                    // Create a special cone for the spotlight
                    let directionCone = new Cone(0.5, 1.0, 20);
                    directionCone.color = [0, 1, 1, 0.5]; // Cyan with transparency
                    if (directionCone.initializeBuffers()) {
                        directionCone.matrix = directionMatrix;
                        directionCone.render();
                    }
                } catch (e) {
                    console.error("Error rendering spotlight direction indicator:", e);
                }
            }
        } catch (e) {
            console.error("Error rendering spotlight marker:", e);
        }
    }
    
    // Layout objects in the scene
    
    // Render cube
    if (cube && typeof cube.render === 'function') {
        try {
            let modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, [-1.5, 0, 0]);
            mat4.scale(modelMatrix, modelMatrix, [0.5, 0.5, 0.5]);
            
            // Apply animation if enabled
            if (settings.runAnimation) {
                const bobHeight = Math.sin(window.g_seconds * 2) * 0.2;
                modelMatrix[13] = bobHeight; // Y position
            }
            
            cube.matrix = modelMatrix;
            cube.render();
        } catch (e) {
            console.error("Error rendering cube:", e);
        }
    }

    // Render sphere
    if (sphere && typeof sphere.render === 'function') {
        try {
            let modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]);
            mat4.scale(modelMatrix, modelMatrix, [0.5, 0.5, 0.5]);
            
            // Apply animation if enabled
            if (settings.runAnimation) {
                const bobHeight = Math.sin(window.g_seconds * 2 + 1) * 0.2;
                modelMatrix[13] = bobHeight; // Y position
            }
            
            sphere.matrix = modelMatrix;
            sphere.render();
        } catch (e) {
            console.error("Error rendering sphere:", e);
        }
    }

    // Render cone
    if (cone && typeof cone.render === 'function') {
        try {
            let modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, [1.5, 0, 0]);
            mat4.scale(modelMatrix, modelMatrix, [0.5, 0.5, 0.5]);
            
            // Apply animation if enabled
            if (settings.runAnimation) {
                const bobHeight = Math.sin(window.g_seconds * 2 + 2) * 0.2;
                modelMatrix[13] = bobHeight; // Y position
            }
            
            cone.matrix = modelMatrix;
            cone.render();
        } catch (e) {
            console.error("Error rendering cone:", e);
        }
    }
    
    // Draw ground plane (large flat cube)
    if (cube && typeof cube.render === 'function') {
        try {
            let modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, [0, -1, 0]);
            mat4.scale(modelMatrix, modelMatrix, [10, 0.1, 10]);
            
            let groundCube = new Cube();
            groundCube.color = [0.5, 0.5, 0.5, 1.0]; // Gray
            if (groundCube.initializeBuffers()) {
                groundCube.matrix = modelMatrix;
                groundCube.render();
            }
        } catch (e) {
            console.error("Error rendering ground:", e);
        }
    }
}

function updateAnimations(now) {
    window.g_seconds = (now) - (window.g_startTime || 0);
    
    if (settings.runAnimation) {
        const maxSwingAngle = 25;
        const maxLiftHeight = 0.2;

        // Right foot animation
        const swingAngleR = Math.sin(4 * window.g_seconds) * maxSwingAngle;
        const liftHeightR = Math.abs(Math.sin(4 * window.g_seconds)) * maxLiftHeight;
        settings.footAngleR = swingAngleR;
        settings.footLiftR = liftHeightR;

        // Left foot animation (phase offset for alternation)
        const swingAngleL = Math.sin(4 * window.g_seconds + Math.PI) * maxSwingAngle;
        const liftHeightL = Math.abs(Math.sin(4 * window.g_seconds + Math.PI)) * maxLiftHeight;
        settings.footAngleL = swingAngleL;
        settings.footLiftL = liftHeightL;

        // Body rotation
        settings.bodyAngle = Math.sin(4 * window.g_seconds) * 5;
    }
}

// Function to force update lighting uniforms - call this if lighting isn't working properly
function updateLightingUniforms() {
    if (!window.gl || !uniformLocations) return;
    
    try {
        // Set light position and color
        if (uniformLocations.u_lightPosition) {
            window.gl.uniform3fv(uniformLocations.u_lightPosition, settings.lightPos);
        }
        
        if (uniformLocations.u_lightColor) {
            window.gl.uniform3fv(uniformLocations.u_lightColor, settings.lightColor);
        }
        
        // Set lighting flags
        if (uniformLocations.u_lightOn) {
            window.gl.uniform1i(uniformLocations.u_lightOn, settings.lightingOn ? 1 : 0);
        }
        
        if (uniformLocations.u_normalVisualization) {
            window.gl.uniform1i(uniformLocations.u_normalVisualization, settings.normalVisualization ? 1 : 0);
        }
        
        if (uniformLocations.u_lightingOn) {
            window.gl.uniform1i(uniformLocations.u_lightingOn, settings.lightingOn ? 1 : 0);
        }
        
        // Set spotlight parameters
        if (uniformLocations.u_spotlightPos) {
            window.gl.uniform3fv(uniformLocations.u_spotlightPos, settings.spotlightPos);
        }
        
        if (uniformLocations.u_lightDirection) {
            window.gl.uniform3fv(uniformLocations.u_lightDirection, settings.spotlightDirection);
        }
        
        if (uniformLocations.u_limit) {
            const limit = Math.cos(toRadians(settings.spotlightCutoff));
            window.gl.uniform1f(uniformLocations.u_limit, limit);
        }
        
        // Set spotlight on/off
        if (uniformLocations.u_spotlightOn) {
            window.gl.uniform1i(uniformLocations.u_spotlightOn, settings.spotlightOn ? 1 : 0);
        }
        
        console.log("Lighting uniforms updated manually");
    } catch (e) {
        console.error("Error updating lighting uniforms:", e);
    }
}

// Add this utility function to help debug WebGL state
function checkWebGLState() {
    console.log("--- WebGL State Check ---");
    console.log("window.gl exists:", window.gl !== undefined);
    console.log("window.shaderProgram exists:", window.shaderProgram !== undefined);
    console.log("window.uniformLocations exists:", window.uniformLocations !== undefined);
    
    if (window.uniformLocations) {
        console.log("Uniform locations:", Object.keys(window.uniformLocations));
    }
    
    if (window.attribLocations) {
        console.log("Attribute locations:", window.attribLocations);
    }
    
    if (window.gl) {
        console.log("GL viewport:", window.gl.getParameter(window.gl.VIEWPORT));
        console.log("GL current program:", window.gl.getParameter(window.gl.CURRENT_PROGRAM));
        console.log("GL depth test enabled:", window.gl.getParameter(window.gl.DEPTH_TEST));
    }
    
    console.log("Camera:", window.g_camera ? {
        eye: window.g_camera.eye,
        at: window.g_camera.at,
        up: window.g_camera.up
    } : "Not initialized");
    
    console.log("Settings:", window.settings);
    console.log("------------------------");
}

// Export functions and settings to the window object
window.initRender = initRender;
window.settings = settings;
window.checkWebGLState = checkWebGLState;
window.addBlock = addBlock;
window.removeBlock = removeBlock;
window.updateLightingUniforms = updateLightingUniforms;