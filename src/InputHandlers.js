// InputHandlers.js
function setupInputHandlers() {
    console.log("Setting up input handlers...");
    
    try {
        // Set up keyboard controls using direct event listener
        document.addEventListener('keydown', function(event) {
            console.log("Key pressed:", event.key);
            handleKeyDown(event);
        });
        console.log("Keyboard controls set up");
        
        // Set up UI controls - do this after a short delay to ensure DOM is ready
        setTimeout(function() {
            setupUIControlsDirectly();
        }, 100);
    } catch (error) {
        console.error("Error setting up input handlers:", error);
    }
}

function handleKeyDown(event) {
    console.log("Key pressed:", event.key);
    
    // Prevent default behavior for arrow keys and WASD
    if ([37, 38, 39, 40, 87, 65, 83, 68, 81, 69, 66, 86].includes(event.keyCode)) {
        event.preventDefault();
    }

    // Get key code
    const key = event.key.toLowerCase();
    
    // Move camera or perform action based on key pressed
    switch (key) {
        // Movement controls
        case 'w': // Move forward
            console.log("Moving forward");
            if (window.g_camera && typeof window.g_camera.moveForward === 'function') {
                window.g_camera.moveForward();
            }
            break;
        case 'a': // Move left
            console.log("Moving left");
            if (window.g_camera && typeof window.g_camera.moveLeft === 'function') {
                window.g_camera.moveLeft();
            }
            break;
        case 's': // Move backward
            console.log("Moving backward");
            if (window.g_camera && typeof window.g_camera.moveBackward === 'function') {
                window.g_camera.moveBackward();
            }
            break;
        case 'd': // Move right
            console.log("Moving right");
            if (window.g_camera && typeof window.g_camera.moveRight === 'function') {
                window.g_camera.moveRight();
            }
            break;
            
        // Camera controls
        case 'q': // Pan left
            console.log("Panning left");
            if (window.g_camera && typeof window.g_camera.panLeft === 'function') {
                window.g_camera.panLeft();
            }
            break;
        case 'e': // Pan right
            console.log("Panning right");
            if (window.g_camera && typeof window.g_camera.panRight === 'function') {
                window.g_camera.panRight();
            }
            break;
            
        // Build/Destroy controls
        case 'b': // Build mode
            console.log("Activating build mode");
            if (typeof window.addBlock === 'function') {
                window.addBlock();
            }
            break;
        case 'v': // Destroy mode
            console.log("Activating destroy mode");
            if (typeof window.removeBlock === 'function') {
                window.removeBlock();
            }
            break;
            
        default:
            // Other keys not handled
            break;
    }
}

function setupUIControlsDirectly() {
    console.log("Setting up UI controls directly...");
    
    // LIGHT TOGGLE BUTTON
    const lightingToggle = document.querySelector('button#toggle-lighting, button:contains("Toggle Lighting")');
    if (lightingToggle) {
        console.log("Found lighting toggle button");
        lightingToggle.onclick = function() {
            if (window.settings) {
                window.settings.lightingOn = !window.settings.lightingOn;
                this.textContent = window.settings.lightingOn ? "Toggle Lighting Off" : "Toggle Lighting On";
                console.log("Lighting toggled:", window.settings.lightingOn);
            }
        };
    } else {
        console.warn("Lighting toggle button not found");
    }
    
    // NORMAL VISUALIZATION TOGGLE
    const normalVizToggle = document.querySelector('button#toggle-normal-viz, button:contains("Toggle Normal")');
    if (normalVizToggle) {
        console.log("Found normal visualization toggle button");
        normalVizToggle.onclick = function() {
            if (window.settings) {
                window.settings.normalVisualization = !window.settings.normalVisualization;
                this.textContent = window.settings.normalVisualization ? "Toggle Normal Visualization Off" : "Toggle Normal Visualization On";
                console.log("Normal visualization toggled:", window.settings.normalVisualization);
            }
        };
    } else {
        console.warn("Normal visualization toggle button not found");
    }
    
    // SPOTLIGHT TOGGLE
    const spotLightToggle = document.querySelector('button#toggle-spot-light, button:contains("Toggle Spot")');
    if (spotLightToggle) {
        console.log("Found spotlight toggle button");
        spotLightToggle.onclick = function() {
            if (window.settings) {
                window.settings.spotLightOn = !window.settings.spotLightOn;
                this.textContent = window.settings.spotLightOn ? "Toggle Spot Light Off" : "Toggle Spot Light On";
                console.log("Spotlight toggled:", window.settings.spotLightOn);
            }
        };
    } else {
        console.warn("Spotlight toggle button not found");
    }
    
    // ANIMATION TOGGLE
    const runAnimationBtn = document.querySelector('button#run-animation, button:contains("Run Animation")');
    if (runAnimationBtn) {
        console.log("Found animation toggle button");
        runAnimationBtn.onclick = function() {
            if (window.settings) {
                window.settings.runAnimation = !window.settings.runAnimation;
                this.textContent = window.settings.runAnimation ? "Run Animation OFF" : "Run Animation ON";
                console.log("Animation toggled:", window.settings.runAnimation);
            }
        };
    } else {
        console.warn("Run animation button not found");
    }
    
    // Set up sliders by direct query
    const sliders = document.querySelectorAll('input[type="range"]');
    console.log("Found " + sliders.length + " sliders");
    
    sliders.forEach(slider => {
        const id = slider.id || slider.getAttribute('id');
        console.log("Setting up slider:", id);
        
        slider.oninput = function(event) {
            const value = parseFloat(event.target.value);
            console.log("Slider " + id + " value changed to", value);
            
            if (window.settings) {
                if (id === 'light-color' || id.includes('color')) {
                    const intensity = value / 100;
                    window.settings.lightColor = [intensity, intensity, intensity];
                    console.log("Light color updated:", window.settings.lightColor);
                } 
                else if (id === 'light-position' || id.includes('position')) {
                    window.settings.lightPos[1] = value / 10;
                    console.log("Light position updated:", window.settings.lightPos);
                }
                else if (id === 'light-angle' || id.includes('angle')) {
                    window.settings.lightAngle = value;
                    console.log("Light angle updated:", window.settings.lightAngle);
                }
                else if (id === 'camera-angle' || id.includes('camera')) {
                    window.settings.cameraAngle = value;
                    console.log("Camera angle updated:", window.settings.cameraAngle);
                }
                else if (id === 'spotlight-position' || id.includes('spotlight')) {
                    window.settings.spotlightPos[1] = value / 10;
                    console.log("Spotlight position updated:", window.settings.spotlightPos);
                }
            }
        };
    });
    
    // Add manual click handlers if all other methods fail
    const buttons = document.querySelectorAll('button');
    console.log("Found " + buttons.length + " buttons");
    
    buttons.forEach(button => {
        const text = button.textContent.toLowerCase();
        console.log("Button text:", text);
        
        if (!button.onclick) {
            if (text.includes('lighting')) {
                button.onclick = function() {
                    if (window.settings) {
                        window.settings.lightingOn = !window.settings.lightingOn;
                        this.textContent = window.settings.lightingOn ? "Toggle Lighting Off" : "Toggle Lighting On";
                        console.log("Lighting toggled via direct handler:", window.settings.lightingOn);
                    }
                };
            }
            else if (text.includes('normal')) {
                button.onclick = function() {
                    if (window.settings) {
                        window.settings.normalVisualization = !window.settings.normalVisualization;
                        this.textContent = window.settings.normalVisualization ? "Toggle Normal Visualization Off" : "Toggle Normal Visualization On";
                        console.log("Normal visualization toggled via direct handler:", window.settings.normalVisualization);
                    }
                };
            }
            else if (text.includes('spot')) {
                button.onclick = function() {
                    if (window.settings) {
                        window.settings.spotLightOn = !window.settings.spotLightOn;
                        this.textContent = window.settings.spotLightOn ? "Toggle Spot Light Off" : "Toggle Spot Light On";
                        console.log("Spotlight toggled via direct handler:", window.settings.spotLightOn);
                    }
                };
            }
            else if (text.includes('animation')) {
                button.onclick = function() {
                    if (window.settings) {
                        window.settings.runAnimation = !window.settings.runAnimation;
                        this.textContent = window.settings.runAnimation ? "Run Animation OFF" : "Run Animation ON";
                        console.log("Animation toggled via direct handler:", window.settings.runAnimation);
                    }
                };
            }
        }
    });
}

// Block manipulation functions
function activateBuildMode() {
    console.log("Build mode activated");
    if (typeof window.addBlock === 'function') {
        window.addBlock();
    }
}

function activateDestroyMode() {
    console.log("Destroy mode activated");
    if (typeof window.removeBlock === 'function') {
        window.removeBlock();
    }
}

// Make setup function available globally
window.setupInputHandlers = setupInputHandlers;