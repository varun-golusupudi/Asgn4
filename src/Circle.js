// Circle.js
class Circle {
    constructor() {
        this.type = 'circle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 10;
    }

    render() {
        const xy = this.position;
        const rgba = this.color;
        const size = this.size;

        gl.uniform4f(gl.getUniformLocation(shaderProgram, "u_FragColor"), rgba[0], rgba[1], rgba[2], rgba[3]);

        const d = this.size / 200.0; // Delta for size
        const angleStep = 360 / this.segments;

        for (let angle = 0; angle < 360; angle += angleStep) {
            const centerPt = [xy[0], xy[1], xy[2]];
            const angle1 = angle;
            const angle2 = angle + angleStep;
            const vec1 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d, 0];
            const vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d, 0];
            const pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1], centerPt[2] + vec1[2]];
            const pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1], centerPt[2] + vec2[2]];

            drawTriangle3D([xy[0], xy[1], xy[2], pt1[0], pt1[1], pt1[2], pt2[0], pt2[1], pt2[2]], [0, 0, 1, 0, 0, 1, 0, 0, 1]);
        }
    }
}

// Export for use in other files
window.Circle = Circle;