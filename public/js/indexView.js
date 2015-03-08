var array   = ['PAPER', 'SCISSORS', 'ROCK'];
var socket  = io();
var UUID    = generateUUID();
var points  = 0;
var buttons = $('button');
var counter = 0;
var timer = 10;
var pause = false;

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

  $('button').attr('disabled', true);
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
    $('.points').html('Your tally: ' + points);
  }
  buttons.attr('disabled', result.disableBtn);
  return false;
});

socket.on('users', function(counter){
  if (counter == 1) {
    $('.hand').html("Things are looking a bit lonely here, if you want to play you'll be playing against our bot.");
  }
  else {
    $('.hand').html("You're playing with " + counter + " players.");
  }
})
