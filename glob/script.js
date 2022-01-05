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


// called for subscribe gifts
// %roshambo sends its full state upon:
// establishing a game
// and
// getting game results
var global_timer;
var global_shoot_time;
function updateGameState(newGameState) {
  var shoot_time = newGameState['poise']['shoot-time'];
  var latency = newGameState['poise']['latency'];
  var current_time = new Date().getTime();
  global_shoot_time = shoot_time;

  if((current_time >= shoot_time) && (current_time < shoot_time+latency)) {
    // results are in
    var shoot_opponent = newGameState['shoot-opponent']['shot'];
    var shoot_self = newGameState['shoot-self']['shot'];
    shoot_opponent = char_to_shoot(shoot_opponent);
    shoot_self = char_to_shoot(shoot_self);

    set_you_play(shoot_self);
    set_them_play(shoot_opponent);
    var game_result = compute_game_result(shoot_self, shoot_opponent);
    set_game_status(game_result);
  }
  else if(current_time < shoot_time) {
    // game is established
    global_timer = setInterval(setTimer, 500);
    set_game_status(1);
  }
}

function setTimer() {
  var statusmsg = document.getElementById('rshb-status-msg'); 
  var current_time = new Date().getTime();
  var diff = global_shoot_time - current_time;
  statusmsg.textContent = Math.ceil(diff/1000) + " seconds.";
  if(diff < 1000) {
    clearInterval(global_timer);
  }
}

// used in updateGameState
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

// used in updateGameState
function compute_game_result(shoot_self, shoot_opponent) {
  shoot_self = shoot_self[0];
  shoot_opponent = shoot_opponent[0];

  if(shoot_self == shoot_opponent) {
    return 4;
  }
  if( ((shoot_self == "r") && (shoot_opponent == "s")) ||
      ((shoot_self == "s") && (shoot_opponent == "p")) ||
      ((shoot_self == "p") && (shoot_opponent == "r")) ){
    return 2;
  }
  return 3;
}


// set shoot and poise
// uses http-api pokes
function shoot() {
  var choices = document.getElementsByName('rshb');

  var chosen = false;
  var choice;
  for(i=0; i < choices.length; i++) {
    if(choices[i].checked) {
      chosen = true;
      choices[i].checked = false;
      choice = choices[i].value;
    }
  }

  opponent = document.getElementById('rshb-opponent-patp');
  
  if(chosen) {
    set_you_play("~");
    set_them_play("~");

    urb.poke({ app:'roshambo', mark:'roshambo-ui-shoot',
      json: choice[0]
    });

    // don't reset %poise if already set
    if(global_game_status != 1 ) {
      urb.poke({ app:'roshambo', mark:'roshambo-ui-poise',
        json: opponent.innerHTML
      });

      set_game_status(0);
    }

  }
}
button = document.getElementById('rshb-shoot-button'); 
button.addEventListener('click', shoot);

// exit game
function exit() {
  set_you_play("~");
  set_them_play("~");
  set_game_status(0);
  set_ui_state(0);
}
button = document.getElementById('rshb-leave-button'); 
button.addEventListener('click', exit);

// start game
function play() {
  var them = document.getElementById('rshb-opponent');
  if(!urbitob.isValidPatp(them.value)){
    return;
  }
  set_you_play("~");
  set_them_play("~");
  set_opponent_patp(them.value);
  set_game_status(0);
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

var global_game_status;
function set_game_status(game_status) {
  var statusblock= document.getElementById('rshb-status-block');
  var statusmsg   = document.getElementById('rshb-status-msg'); 
  global_game_status = game_status;

  switch(game_status) {
  case 0:
    // no current winner
    statusblock.style.removeProperty('background-color');
    statusblock.style.color = "black";
    statusmsg.textContent = "...";
    break;
  case 1:
    // confirmed time
    statusblock.style.removeProperty('background-color');
    statusblock.style.color = "black";
    break;
  case 2:
    // you win
    statusblock.style.backgroundColor = "green";
    statusblock.style.color = "white";
    statusmsg.textContent = "you win!";
    break;
  case 3:
    // you lose
    statusblock.style.backgroundColor = "red";
    statusblock.style.color = "white";
    statusmsg.textContent = "you lose :-(";
    break;
  case 4:
    // tie
    statusblock.style.backgroundColor = "yellow";
    statusblock.style.color = "black";
    statusmsg.textContent = "you tied :/";
    break;
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

