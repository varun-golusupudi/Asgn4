// Animation.js
let g_startTime = performance.now() / 1000.0;
let g_seconds = 0;

function setupAnimations() {
    // No setup needed initially, just export the update function
}

function updateAnimations(now) {
    g_seconds = (now * 0.001) - g_startTime; // Convert milliseconds to seconds
    if (settings.runAnimation) {
        console.log("Run animation started");
        const maxSwingAngle = 25;
        const maxLiftHeight = 0.2;

        // Right foot animation (inspired by student’s foot animation)
        const swingAngleR = Math.sin(4 * g_seconds) * maxSwingAngle;
        const liftHeightR = Math.abs(Math.sin(4 * g_seconds)) * maxLiftHeight;
        settings.footAngleR = swingAngleR;
        settings.footLiftR = liftHeightR;

        // Left foot animation (phase offset for alternation)
        const swingAngleL = Math.sin(4 * g_seconds + Math.PI) * maxSwingAngle;
        const liftHeightL = Math.abs(Math.sin(4 * g_seconds + Math.PI)) * maxLiftHeight;
        settings.footAngleL = swingAngleL;
        settings.footLiftL = liftHeightL;

        // Body rotation (inspired by student’s body angle)
        settings.bodyAngle = Math.sin(4 * g_seconds) * 5;
    }
}

// Export for use in other files
window.setupAnimations = setupAnimations;
window.updateAnimations = updateAnimations;