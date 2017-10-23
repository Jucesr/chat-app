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
const {User} = require('./models/user');
const {Room} = require('./models/room');

const port = process.env.PORT || 3000;
const public_path = path.join(__dirname, '../public')

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use( bodyParser.json() );
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


    Room.findById(params.room).then( (roomDoc) =>{

      let error;

      let userList = roomDoc.getUserList();
      if( userList[params.name]){
        //Check if user is not duplicated
        error = 'Sorry. There is an user with this name, try another one :D';
        callback(error);
      }else{
        socket.join(params.room);
        // users.removeUser(socket.id);
        // users.addUser(socket.id, params.name, params.room);
        roomDoc.addUser({
          name: params.name,
          socket_id: socket.id
        }).then( (userDoc) =>{
          io.to(params.room).emit('updateUserList', roomDoc.getUserList());
          socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
          socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));
          callback();
        });
      }
    }).catch( (e) =>{
      ccallback(e);
    });

    // if (isDuplicated(params.name, params.room, users)){
    //   return callback('Sorry. There is an user with this name, try another one :D');
    // }



  });

  // socket.on('createMessage', (newMessage, callback) => {
  //   var user = users.getUser(socket.id);
  //   if (user && isRealString(newMessage.text)){
  //     io.to(user.room).emit('newMessage', generateMessage(user.name, newMessage.text));
  //     callback();
  //   }
  // });
  //
  // socket.on('createLocationMessage', (coords) => {
  //   var user = users.getUser(socket.id);
  //   if (user){
  //     io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name,coords.latitude, coords.longitude));
  //
  //   }
  // });
  //
  socket.on('getRoomList', (callback) => {

    Room.getRoomList().then( (roomList) => {
      callback(roomList);
    }).catch( (e) => {
      callback();
    });

  });

  socket.on('getRoom', (parms, callback) =>{

    Room.findOne({name: parms.name}).then( (roomDoc) => {
      callback(roomDoc);
    }).catch( (e) => {
      callback();
    });
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

  socket.on('newRoom', (roomClient, callback) =>{

    const room = new Room({
      name: roomClient.name
    });

    room.save().then( (newRoom) =>{
      //updateRoomList client
      callback(newRoom);
    }, (e) =>{
      callback();
    });

  });

  socket.on('disconnect', () => {
    // var user = users.removeUser(socket.id);
    //
    // if( user ){
    //   io.to(params.room).emit('updateUserList', roomDoc.getUserList());
    //   io.to(user.room).emit('updateUserList', users.getUserList(user.room));
    //   io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    // }
    console.log('Disconnected');

  });

});

server.listen(port, ()=> {
    console.log(`Server is up on port ${port}`);
})
