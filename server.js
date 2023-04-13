const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname + "/public"));

const rooms = {};
var xDirection = Math.random() < 0.6 ? -1 : 1;
var yDirection = Math.random() < 0.6 ? -1 : 1;


var ballPos0 = { x: 3, z: 4 };


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

    socket.on("padCollide",()=>{
        xDirection*=-1;
        //yDirection*=Math.floor(Math.random()*10);
        //console.log(xDirection,yDirection)
    })

    socket.on("lost",()=>{
        socket.to(Array.from(socket.rooms)[1]).emit("win");
    })

    

    socket.on("getBallPos", () => {
        var ballPos1 = { x: -ballPos0.x, z: -ballPos0.z };
        if (ballPos0.z <= -5.75 || ballPos0.z >= 5.75) {
            yDirection *= -1;
        }
        if (ballPos0.x <= -5.75 || ballPos0.x >= 5.75) {
            xDirection *= -1;
        }
        ballPos0.x += xDirection * 0.035;
        ballPos0.z += yDirection * 0.035;
        //yDirection=yDirection/Math.abs(yDirection)
        //console.log("ball mov",yDirection)
        const roomIds = Array.from(socket.rooms);
        const idObj = io.sockets.adapter.rooms.get(roomIds[1])
        if (idObj) {
            const clients = Array.from(idObj)
            //console.log(ballPos0,ballPos1)
            io.to(clients[0]).emit("ballReply", ballPos0);
            io.to(clients[1]).emit("ballReply", ballPos1);
        }
    });

});

http.listen(3000, () => {
    console.log("Listening on port 3000");
});
