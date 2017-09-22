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
