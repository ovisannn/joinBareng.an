const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utility/message');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utility/users');
const { Socket } = require('dgram');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


const namaBot = 'sAdmin joinBareng.an'

//aplikasi folder
app.use(express.static(path.join(__dirname,'public')));

//ketikaclient terkoneksi
io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) => {

        const user= userJoin(socket.id, username, room);

        socket.join(user.room);

        //bc menerima user
        socket.emit('message', formatMessage(namaBot, `halo enjoy di sini ya semoga betah ^^`));

        //bc ketika user tekoneksi
        socket.broadcast.to(user.room).emit('message', formatMessage(namaBot, `${user.username} telah bergabung`));

        //get room and user info
        io.to(user.room).emit('roomUsers', {
            room : user.room,
            users : getRoomUsers(user.room)
        });

    });
    

    //ketika client disconenect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(namaBot, `${user.username} telah meninggalkan chat`));

           
            //get room and user info
            io.to(user.room).emit('roomUsers', {
                room : user.room,
                users : getRoomUsers(user.room)
            }); 
        }

    });


    //menerima pesan chat
    socket.on('chatMessage', msg =>{
       const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
        //io.emit('message', formatMessage('user', msg))
    });

});

//server port
const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`server run in port ${PORT}`));