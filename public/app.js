let canvas = document.getElementById("gameCanvas");
let engine = new BABYLON.Engine(canvas, true);

let createScene = function () {
    
    let physicsPlugin = new BABYLON.CannonJSPlugin();
    let scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), physicsPlugin);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    let material = new BABYLON.StandardMaterial("material", scene);
    let material1 = new BABYLON.StandardMaterial("material", scene);
    material.diffuseColor = new BABYLON.Color3(255, 1, 1);

    // Light
    let light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 10, 0), scene);
    light.intensity = 0.8;

    // Create a plane
    let plane = BABYLON.MeshBuilder.CreatePlane("plane", { size: 10 }, scene);
    plane.position.y = 0;
    plane.rotation.x = Math.PI / 2;

    // Create paddles and walls

    let wall1 = BABYLON.MeshBuilder.CreateBox("wall1", { height: 1, width: 10, depth: 0.3 }, scene);  //wall farthest from camera
    wall1.material = material;
    wall1.position.x = 4.5;
    wall1.position.z = 0;
    wall1.rotation.y = Math.PI / 2;
    
    let wall2 = BABYLON.MeshBuilder.CreateBox("wall2", { height: 1, width: 10, depth: 0.3 }, scene); //wall closest to camera
    wall2.material = material;
    wall2.position.x = -4.75;
    wall2.position.z = 0;
    wall2.rotation.y = Math.PI / 2;
    
    let wall3 = BABYLON.MeshBuilder.CreateBox("wall3", { height: 1, width: 10, depth: 0.3 }, scene); //wall to the right of camera
    wall3.material = material;
    wall3.position.x = 0;
    wall3.position.z = -4.8;

    let wall4 = BABYLON.MeshBuilder.CreateBox("wall4", { height: 1, width: 10, depth: 0.3 }, scene); //wall to the left of camera
    wall4.material = material;
    wall4.position.x = 0;
    wall4.position.z = 4.8;
    
    let leftPaddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", { height: 0.5, width: 0.5, depth: 2 }, scene);
    leftPaddle.material = material;
    let rightPaddle = BABYLON.MeshBuilder.CreateBox("rightPaddle", { height: 0.5, width: 0.5, depth: 2 }, scene);
    leftPaddle.position.x = -4;
    rightPaddle.position.x = 4;
    
    leftPaddle.position.y = rightPaddle.position.y = 0.3;

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
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physicsPlugin);
    plane.physicsImpostor = new BABYLON.PhysicsImpostor(plane, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1 }, scene);
<<<<<<< HEAD
    leftPaddle.physicsImpostor = new BABYLON.PhysicsImpostor(leftPaddle, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0,  friction: 10000, restitution: 1 }, scene);
    rightPaddle.physicsImpostor = new BABYLON.PhysicsImpostor(rightPaddle, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1 }, scene);
=======
    leftPaddle.physicsImpostor = new BABYLON.PhysicsImpostor(leftPaddle, BABYLON.PhysicsImpostor.BoxImpostor, { mass:0,  restitution: 1 }, scene);
    rightPaddle.physicsImpostor = new BABYLON.PhysicsImpostor(rightPaddle, BABYLON.PhysicsImpostor.BoxImpostor, { mass:0, restitution: 1 }, scene);
>>>>>>> c7785d0846ae8dd0e07b59a73ae41e6cf18e76e1
    wall4.physicsImpostor = new BABYLON.PhysicsImpostor(wall4, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1  }, scene);
    wall1.physicsImpostor = new BABYLON.PhysicsImpostor(wall1, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1  }, scene);
    wall2.physicsImpostor = new BABYLON.PhysicsImpostor(wall2, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1  }, scene);
    wall3.physicsImpostor = new BABYLON.PhysicsImpostor(wall3, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1  }, scene);
    ball.physicsImpostor = new BABYLON.PhysicsImpostor(ball, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 1  }, scene);
    
  
    
    // Add event listener to move left paddle
    document.addEventListener('keydown', function (event) {
        if (event.code === 'KeyA' && leftPaddle.position.z < 4) {
            leftPaddle.position.z += 0.5;
            socket.emit('paddleMoved', { player: 'left', position: leftPaddle.position.z });
        } else if (event.code === 'KeyD' && leftPaddle.position.z > -4) {
            leftPaddle.position.z -= 0.5;
            socket.emit('paddleMoved', { player: 'left', position: leftPaddle.position.z });
        }
    });
    
    
    ball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(5, 0, Math.random()*10));
    // Create variables for ball movement
    // Create variables for ball movement
    let xDirection = Math.random() < 0.5 ? -1 : 1;
    let zDirection = Math.random() < 0.5 ? -1 : 1;
    
    // Move the ball
    let moveBall = function () {
        //ball.position.x += xDirection * 0.04;
        // ball.position.z += zDirection * 0.04;
        
        //wall collision handlers 
        let vel = ball.physicsImpostor.getLinearVelocity();
        ball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(vel.x, 0, vel.z));

          ball.physicsImpostor.registerOnPhysicsCollide(leftPaddle.physicsImpostor, (main, collided) => {
           
           
            
          });
          ball.physicsImpostor.registerOnPhysicsCollide(wall1.physicsImpostor, (main, collided) => {
            
            
            material1.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
            ball.material = material1;
          });
          ball.physicsImpostor.registerOnPhysicsCollide(wall2.physicsImpostor, (main, collided) => {
            material1.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
            ball.material = material1;
          
          });
          ball.physicsImpostor.registerOnPhysicsCollide(wall3.physicsImpostor, (main, collided) => {
            material1.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
            ball.material = material1;
          });
          ball.physicsImpostor.registerOnPhysicsCollide(wall4.physicsImpostor, (main, collided) => {
            material1.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
            ball.material = material1;
          });

        // Check for collisions with the paddles
        if (ball.intersectsMesh(leftPaddle, false)) {
            xDirection = 1;
        } else if (ball.intersectsMesh(rightPaddle, false)) {
            xDirection = -1;
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

