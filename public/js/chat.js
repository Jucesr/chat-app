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
  socket.emit('join', params, function(err) {
    if(err){
      alert(err);
      window.location.href = '/'
    }

  });
});

socket.on('disconnect',function () {
  console.log('Disconnected from the server');
});

socket.on('updateUserList', function (users) {
  var ol = jQuery('<ol></ol>');

  users.forEach( function (user) {
    ol.append(jQuery('<li></li>').text(user.name));
  });

  jQuery('#users').html(ol);
  console.log('Users List', users);
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
  scrollToBottom();
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
  scrollToBottom();
});

// ***** UI Events ****

// jQuery selectos

var locationButton = jQuery('#send-location');
var message_form = jQuery('#message-form');

message_form.on('submit', function(e) {
  e.preventDefault();
  var text = jQuery('[name=message]').val();
  socket.emit('createMessage', {
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
