// WebGLSetup.js
let gl = null; // Explicitly declare as null initially
let shaderProgram = null; // Explicitly declare as null initially

function initWebGL() {
    const canvas = document.getElementById("webgl");
    console.log("Initializing WebGL...");
    gl = canvas.getContext("webgl");
    if (!gl) {
        console.error("WebGL not supported");
        alert("WebGL not supported");
        return false;
    }
    console.log("WebGL context initialized:", gl);

    // Initialize shaders
    shaderProgram = initShaders(gl);
    if (!shaderProgram) {
        console.error("Failed to initialize shaders");
        return false;
    }
    console.log("Shader program initialized:", shaderProgram);
    gl.useProgram(shaderProgram);

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE); // Cull back faces for better performance
    console.log("Depth testing and face culling enabled");

    // Connect variables to GLSL (inspired by student's code)
    connectVariablesToGLSL();

    // Ensure global availability
    window.gl = gl;
    window.shaderProgram = shaderProgram;

    return true;
}

function initShaders(gl) {
    console.log("Compiling shaders...");
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, getVertexShaderSource());
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("Vertex shader compile error: " + gl.getShaderInfoLog(vertexShader));
        return null;
    }
    console.log("Vertex shader compiled successfully");

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, getFragmentShaderSource());
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error("Fragment shader compile error: " + gl.getShaderInfoLog(fragmentShader));
        return null;
    }
    console.log("Fragment shader compiled successfully");

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Shader program link error: " + gl.getProgramInfoLog(program));
        return null;
    }
    console.log("Shader program linked successfully");

    return program;
}

function connectVariablesToGLSL() {
    // Get attribute locations
    const a_position = gl.getAttribLocation(shaderProgram, "a_position");
    if (a_position < 0) {
        console.error("Failed to get the storage location of a_position");
        return;
    }
    const a_normal = gl.getAttribLocation(shaderProgram, "a_normal");
    if (a_normal < 0) {
        console.error("Failed to get the storage location of a_normal");
        return;
    }

    // Store attribute locations globally
    window.attribLocations = {
        a_position: a_position,
        a_normal: a_normal
    };
    
    console.log("Attribute locations initialized:", window.attribLocations);

    // Get uniform locations (inspired by student's code)
    const u_modelMatrix = gl.getUniformLocation(shaderProgram, "u_modelMatrix");
    if (!u_modelMatrix) {
        console.error("Failed to get the storage location of u_modelMatrix");
        return;
    }
    const u_viewMatrix = gl.getUniformLocation(shaderProgram, "u_viewMatrix");
    if (!u_viewMatrix) {
        console.error("Failed to get the storage location of u_viewMatrix");
        return;
    }
    const u_projMatrix = gl.getUniformLocation(shaderProgram, "u_projMatrix");
    if (!u_projMatrix) {
        console.error("Failed to get the storage location of u_projMatrix");
        return;
    }
    const u_normalMatrix = gl.getUniformLocation(shaderProgram, "u_normalMatrix");
    if (!u_normalMatrix) {
        console.error("Failed to get the storage location of u_normalMatrix");
        return;
    }
    const u_viewPos = gl.getUniformLocation(shaderProgram, "u_viewPos");
    if (!u_viewPos) {
        console.error("Failed to get the storage location of u_viewPos");
        return;
    }
    const u_lightPosition = gl.getUniformLocation(shaderProgram, "u_lightPosition");
    if (!u_lightPosition) {
        console.error("Failed to get the storage location of u_lightPosition");
        return;
    }
    const u_spotlightPos = gl.getUniformLocation(shaderProgram, "u_spotlightPos");
    if (!u_spotlightPos) {
        console.error("Failed to get the storage location of u_spotlightPos");
        return;
    }
    const u_lightColor = gl.getUniformLocation(shaderProgram, "u_lightColor");
    if (!u_lightColor) {
        console.error("Failed to get the storage location of u_lightColor");
        return;
    }
    const u_lightOn = gl.getUniformLocation(shaderProgram, "u_lightOn");
    if (!u_lightOn) {
        console.error("Failed to get the storage location of u_lightOn");
        return;
    }
    const u_normalVisualization = gl.getUniformLocation(shaderProgram, "u_normalVisualization");
    if (!u_normalVisualization) {
        console.error("Failed to get the storage location of u_normalVisualization");
        return;
    }
    const u_lightingOn = gl.getUniformLocation(shaderProgram, "u_lightingOn");
    if (!u_lightingOn) {
        console.error("Failed to get the storage location of u_lightingOn");
        return;
    }
    const u_lightDirection = gl.getUniformLocation(shaderProgram, "u_lightDirection");
    if (!u_lightDirection) {
        console.error("Failed to get the storage location of u_lightDirection");
        return;
    }
    const u_limit = gl.getUniformLocation(shaderProgram, "u_limit");
    if (!u_limit) {
        console.error("Failed to get the storage location of u_limit");
        return;
    }
    
    // Set default material properties
    const u_materialColor = gl.getUniformLocation(shaderProgram, "u_materialColor"); 
    if (!u_materialColor) {
        console.error("Failed to get the storage location of u_materialColor");
        return;
    }
    
    const u_shininess = gl.getUniformLocation(shaderProgram, "u_shininess");
    if (!u_shininess) {
        console.warn("Failed to get the storage location of u_shininess, may not be used in shader");
        // Not returning here as this may be optional
    }

    // Store uniform locations globally for Render.js
    window.uniformLocations = {
        u_modelMatrix, u_viewMatrix, u_projMatrix, u_normalMatrix, u_viewPos,
        u_lightPosition, u_spotlightPos, u_lightColor, u_lightOn, u_normalVisualization, u_lightingOn,
        u_lightDirection, u_limit, u_materialColor, u_shininess
    };
    
    console.log("Uniform locations initialized:", Object.keys(window.uniformLocations).length);
}

// Add this utility function to help debug WebGL attribute and uniform locations
function checkShaderVariables() {
    console.log("--- Shader Variables Check ---");
    
    // Check attribute locations
    if (window.attribLocations) {
        console.log("Attribute locations:");
        console.log("  a_position:", window.attribLocations.a_position);
        console.log("  a_normal:", window.attribLocations.a_normal);
    } else {
        console.error("No attribute locations defined!");
    }
    
    // Check uniform locations
    if (window.uniformLocations) {
        console.log("Uniform locations available:", Object.keys(window.uniformLocations).length);
        for (const key in window.uniformLocations) {
            console.log(`  ${key}:`, window.uniformLocations[key]);
        }
    } else {
        console.error("No uniform locations defined!");
    }
    
    console.log("------------------------");
}

// Export for use in other files
window.initWebGL = initWebGL;
window.checkShaderVariables = checkShaderVariables;