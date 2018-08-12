//client_game.js
'use strict';

const game_core = require('../shared/game_core');
const Player = require('../shared/player');
const Entity = require('./entity');
const Bullet = require('../shared/bullet');

const Renderer = require('./rendering/renderer');
const RoomStructure = require('../shared/room_structure.js');

var interval;

var FPS = 60;

var main_player = new Player();
var others = [];
var bullets = [];
var self_index = -1;

RoomStructure.init(2, 2);
Renderer.setMainPlayer(main_player);
Renderer.setOthers(others, -1);
Renderer.setBullets(bullets);

var last_update = 0;
var delta_time = 0;

var update_queue = [];
var oldest_update;
var update_delay = 100; //millisF
var correction_counter = 0;

// connects at the ip addess and port of the page
var socket = io.connect({ query: "username="+sessionStorage.getItem("username") });

socket.on('connect', function(data) {
   main();
});

function intializeControls() {
  document.addEventListener('keydown', checkKeyDown);
	document.addEventListener('keyup', checkKeyUp);
}

function main(){
  intializeControls();
  main_player.room_location = {r:0, c:0};

  last_update = Date.now();
  interval = setInterval(function(){Update();Renderer.render();}, 1000/FPS);


  //make sure the default position is not colliding with anything
  socket.emit('init_client', main_player.location, sessionStorage.getItem("username"));
}

//        --- UPDATE ---
function Update(){
  updateDeltaTime();

  updatePlayer();

  RoomStructure.update(main_player);

  updateOthers();

  //if(main_player.moving)
  socket.emit('move', {loc: main_player.location, ori: main_player.orientation, cc: correction_counter});
}

function updateDeltaTime() {
  delta_time = Date.now() - last_update;
  last_update = Date.now();
}

function updatePlayer() {
  var old_loc = main_player.move(delta_time);
  main_player.old_location = old_loc;

  var colliding_box = game_core.anyIntersect(main_player, others, self_index);
  if(colliding_box){
    game_core.smoothCollision(main_player, old_loc, colliding_box);
  }

  makeBullet(main_player.excecuteCommands());
}

function makeBullet(bullet){
  if(bullet){
    // RoomStructure.checkBullet
    computeBulletCollision(bullet);
    bullet.startFade();
    bullets.push(bullet);
    socket.emit('attack');
  }
}

function computeBulletCollision(bullet){
  if(others[1]){
    bullet.collide(others[1]);
  }
}

function updateOthers(){
  if(oldest_update === undefined || update_queue === undefined) return;

  if(update_queue.length === 0) return;

  if(others.length != oldest_update.state.locations.length){
    oldest_update = update_queue.shift();
    return;
  }

  let current_time = Date.now();
  let delayed_time = current_time - update_delay - oldest_update.timestamp;

  for(var i in others){
    if (i >= update_queue[0].state.locations.length)
      break;
    if(i != self_index){
      let startloc = oldest_update.state.locations[i];
      let endloc = update_queue[0].state.locations[i];
      let d_time = update_queue[0].timestamp - oldest_update.timestamp;
      others[i].interpolate(startloc, endloc, d_time, delayed_time);

      //others[i].orientation = oldest_update.state.orientations[i];
      let startori = oldest_update.state.orientations[i];
      let endori = update_queue[0].state.orientations[i];
      others[i].interpolateOrientation(startori, endori, d_time, delayed_time);
    }
    else{
      var index = update_queue[update_queue.length-1].state.self_index;
      others[i].location = update_queue[update_queue.length-1].state.locations[index];
      others[i].orientation = update_queue[update_queue.length-1].state.orientations[index];
    }
  }

  while(update_queue.length > 0 && current_time-update_queue[0].timestamp >= update_delay){
    oldest_update = update_queue.shift();
  }
}

function setState(state){
  //removes excess others
  if(others.length > state.locations.length){
    others.splice(state.locations.length-1, others.length-state.locations.length);
  }
  //adds extra others
  else if(others.length < state.locations.length){
    for(var i=others.length; i<state.locations.length; i++){
      others.push(new Entity(
         state.names[i],
         "human",
         state.locations[i],
         state.dimensions[i],
         state.orientations[i])
       );
    }
  }

  self_index = state.self_index;
  Renderer.setSelfIndex(state.self_index);
}


//        --- SERVER LISTENERS ---
/* API 'all'
   input: {locations: [{x,y},{x,y},...], orientations: []}
    - pushes the new state into the update queue
*/
socket.on('all', function(state) {
    if(oldest_update === undefined){
      oldest_update = {state, timestamp: Date.now()};
    }
    else{
      update_queue.push({state, timestamp: Date.now()});
    }
});

/* API 'init_entities'
   input: {names, locations: [{x,y},{x,y},...], ori}
    - Initializes all entities with essential data
*/
socket.on('init_entities', function(state) {
    setState(state);
});

/* API 'correction'
   input: {x,y}
    - Immediately updates the player location
*/
socket.on('correction', function(pack){
  if(pack.cc !== correction_counter) {return;}
  main_player.location = pack.corrected_location;
  correction_counter++;
});

socket.on('reduce_health', function(new_health) {
  main_player.health = new_health;
  let life_bar = document.getElementById("life-bar");
  life_bar.value = new_health;
});

socket.on('bullet', function(bullet_info){
  var bullet = new Bullet();
  bullet.fire(bullet_info.x, bullet_info.y, bullet_info.ori);
  bullet.startFade();
  bullets.push(bullet);
  others[bullet_info.player].sprite.shoot();
});

socket.on('died', function(){
  let username = sessionStorage.getItem('username');
  clearInterval(interval);

  $.post({url: '/game-lobby', data: {username}, success: function(result) {
    document.open();
    document.write(result);
    document.close();
  }});
})

socket.on('rejected', function(){
  clearInterval(interval);
  alert("You've been kicked from the game. Log back in.");
});

//      --- CONTROL LISTENERS ---
const KEY_UP=87, KEY_DOWN=83, KEY_LEFT=65, KEY_RIGHT=68;
function checkKeyDown(evt) {
  // evt.preventDefault();
  if (evt.keyCode === KEY_LEFT)
    main_player.commands.left = true;
  if (evt.keyCode === KEY_RIGHT)
    main_player.commands.right = true;
  if (evt.keyCode === KEY_UP)
    main_player.commands.up = true;
  if (evt.keyCode === KEY_DOWN)
    main_player.commands.down = true;
}

function checkKeyUp(evt){
  // evt.preventDefault();
  if (evt.keyCode === KEY_LEFT)
    main_player.commands.left = false;
  if (evt.keyCode === KEY_RIGHT)
    main_player.commands.right = false;
  if (evt.keyCode === KEY_UP)
    main_player.commands.up = false;
  if (evt.keyCode === KEY_DOWN)
    main_player.commands.down = false;
}

addEventListener("mousedown", function() {
  main_player.commands.left_click = true;
  let new_bullet = main_player.attack();
  makeBullet(new_bullet);
});
addEventListener("mouseup", function() {
  main_player.commands.left_click = false;
});

$(window).resize(function() {Renderer.changeCanvasToFull();});
