let canvas = document.getElementById("gameCanvas");
let engine = new BABYLON.Engine(canvas, true);
var socket;

let createScene = function () {
    socket=io().connect()
    let scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    let material = new BABYLON.StandardMaterial("material", scene);
    material.diffuseColor = new BABYLON.Color3(255, 1, 1);

    // Light
    let light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 10, 0), scene);
    light.intensity = 0.8;

    // Create a plane
    let plane = BABYLON.MeshBuilder.CreatePlane("plane", { size: 12 }, scene);
    plane.position.y = 0;
    plane.rotation.x = Math.PI / 2;

    // Create paddles
    let leftPaddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", { height: 0.5, width: 0.1, depth: 2 }, scene);
    leftPaddle.material = material;
    let rightPaddle = BABYLON.MeshBuilder.CreateBox("rightPaddle", { height: 0.5, width: 0.1, depth: 2 }, scene);
    leftPaddle.position.x = -5.95;
    rightPaddle.position.x = 5.95;
    leftPaddle.position.y = rightPaddle.position.y = 0.25;

    // Create ball
    let ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 0.5 }, scene);
    ball.position.y = 0.5;

    let leftWall= BABYLON.MeshBuilder.CreateBox("leftWall", { height: 0.5, width: 0.1, depth: 12 }, scene);
    leftWall.position.x = -6.05;

    let rightWall= BABYLON.MeshBuilder.CreateBox("leftWall", { height: 0.5, width: 0.1, depth: 12 }, scene);
    rightWall.position.x = 6.05;

    


    // Camera
    let camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(-9, 3, 0), scene);
    camera.rotation.y = Math.PI / 2; // rotate the camera to face the other paddle
    camera.rotation.x = Math.PI / 6;

    // Attach the camera to the left paddle
    //camera.parent = leftPaddle;
    camera.position = new BABYLON.Vector3(-12, 7, 0); // adjust the camera position to be behind the left paddle

    
    

    // Set physics properties
    let physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physicsPlugin);
    
    plane.physicsImpostor = new BABYLON.PhysicsImpostor(plane, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.2 }, scene);
    leftPaddle.physicsImpostor = new BABYLON.PhysicsImpostor(leftPaddle, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 10000, restitution: 0.1, ignoreGravity: true }, scene);
    leftWall.physicsImpostor = new BABYLON.PhysicsImpostor(leftWall, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1,ignoreGravity:true}, scene);
    rightWall.physicsImpostor = new BABYLON.PhysicsImpostor(rightWall, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1,ignoreGravity:true}, scene);
    rightPaddle.physicsImpostor = new BABYLON.PhysicsImpostor(rightPaddle, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 10000, restitution: 0.1, ignoreGravity: true }, scene);
    ball.physicsImpostor = new BABYLON.PhysicsImpostor(ball, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 1}, scene);

    // Add event listener to move left paddle
    document.addEventListener('keydown', function (event) {
        if (event.code === 'KeyA' && leftPaddle.position.z < 5) {
            leftPaddle.position.z += 0.5;
            //socket.emit('paddleMoved', { player: 'left', position: leftPaddle.position.z });
        } else if (event.code === 'KeyD' && leftPaddle.position.z > -5) {
            leftPaddle.position.z -= 0.5;
            //socket.emit('paddleMoved', { player: 'left', position: leftPaddle.position.z });
        }
    });
    // Create variables for ball movement
    let xDirection = Math.random() < 0.6 ? -1 : 1;
    let yDirection = Math.random() < 0.6 ? -1 : 1;

    // Move the ball
    let moveBall = function () {

        let leftPaddlePos =  {x:leftPaddle.position.x, y:leftPaddle.position.y, z:leftPaddle.position.z};
        socket.emit("paddlePosition",leftPaddlePos);
        ball.position.x += xDirection * 0.1;
        ball.position.z += yDirection * 0.1;

        
        // Set up the collision callback for the ball
        

        ball.physicsImpostor.registerOnPhysicsCollide(leftPaddle.physicsImpostor, function(main, collided) {
            xDirection = 1;
        });
        ball.physicsImpostor.registerOnPhysicsCollide(rightPaddle.physicsImpostor, function(main, collided) {
            xDirection = -1;
        });
        ball.physicsImpostor.registerOnPhysicsCollide(leftWall.physicsImpostor, function(main, collided) {
            xDirection = 1;
        });
        ball.physicsImpostor.registerOnPhysicsCollide(rightWall.physicsImpostor, function(main, collided) {
            xDirection = -1;
        });
        
    
    // Check for collisions with the walls
    /* if (ball.position.x <= -5.75 || ball.position.x >= 5.75) {
        xDirection *= -1;
    } */
    if (ball.position.z <= -5.75 || ball.position.z >= 5.75) {
        yDirection *= -1;
    }
};

// Start the game loop
scene.onBeforeRenderObservable.add(function () {
    moveBall();
    
});

return scene;
};

let scene = createScene();

// Resize the canvas when the window is resized
window.addEventListener("resize", function () {
    engine.resize();
});

// Start the engine
engine.runRenderLoop(function () {
    
    scene.render();
});

