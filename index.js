const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const users = {
    number: 0
};

io.on("connection", (socket) => {
    socket.on("new-user-joined", name => {
        users[socket.id] = name;
        users.number++;
        socket.broadcast.emit("user-joined", `${name} joined the chat.`);
        io.emit("online users", (users.number > 1) ? `${users.number} users are online` : `${users.number} user is online`);
    });

    socket.on("disconnect", () => {
        users.number--;
        console.log(users);
        socket.broadcast.emit("disconnect message", users[socket.id] + " left the chat");
        delete users[socket.id];
        socket.broadcast.emit("online users", (users.number > 1) ? `${users.number} users are online` : `${users.number} user is online`);
    });

    socket.on("chat message", (msg) => {
        socket.broadcast.emit("chat message", users[socket.id] + " : " + msg);
    });
    
});

// io.on("connection", (socket) => { //to send and recieve message of myself
//     socket.on("chat message", (msg) => {
//         io.emit("chat message", msg);
//     });
// });

server.listen(3000, () => {
    console.log("Server is running on port 3000.");
});