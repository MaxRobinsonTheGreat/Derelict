'use strict'

const WallStructure = require('./wall_structure');
const game_core = require('./game_core');

module.exports = class Room{

  constructor(type, x, y, door_list){
    this.type = type;
    this.location = {x, y};
    this.dimensions = {h:300, w:300};
    this.makeWalls(door_list);
  }

  makeWalls(door_list){
    this.walls = new WallStructure(door_list, this);
  }

  setSprite(room_sprite){
    //this.sprite = room_sprite;
  }

  contains(rect){
    return game_core.checkIntersect(rect, this);
  }

  updateSmoothCollisions(player){
    //TODO: better naming conventions
    var walls = this.walls.obstacles;
    var colliding_wall = game_core.anyIntersect(player, walls, -1); // self index is not important
    if(colliding_wall){
      game_core.smoothCollision(player, player.old_location, colliding_wall);
      this.updateSmoothCollisions(player); // recursivly call yourself until all collisions are accounted for
    }
  }

  draw(camera){
    camera.drawCollision(this, "blue");
    this.walls.draw(camera);
  }
}
