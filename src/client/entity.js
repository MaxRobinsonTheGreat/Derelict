'use strict'

const Sprite = require('./rendering/sprite');

module.exports = class Entity{
  constructor(type, location, dimensions){
    this.type = type;
    this.location = location;
    this.dimensions = dimensions;

    this.sprite = new Sprite(type, dimensions, .5);
  }

  interpolate(startloc, endloc, d_time, delayed_time){
    if(d_time === 0) return;

    this.location = startloc;
    this.location.x += ( ((endloc.x - startloc.x) / (d_time))*(delayed_time));

    this.location.y += ( ((endloc.y - startloc.y) / (d_time))*(delayed_time));
  }

}
