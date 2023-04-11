const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.Server(app);
const io = socketIO(server);

app.use(express.static('public'));

// Store all the rooms
const rooms = {};

// When a new connection is made
io.on("connection", (socket) => {
    console.log("New user connected", socket.id);

    // When the user joins a room
    socket.on("joinRoom", (roomName) => {
        // Create the room if it doesn't exist
        if (!rooms[roomName]) {
            rooms[roomName] = {
                players: [socket],
                ballPosition: { x: 0, y: 0, z: 0 },
                leftPaddlePosition: 0,
                rightPaddlePosition: 0,
            };
        } else {
            // Add the player to the existing room
            rooms[roomName].players.push(socket);
        }

        // Join the room
        socket.join(roomName);

        // Notify the user that they have joined the room
        socket.emit("roomJoined", roomName);

        // Notify all other players in the room that a new player has joined
        socket.to(roomName).emit("playerJoined", socket.id);

        // When the user moves their paddle, update the position and notify all other players in the room
        socket.on("paddleMoved", (data) => {
            if (data.player === "left") {
                rooms[roomName].leftPaddlePosition = data.position;
            } else if (data.player === "right") {
                rooms[roomName].rightPaddlePosition = data.position;
            }

            socket.to(roomName).emit("paddleMoved", data);
        });

        // When the ball moves, update the position and notify all other players in the room
        socket.on("ballMoved", (data) => {
            rooms[roomName].ballPosition = data;
            socket.to(roomName).emit("ballMoved", data);
        });

        // When the user disconnects
        socket.on("disconnect", () => {
            console.log("User disconnected");

            // Remove the player from the room
            if (rooms[roomName]) {
                const index = rooms[roomName].players.indexOf(socket);
                if (index !== -1) {
                    rooms[roomName].players.splice(index, 1);
                    socket.to(roomName).emit("playerLeft", socket.id);

                    // If there are no more players in the room, delete the room
                    if (rooms[roomName].players.length === 0) {
                        delete rooms[roomName];
                    }
                }
            }
        });
    });
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});