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
    name: String
  }]

});

RoomSchema.methods.addMessage = function(message){

  this.messages.push(message);

  return this.save().then( () => message );
};

RoomSchema.methods.getUserList = function(){
  return this.userList;
}

RoomSchema.methods.getMessageList = function(){
  return this.messages;
}

RoomSchema.methods.addUser = function(user){
  this.userList.push(user);

  return this.save().then( (roomDoc) => roomDoc );
}

RoomSchema.methods.removeUser = function(id){
  return this.update({
    $pull: {
      userList: {
        _id: id
      }
    }
  });
}

RoomSchema.statics.getRoomList = function (){
  const Room = this;

  return Room.find({}).then( (rooms) => {
    let roomList = [];
    rooms.forEach( (room) =>{
      roomList[rooms.indexOf(room)] = room.name ;
    });
    return new Promise ( resolve => resolve(roomList) );
  });

};

RoomSchema.statics.cleanAllUserList = function (){
  const Room = this;

  return Room.find({}).then( (rooms) => {

    const fn = function updateValue(r){
      r.set({ userList: [] });
      r.save();
    }

    const actions = rooms.map(fn);

    return Promise.all(actions);

    // results.then( () => {
    //   return new Promise ( resolve => resolve(true) );
    // });

  });

};

const Room = mongoose.model('Room', RoomSchema);

module.exports = {Room};
