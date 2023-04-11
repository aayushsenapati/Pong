const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname + "/public"));

const rooms = {};

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", (roomId) => {
        if (roomId in rooms && rooms[roomId] < 2) {
            rooms[roomId] += 1;
            socket.join(roomId);
            socket.emit("joinedRoom", roomId);
            console.log(rooms)
            io.to(roomId).emit("userJoined", socket.id);
        }
        else if(roomId in rooms){
            socket.emit("roomFull");
        }
        else {
            socket.emit("roomNotFound");
        }
    });

    socket.on("createRoom", () => {
        const roomId = Math.floor(Math.random()*10000);
        rooms[roomId] = 1;
        console.log(rooms)
        socket.join(roomId);
        socket.emit("createdRoom", roomId);
    });
});

http.listen(3000, () => {
    console.log("Listening on port 3000");
});
