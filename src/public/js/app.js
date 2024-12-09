const socket = io();

const myFace = document.getElementById("myFace")
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")
const cameraSelect = document.getElementById("cameras")

let muted = false;
let cameraOff = false; 
let roomName;

const call = document.getElementById("call")

call.hidden = true;

let myStream
let myPeerConnection

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput")
        const currentCamera = myStream.getVideoTracks()[0]
        cameras.forEach(camera=>{
            const option = document.createElement("option")
            option.value = camera.deviceId
            option.innerText = camera.label
            if(currentCamera.label === camera.label){
                option.selected = true;
            }
            cameraSelect.appendChild(option)
        })
        console.log("All connected device : ", devices)

    }catch{
        console.log("Failed to enumerate connected devices")
    }
}

async function getMedia(deviceId){
    // 처음 들어가면 deviceId가 없다. default로 실행되는 config
    const initialConstrains = {
        audio : true, 
        video : {facingMode : "user"}
    }
    const cameraConstraints = {
        audio : true,
        video : {
            deviceId : {exact : deviceId}
        }
    }
    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId?cameraConstraints:initialConstrains
        )
        myFace.srcObject = myStream;
        if(!deviceId){
            await getCameras();
        }
        console.log(myStream)
    }catch(e){
        console.log(e)
    }
}

muteBtn.addEventListener("click", handleMuteClick)
cameraBtn.addEventListener("click", handleCameraClick)

function handleMuteClick(){
    myStream.getAudioTracks().forEach(track=>track.enabled =! track.enabled);
        //muted = !muted;
    if(!muted){
        muteBtn.innerText = "Unmute"
        muted = true;
    }else{
        muteBtn.innerText = "Mute"
        muted = false;
    }
}

function handleCameraClick(){
    myStream.getVideoTracks().forEach(track=>track.enabled =! track.enabled);
    if(cameraOff){
        cameraBtn.innerText = "Turn camera Off"
        cameraOff = false;
    }else{
        cameraBtn.innerText = "Turn camera On"
        cameraOff = true;
    }

}

async function handleCameraChange(){
    // cameraSelect.value => deviceID 출력
    await getMedia(cameraSelect.value);
    if(myPeerConnection){
        //myPeerConnection
        const videoTrack = myStream.getVideoTracks()[0]
        const videoSender = myPeerConnection.getSenders().find(sender=>{
            sender.track.kind == "video"
        })
        videoSender.replaceTrack(videoTrack)
    }
}


const welcome = document.getElementById("welcome")

async function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input")
    await initCall()
    // input.value <= room name
    socket.emit("join_room", input.value, initCall)
    roomName = input.value;
    input.value = ""

}

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

cameraSelect.addEventListener("input", handleCameraChange)

const welcomeForm = welcome.querySelector("form")
welcomeForm.addEventListener("submit", handleWelcomeSubmit)


// Step 1. 자신이 만든 방에 누군가 들어오면 offer를 생성해서 자신의 local description을 만들고,
// 들어온 사람에게 offer를 전송
socket.on("welcome", async ()=>{
    const offer = await myPeerConnection.createOffer()
    myPeerConnection.setLocalDescription(offer)
    socket.emit("offer", offer, roomName)
    console.log(offer)
})
// Step 2. 방에 입장한 사람은 Step 1에서 전달된 offer를 통해 자신의 remote description을 만든다.
// 그 후, answer를 만들고 이를 통해 자신의 local description을 만든다.
// 만든 answer은 방의 생성자에게 전달
socket.on("offer", async(offer) => {
    myPeerConnection.setRemoteDescription(offer)
    const answer = await myPeerConnection.createAnswer()
    myPeerConnection.setLocalDescription(answer)
    socket.emit("answer", answer, roomName)
})

// Step 3. 방의 생성자는 Step 2에서 전달된 answer를 통해 자신의 remote description을 만든다.
// 이로써 방의 생성자와 참가자 모두에게 각각 local, remote description이 1개씩 생성되었다. 
socket.on("answer", answer=>{
    myPeerConnection.setRemoteDescription(answer)
})

// Receiving ICE candidate
socket.on("ice", ice =>{
    myPeerConnection.addIceCandidate(ice)
})

// RTC 코드
// 여기가 핵심!
function makeConnection(){
    myPeerConnection = new RTCPeerConnection()
    myPeerConnection.addEventListener("icecandidate", handleIce)
    myPeerConnection.addEventListener("addstream", handleAddStream)
    myStream
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream))
     
}

function handleIce(data){
    socket.emit("ice", data.candidate, roomName)
}

function handleAddStream(data){
    const peerFace = document.getElementById("peerFace")
    // console.log("Got a Stream from my Peer!")
    // console.log("Peer's stream : ", data.stream)
    // console.log("My stream : ", myStream)
    peerFace.srcObject = data.stream
}
