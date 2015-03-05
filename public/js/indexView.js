var array = ['PAPER', 'SCISSORS', 'ROCK'];
var socket = io();
var UUID = generateUUID();
var points = 0;

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

$('form').submit(function(){
  var inputVal   = $('#m').val();
  var outgoing   = inputVal.toUpperCase();
  var validInput = (array.indexOf(outgoing)) != -1;

  if (!validInput || inputVal == "") { outgoing = array[Math.floor(3*Math.random())] }

  var index        = array.indexOf(outgoing);
  var messageArray = [index, UUID];

  socket.emit('show', messageArray);

  $('#m').val('');
  $('button').attr('disabled', true);
  return false;
});

socket.on('result', function(result){
  $('button').attr('disabled', result.disableBtn);
  if (UUID == result.UUID){
    $('#messages').append($('<li>').text('You went: ' + array[result.hand] + ' ' + displayOtherHands(result.otherHands)));
    points = points + result.increment;
    $('#messages').append($('<li>').text('Your tally: ' + points));
  }
  $('button').attr('disabled', result.disableBtn);
  return false;
});

socket.on('users', function(counter){
  if (counter == 1) {
    $('#messages').append($('<li>').text("Things are looking a bit lonely here, if you want to play you'll be playing against our bot."));
  }
  else {
    $('#messages').append($('<li>').text("You're playing with " + counter + " players."));
  }
})
