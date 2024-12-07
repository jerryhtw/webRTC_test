import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

// http 스타일의 req, res style
app.set("view engine","pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));


app.get("/", (req,res) =>res.render("home"));
app.get("/*", (req,res) =>res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

wss.on("connection", (socket)=>{
    //console.log(socket);
    console.log("Connected to Browser");
    socket.on("message", (message)=>{
        console.log("Incoming message is : ", message.toString());
    })
    socket.on("close", ()=>{
        console.log("Disconnected from the browser");
    });
    socket.send("hello!");
});

server.listen(3000, handleListen);