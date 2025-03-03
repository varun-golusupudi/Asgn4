// Shaders.js
// This file contains shader source code for WebGL

// Vertex shader source code
function getVertexShaderSource() {
    return `
        attribute vec3 a_position;
        attribute vec3 a_normal;
        
        uniform mat4 u_modelMatrix;
        uniform mat4 u_viewMatrix;
        uniform mat4 u_projMatrix;
        uniform mat4 u_normalMatrix;
        
        varying vec3 v_normal;
        varying vec3 v_fragPos;
        varying vec3 v_position;
        
        void main() {
            // Calculate world position
            vec4 worldPosition = u_modelMatrix * vec4(a_position, 1.0);
            v_fragPos = worldPosition.xyz;
            v_position = a_position;
            
            // Transform normal for lighting calculations
            v_normal = mat3(u_normalMatrix) * a_normal;
            
            // Calculate final position
            gl_Position = u_projMatrix * u_viewMatrix * worldPosition;
        }
    `;
}

// Fragment shader source code
function getFragmentShaderSource() {
    return `
        precision mediump float;
        
        varying vec3 v_normal;
        varying vec3 v_fragPos;
        varying vec3 v_position;
        
        uniform vec3 u_viewPos;
        uniform vec3 u_lightPosition;
        uniform vec3 u_spotlightPos;
        uniform vec3 u_lightColor;
        uniform bool u_lightOn;
        uniform bool u_spotlightOn;
        uniform bool u_normalVisualization;
        uniform bool u_lightingOn;
        uniform vec3 u_lightDirection;
        uniform float u_limit;
        
        // Material properties
        uniform vec3 u_materialColor;
        uniform float u_shininess;
        
        void main() {
            // EXTREMELY SIMPLIFIED DIAGNOSTIC SHADER
            // Just to check if basic values are coming through correctly
            
            // Default base material color if not provided
            vec3 materialColor = vec3(0.7, 0.7, 0.7);
            if (u_materialColor.x > 0.0 || u_materialColor.y > 0.0 || u_materialColor.z > 0.0) {
                materialColor = u_materialColor;
            }
            
            // Normalize the normal
            vec3 normal = normalize(v_normal);
            
            // Simple diagnostic view - show different parts in different colors
            if (u_normalVisualization) {
                // Visualize normals as colors
                gl_FragColor = vec4(0.5 + 0.5 * normal, 1.0);
                return;
            }
            
            // Show model position for basic shape visibility
            vec3 modelPos = 0.5 + 0.5 * normalize(v_position);
            
            // Basic colors for different light states - make visible regardless
            if (!u_lightingOn) {
                // No lighting - use model position for visibility
                gl_FragColor = vec4(modelPos, 1.0);
                return;
            }
            
            // Basic lighting to debug light position
            vec3 result = vec3(0.1, 0.1, 0.1); // Very dim ambient
            
            // Point light calculation - simplified
            if (u_lightOn) {
                vec3 lightDir = normalize(u_lightPosition - v_fragPos);
                float diff = max(dot(normal, lightDir), 0.0);
                // Red component for point light to make it obvious
                result += vec3(diff * 0.6, diff * 0.2, diff * 0.2);
            }
            
            // Spotlight calculation - simplified
            if (u_spotlightOn) {
                vec3 spotLightDir = normalize(u_spotlightPos - v_fragPos);
                float theta = dot(spotLightDir, normalize(-u_lightDirection));
                
                // Add spotlight contrib in cyan to distinguish from point light
                if (theta > u_limit) {
                    float diff = max(dot(normal, spotLightDir), 0.0);
                    // Cyan component for spotlight to make it obvious
                    result += vec3(0.0, diff * 0.7, diff * 0.7);
                } else {
                    // Outside spotlight cone - very subtle indicator to show where cone boundary is
                    result += vec3(0.0, 0.0, theta * 0.1);
                }
            }
            
            gl_FragColor = vec4(result, 1.0);
        }
    `;
}

// Make shader source functions available globally
window.getVertexShaderSource = getVertexShaderSource;
window.getFragmentShaderSource = getFragmentShaderSource;