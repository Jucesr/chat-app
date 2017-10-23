// const {Users} = require('./users.js');

var isRealString = (str) => {
  return typeof str === 'string' && str.trim().length > 0;
};

var isDuplicated = (name, room, userList) => {
  // var isRepeated = false;
  // var usersName = userList.getUserList(room);
  //
  // console.log(usersName);
  // if(usersName.length > 0){
  //
  //   usersName.forEach( function(user){
  //     if (user === name)
  //       isRepeated = true;
  //   });
  // }
  // return isRepeated;
};

module.exports = {isRealString, isDuplicated};
