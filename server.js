// server.js

'use strict';

const Logger = require("./src/server/logger");
const Game = require("./src/server/game");
const Client = require("./src/server/client");
const HeartMonitor = require("./src/server/heart_monitor");

// Use express to open a web server
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { wsEngine: 'ws' });

var clients = new Map(); // contains socket connections and player objects

var game = new Game("Killing Floor", new Map()); // new map here is just clients in this specific game

HeartMonitor.setClients(clients);

app.use(express.static(__dirname + '/node_modules')); // makes node_modules folder publicly accessible
app.use(express.static(__dirname + '/public')); // makes public folder publicly accessible
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// -- ROUTING --
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/public/html/login-page.html');
});

app.post('/login', function(req, res, next) {
    let username = req.body.username;
    if(!HeartMonitor.isRunning()) {
      HeartMonitor.beginMonitor();
    }

    if(clients.has(username)) {
      res.send(false);
    }
    else {
      Logger.log('Client ' + username + ' signed in.');
      let new_client = new Client(username)
      clients.set(username, new_client);
      HeartMonitor.beat(new_client);
      res.send(true);
    }
});

app.post('/game-lobby', function(req, res, next) {
  if(clients.has(req.body.username)) {
    res.sendFile(__dirname + '/public/html/game-lobby.html');
    HeartMonitor.beat(clients.get(req.body.username));
  }
  else {
    // res.sendFile(__dirname + '/public/html/login-page.html');
  }
});

app.get('/game-list', function(req, res, next) {
  res.send({names:[game.name]});
});

app.post('/join-game', function(req, res, next) {
  // console.log(req.body.game_name);
  let username = req.body.username
  if (clients.has(username)) { //idk about this check...
    res.sendFile(__dirname + '/public/html/index.html');
    HeartMonitor.beat(clients.get(username));
  }
  else {
    Logger.log('Nonexistent client requested a game page: ' + username);
    res.sendFile(__dirname + '/public/html/login-page.html');
  }
});

app.post('/remove-username', function(req, res, next) {
  try {
    let username = req.body.username;
    destroyClient(username);
    Logger.log("SERVER: Client " + username + " has been removed from the server by request.");
    res.sendFile(__dirname + '/public/html/login-page.html');
  } catch(e) {
    Logger.log(e);
    res.sendFile(__dirname + '/public/html/login-page.html');
  }
});

// this function must be redefined
// HeartMonitor.declareDeath = function(client){
//   destroyClient(client.name);
//   Logger.log("SERVER: Client " + client.name + " has been removed from the server due to inactivity");
// };

function destroyClient(name){
  if(clients.get(name).isInGame()){
    //The client is in game. Because there's only one game(for now) remove them from the Killing Floor
    game.removeClient(name);
  }
  clients.delete(name);
}

// -- ClIENT LISTENERS --
server.listen(8080, '0.0.0.0'); // begin listening
Logger.log("SERVER: listening...");
io.on('connection', function(connection) {

  // Checking user exists, whether or not user is in game, etc. (starting housekeeping)
  var handshakeData = connection.request;
  var username = handshakeData._query['username'];

  if(!clients.has(username)){
    Logger.log('Nonexistent client attempted game connection: ' + username);
    connection.emit('rejected', "log back in ya dope");
    connection.disconnect();
    return;
  }
  var client = clients.get(username);

  if(client.isInGame()){
    Logger.log('Client in-game tried to join another game: ' + username);
    connection.emit('rejected', "you are already in game");
    connection.disconnect();
    return;
  }

  client.connection = connection;
  client.game = game.name;

  /* API 'init_client'
     input: {x, y}
      - avoids colliding start positions
      - initializes the client and clientbodies objects and puts into maps
      - restarts physics loop when the client is added to an empty client map
  */
  client.on('init_client', function(new_player_loc, init_username){
    game.addClient(client, username, new_player_loc);
    //TODO: defend against multiple 'init_client' emits
    Logger.log('Client ' + username + ' opened a game socket.');

    if(game.clients.size <= 1 && !game.isRunning()) {
      try{
        game.start();
        Logger.log("SERVER: Game \'" + game.name + "\' started." );
      }catch(e){}
    }
  });


  /* API 'move'
     input: {x, y}
      - updates the client's move data
      - checks if the clients prediction is too off
      - sends correction data to client if prediction is wrong
  */
  client.on('move', function(pack){
    if(!clients.has(username)){return;}
    try{
      game.movePlayer(username, pack);
    }catch(e){
      Logger.log("SERVER: Client \'" + username + "\' movement caused error:" );
      console.log(e);
    }
  });

  //TODO: API comment for attack
  client.on('attack', function(){
    try{
      game.attackFrom(username);
    }catch(e){
      Logger.log("SERVER: Client \'" + username + "\' attack caused error:" );
      console.log(e);
    }
  });

  /* API 'disconnect'
     input: {}
      - removes the client data from the clients and clientbodies map
      - shuts down the physics loop if this was the last client to leave
  */
  client.on('disconnect', function(){
    Logger.log("Client " + username + " disconnected from the game \""+client.game+"\"");

    game.removeClient(username);

    if(game.clients.size === 0){
        game.stop();
        Logger.log("SERVER: Game \'" + game.name + "\' shut down." );
    }
  });
});

/*
SEND API
    -'all'
        send data: {locations:[{x,y},{x,y},...], self_index}

    -'correction'
        send data: {x, y}
*/
