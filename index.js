var express = require('express');
var app = express();
// var helpers = require('helpers');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var counter = 0;
var submittedHands = [];
var timeout;
var roundTimer = undefined;
var roundTime = 60;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Need to move out properly

var isBeaten = function(i, array) {
  j = (i + 1) % 3;
  bool = array.indexOf(j) == -1;
  return !bool
}

var beatsOne = function(i, array) {
  j = (i - 1) % 3;
  bool = array.indexOf(j) == -1;
  return !bool
}

checkWhoWon = function(submittedHands) {
  for ( i = 0; i < submittedHands.length; i++) {
    var compareArray = [];
    var increment = 0;
    for ( j = 0; j < submittedHands.length; j++) {
      if(j != i) {
        compareArray.push(submittedHands[j][0]);
      }
    }
    var element = submittedHands[i][0];
    if (beatsOne(element, compareArray)) { increment = increment + 1; }
    else if (isBeaten(element, compareArray)) { increment = increment + -1; }

    io.emit('result', {
      otherHands: compareArray,
      hand: element,
      increment: increment,
      UUID: submittedHands[i][1],
      waiting: false
      }
    );
  }
};

getIdArray = function(submittedHands) {
  var idArray = [];
  for (i = 0; i < submittedHands.length; i++) {
    idArray.push(submittedHands[i][1]);
  }
  return idArray;
}

notSubmitted = function(id, submittedHands) {
  var idArray = getIdArray(submittedHands);
  index = idArray.indexOf(id);
  bool = (index == -1);
  return bool;
}

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){

  io.emit('users', {
    users: io.engine.clientsCount
  });
  console.log('Users: ' + io.engine.clientsCount);

  socket.on('show', function(hand, fn){
    usersCount = io.engine.clientsCount;

    if (usersCount == 1) {
      submittedHands = [[Math.floor(3*Math.random()), "Fake UUID"]];
    }
    else if (submittedHands.length == 0) {
      io.emit('first hand submitted', roundTime, socket.conn.id);

      roundTimer = setTimeout(function(){
        if (submittedHands.length  == 1) {
          submittedHands.push([Math.floor(3*Math.random()), "Fake UUID"]);
        }
        checkWhoWon(submittedHands);
        submittedHands = [];
      }, roundTime * 1000);
    }

    if (notSubmitted(socket.conn.id, submittedHands)) {
      submittedHands.push([hand, socket.conn.id]);
    }

    console.log(submittedHands);

    if (submittedHands.length >= usersCount) {

      console.log('End of round');
      clearTimeout(roundTimer);
      checkWhoWon(submittedHands);
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
