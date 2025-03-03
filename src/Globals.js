// Globals.js
// Global variables and constants for WebGL application

// World constants
const worldSize = 32; // Size of the world grid (32x32)
const carrotBlock = 1; // ID for carrot block type

// Global variables
let g_map = []; // World map data
let g_startTime = 0; // Animation start time
let g_seconds = 0; // Animation time in seconds
let bunnyHappiness = 0; // Happiness level of bunny

// Make globals available
window.worldSize = worldSize;
window.carrotBlock = carrotBlock;
window.g_map = g_map;
window.g_startTime = g_startTime;
window.g_seconds = g_seconds;
window.bunnyHappiness = bunnyHappiness;