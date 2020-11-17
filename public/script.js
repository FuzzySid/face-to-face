const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const message= document.getElementById('chat_message');

const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = false
const peers = {}

let myVideoStream;
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
    myVideoStream=stream;
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
    message.onkeyup=e=>{
        let msg=message.value;
        if(e.key==='Enter' && msg.length>0){
            console.log(msg);
            socket.emit('message',msg);
            message.value="";
        }
    }
    socket.on('createMessage',msg=>{
        document.getElementsByClassName('messages')[0].innerHTML+=(`<li>${msg}</li>`)
        scrollToBottom()
    })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

const scrollToBottom=()=>{
    let chatWindow=document.getElementsByClassName('main__chatWindow')[0];
    chatWindow.scrollTop(chatWindow.prop("scrollHeight"))
}

const toggleMute=()=>{
    const enabled=myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled=false;
        //setUnmuteButton();
        document.querySelector('.mute_button').innerHTML=`
        <i class="off fas fa-microphone-slash"></i>
        <span>Unmute</span>
        `        
    }
    else{
        document.querySelector('.mute_button').innerHTML=`
        <i class="on fas fa-microphone"></i>
        <span>Mute</span>`
        myVideoStream.getAudioTracks()[0].enabled=true;
    }
}

const togglePause=()=>{
    const enabled=myVideoStream.getVideoTracks()[0].enabled;
    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled=false;
        //setUnmuteButton();
        document.querySelector('.pause_button').innerHTML=`
        <i class="off fas fa-video-slash"></i>
        <span>Play</span>
        `        
    }
    else{
        document.querySelector('.pause_button').innerHTML=`
        <i class="on fas fa-video"></i>
        <span>Pause</span>`
        myVideoStream.getVideoTracks()[0].enabled=true;
    }
}

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}