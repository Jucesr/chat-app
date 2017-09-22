const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');


const port = process.env.PORT || 3000;
const public_path = path.join(__dirname, '../public')

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use( express.static(public_path) );

io.on('connection', (socket) => {
  console.log('new user connected');

  socket.emit('newMessage', {
    from: 'Admin',
    text: 'Welcome to the chat app',
    createAt: new Date().getTime()
  });

  socket.broadcast.emit('newMessage', {
    from: 'Admin',
    text: 'A new user just join',
    createAt: new Date().getTime()
  });


  socket.on('createMessage', (newMessage) => {
    console.log('createMessage', newMessage);
    io.emit('newMessage', {
      from: newMessage.from,
      text: newMessage.text,
      createAt: new Date().getSeconds()
    });
  });

  socket.on('disconnect', () => {
    console.log('user was disconnected');
  });
});

app.get('/', (req, res) => {
  res.send('index.html');
});

server.listen(port, ()=> {
    console.log(`Server is up on port ${port}`);
})
