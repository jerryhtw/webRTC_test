const socket = io();

const myFace = document.getElementById("myFace")
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")
const cameraSelect = document.getElementById("cameras")

let muted = false;
let cameraOff = false; 

let myStream

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput")
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

// 처음에 default로 실행
getMedia();

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
}

cameraSelect.addEventListener("input", handleCameraChange)
