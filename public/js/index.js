var socket = io();

// jQuery Selectors
var join_form = jQuery('#join-form');
var sign_form = jQuery('#sign-form');
var room_form = jQuery('#room-form');

var main_container = jQuery('#main-container');
var sign_up = jQuery('#sign_up');
var sign_in = jQuery('#sign_in');
var room_selector = jQuery('#room-selector');

var sign_out = jQuery('#sign_out');

socket.on('connect', function () {

  //Get room list
  socket.emit('getRoomList', function(roomList){
    if(roomList){
      localStorage.setItem('roomList', roomList);
    }

    //verify if user is logged in.
    if( localStorage.getItem('x-auth') ){
      showRoomForm(localStorage.getItem('username'));
    }else{
      join_form.removeClass('invisible');
    }

    main_container.removeClass('invisible');

  });



});

join_form.on('submit', function(e) {
  e.preventDefault();
  //Get users list to check if a user with same name is log in.
  var email = jQuery('[name=email]').val();
  var password = jQuery('[name=password]').val();
  socket.emit('signIn', {
    email: email,
    password: password
  }, function(token, user) {
    if(user ){
      ls_sign_in(user.name, token);

      showRoomForm(user.name);
      join_form.addClass('invisible');
      alert('Welcome ' + user.name + ' you can start chatting now!');
    }else{
      alert('Sorry, we could not find a user');
    }

  });

});

sign_form.on('submit', function(e) {
  e.preventDefault();

  var name = jQuery('[name=s_name]').val();
  var password = jQuery('[name=s_password]').val();
  var email = jQuery('[name=s_email]').val();

  var user = {
    name: name,
    email: email,
    password: password
  }

  $.ajax({
    method: 'POST',
    url: '/users',
    data: JSON.stringify(user),
    dataType: 'json',
    contentType: 'application/json',
    complete: function(res){

      if(res.status === 200){
        ls_sign_in(user.name, res.getResponseHeader('x-auth'));
        showRoomForm(localStorage.getItem('username'));
        sign_form.addClass('invisible');
        alert('Welcome ' + name + ' you can start chatting now!');
      }else{
        alert('Sorry, ' + user.email + ' is already taken. Try another email.');
      }
    }

  });

});

room_form.on('submit', function(e) {
  e.preventDefault();

  var value = room_selector.val();

  //new room option
  if(value == 1){

    var roomName = jQuery('[name=roomName]').val();
    roomName = validString(roomName);
    if(!!roomName){
      socket.emit('newRoom', {
        name: roomName
      }, function(room) {
        if(room){
          alert('Room created successfuly');
          var query = '?name='+encodeURIComponent(localStorage.getItem('username'))+'&room='+encodeURIComponent(room._id);
          window.location.href = '/chat.html'+query
        }else {
          alert('Unable to create the room, room name is unique');
        }
      });
    }else{
      alert('Invalid room name.');
    }

  }else{
    // Option selected
    var room = $( "#room-selector option:selected" ).text();

    //fetch room id
    socket.emit('getRoom', {
      name: room
    }, function(room) {

      if(room){
        var query = '?name='+encodeURIComponent(localStorage.getItem('username'))+'&room='+encodeURIComponent(room._id);
        window.location.href = '/chat.html'+query;
      } else{
        alert('There is an error with this room, please chose another one.');
      }
    });


  }




});

sign_up.on('click', function() {
  join_form.addClass('invisible');
  sign_form.removeClass('invisible');
});

sign_in.on('click', function() {
  join_form.removeClass('invisible');
  sign_form.addClass('invisible');
});

sign_out.on('click', function() {

  socket.emit('signOut', {
    token: localStorage.getItem('x-auth')
  }, function(success){
    if(success){
      ls_sign_out();
      room_form.addClass('invisible');
      join_form.removeClass('invisible');
      alert('You have successfuly signed out');
    }else{
      alert('There was an error loggin out');
    }
  });



});

room_selector.on('change', function() {
  var value = room_selector.val();


  if (value == 1 ){
    $('#new-room').show();
  }
});

function showRoomForm(userName) {

  var roomList = ['Select a room','Add a new room'];
  var roomObject = [];
  var template = jQuery('#rooms-template').html();

  //GET ROOM LIST
  if( localStorage.getItem('roomList') ){
    roomList = roomList.concat(localStorage.getItem('roomList').split(','));
  }

  for(idx in roomList){
    roomObject.push({index: idx, name: roomList[idx]});
  }

  var data = {
    rooms: roomObject,
  }

  var html = Mustache.render(template, data);
  jQuery('#room-selector').html(html);
  jQuery('#userName').html(userName);

  room_form.removeClass('invisible');
};

function ls_sign_in(name, token){
  localStorage.setItem('x-auth', token);
  localStorage.setItem('username', name);
}

function validString( val ){
  if(val){
    val = val.trim();
    return typeof val === 'string' && val.length > 0 ? val : false;
  }else
    return false;
}

function ls_sign_out(){
  let rl = localStorage.getItem('roomList');
  localStorage.clear();
  localStorage.setItem('roomList', rl);
}
