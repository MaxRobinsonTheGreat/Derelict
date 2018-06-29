'use strict'

const Sprite = require('./rendering/sprite');

module.exports = class Entity{
  constructor(name, type, location, dimensions, orientation){
    this.name = name;
    this.type = type;
    this.location = location;
    this.dimensions = dimensions;
    this.orientation = orientation;
    this.moving = false;

    this.sprite = new Sprite(type, dimensions, 2);
  }

  interpolate(startloc, endloc, d_time, delayed_time){
    if(d_time === 0) return;

    this.location = startloc;
    this.location.x += ( ((endloc.x - startloc.x) / (d_time))*(delayed_time));

    this.location.y += ( ((endloc.y - startloc.y) / (d_time))*(delayed_time));

    this.moving = true;
    if(startloc.x == endloc.x && startloc.y == endloc.y){this.moving = false;}
  }

  interpolateOrientation(startori, endori, d_time, delayed_time){
    if(d_time === 0) return;

    this.orientation = startori;
    let diff = endori - startori;
    this.orientation += ( ((diff) / (d_time))*(delayed_time));
    if((endori > 270 && startori < 90) || (endori < 90 && startori > 270)){
      this.orientation = Math.abs(diff);
    }
  }

}
