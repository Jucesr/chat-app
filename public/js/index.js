var socket = io();

socket.on('connect', function () {
  console.log('Connected to the server');
});

socket.on('disconnect',function () {
  console.log('Disconnected from the server');
});

socket.on('newMessage', function (message) {
  var formatedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#message-template').html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formatedTime
  });
  jQuery('#messages').append(html);
});

socket.on('newLocationMessage', function(message){
  var formatedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#location-message-template').html();
  var html = Mustache.render(template, {
    url: message.url,
    from: message.from,
    createdAt: formatedTime
  });

  jQuery('#messages').append(html);
});

jQuery('#message-form').on('submit', function(e) {
  e.preventDefault();
  var text = jQuery('[name=message]').val();
  socket.emit('createMessage', {
    from: 'User',
    text: text
  }, function () {
    jQuery('[name=message]').val('');
  });
});

var locationButton = jQuery('#send-location');

locationButton.on('click', function(){
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...');

  navigator.geolocation.getCurrentPosition(function(position){
    locationButton.removeAttr('disabled').text('Send location');
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  }, function(e){
    locationButton.removeAttr('disabled').text('Send location');
    alert('Unable to fetch location');
  });


});
















console.log('Just for scrolling');
