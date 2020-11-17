const socket = io('/');
var peer = new Peer(undefined,{
    path:'/peerjs',
    host:'/',
    port:'5000'
}); 

//create a DOM element of <video> that renders your video
const myVideo=document.createElement('video')
myVideo.muted=true; //keep the audio muted for that element 
const videoGrid=document.getElementById('video-grid')
let videoSteam; //variable for video stream
navigator.mediaDevices.getUserMedia({ //access systems media devices
    video:true,
    audio:true
})
  .then(stream=>{
      videoSteam=stream; //store the steam obtained
      addVideoStream(myVideo,stream);
      
      peer.on('call',call=>{
          console.log('here')
          call.answer(stream);
          const video=document.createElement('video')
          call.on('stream',userVideoStream=>{
              addVideoStream(video,userVideoStream)
          })
      })
      socket.on('user-connected',(userId)=>{
        setTimeout(function ()
        {
          connectToNewUser(userId, stream);
        },5000)
        //connectToNewUser(userId,stream);
    })
  })
  .catch(err=>{
      console.log(err)
  })


peer.on('open',id=>{
    //console.log('id: ',id)
    socket.emit('join-room',room_id,id);

})


const connectToNewUser=(userId,stream)=>{
    //console.log('new user: ',userId)
    const call=peer.call(userId,stream)
    const video=document.createElement('video')
    call.on('stream',userVideoStream=>{
        addVideoStream(video,userVideoStream)
    })
}

const addVideoStream=(video,stream)=>{
    video.srcObject=stream; //append steam to the source of that video element
    video.addEventListener('loadedmetadata',()=>{
        video.play();
    })
    videoGrid.append(video)
}