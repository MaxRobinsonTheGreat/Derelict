'use strict'

const game_core = require("../shared/game_core");
const logger = require("./logger")
const Player = require("../shared/player")

module.exports = class Game{
  constructor(name, clients){
    this.name = name;
    this.fps = 45;
    this.clients = clients;
    this.last_update = Date.now();
    this.last_client_update = Date.now();
    this.running = false;
  }

  start(){
    this.physics_loop = setInterval(function(){this.updateState();}.bind(this), this.fps);
    this.runnning = true;
  }

  stop(){
    clearInterval(this.physics_loop);
    this.running = false;
  }

  isRunning(){
    return this.running;
  }

  updateState(){
    this.delta_time = Date.now() - this.last_update;
    this.last_update = Date.now();

    this.updateClients();
  }

  collided(r, ignore_name){
    var result = false;
    this.clients.forEach(function update(client, name, map){
      if(name != ignore_name){
        if(game_core.checkIntersect(r, client.player)){
          result = true;
          return; //why aren't we returning the result?
        }
      }
    });
    return result;
  }

  updateClients(){
    // update all clients with the info relevant to them about the world and the other clients
    var locations = [];
    this.clients.forEach(function getLocations(client, name, map){
      locations.push(client.player.location);
    });

    //why isn't this in the getLocations function?
    var self_index = 0;
    this.clients.forEach(function update(client, name, map){
      client.sendToAll({locations, self_index: self_index++});
    });
  }

  addClient(client, client_name, location){
    client.player = new Player();
    client.player.correction_counter = 0;

    // keep incrementing x position until no longer colliding
    while(this.collided(client.player, client_name)){
      client.player.location.x+=client.player.dimensions.w+10;
    }

    if(client.player.location.x !== location.x){
      client.sendCorrection(client.player.location);
    }

    // put client info in map
    this.clients.set(client_name, client);
  }

  removeClient(name){
    this.clients.delete(name);
  }

  movePlayer(name, pack){
    let client = this.clients.get(name);

    if(pack.cc !== client.player.correction_counter) return;

    let predicted_location = pack.loc;

    const forgiveness = 16;//should be 10 //this give the clients a *little* bit of leeway in their predictions
    let d_time = Date.now()-client.player.last_update+forgiveness;
    let old_time = client.player.last_update;
    client.player.last_update = Date.now();
    if(d_time < 0) return;

    var server_location = this.clients.get(name).player.location;

    let max_distance = (d_time/1000)*client.player.speed;

    var x_dif = Math.abs(server_location.x - predicted_location.x);
    var y_dif = Math.abs(server_location.y - predicted_location.y);

    var collision = this.collided({dimensions: client.player.dimensions, location: predicted_location}, name);

    if(collision || x_dif > max_distance || y_dif > max_distance){
      client.player.last_update = old_time;
      client.player.correction_counter++;
      client.sendCorrection({corrected_location: server_location, cc: pack.cc});
    }
    else{
      client.player.location = predicted_location;
    }
  }
}
