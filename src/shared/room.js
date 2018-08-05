'use strict'

const DoorStructure = require('./doors_structure');

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
    if(rect.location.x + rect.dimensions.w > this.location.x + this.dimensions.w) {
      rect.location.x = this.dimensions.w+this.location.x-rect.dimensions.w;
      return true;
    }
    if(rect.location.y + rect.dimensions.h > this.location.y + this.dimensions.h) {
      rect.location.y = this.dimensions.h+this.location.y-rect.dimensions.h;
      return true;
    }
    if(rect.location.x < 0) {
      rect.location.x = 0;
      return true;
    }
    if(rect.location.y < 0) {
      rect.location.y = 0;
      return true;
    }
    return false;
  }

  draw(camera){
    camera.drawCollision(this, "blue");

    var d = this.doors;
    camera.drawBox(d.up.x, d.up.y, 10, 75, "red");
    camera.drawBox(d.down.x, d.down.y, 10, 75, "red");
    camera.drawBox(d.right.x, d.right.y, 75, 10, "red");
    camera.drawBox(d.left.x, d.left.y, 75, 10, "red");
  }
}
