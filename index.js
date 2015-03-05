var express = require('express');
var app = express();
var helpers = require('helpers');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var counter = 0;
var showArray = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
  counter = counter + 1;
  io.emit('users', counter);
  socket.on('show', function(msgArray){
    if (counter == 1) { showArray = [[Math.floor(3*Math.random()), "Fake UUID"]]; }
    if (helpers.notSubmitted(msgArray)) {
      showArray.push(msgArray);
      if ((showArray.length == counter) || (counter == 1)) { helpers.checkWhoWon(); }
    }
    else { io.emit('result', { disableBtn: true }); }
  });
  socket.on('disconnect', function(socket){
    counter = counter -1;
    showArray = [];
    io.emit('users', counter);
  });
});

http.listen((process.env.PORT || 5000), function(){
  console.log('listening on ' + 5000);
});
