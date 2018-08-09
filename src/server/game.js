'use strict'

const game_core = require("../shared/game_core");
const Logger = require("./logger");
const Player = require("../shared/player");

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

  collided(box, ignore_name){
    var result = false;
    this.clients.forEach(function update(client, name, map){
      if(name != ignore_name){
        if(game_core.checkIntersect(box, client.player)){
          result = true;
          return;
          // This is *NOT* a return for the collided function, but is a
          // return for the search function defined at line 40
        }
      }
    });
    return result;
  }

  updateClients(){
    // update all clients with the info relevant to them about the world and the other clients
    var locations = [];
    var orientations = [];
    this.clients.forEach(function getLocations(client, name, map){
      locations.push(client.player.location);
      orientations.push(client.player.orientation);
    });

    var self_index = 0;
    this.clients.forEach(function update(client, name, map){
      client.sendToAll({locations, orientations, self_index: self_index++});
    });
  }

  initEntities(){
    //Sends initilization data for entities to all clients like names, dimensions, etc
    var names = [];
    var locations = [];
    var orientations = [];
    var dimensions = [];

    this.clients.forEach(function getLocations(client, name, map){
      names.push(name);
      locations.push(client.player.location);
      orientations.push(client.player.orientation);
      dimensions.push(client.player.dimensions);
    });

    var self_index = 0;
    this.clients.forEach(function update(client, name, map){
      client.initEntities({names, locations, orientations, dimensions, self_index});
      self_index++;
    });
  }

  addClient(client, client_name, location){
    client.player = new Player();
    client.player.correction_counter = 0;

    // keep incrementing x position until no longer colliding
    while(this.collided(client.player, client_name)){
      client.player.location.x+=client.player.dimensions.w+10;
    }

    //did the client have to be moved over?
    if(client.player.location.x !== location.x){
      client.sendCorrection({
        corrected_location: client.player.location,
        cc: 0
      });
      client.player.correction_counter++;
    }

    // put client info in map
    this.clients.set(client_name, client);
    this.initEntities();
  }

  removeClient(name){
    this.clients.get(name).game = '';
    this.clients.delete(name);
    this.initEntities();
  }

  movePlayer(name, pack){
    let client = this.clients.get(name);

    if(pack.cc !== client.player.correction_counter) return;

    let predicted_location = pack.loc;

    const forgiveness = 16;//this give the clients a *little* bit of leeway in their predictions
    let d_time = Date.now()-client.player.last_update+forgiveness;
    let old_time = client.player.last_update;
    client.player.last_update = Date.now();
    if(d_time < 0) return;

    var server_location = this.clients.get(name).player.location;

    let max_distance = (d_time/1000)*client.player.speed;

    var x_dif = Math.abs(server_location.x - predicted_location.x);
    var y_dif = Math.abs(server_location.y - predicted_location.y);

    var collision = this.collided({dimensions: client.player.dimensions, location: predicted_location}, name);

    var wall_collision = game_core.checkRoomCollision({dimensions: client.player.dimensions, location: predicted_location})

    // if(x_dif > max_distance){
    //   //this is triggering for some reason
    //   console.log("LAME!");
    // }
    if(wall_collision || collision || x_dif > max_distance || y_dif > max_distance){
      client.player.last_update = old_time;
      client.player.correction_counter++;
      client.sendCorrection(
        {
          corrected_location: server_location,
          cc: pack.cc
        }
       );
    }
    else{
      client.player.location = predicted_location;
      client.player.orientation = pack.ori;
    }
  }

  attackFrom(name){
    let client = this.clients.get(name);

    let player_index = -1;
    let i = 0;
    for (let n of this.clients.keys()){
      if (n===name)
        player_index = i;
      i++;
    }

    let player = client.player;
    var bullet = player.attack();
    if(!bullet){
      // Logger.log("Bullet Rejected");
      return;
    }

    this.clients.forEach(function getLocations(cur_client, cur_name, map){
      if (cur_name != name){
        if (bullet.trajectory.checkBoxIntersect(cur_client.player)) {
          const BULLET_DAMAGE = 10;

          let current_health = cur_client.player.health;
          cur_client.player.health -= BULLET_DAMAGE;
          if (cur_client.player.health <= 0) {
            if (current_health <= 0) {
              // Logger.log("Player was already dead...");
            }
            else {
              Logger.log(cur_name + " died!!!");
              cur_client.kick();
            }
          }
          else {
            cur_client.reduceHealth(cur_client.player.health);
          }
        }

        cur_client.sendBullet({x:bullet.trajectory.start.x,
                               y:bullet.trajectory.start.y,
                               ori:bullet.orientation,
                               player: player_index
                              });
        }
    });
  }
}
