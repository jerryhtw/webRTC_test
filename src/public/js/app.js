const socket = io();

// socketIO에서는 기본적으로 연결되어 있는 client를 저장하는 map구조가 존재한다. 

const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form")

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    
    // emit 1번째 인자 : 즉석에서 "enter_room"이라는 event를 바로 만들어 버릴 수 있다. 
    // emit 2번째 인자 : socketIO에서는 전송할때 꼭 objecy를 string으로 바꾸지 않고 emit 함수를 통해 바로 object를 보낼 수 있다. 
    // emit 3번째 인자 : callback 함수를 보낼 수 있다. 헷갈릴 수 있지만, 이 함수는 server 쪽에서 실행되는 것이 아닌 server와 연결된 client에서 실행되는 것. server쪽에서는 이 callback 함수를 받아서 client 쪽에서 어떻게 이 함수를 실행하는지 설정할 수 있다.
    socket.emit("enter_room", {payload : input.value}, ()=>{
        console.log("server is done!");
    });
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);