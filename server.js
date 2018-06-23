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

var game = new Game("only_game", clients);//Object.assign({}, clients));

app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

// -- ROUTING --
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/public/html/login-page.html');
});
app.post('/login', function(req, res, next) {
    let body = req.body;
    res.sendFile(__dirname + '/public/html/index.html');
});

// -- ClIENT LISTENERS --
server.listen(4200, '0.0.0.0'); // begin listening
Logger.log("SERVER: listening...");
// io.set('transports', ['websocket']);
io.on('connection', function(new_client) {
  var cur_name = (client_counter++)+"";
    /* The client counter increments with every added client, but does not decrement when a client leaves.
       It is used as a key in a map, not as an index in an array. This is temporary until we get login working*/

  var client = new Client(new_client);

  Logger.log('Client ' + cur_name + ' connected.');

  /* API 'init_client'
     input: {x, y}
      - avoids colliding start positions
      - initializes the client and clientbodies objects and puts into maps
      - restarts physics loop when the client is added to an empty client map
  */
  client.on('init_client', function(new_player_loc){
    game.addClient(client, cur_name, new_player_loc);

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
    if(!clients.has(cur_name)){return;}
    try{game.movePlayer(cur_name, pack);}catch(e){}
  });

  /* API 'disconnect'
     input: {}
      - removes the client data from the clients and clientbodies map
      - shuts down the physics loop if this was the last client to leave
  */
  client.on('disconnect', function(){

    game.removeClient(cur_name);

    Logger.log("Client " + cur_name + " disconnected.");

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
