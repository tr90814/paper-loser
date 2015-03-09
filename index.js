var express = require('express');
var app = express();
// var helpers = require('helpers');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var counter = 0;
var showArray = [];
var timeout;
var UUIDs = [];
var roundTimer = undefined;
var roundTime = 10;

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

checkWhoWon = function(showArray) {
  for ( i = 0; i < showArray.length; i++) {
    var compareArray = [];
    var increment = 0;
    for ( j = 0; j < showArray.length; j++) {
      if(j != i) {
        compareArray.push(showArray[j][0]);
      }
    }
    var element = showArray[i][0];
    if (beatsOne(element, compareArray)) { increment = increment + 1; }
    else if (isBeaten(element, compareArray)) { increment = increment + -1; }
    io.emit('result', {
      otherHands: compareArray,
      hand: element,
      increment: increment,
      UUID: showArray[i][1],
      waiting: false
      }
    );
  }
};

getIdArray = function(showArray) {
  var idArray = [];
  for (i = 0; i < showArray.length; i++) {
    idArray.push(showArray[i][1]);
  }
  return idArray;
}

notSubmitted = function(msgArray, showArray) {
  var idArray = getIdArray(showArray);
  index = idArray.indexOf(msgArray[1]);
  bool = (index == -1);
  return bool;
}

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
  counter = socket.conn.server.clientsCount;
  io.emit('users', { counter: counter });

  socket.on('show', function(msgArray){
    console.log(msgArray);
    if (counter == 1) {
      showArray = [[Math.floor(3*Math.random()), "Fake UUID"]];
    }
    else if (showArray.length == 0) {
      io.emit('show submitted', msgArray[1], roundTime);
      roundTimer = setTimeout(function(){
        console.log(showArray);
        if (showArray.length  == 1) {
          showArray.push([Math.floor(3*Math.random()), "Fake UUID"]);
        }
        checkWhoWon(showArray);
        showArray = [];
      }, roundTime * 1000);
    }
    if (notSubmitted(msgArray, showArray)) {
      showArray.push(msgArray);
    }
    if (showArray.length == counter) {
      clearTimeout(roundTimer);
      checkWhoWon(showArray);
      showArray = [];
    }
  });

  socket.on('disconnect', function(socket){
    counter = counter - 1;
    showArray = [];
    io.emit('users', { counter: counter, waiting: false });
  });

  socket.on('hello', function(UUID){
    UUIDs.push(UUID);
    console.log('User count = ' + counter);
  })
});

http.listen((process.env.PORT || 5000), function(){
  console.log('listening on ' + 5000);
});
