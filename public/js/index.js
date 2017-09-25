var socket = io();

// jQuery Selectors
var room_section = jQuery('#room-section');

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
