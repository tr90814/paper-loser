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

var getIdArray = function(submittedHands) {
  var idArray = [];
  for (i = 0; i < submittedHands.length; i++) {
    idArray.push(submittedHands[i][1]);
  }
  return idArray;
}

exports.checkWhoWon = function(submittedHands, i) {
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
  return {
  otherHands: compareArray,
  hand: element,
  increment: increment,
  UUID: submittedHands[i][1],
  waiting: false
  };
};

exports.notSubmitted = function(id, submittedHands) {
  var idArray = getIdArray(submittedHands);
  index = idArray.indexOf(id);
  bool = (index == -1);
  return bool;
}
