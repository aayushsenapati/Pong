const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname + "/public"));

const rooms = {};
var xDirection = Math.random() < 0.6 ? -1 : 1;
var yDirection = Math.random() < 0.6 ? -1 : 1;


var ballPos = { x: 0, z: 0 };
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", (roomId) => {
        roomId = parseInt(roomId)
        if (roomId in rooms && rooms[roomId] < 2) {
            rooms[roomId] += 1;
            socket.join(roomId);
            socket.emit("joinedRoom", roomId);
            console.log(rooms)

            io.in(roomId).emit("userJoined", socket.id);
            io.in(roomId).emit("startGame");
        }
        else if (roomId in rooms) {
            socket.emit("roomFull");
        }
        else {
            socket.emit("roomNotFound");
        }
    });

    socket.on("paddlePos", (data) => {
        //console.log("look here",socket.rooms)
        const roomIds = Array.from(socket.rooms);
        //console.log("paddlePosition updated");
        const clients = Array.from(io.sockets.adapter.rooms.get(roomIds[1]))
        //console.log(clients,typeof(clients))
        socket.to(roomIds[1]).emit("paddleReply", data);
    });

    socket.on("createRoom", () => {
        const roomId = Math.floor(Math.random() * 10000);
        rooms[roomId] = 1;
        console.log(rooms)
        socket.join(roomId);
        console.log("debug creat", socket.rooms)
        socket.emit("createdRoom", roomId);
    });

    socket.on("getBallPos", () => {
        const roomIds = Array.from(socket.rooms);
        const clients = Array.from(io.sockets.adapter.rooms.get(roomIds[1]))
        //console.log(clients,typeof(clients))
        io.to(clients[0]).emit("ballReply", ballPos);
        io.to(clients[1]).emit("ballReply", ballPos);
    });

});

http.listen(3000, () => {
    console.log("Listening on port 3000");
});
