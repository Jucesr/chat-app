var socket = io();

socket.on('connect', function () {
  console.log('Connected to the server');
});

socket.on('disconnect',function () {
  console.log('Disconnected from the server');
});

socket.on('newMessage', function (message) {
  var li = jQuery('<li></li>');
  li.text(`${message.from}: ${message.text}`);

  jQuery('#messages').append(li);
});

socket.on('newLocationMessage', function(message){
  var li = jQuery('<li></li>');
  var a = jQuery('<a target="_blank">My current location</a>');

  li.text(`${message.from}: `);
  a.attr('href', message.url);
  li.append(a);

  jQuery('#messages').append(li);
});

jQuery('#message-form').on('submit', function(e) {
  e.preventDefault();
  console.log('This is movieng');
  var text = jQuery('[name=message]').val();
  socket.emit('createMessage', {
    from: 'User',
    text: text
  }, function () {
    console.log('Got it');
  });
});

var locationButton = jQuery('#send-location');

locationButton.on('click', function(){
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  navigator.geolocation.getCurrentPosition(function(position){
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
    console.log(position);
  }, function(e){
    alert('Unable to fetch location');
  });


});
















console.log('Just for scrolling');
