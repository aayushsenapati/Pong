let canvas = document.getElementById("gameCanvas");
let engine = new BABYLON.Engine(canvas, true);

let createScene = function () {
    let scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    let material = new BABYLON.StandardMaterial("material", scene);
    material.diffuseColor = new BABYLON.Color3(255, 1, 1);

    // Light
    let light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 10, 0), scene);
    light.intensity = 0.8;

    // Create a plane
    let plane = BABYLON.MeshBuilder.CreatePlane("plane", { size: 10 }, scene);
    plane.position.y = 0;
    plane.rotation.x = Math.PI / 2;

    // Create paddles
    let leftPaddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", { height: 0.5, width: 0.5, depth: 2 }, scene);
    leftPaddle.material = material;
    let rightPaddle = BABYLON.MeshBuilder.CreateBox("rightPaddle", { height: 0.5, width: 0.5, depth: 2 }, scene);
    leftPaddle.position.x = -4;
    rightPaddle.position.x = 4;
    leftPaddle.position.y = rightPaddle.position.y = 0.5;

    // Create ball
    let ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 0.5 }, scene);
    ball.position.y = 0.5;


    // Camera
    let camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(-6, 3, 0), scene);
    camera.rotation.y = Math.PI / 2; // rotate the camera to face the other paddle
    camera.rotation.x = Math.PI / 5; 

    // Attach the camera to the left paddle
    //camera.parent = leftPaddle;
    camera.position = new BABYLON.Vector3(-10, 5, 0); // adjust the camera position to be behind the left paddle



    // Set physics properties
    let physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physicsPlugin);
    plane.physicsImpostor = new BABYLON.PhysicsImpostor(plane, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
    leftPaddle.physicsImpostor = new BABYLON.PhysicsImpostor(leftPaddle, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 100000, restitution: 0.1 }, scene);
    rightPaddle.physicsImpostor = new BABYLON.PhysicsImpostor(rightPaddle, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 100000, restitution: 0.1 }, scene);
    ball.physicsImpostor = new BABYLON.PhysicsImpostor(ball, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 1.0 }, scene);

    // Add event listener to move left paddle
    document.addEventListener('keydown', function (event) {
        if (event.code === 'KeyA' && leftPaddle.position.z < 4) {
            leftPaddle.position.z += 0.5;
            socket.emit('paddleMoved', { player: 'left', position: leftPaddle.position.z });
        } else if (event.code === 'KeyZ' && leftPaddle.position.z > -4) {
            leftPaddle.position.z -= 0.5;
            socket.emit('paddleMoved', { player: 'left', position: leftPaddle.position.z });
        }
    });

    // Create variables for ball movement
    // Create variables for ball movement
    let xDirection = Math.random() < 0.5 ? -1 : 1;
    let zDirection = Math.random() < 0.5 ? -1 : 1;

    // Move the ball
    let moveBall = function () {
        ball.position.x += xDirection * 0.1;
        ball.position.z += zDirection * 0.1;

        // Check for collisions with the paddles
        if (ball.intersectsMesh(leftPaddle, false)) {
            xDirection = 1;
        } else if (ball.intersectsMesh(rightPaddle, false)) {
            xDirection = -1;
        }

        // Check for collisions with the walls
        if (ball.position.x < -4.5 || ball.position.x > 4.5) {
            xDirection *= -1;
        }
        if (ball.position.z < -4.5 || ball.position.z > 4.5) {
            zDirection *= -1;
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

