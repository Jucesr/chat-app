const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString, isDuplicated} = require('./utils/validation');
const {Users} = require('./utils/users');

const port = process.env.PORT || 3000;
const public_path = path.join(__dirname, '../public')

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use( express.static(public_path) );

io.on('connection', (socket) => {

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room) ){
      return callback('Name and room name are required.');
    }
    if (isDuplicated(params.name, params.room, users)){
      return callback('Sorry. There is an user with this name, try another one :D');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));

    callback();

  });

  socket.on('createMessage', (newMessage, callback) => {
    var user = users.getUser(socket.id);
    if (user && isRealString(newMessage.text)){
      io.to(user.room).emit('newMessage', generateMessage(user.name, newMessage.text));
      callback();
    }
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);
    if (user){
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name,coords.latitude, coords.longitude));

    }
  });

  socket.on('getRoomList', (callback) => {

    var roomList = users.getRoomList();

    callback(roomList);

  });

  socket.on('getUserList', (room, callback) => {

    var userList = users.getUserList(room);

    callback(userList);

  });

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if( user ){
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    }

  });

});

server.listen(port, ()=> {
    console.log(`Server is up on port ${port}`);
})
