$(document).ready ( function(){

var urbithttp = require("@urbit/http-api");
// var urbitob = require("urbit-ob");

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


// SSE handler
// %roshambo sends game state upon:
// getting game results
// updates DOM accordingly
var global_shoot_time;
function updateGameState(newGameState) {
  var shoot_time = newGameState['poise']['shoot-time'];
  var latency = newGameState['poise']['latency'];
  var current_time = new Date().getTime();
  global_shoot_time = shoot_time;

  // results are in
  var shoot_opponent = newGameState['shoot-opponent']['shot'];
  var shoot_self = newGameState['shoot-self']['shot'];
  var game_result = computeGameResult(shoot_self, shoot_opponent);
  setGameStatus(game_result);

  shoot_opponent = charToShoot(shoot_opponent);
  shoot_self = charToShoot(shoot_self);
  setYouPlay(shoot_self);
  setThemPlay(shoot_opponent);
}


/*
 * click events
 */

// exit game
function exit() {
  setYouPlay("~");
  setThemPlay("~");
  setGameStatus(0);
  setUIState(0);
}
button = document.getElementById('leave-button'); 
button.addEventListener('click', exit);

// start game
var global_opponent;
function play() {
  var them = document.getElementById('opponent');
  global_opponent = them.value;

  setYouPlay("~");
  setThemPlay("?");
  setOpponentPatp(global_opponent);
  setGameStatus(0);
  setUIState(1);
}
button = document.getElementById('start-button'); 
button.addEventListener('click', play);

// set shoot and poise
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

  if(!chosen) return;

  // %poise if not already set
  var current_time = new Date().getTime();
  if( global_game_status != 1 ||
      current_time > global_shoot_time ) {
    urb.poke({ app:'roshambo',
               mark:'roshambo-ui-poise',
               json: global_opponent });
    urb.poke({ app:'roshambo',
               mark:'roshambo-ui-shoot',
               json: choice[0] });
    setGameStatus(0);
    setYouPlay(choice);
    setThemPlay("?");

  }
}
button = document.getElementById('shoot-button'); 
button.addEventListener('click', shoot);


/*
 * helpers for manipulating DOM
 */

var global_ui_state;
function setUIState(ui_state) {
  global_ui_state = ui_state;
  var nogame = document.getElementById('no-game');
  var playgame = document.getElementById('game');
  if(ui_state == 0) {
    playgame.style.display = 'none';
    nogame.style.removeProperty('display');
  }
  else if(ui_state == 1) {
    nogame.style.display = 'none';
    playgame.style.removeProperty('display');
  }
}

var global_game_status;
function setGameStatus(game_status) {
  var statusblock = document.getElementById('status-block');
  var statusmsg   = document.getElementById('status-msg'); 
  global_game_status = game_status;

  switch(game_status) {
  case 0:
    // default
    statusblock.style.removeProperty('background-color');
    statusblock.style.color = "black";
    statusmsg.textContent = "...";
    break;
  case 1:
    // you win
    statusblock.style.backgroundColor = "green";
    statusblock.style.color = "white";
    statusmsg.textContent = "you win!";
    break;
  case 2:
    // you lose
    statusblock.style.backgroundColor = "red";
    statusblock.style.color = "white";
    statusmsg.textContent = "you lose :-(";
    break;
  case 3:
    // tie
    statusblock.style.backgroundColor = "gray";
    statusblock.style.color = "white";
    statusmsg.textContent = "you tied :/";
    break;
  }
}

// accepts two strings r, p, or s
// returns a game_status int for setGameStatus
// 1 : win
// 2 : lose
// 3 : tie
function computeGameResult(shoot_self, shoot_opponent) {
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

function charToShoot(c) {
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

function setOpponentPatp(patp) {
  document.getElementById('opponent-patp').textContent = patp;
}

function setYouPlay(play) {
  document.getElementById('you-play').textContent = play;
}

function setThemPlay(play) {
  document.getElementById('them-play').textContent = play;
}
});

