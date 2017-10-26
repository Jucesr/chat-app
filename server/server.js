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
const {isRealString} = require('./utils/validation');
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
    res.header('user_token',token).send(user);
  }).catch( (e) => {
    res.status(400).send(e);
  } );

});

//REMOVE ALL USER CONNECTIONS

Room.cleanAllUserList().then( () => {
  console.log('Rooms were cleaned');
}).catch( (e) =>{
  console.log(e);
});

io.on('connection', (socket) => {


  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room) ){
      return callback('Name and room name are required.');
    }

    let roomDoc;

    Room.findById(params.room).then( (r) =>{
      roomDoc = r;
      let userList = roomDoc.getUserList();
      //Check if user is not duplicated
      let duplicated = userList.filter( user => user.name == params.name);

      if( duplicated.length > 0){
        throw new Error('Sorry. There is an user with this name, try another room :(');
      }

      socket.join(params.room);

      return roomDoc.addUser({
        _id: ObjectID(params.user_id),
        name: params.name
      });

    }).then( (userDoc) =>{
      //Happy path
      io.to(params.room).emit('updateUserList', roomDoc.getUserList());
      socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
      socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));

      //Setting custom data
      socket._customdata = {
        user_id: params.user_id,
        user_name: params.name,
        room_id: params.room
      };

      callback();

    }).catch( (e) =>{
      callback(e.message);
    });

  });

  socket.on('createMessage', (newMessage, callback) => {
    //Get room
    let tmp_room;
    Room.findById(newMessage.room_id).then( (roomDoc) => {
      tmp_room = roomDoc;
      if(tmp_room && isRealString(newMessage.text)){
        return roomDoc.addMessage(generateMessage(newMessage.user_name, newMessage.text));
      }else {
        return Promise.reject();
      }
    }).then( (messageDoc) => {
      io.to(tmp_room._id).emit('newMessage', generateMessage(newMessage.user_name, newMessage.text));
      callback();
    });
  });

  socket.on('createLocationMessage', (newMessage) => {
    let tmp_room;
    Room.findById(newMessage.room_id).then( (roomDoc) => {
      tmp_room = roomDoc;
      if(tmp_room && newMessage.latitude && newMessage.longitude){
        return roomDoc.addMessage(generateLocationMessage(newMessage.user_name,newMessage.latitude, newMessage.longitude));
      }else {
        return Promise.reject();
      }
    }).then( (messageDoc) => {
      io.to(tmp_room._id).emit('newMessage', generateLocationMessage(newMessage.user_name,newMessage.latitude, newMessage.longitude));
    });
  });


  socket.on('getRoomList', (callback) => {

    Room.getRoomList().then( (roomList) => {
      callback(roomList);
    }).catch( (e) => {
      callback();
    });

  });

  socket.on('getRoom', (params, callback) =>{

    Room.findOne({name: params.name}).then( (roomDoc) => {
      callback(roomDoc);
    }).catch( (e) => {
      callback();
    });
  });

  socket.on('signIn', (userClient, callback) => {
    let temp_user;
    User.findByCredentials(userClient.email, userClient.password).then( (user) => {
      temp_user = user;
      return user.generateAuthToken();
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

    let tmp_newRoom;

    const room = new Room({
      name: roomClient.name
    });

    room.save().then( (newRoom) =>{
      tmp_newRoom = newRoom;
      return Room.getRoomList();
      //updateRoomList client

    }).then( (roomList) => {
      socket.broadcast.emit('updateRoomList', roomList);
      callback(tmp_newRoom);
    }).catch( () => {
      callback();
    });

  });

  socket.on('disconnect', () => {

    if( socket._customdata ){
      let params = socket._customdata;

      let tmp_room;
      Room.findById(params.room_id).then( (roomDoc) => {
        tmp_room = roomDoc;
        return tmp_room.removeUser(params.user_id);
      }).then( (userDoc) => {
        tmp_room.userList = tmp_room.userList.filter( user => user._id != params.user_id);

        io.to(params.room_id).emit('updateUserList', tmp_room.userList);
        io.to(params.room_id).emit('newMessage', generateMessage('Admin', `${params.user_name} has left.`));

        console.log(`${params.user_name} has left room \'${tmp_room.name}`);
      }).catch( (e) => {
        console.log('error:' +e);
      });
    }

  });

});

server.listen(port, ()=> {
    console.log(`Server is up on port ${port}`);
});

function censor(censor) {
  var i = 0;

  return function(key, value) {
    if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
      return '[Circular]';

    if(i >= 5) // seems to be a harded maximum of 30 serialized objects?
      return '[Unknown]';

    ++i; // so we know we aren't using the original object anymore

    return value;
  }
}
