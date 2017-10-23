const mongoose = require('mongoose');
const _ = require('lodash');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    minLengh: 1,
    trim: true
  },
  messages: [{
    from: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minLengh: 1
    },
    createdAt: {
      type: Number,
      required: true
    },
    url: {
      type: Boolean
    }
  }],
  userList:[{
    name: String,
    socket_id: String
  }]

});

RoomSchema.methods.addMessage = function(message){
  let room = this;
  room.messages.push(message);

  return room.save().then( () => {
    return message;
  });
};

RoomSchema.methods.getUserList = function(){
  return this.userList;
}

RoomSchema.methods.addUser = function(user){
  this.userList.push(user);

  return this.save().then( (userDoc) => {
    return userDoc;
  });
}

RoomSchema.methods.removeUser = function(id){
  return this.update({
    $pull: {
      userList: {
        socket_id: id
      }
    }
  });

  return this.save().then( (userDoc) => {
    return userDoc;
  });
}

RoomSchema.statics.getRoomList = function (){
  var Room = this;

  return Room.find({}).then( (rooms) => {
    let roomList = [];
    rooms.forEach( (room) =>{
      roomList[rooms.indexOf(room)] = room.name ;
    });
    return new Promise ( resolve => resolve(roomList) );
  });

};

const Room = mongoose.model('Room', RoomSchema);

module.exports = {Room};
