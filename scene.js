// Import the required modules
import * as BABYLON from 'babylonjs';
const socket = io();


// Create the game scene
const canvas = document.getElementById('gameCanvas');
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// Create the camera
const camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 5, new BABYLON.Vector3(0, 0, 0), scene);
camera.attachControl(canvas, true);

// Create the playing field
const playingField = BABYLON.MeshBuilder.CreateBox('playingField', { width: 4, height: 0.1, depth: 2 }, scene);
playingField.position.y = -0.05;
const playingFieldMaterial = new BABYLON.StandardMaterial('playingFieldMaterial', scene);
playingFieldMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
playingFieldMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
playingField.material = playingFieldMaterial;

// Create the paddles
const paddleWidth = 0.2;
const paddleHeight = 0.5;
const paddleDepth = 0.1;
const paddleDistanceFromWall = 1.8;
const paddleMaterial = new BABYLON.StandardMaterial('paddleMaterial', scene);
paddleMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
paddleMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

const leftPaddle = BABYLON.MeshBuilder.CreateBox('leftPaddle', { width: paddleWidth, height: paddleHeight, depth: paddleDepth }, scene);
leftPaddle.position.x = -paddleDistanceFromWall;
leftPaddle.position.y = paddleHeight / 2 - 0.05;
leftPaddle.material = paddleMaterial;

const rightPaddle = BABYLON.MeshBuilder.CreateBox('rightPaddle', { width: paddleWidth, height: paddleHeight, depth: paddleDepth }, scene);
rightPaddle.position.x = paddleDistanceFromWall;
rightPaddle.position.y = paddleHeight / 2 - 0.05;
rightPaddle.material = paddleMaterial;

// Create the ball
const ballRadius = 0.1;
const ballMaterial = new BABYLON.StandardMaterial('ballMaterial', scene);
ballMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
ballMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

const ball = BABYLON.MeshBuilder.CreateSphere('ball', { diameter: ballRadius * 2 }, scene);
ball.position.y = ballRadius;
ball.material = ballMaterial;

// Add physics to the ball and paddles
const physicsPlugin = new BABYLON.CannonJSPlugin();
scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physicsPlugin);
playingField.physicsImpostor = new BABYLON.PhysicsImpostor(playingField, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0, restitution: 1 }, scene);
leftPaddle.physicsImpostor = new BABYLON.PhysicsImpostor(leftPaddle, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, friction: 0, restitution: 1 }, scene);
rightPaddle.physicsImpostor = new BABYLON.PhysicsImpostor(rightPaddle, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, friction: 0, restitution: 1 }, scene);

ball.physicsImpostor = new BABYLON.PhysicsImpostor(ball, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, friction: 0, restitution: 1 }, scene);

// Set up the game loop
engine.runRenderLoop(() => {
// Move the ball
ball.physicsImpostor.setLinearVelocity(ball.physicsImpostor.getLinearVelocity().scale(0.99));

// Check if the ball collides with the walls
if (ball.intersectsMesh(playingField, false)) {
ball.physicsImpostor.setLinearVelocity(ball.physicsImpostor.getLinearVelocity().multiply(new BABYLON.Vector3(1, -1, 1)));
}

// Check if the ball collides with the paddles
if (ball.intersectsMesh(leftPaddle, false)) {
ball.physicsImpostor.setLinearVelocity(ball.physicsImpostor.getLinearVelocity().multiply(new BABYLON.Vector3(-1, 1, 1)));
}
if (ball.intersectsMesh(rightPaddle, false)) {
ball.physicsImpostor.setLinearVelocity(ball.physicsImpostor.getLinearVelocity().multiply(new BABYLON.Vector3(-1, 1, 1)));
}

// Move the paddles
const leftPaddleMovement = Math.min(Math.max(leftPaddleMovement, -1), 1);
const rightPaddleMovement = Math.min(Math.max(rightPaddleMovement, -1), 1);
leftPaddle.position.z += leftPaddleMovement * 0.1;
rightPaddle.position.z += rightPaddleMovement * 0.1;

// Limit the movement of the paddles
if (leftPaddle.position.z < -0.9) {
leftPaddle.position.z = -0.9;
}
if (leftPaddle.position.z > 0.9) {
leftPaddle.position.z = 0.9;
}
if (rightPaddle.position.z < -0.9) {
rightPaddle.position.z = -0.9;
}
if (rightPaddle.position.z > 0.9) {
rightPaddle.position.z = 0.9;
}

// Render the scene
scene.render();
});

// Handle user input
let leftPaddleMovement = 0;
let rightPaddleMovement = 0;
document.addEventListener('keydown', (event) => {
if (event.code === 'KeyW') {
leftPaddleMovement = -1;
}
if (event.code === 'KeyS') {
leftPaddleMovement = 1;
}
if (event.code === 'ArrowUp') {
rightPaddleMovement = -1;
}
if (event.code === 'ArrowDown') {
rightPaddleMovement = 1;
}
});
document.addEventListener('keyup', (event) => {
if (event.code === 'KeyW' && leftPaddleMovement === -1) {
leftPaddleMovement = 0;
}
if (event.code === 'KeyS' && leftPaddleMovement === 1) {
leftPaddleMovement = 0;
}
if (event.code === 'ArrowUp' && rightPaddleMovement === -1) {
rightPaddleMovement = 0;
}
if (event.code === 'ArrowDown' && rightPaddleMovement === 1) {
rightPaddleMovement = 0;
}
});

// Set up multiplayer support using Socket.io

socket.on('connect', () => {
console.log('Connected to server');
});

socket.on('disconnect', () => {
console.log('Disconnected from server');
});

socket.on('leftPaddleMovement', (movement) => {
leftPaddleMovement = movement;
});

socket.on('rightPaddleMovement', (movement) => {
rightPaddleMovement = movement;
});

setInterval(() => {
socket.emit('ballPosition', {
x: ball.position.x,
y: ball.position.y,
z: ball.position.z,
});
}, 1000 / 30);

socket.on('ballPosition', (position) => {
ball.position.x = position.x;
ball.position.y = position.y;
ball.position.z = position.z;
});

socket.on('scoreUpdate', (score) => {
    console.log(`Score: ${score.left} - ${score.right}`);
  }); 

// Set up game logic
let leftScore = 0;
let rightScore = 0;

setInterval(() => {
if (ball.position.x < -9) {
rightScore++;
ball.position = new BABYLON.Vector3(0, 0, 0);
ball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(5, 0, 5));
socket.emit('scoreUpdate', {
left: leftScore,
right: rightScore,
});
}
if (ball.position.x > 9) {
leftScore++;
ball.position = new BABYLON.Vector3(0, 0, 0);
ball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(-5, 0, -5));
socket.emit('scoreUpdate', {
left: leftScore,
right: rightScore,
});
}
}, 100);

socket.on('resetBall', () => {
ball.position = new BABYLON.Vector3(0, 0, 0);
ball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(5, 0, 5));
});

socket.on('resetScores', () => {
leftScore = 0;
rightScore = 0;
});

// Start the game loop
engine.runRenderLoop(() => {
// Move the ball
ball.physicsImpostor.setLinearVelocity(ball.physicsImpostor.getLinearVelocity().scale(0.99));

// Check if the ball collides with the walls
if (ball.intersectsMesh(playingField, false)) {
ball.physicsImpostor.setLinearVelocity(ball.physicsImpostor.getLinearVelocity().multiply(new BABYLON.Vector3(1, -1, 1)));
}

// Check if the ball collides with the paddles
if (ball.intersectsMesh(leftPaddle, false)) {
ball.physicsImpostor.setLinearVelocity(ball.physicsImpostor.getLinearVelocity().multiply(new BABYLON.Vector3(-1, 1, 1)));
socket.emit('ballHit', 'left');
}
if (ball.intersectsMesh(rightPaddle, false)) {
ball.physicsImpostor.setLinearVelocity(ball.physicsImpostor.getLinearVelocity().multiply(new BABYLON.Vector3(-1, 1, 1)));
socket.emit('ballHit', 'right');
}

// Move the paddles
const leftPaddleMovement = Math.min(Math.max(leftPaddleMovement, -1), 1);
const rightPaddleMovement = Math.min(Math.max(rightPaddleMovement, -1), 1);
leftPaddle.position.z += leftPaddleMovement * 0.1;
// Move the right paddle
rightPaddle.position.z += rightPaddleMovement * 0.1;

// Render the scene
scene.render();
});

// Set up the window resize handler
window.addEventListener('resize', () => {
engine.resize();
});

// Set up the keyboard input handlers
window.addEventListener('keydown', (event) => {
if (event.keyCode === 87) {
// W key
leftPaddleMovement = 1;
socket.emit('leftPaddleMovement', leftPaddleMovement);
} else if (event.keyCode === 83) {
// S key
leftPaddleMovement = -1;
socket.emit('leftPaddleMovement', leftPaddleMovement);
} else if (event.keyCode === 38) {
// Up arrow
rightPaddleMovement = 1;
socket.emit('rightPaddleMovement', rightPaddleMovement);
} else if (event.keyCode === 40) {
// Down arrow
rightPaddleMovement = -1;
socket.emit('rightPaddleMovement', rightPaddleMovement);
}
});

window.addEventListener('keyup', (event) => {
if (event.keyCode === 87 || event.keyCode === 83) {
leftPaddleMovement = 0;
socket.emit('leftPaddleMovement', leftPaddleMovement);
} else if (event.keyCode === 38 || event.keyCode === 40) {
rightPaddleMovement = 0;
socket.emit('rightPaddleMovement', rightPaddleMovement);
}
});

// Reset the game when the reset button is clicked
const resetButton = document.getElementById('reset-button');
resetButton.addEventListener('click', () => {
socket.emit('resetBall');
});

// Reset the scores when the reset scores button is clicked
const resetScoresButton = document.getElementById('reset-scores-button');
resetScoresButton.addEventListener('click', () => {
socket.emit('resetScores');
});

// Handle ball hits
socket.on('ballHit', (side) => {
const hitSound = new BABYLON.Sound('hitSound', 'sounds/hit.mp3', scene);
hitSound.play();
});

// Start the game
socket.emit('startGame');
