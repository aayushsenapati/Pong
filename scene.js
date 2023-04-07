const BABYLON = require('babylonjs');
const { Engine, Scene, FreeCamera, HemisphericLight } = BABYLON;

// Create a new Babylon.js engine
const canvas = { width: 640, height: 480 }; // Set the size of the canvas
const engine = new Engine(null, true, { preserveDrawingBuffer: true });

// Create a new Babylon.js scene
const scene = new Scene(engine);

// Add a camera to the scene
const camera = new FreeCamera('camera', new BABYLON.Vector3(0, 0, -10), scene);

// Add a light to the scene
const light = new HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

// Render the scene
engine.runRenderLoop(() => {
    scene.render();
});