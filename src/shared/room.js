'use strict'

module.exports = class Room{

  constructor(type, x, y){
    this.type = type;
    this.location = {x, y};
    this.dimensions = {h:300, w:300}
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


}
