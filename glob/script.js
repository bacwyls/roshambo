$(document).ready ( function(){

var uhapi = require("@urbit/http-api");

var urb = new uhapi.Urbit('', '', 'roshambo');
urb.ship = window.ship;
urb.verbose = true;

function shoot() {

  var choices = document.getElementsByName('rshb');

  var chosen = false;
  for(i=0; i < choices.length; i++) {
    if(choices[i].checked) {
      chosen = true;
      choices[i].checked = false;
      console.log(choices[i].value);
    }
  }
  
  if(!chosen) {
    console.log("nothing is chosen");
  }
  else {
    console.log("poking:");
    urb.poke({ app:'roshambo', mark:'roshambo-action', json:'pancake'});
  }
}
button = document.getElementById('rshb-shoot-button'); 
button.addEventListener('click', shoot);


function exit() {
  console.log("exit game");
  set_ui_state(0);
}
button = document.getElementById('rshb-leave-button'); 
button.addEventListener('click', exit);

function play() {
  var them = document.getElementById('rshb-opponent');
  console.log("play game");
  console.log(them.value);
  set_ui_state(2);
}
button = document.getElementById('rshb-start-button'); 
button.addEventListener('click', play);


function set_ui_state(state) {
  var nogame = document.getElementById('rshb-no-game');
  var waiting = document.getElementById('rshb-start-wait');
  var playgame = document.getElementById('rshb-game');
  if(state == 0) {
    
    nogame.style.removeProperty('display');
    waiting.style.display = 'none';
    playgame.style.display = 'none';
  }
  else if(state == 1) {
    nogame.style.removeProperty('display');
    waiting.style.removeProperty('display');
    playgame.style.display = 'none';
  }
  else if(state == 2) {
    nogame.style.display = 'none';
    waiting.style.display = 'none';
    playgame.style.removeProperty('display');
  }
}

function set_game_result(result) {
  var winnerblock = document.getElementById('rshb-winner-block');
  var winnermsg   = document.getElementById('rshb-winner-msg'); 

  if(result == 0) {
    // no current winner
    winnerblock.style.removeProperty('background-color');
    winnerblock.style.color = "black";
    winnermsg.textContent = "...";
    
  }
  else if (result == 1) {
    // you win
    winnerblock.style.backgroundColor = "green";
    winnerblock.style.color = "white";
    winnermsg.textContent = "you win!";
  }
  else if (result == 2) {
    // you lose
    winnerblock.style.backgroundColor = "red";
    winnerblock.style.color = "white";
    winnermsg.textContent = "you lose :-(";
  }
}

function set_you_play(play) {
  document.getElementById('rshb-you-play').textContent = play;
}

function set_them_play(play) {
  document.getElementById('rshb-them-play').textContent = play;
}

});

