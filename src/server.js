import express from "express";
import http from "http";
import {Server} from "socket.io";
import {instrument} from "@socket.io/admin-ui";

const app = express();

// http 스타일의 req, res style
app.set("view engine","pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));


app.get("/", (req,res) =>res.render("home"));
app.get("/*", (req,res) =>res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors : {
        origin : ["https://admin.socket.io"],
        credentials : true
}});

instrument(wsServer, {
    auth : false,
});


function publicRooms(){
    const {
        sockets : {
            adapter : {sids, rooms},
        }
    } = wsServer;

    const publicRooms = [];
    rooms.forEach((_, key)=>{
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    })
    return publicRooms;
}

function countRoom(roomname){
    return wsServer.sockets.adapter.rooms.get(roomname)?.size;
}

wsServer.on("connection", socket=>{
    socket["nickname"] = "Anonymous"
    // app.js에서 만든 "enter_room" 이벤트에 대해 반응
    socket.on("enter_room", (roomName, callback)=> {
        // console.log(roomName);
        // join을 통해 roomName 이름의 room에 입장
        socket.join(roomName);
        // socket.to => 특정 room에 msg 보내기
        // socket.leave => 특정 room 나가기
        // socket.id => client socket의 고유 id를 알 수 있음
        // socketsJoin => 특정 client socket을 강제로 특정 room에 join시킬 수 있음. 

        callback();

        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
        
    });

    socket.on("disconnecting", ()=>{
        socket.rooms.forEach(room => {
            socket.to(room).emit("bye", socket.nickname, countRoom(room)-1 )
        });
    })

    socket.on("new_message", (msg, roomName, callback)=>{
        socket.to(roomName).emit("new_message", `${socket.nickname} : ${msg}`)
        callback()
    })
    socket.on("nickname", nickname =>socket["nickname"] = nickname);    
});


httpServer.listen(3000, handleListen);

