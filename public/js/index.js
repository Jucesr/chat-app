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
  console.log('New message', message);
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
