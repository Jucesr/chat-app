var socket = io();

function scrollToBottom() {
  //Selectors
  let messages = jQuery('#messages');
  let newMessage = messages.children('li:last-child');
  //Heights
  let clientHeight = messages.prop('clientHeight');
  let scrollTop = messages.prop('scrollTop');
  let scrollHeight = messages.prop('scrollHeight');
  let newMessageHeight = newMessage.innerHeight();
  let lastMessageHeigt = newMessage.prev().innerHeight();

  if( clientHeight + scrollTop + newMessageHeight + lastMessageHeigt>= scrollHeight ){
    messages.scrollTop(scrollHeight);
  }
}

// ***** SocketIO Events ****

socket.on('connect', function () {
  var params = jQuery.deparam(window.location.search);
  params.user_id = localStorage.getItem('user_id');
  socket.emit('join', params, function(err) {
    if(err){
      console.log('Error: '+ err);
      alert(err);
      window.location.href = '/'
    }

  });
});

socket.on('disconnect',function () {
  console.log('Disconnected from the server');
  var params = jQuery.deparam(window.location.search);
    socket.emit('leaveRoom', {
      user_name: localStorage.getItem('user_name'),
      user_id: localStorage.getItem('user_id'),
      room_id: params.room
    });
});

socket.on('updateUserList', function (users) {
  var ol = jQuery('<ol></ol>');

  users.forEach( function (user) {
    ol.append(jQuery('<li></li>').text(user.name));
  });

  jQuery('#users').html(ol);
});

socket.on('newMessage', function (message) {
  var formatedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#message-template').html();
  var html = Mustache.render(template, {
    from: message.from,
    text: message.text,
    createdAt: formatedTime,
    url: message.url
  });
  jQuery('#messages').append(html);
  scrollToBottom();
});


// ***** UI Events ****

var locationButton = jQuery('#send-location');
var message_form = jQuery('#message-form');
var _window = jQuery(window);

message_form.on('submit', function(e) {
  e.preventDefault();
  var params = jQuery.deparam(window.location.search);
  var text = jQuery('[name=message]').val();
  socket.emit('createMessage', {
    room_id: params.room,
    user_name: localStorage.getItem('user_name'),
    text: text
  }, function () {
    jQuery('[name=message]').val('');
  });
});

locationButton.on('click', function(){
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...');

  var params = jQuery.deparam(window.location.search);

  navigator.geolocation.getCurrentPosition(function(position){
    locationButton.removeAttr('disabled').text('Send location');
    socket.emit('createLocationMessage', {
      room_id: params.room,
      user_name: localStorage.getItem('user_name'),
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  }, function(e){
    locationButton.removeAttr('disabled').text('Send location');
    alert('Unable to fetch location');
  });


});
















// console.log('Just for scrolling');
