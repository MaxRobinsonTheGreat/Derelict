// server.js

'use strict';

const Logger = require("./src/server/logger");
const Game = require("./src/server/game");
const Client = require("./src/server/client")

// Use express to open a web server
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var clients = new Map(); // contains socket connections and player objects
var client_counter=0; //increments with every added client

var game = new Game("only_game", new Map());

app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

// -- ROUTING --
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/public/html/login-page.html');
});
app.post('/', function(req, res, next) {
    let username = req.body.username;

    if(clients.has(username)) {
      res.sendFile(__dirname + '/public/html/login-page.html');
    }
    else {
      Logger.log('Client ' + username + ' signed in.');
      clients.set(username, '');
      res.sendFile(__dirname + '/public/html/index.html');
    }
});

// -- ClIENT LISTENERS --
server.listen(4200, '0.0.0.0'); // begin listening
Logger.log("SERVER: listening...");
io.on('connection', function(connection) {
  // var cur_name = (client_counter++)+"";

  if(clients.size == 0){
    connection.disconnect();
  }
  var username;
  var client = new Client(connection);


  /* API 'init_client'
     input: {x, y}
      - avoids colliding start positions
      - initializes the client and clientbodies objects and puts into maps
      - restarts physics loop when the client is added to an empty client map
  */
  client.on('init_client', function(new_player_loc, init_username){
    // Logger.log(process.memoryUsage().heapUsed + " MB"); shows how much memory the heap is using...
    username = init_username; //sets the client username so it can be removed

    if(!clients.has(username)){
      Logger.log('Nonexistent client attempted game init: ' + username);
      client.connection.emit('rejected', "log back in ya dope");
      connection.disconnect();
      return;
    }
    clients.set(username, client);
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
      Logger.log("SERVER: Client \'" + username + "\' sent broken data for movement." );
    }
  });

  client.on('attack', function(){
    try{
      game.attackFrom(username);
    }catch(e){
      Logger.log("SERVER: Client \'" + username + "\' sent broken data for an attack." );
    }
  });

  /* API 'disconnect'
     input: {}
      - removes the client data from the clients and clientbodies map
      - shuts down the physics loop if this was the last client to leave
  */
  client.on('disconnect', function(){

    clients.delete(username); //removes from the master map. should be done when they leave the lobby
    game.removeClient(username);

    Logger.log("Client " + username + " disconnected.");

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
