
class Users {
  constructor() {
    this.users = [];
  }

  addUser(id, name, room){
    var user = {id, name, room};
    this.users.push(user);
    return user;
  }

  getUser(id){

    var users = this.users.filter((user) => {
      return user.id === id;
    });

    return users[0];

  }

  removeUser (id) {
    var user = this.getUser(id);

    if( user ){
      this.users = this.users.filter( (user) => user.id !== id );
    }
    return user;
  }



  getUserList(room){
    var users = this.users.filter((user) => {
      return user.room === room;
    });

    var namesArray = users.map( (user) => {
      return user.name;
    });

    return namesArray;
  }

  getRoomList(){

    var roomList = this.users.map( user => user.room );

    var uniq = roomList.reduce(function(a,b){
      if (a.indexOf(b) < 0 ) a.push(b);
      return a;
    },[]);

    return uniq;
  }
}

module.exports = {Users}
