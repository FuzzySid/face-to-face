const express=require('express');
const app=express();
const server=require('http').Server(app)
const {v4:uuidv4}=require('uuid')
const socket=require('socket.io')(server)
const {ExpressPeerServer}=require('peer');
const peerServer=ExpressPeerServer(server,{
    debug:true
})

//tell express where static files are
app.use(express.static('public'))
//set view engines as ejs
app.set('view engine','ejs')


//use peer
app.use('/peerjs',peerServer);

//root route to redirect to room route
app.get('/',(req,res)=>{
    res.redirect(`/${uuidv4()}`)
})

//render the ejs template
app.get('/:room',(req,res)=>{
    res.render('room',{roomId:req.params.room});
})

socket.on('connection',websocket=>{
    websocket.on('join-room',(roomId,userId)=>{
        //console.log('Joined room')
        websocket.join(roomId)
        websocket.to(roomId).broadcast.emit('user-connected',userId);
    })
})

server.listen(5000,()=>{
    console.log('Listening on port 5000...')
})
