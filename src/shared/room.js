'use strict'

const DoorStructure = require('./doors_structure');
const game_core = require('./game_core');

module.exports = class Room{

  constructor(type, x, y, doors){
    this.type = type;
    this.location = {x, y};
    this.dimensions = {h:300, w:300};
    this.setDoors(doors);
  }

  setDoors(doors){

    this.doors = new DoorStructure(doors, this);
  }

  setSprite(room_sprite){
    //this.sprite = sprite;
  }

  checkBoundry(rect){
    var result = false;
    if(rect.location.x + rect.dimensions.w > this.location.x + this.dimensions.w){
      if(this.doors.right && game_core.checkIntersect(this.doors.right, rect)){
          console.log("RIGHT!");
      }
      else{
        rect.location.x = this.dimensions.w+this.location.x-rect.dimensions.w;
      }
      result = true;
    }
    if(rect.location.y + rect.dimensions.h > this.location.y + this.dimensions.h) {
      rect.location.y = this.dimensions.h+this.location.y-rect.dimensions.h;
      result = true;
    }
    if(rect.location.x < this.location.x) {
      rect.location.x = this.location.x;
      result = true;
    }
    if(rect.location.y < this.location.y) {
      rect.location.y = this.location.y;
      result = true;
    }
    return result;
  }

  draw(camera){
    camera.drawCollision(this, "blue");

    var d = this.doors;
    camera.drawCollision(this.doors.up, "blue");
    camera.drawCollision(this.doors.down, "blue");
    camera.drawCollision(this.doors.right, "blue");
    camera.drawCollision(this.doors.left, "blue");
  }
}
