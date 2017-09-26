var socket = io();

// jQuery Selectors
var room_section = jQuery('#room-section');
var join_form = jQuery('#join-form');

socket.on('connect', function () {
  //Get room list
  socket.emit('getRoomList', function(roomList) {

    if( roomList.length > 0 ){
      //Add a selector so user can select room
      var room_selector = jQuery('<select></select>').attr('name','room').attr('id','room-selector');

      room_selector.on('change', function() {
        var option_id = jQuery('select option:selected').attr('id');
        if(option_id === 'new_room'){
          //Show input field
          var room_name_input = jQuery('<input>').attr('name','room').attr('type','text');
          room_section.append(room_name_input);
          //Hide selector and remove name attribute
          room_selector.hide().attr('name',null);
        }
      });


      roomList.forEach( function(room) {
        var option = jQuery('<option></option>');
        option.text(room);
        room_selector.append(option);
      });
      room_selector.append(jQuery('<option id="new_room">Add a new room</option>'));

      room_section.append(room_selector);
    }else{
      //Add an input field so the user can type a room
      var room_name_input = jQuery('<input>').attr('name','room').attr('type','text');
      room_section.append(room_name_input);
    }
  });

});

join_form.on('submit', function(e) {
  e.preventDefault();
  //Get users list to check if a user with same name is log in.
  var newName = jQuery('[name=name]').val();
  var newRoom = jQuery('[name=room]').val();
  socket.emit('getUserList', newRoom, function(users) {


    if(users.length > 0){

      var isRepeated = false;
      users.forEach( function(user){
        if (user === newName)
          isRepeated = true;
      });

      if(isRepeated){
        return alert('Sorry. There is already an user with this name, try another one :D')
      }
    }
    //?name=&room=
    var query = '?name='+encodeURIComponent(newName)+'&room='+encodeURIComponent(newRoom);
    window.location.href = '/chat.html'+query

  });
});
