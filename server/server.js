require('./config/config');
require('./db/mongoose');

const _ = require('lodash');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const http = require('http');
const {ObjectID} = require('mongodb');


const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString, isDuplicated} = require('./utils/validation');
const {Users} = require('./utils/users');
const {User} = require('./models/user');

const port = process.env.PORT || 3000;
const public_path = path.join(__dirname, '../public')

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(bodyParser.json());
app.use( express.static(public_path) );

app.post('/users', (req, res) => {
  let body = _.pick(req.body, ['name', 'email', 'password']);
  let user = new User({
    name: body.name,
    email: body.email,
    password: body.password
  });

  user.save().then( () => {
    return user.generateAuthToken();
  }).then( (token) => {
    res.header('x-auth',token).send(user);
  }).catch( (e) => {
    res.status(400).send(e);
  } );

});


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

  socket.on('signIn', (userClient, callback) => {
    let temp_user;
    User.findByCredentials(userClient.email, userClient.password).then( (user) => {
      temp_user = user;
      return user.generateAuthToken()
    }).then( (token) =>{
      callback(token, temp_user);
    }).catch( (e) => {
      callback();
    });
  });

  socket.on('signOut', (userClient, callback) => {

    //Returns true if token is removed
    
    User.findByToken(userClient.token).then( (user) =>{
      if(!user){
        return Promise.reject();
      }
      return user.removeToken(userClient.token);

    }).then( () =>{
      callback(true);
    }).catch( (e) => {
      callback(false);
    });

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
