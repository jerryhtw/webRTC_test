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

const sockets = [];

wss.on("connection", (socket)=>{
    // 연결된 client 저장 
    sockets.push(socket);
    // default nickname 설정
    socket["nickname"] = "anonymous";
    //console.log(socket);
    console.log("Connected to Browser");
    socket.on("message", (message)=>{
        const parsed = JSON.parse(message);
        if(parsed.type === "nickname"){
            socket["nickname"] = parsed.payload;
        }else if((parsed.type === "new_message")){
            sockets.forEach(aSocket=>aSocket.send(`${socket.nickname} : ${parsed.payload}`));
        }
    })
    socket.on("close", ()=>{
        
        console.log("Disconnected from the browser");
    });
});

server.listen(3000, handleListen);