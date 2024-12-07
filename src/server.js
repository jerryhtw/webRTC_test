import express from "express";
import http from "http";
import SocketIO from "socket.io";

const app = express();

// http 스타일의 req, res style
app.set("view engine","pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));


app.get("/", (req,res) =>res.render("home"));
app.get("/*", (req,res) =>res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", socket=>{
    // app.js에서 만든 "enter_room" 이벤트에 대해 반응
    socket.on("enter_room", (msg, callback)=> {
        console.log(msg);
        setTimeout(()=>{
            callback();
        }, 10000);
    });
});


// const sockets = [];

// wss.on("connection", (socket)=>{
//     // 연결된 client 저장 
//     sockets.push(socket);
//     // default nickname 설정
//     socket["nickname"] = "anonymous";
//     console.log("Connected to Browser");
//     socket.on("message", (message)=>{
//         const parsed = JSON.parse(message);
//         if(parsed.type === "nickname"){
//             socket["nickname"] = parsed.payload;
//         }else if((parsed.type === "new_message")){
//             sockets.forEach(aSocket=>aSocket.send(`${socket.nickname} : ${parsed.payload}`));
//         }
//     })
//     socket.on("close", ()=>{
        
//         console.log("Disconnected from the browser");
//     });
// });

httpServer.listen(3000, handleListen);