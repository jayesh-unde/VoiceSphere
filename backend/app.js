require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./routes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const ACTIONS = require('./actions');
const server = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(server,{
    cors:{
        origin:process.env.REACT_APP_API_URL,
        methods: ['GET','POST'],
    },
})

main().
then(()=>{
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.DB_URL);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
const corsOption = {
    credentials:true,
    origin:process.env.REACT_APP_API_URL,
};
app.use(cors(corsOption));
app.use(cookieParser());
const PORT = process.env.PORT || 5500;
app.use(express.json({ limit: '8mb' })); // size of file
app.use(router);
app.use('/storage', express.static(path.join(__dirname, 'storage')));



app.get('/',(req,res)=>{
    // console.log("app is listening");
    res.send("app is listening");
})

// sockets logic
const socketUserMapping = {

}

io.on('connection',(socket)=>{
    console.log('new connection',socket.id);
    socket.on(ACTIONS.JOIN,({roomId,user})=>{
        socketUserMapping[socket.id] = user;
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId)=>{
            io.to(clientId).emit(ACTIONS.ADD_PEER,{
                peerId: socket.id,
                createOffer:false,
                user
            });
            socket.emit(ACTIONS.ADD_PEER,{
                peerId: clientId,
                createOffer:true,
                user: socketUserMapping[clientId],
            });
        });
        
        socket.join(roomId);
    });
    // handle relay ice
    socket.on(ACTIONS.RELAY_ICE,({peerId,icecandidate})=>{
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE,{
            peerId:socket.id,
            icecandidate
        })
    })

    // handle relay sdp
    socket.on(ACTIONS.RELAY_SDP,({peerId,sessionDescription})=>{
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION,{
            peerId: socket.id,
            sessionDescription,
        })
    })

    socket.on(ACTIONS.MUTE, ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.MUTE, {
                peerId: socket.id,
                userId,
            });
        });
    });

    socket.on(ACTIONS.UNMUTE, ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.UNMUTE, {
                peerId: socket.id,
                userId,
            });
        });
    });

    socket.on(ACTIONS.MUTE_INFO, ({ userId, roomId, isMute }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            if (clientId !== socket.id) {
                console.log('mute info');
                io.to(clientId).emit(ACTIONS.MUTE_INFO, {
                    userId,
                    isMute,
                });
            }
        });
    });

    socket.on('sendMessage', ({ roomId, message,user }) => {
        console.log(message);
        console.log(roomId);
        socket.broadcast.emit('receiveMessage', {
            message,
            user: user.name || 'Anonymous',
        });
       
    });
    // remove peer
    const leaveRoom = ({roomId})=>{
        const {rooms} = socket;
        Array.from(rooms).forEach(roomId=>{
            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
            clients.forEach(clientId=>{
                io.to(clientId).emit(ACTIONS.REMOVE_PEER,{
                    peerId:socket.id,
                    userId: socketUserMapping[socket.id]?.id,
                });
                socket.emit(ACTIONS.REMOVE_PEER,{
                    peerId:clientId,
                    userId:socketUserMapping[clientId]?.id,
                })
            });
            socket.leave(roomId);
        });
        delete socketUserMapping[socket.id];
    }
    socket.on(ACTIONS.LEAVE,leaveRoom);
    socket.on('disconnecting',leaveRoom);
})

server.listen(PORT,()=>{
    console.log(`Listening on Port ${PORT}`);
})
