var express         = require('express');
var app             = express();
var helpers         = require('./helpers.js');
var http            = require('http').Server(app);
var io              = require('socket.io')(http);
var roundTimer      = undefined;
var counter         = 0;
var submittedHands  = [];
var roundTime       = 60;
var timeout;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){

  io.emit('users', {
    users: io.engine.clientsCount
  });
  console.log('Users: ' + io.engine.clientsCount);

  socket.on('show', function(hand, fn){
    usersCount = io.engine.clientsCount;

    console.log('submitted hands ' + submittedHands);

    if (usersCount == 1) {
      submittedHands = [[Math.floor(3*Math.random()), "Fake UUID"]];
    }
    else if (submittedHands.length == 0) {
      io.emit('first hand submitted', roundTime, socket.conn.id);
      console.log('first hand submitted' + ' ' + roundTime + " "  + socket.conn.id);

      roundTimer = setTimeout(function(){
        if (submittedHands.length  == 1) {
          submittedHands.push([Math.floor(3*Math.random()), "Fake UUID"]);
        }

        io.emit('result', helpers.checkWhoWon(submittedHands));
        console.log('result ' + helpers.checkWhoWon(submittedHands) + ' in timer')

        submittedHands = [];
      }, roundTime * 1000);
    }

    if (helpers.notSubmitted(socket.conn.id, submittedHands)) {
      submittedHands.push([hand, socket.conn.id]);
      console.log('result ' + ' ' + hand + ' ' + socket.conn.id)
    }

    console.log(submittedHands);

    if (submittedHands.length >= usersCount) {
      console.log('enough results');
      console.log('End of round');
      clearTimeout(roundTimer);

      io.emit('result', helpers.checkWhoWon(submittedHands));
      console.log('result ' + helpers.checkWhoWon(submittedHands));

      submittedHands = [];
    }
    fn(roundTime);
  });

  socket.on('disconnect', function(socket){
    submittedHands = [];
    io.emit('users', { users: io.engine.clientsCount, waiting: false });
  });

  socket.on('hello', function(fn){
    fn(socket.conn.id);
  })
});

http.listen((process.env.PORT || 5000), function(){
  console.log('listening on ' + 5000);
});
