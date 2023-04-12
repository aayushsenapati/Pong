const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname + "/public"));

const rooms = {};



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


        const roomIds = Array.from(socket.rooms);
        console.log(roomIds);
        console.log("paddlePosition updated");
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
});

http.listen(3000, () => {
    console.log("Listening on port 3000");
});
