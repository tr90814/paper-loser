var array       = ['PAPER', 'SCISSORS', 'ROCK'];
var socket      = io();
var buttons     = $('button');
var title       = $('h1');
var waitingText = $('.waiting-container > p')
var pause       = false;
var points      = 0;
var counter     = undefined;
var UUID        = undefined;

init = function() {
  $(document.body).addClass('waiting');
  title.fadeIn();
  socket.emit('hello', function(ID){
    UUID = ID;
    setTimeout(function(){
      document.body.className = 'app intro';
    }, 2000)
  });
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

function sendShow(hand) {
  socket.emit('show', hand, function(time){
    shownHand = true;
  });
  document.body.className = 'waiting';
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

function timer(time) {
  clearInterval(counter);
  var time    = time;
  counter = setInterval(countDown, 1000);

  function countDown() {
    time = time - 1;
    if (time <= 0) {
      clearInterval(counter);
      return;
    }
    $('.count-down').html(time);
  }
}

buttons.on('click', function(){
  var hand = $(this).data('hand');
  if (hand == '-1') {
    hand = Math.floor(3*Math.random());
  }
  sendShow(hand);
});

socket.on('result', function(result){
  clearInterval(counter);
  $('.hand').html('You went: ' + array[result.UUID.hand] + ' ' + displayOtherHands(result.UUID.otherHands));
  points = points + result.UUID.increment;
  $('.points').html('Points: ' + points);
  if (!result.waiting) { document.body.className = 'app'; }
});

socket.on('users', function(obj){
  if (obj.users <= 1) { $('.players').html("You're playing on your own (against our bot)."); }
  else                { $('.players').html("Players: " + obj.users); }
  if (obj.waiting)    { document.body.className = 'waiting'; }
  else                { document.body.className = 'app'; }
})

socket.on('first hand submitted', function(time, ID){
  if (UUID != ID) {
    $('.hand').html(
      "<span class='instructions'>Someone has submitted their " +
      "next hand.<br>You have <span class='count-down'></span>s " +
      "to submit a hand for this round.</span>"
    );
  }
  timer(time);
})

init();
