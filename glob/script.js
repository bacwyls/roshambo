$(document).ready ( function(){

var urbithttp = require("@urbit/http-api");
var urbitob = require("urbit-ob");

var urb = new urbithttp.Urbit('', '', 'roshambo');
urb.ship = window.ship;
urb.verbose = true;

urb.subscribe({
    app: "roshambo",
    path: "/game-updates",
    event: updateGameState,
    err: console.log,
    quit: console.log,
  });


function shoot() {

  var choices = document.getElementsByName('rshb');

  var chosen = false;
  var choice;
  for(i=0; i < choices.length; i++) {
    if(choices[i].checked) {
      chosen = true;
      choices[i].checked = false;
      console.log(choices[i].value);
      choice = choices[i].value;
    }
  }

  opponent = document.getElementById('rshb-opponent-patp');
  console.log("OPPONENT:");
  console.log(opponent);
  
  if(!chosen) {
    console.log("nothing is chosen");
  }
  else {
    console.log("poking:");
    urb.poke({ app:'roshambo', mark:'roshambo-ui-shoot',
    json: choice[0]
    });
    urb.poke({ app:'roshambo', mark:'roshambo-ui-poise',
    json: opponent
    });
  }
}

button = document.getElementById('rshb-shoot-button'); 
button.addEventListener('click', shoot);

function char_to_shoot(c) {
  if(c == "r"){
    return "rock";
    }
  else if(c == "p"){
    return "paper";
    }
  else if(c == "s"){
    return "scissors";
    }
  else return null;
}

function compute_game_result(shoot_self, shoot_opponent) {
  shoot_self = shoot_self[0];
  shoot_opponent = shoot_opponent[0];

  if(shoot_self == shoot_opponent) {
    return 3;
  }
  if( ((shoot_self == "r") && (shoot_opponent == "s")) ||
      ((shoot_self == "s") && (shoot_opponent == "p")) ||
      ((shoot_self == "p") && (shoot_opponent == "r")) ){
    return 1;
  }
  return 2;
  
}

function updateGameState(newGameState) {
  var shoot_opponent = newGameState['shoot-opponent']['shot'];
  var shoot_self = newGameState['shoot-self']['shot'];
  shoot_opponent = char_to_shoot(shoot_opponent);
  shoot_self = char_to_shoot(shoot_self);

  set_you_play(shoot_self);
  set_them_play(shoot_opponent);
  var game_result = compute_game_result(shoot_self, shoot_opponent);
  set_game_result(game_result);
}


function exit() {
  console.log("exit game");
  set_you_play("~");
  set_them_play("~");
  set_game_result(0);
  set_ui_state(0);
}
button = document.getElementById('rshb-leave-button'); 
button.addEventListener('click', exit);

function play() {
  var them = document.getElementById('rshb-opponent');
  if(urbitob.isValidPatp(them.value)){
    console.log("play game");
    console.log(them.value);
    set_you_play("~");
    set_them_play("~");
    set_opponent_patp(them.value);
    set_game_result(0);
    set_ui_state(2);
  }
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
  if(result == 3) {
    // tie
    winnerblock.style.backgroundColor = "yellow";
    winnerblock.style.color = "black";
    winnermsg.textContent = "you tied :/";
  }
}
function set_opponent_patp(patp) {
  document.getElementById('rshb-opponent-patp').textContent = patp;
}

function set_you_play(play) {
  document.getElementById('rshb-you-play').textContent = play;
}

function set_them_play(play) {
  document.getElementById('rshb-them-play').textContent = play;
}

});

