// server.js

'use strict';

const Logger = require("./src/server/logger");
const Game = require("./src/server/game");
const Client = require("./src/server/client")

// Use express to open a web server
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { wsEngine: 'ws' });

var clients = new Map(); // contains socket connections and player objects
var client_counter=0; // increments with every added client

var game = new Game("Killing Floor", new Map());

app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// -- ROUTING --
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/public/html/login-page.html');
});

app.post('/login', function(req, res, next) {
    let username = req.body.username;

    if(clients.has(username)) {
      res.send(false);
    }
    else {
      Logger.log('Client ' + username + ' signed in.');
      clients.set(username, new Client(username));
      res.send(true);
    }
});

app.post('/game-lobby', function(req, res, next) {
  if(clients.has(req.body.username)) {
    res.sendFile(__dirname + '/public/html/game-lobby.html');
  }
  else {
    // res.sendFile(__dirname + '/public/html/login-page.html');
  }
});

app.get('/game-list', function(req, res, next) {
  res.send({names:[game.name, "fat boy"]});
});

app.post('/join-game', function(req, res, next) {
  // console.log(req.body.game_name);
  if (clients.has(req.body.username)) { //idk about this check...
    res.sendFile(__dirname + '/public/html/index.html');
  }
  else {
    Logger.log('Nonexistent client requested a game page: ' + username);
  }
});

app.post('/remove-username', function(req, res, next) {
  clients.delete(req.body.username);

  if(clients.isInGame()){
    //The client is in game. Because there's only one game(for now) remove them from the Killing Floor
    game.removeClient(req.body.username);
  }
  Logger.log("SERVER: Client " + req.body.username + " ended their session.");
});

// -- ClIENT LISTENERS --
server.listen(8080, '0.0.0.0'); // begin listening
Logger.log("SERVER: listening...");
io.on('connection', function(connection) {
  // var cur_name = (client_counter++)+"";
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

    Logger.log('Client ' + username + ' opened a game socket.');

    if(clients.size <= 1 && !game.isRunning()) {
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
      Logger.log("SERVER: Client \'" + username + "\' movement caused error." );
      console.log(e);
    }
  });

  client.on('attack', function(){
    try{
      game.attackFrom(username);
    }catch(e){
      Logger.log("SERVER: Client \'" + username + "\' attack caused error." );
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

    if(clients.size === 0){
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
