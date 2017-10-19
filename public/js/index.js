var socket = io();

// jQuery Selectors
var join_form = jQuery('#join-form');
var sign_form = jQuery('#sign-form');

var main_container = jQuery('#main-container');
var sign_up = jQuery('#sign_up');
var sign_in = jQuery('#sign_in');

var sign_out = jQuery('#sign_out');
var room_form = jQuery('#room-form');

socket.on('connect', function () {

  //verify if user is logged in.
  if( localStorage.getItem('x-auth') ){
    showRoomForm(localStorage.getItem('username'), ['one', 'two', 'three']);
  }else{
    join_form.removeClass('invisible');
  }

  main_container.removeClass('invisible');


  //Get room list
  // socket.emit('getRoomList', function(roomList) {
  //
  //   if( roomList.length > 0 ){
  //     //Add a selector so user can select room
  //     var room_selector = jQuery('<select></select>').attr('name','room').attr('id','room-selector');
  //
  //     room_selector.on('change', function() {
  //       var option_id = jQuery('select option:selected').attr('id');
  //       if(option_id === 'new_room'){
  //         //Show input field
  //         var room_name_input = jQuery('<input>').attr('name','room').attr('type','text');
  //         room_section.append(room_name_input);
  //         //Hide selector and remove name attribute
  //         room_selector.hide().attr('name',null);
  //       }
  //     });
  //
  //
  //     roomList.forEach( function(room) {
  //       var option = jQuery('<option></option>');
  //       option.text(room);
  //       room_selector.append(option);
  //     });
  //     room_selector.append(jQuery('<option id="new_room">Add a new room</option>'));
  //
  //     room_section.append(room_selector);
  //   }else{
  //     //Add an input field so the user can type a room
  //     var room_name_input = jQuery('<input>').attr('name','room').attr('type','text');
  //     room_section.append(room_name_input);
  //   }
  // });



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
      signIn(user.name, token);

      var rooms = ['one','two','three'];
      showRoomForm(user.name, rooms);
      join_form.addClass('invisible');
    }else{
      alert('Sorry, we could not find a user');
    }
    //?name=&room=
    // var query = '?name='+encodeURIComponent(newName)+'&room='+encodeURIComponent(newRoom);
    // window.location.href = '/chat.html'+query

  });

  console.log(email, password);
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
        signIn(user.name, res.getResponseHeader('x-auth'));
        showRoomForm(localStorage.getItem('username'), ['one', 'two', 'three']);
        sign_form.addClass('invisible');
        // var query = '?name='+encodeURIComponent(user.name)+'&room='+encodeURIComponent('newRoom');
        // window.location.href = '/chat.html'+query
      }else{
        alert('Sorry, ' + user.email + ' is already taken. Try another email.');
      }
    }

  });

});

room_form.on('submit', function(e) {
  e.preventDefault();
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
      alert('You have successfuly signed out');
      localStorage.clear();
      room_form.addClass('invisible');
      join_form.removeClass('invisible');
    }else{
      alert('There was an error loggin out');
    }
  });



});

function showRoomForm(userName, roomsList) {

  var template = jQuery('#rooms-template').html();
  var html = Mustache.render(template, {
    rooms: roomsList
  });
  jQuery('#room-selector').html(html);
  jQuery('#userName').html(userName);

  room_form.removeClass('invisible');
};

function signIn(name, token){
  localStorage.setItem('x-auth', token);
  localStorage.setItem('username', name);
  alert('Welcome ' + name + ' you can start chatting now!');
}
