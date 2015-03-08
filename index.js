var express = require('express');
var app = express();
// var helpers = require('helpers');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var counter = 0;
var showArray = [];
var timeout;
var UUIDs = [];

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
      disableBtn: false}
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

playerTimeout = function(showArray) {
  clearTimeout('timeout');
  setTimeout(function(){
    var idArray = getIdArray(showArray);
    for (i = 0; i < UUIDs.length; i++) {
      if ((idArray.indexOf(UUIDs[i]) == -1) && (showArray.length != counter)) {
        io.emit('disconnect', UUIDs[i]);
        console.log('disconnect ' + UUIDs[i]);
        UUIDs.splice(i, 1);
        console.log('User count = ' + UUIDs.length);
      }
    }
  }, 6000);
}

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
  counter = socket.conn.server.clientsCount;
  io.emit('users', counter);
  socket.on('show', function(msgArray){
    console.log(msgArray);
    playerTimeout(showArray);
    if (counter == 1) { showArray = [[Math.floor(3*Math.random()), "Fake UUID"]]; }
    if (notSubmitted(msgArray, showArray)) {
      showArray.push(msgArray);
      if ((showArray.length == counter) || (counter == 1)) { checkWhoWon(showArray); showArray = []; }
    }
  });
  socket.on('disconnect', function(socket){
    counter = counter - 1;
    showArray = [];
    io.emit('users', counter);
    io.emit('result', { disableBtn: false });
  });
  socket.on('hello', function(UUID){
    UUIDs.push(UUID);
    console.log('User count = ' + counter);
  })
});

http.listen((process.env.PORT || 5000), function(){
  console.log('listening on ' + 5000);
});
