var array   = ['PAPER', 'SCISSORS', 'ROCK'];
var socket  = io();
var UUID    = generateUUID();
var points  = 0;
var buttons = $('button');
var body    = $(document.body);
var waitingText = $('.waiting-container > p')
var counter = 0;
var timer   = 10;
var pause   = false;
var title = $('h1');

init = function() {
  socket.emit('hello', UUID);
  body.addClass('waiting');
  title.fadeIn();
  setTimeout(function(){
    document.body.className = 'app intro';
  }, 2000)
}

window.addEventListener("devicemotion", function(event) {
  if ((event.acceleration.y > 4) || (event.acceleration.x > 4) && !pause) {
    counter = counter + 1;
    pause = true;
    setTimeout(function(){
      pause = false;
    }, 1000)
  }
  if (counter > 2) {
    outgoing = Math.floor(3*Math.random())
    sendShow(outgoing);
    counter = 0;
  }
}, true);

function sendShow(outgoing) {
  var messageArray = [outgoing, UUID];

  socket.emit('show', messageArray);
  document.body.className = 'waiting';
  // document.querySelector('animate').beginElement();
}

function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x7|0x8)).toString(16);
  });
  return uuid.toUpperCase();
}

function displayOtherHands(handsArray) {
  var hands = "(";
  for(i=0; i < handsArray.length; i++) {
    var hand = array[handsArray[i]];
    hands = hands + " VS " + hand;
  }
  hands = hands + " )"
  return hands;
}

buttons.on('click', function(){
  var outgoing = $(this).data('hand');
  if (outgoing == '-1') {
    outgoing = Math.floor(3*Math.random());
  }

  sendShow(outgoing);
  return false;
});

socket.on('result', function(result){
  if (UUID == result.UUID){
    $('.hand').html('You went: ' + array[result.hand] + ' ' + displayOtherHands(result.otherHands));
    points = points + result.increment;
    $('.points').html('Points: ' + points);
  }
  if (result.disableBtn) {
    document.body.className = 'waiting';
  } else { document.body.className = 'app'; }
  return false;
});

socket.on('users', function(counter){
  if (counter == 1) {
    $('.players').html("You're playing on your own (against our bot).");
  }
  else {
    $('.players').html("Players: " + counter);
  }
})

socket.on('disconnect', function(UUIDToDisconnect) {
  if (UUID == UUIDToDisconnect) {
    socket.disconnect();
  }
  $('.message-container p').html("Someone took too long to respond so they were kcicked.<br>Play the round again.");
  document.body.className = 'message';
  setTimeout(function() {
    document.body.className = 'app';
  }, 3000)
})

init();
