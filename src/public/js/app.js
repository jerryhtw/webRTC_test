const socket = io();

// socketIO에서는 기본적으로 연결되어 있는 client를 저장하는 map구조가 존재한다. 

const welcome = document.getElementById("welcome")
const form = document.querySelector("#welcome form");
const room = document.getElementById("room")
room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li")
    li.innerText = message
    ul.appendChild(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const msgvalue = input.value;
    socket.emit("new_message", input.value, roomName, ()=>{
        addMessage(`You ${msgvalue}`)
    })   
    input.value = ""; 
}

function handleNicknameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value);
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    
    // emit 1번째 인자 : 즉석에서 "enter_room"이라는 event를 바로 만들어 버릴 수 있다. 
    // emit 2번째 인자 : socketIO에서는 전송할때 꼭 objecy를 string으로 바꾸지 않고 emit 함수를 통해 바로 object를 보낼 수 있다. 
    // emit 3번째 인자 : callback 함수를 보낼 수 있다. 헷갈릴 수 있지만, 이 함수는 server 쪽에서 실행되는 것이 아닌 server와 연결된 client에서 실행되는 것. server쪽에서는 이 callback 함수를 받아서 client 쪽에서 어떻게 이 함수를 실행하는지 설정할 수 있다.
    socket.emit("enter_room", input.value, ()=>{
        console.log("server is done!");
        welcome.hidden = true;
        room.hidden = false;    
        const h3 = room.querySelector("h3");
        h3.innerText = `Room ${roomName}`;
        const msgform = room.querySelector("#msg")
        const nameform = room.querySelector("#name")
        msgform.addEventListener("submit", handleMessageSubmit)
        nameform.addEventListener("submit", handleNicknameSubmit)
    });
    roomName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;    
    addMessage(`${user} has joined!`)
})

socket.on("bye", (user, newCount)=>{ 
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;             
    addMessage(`${user} has left!`)
})

socket.on("new_message", (msg)=>{
    addMessage(msg)
})

socket.on("room_change", (rooms)=>{
    if(rooms.length === 0){
        roomList.innerHTML = "";
        return;
    }
    const roomList = welcome.querySelector("ul")
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
})