/*
    The game core contains code that is shared between the server and the client, such as:
        -default values
        -classes/object structures
        -behavior functions

    This avoids code duplication and ensures that the code is EXACTLY the same between the server and client where it matters.
    It's important to note that no DATA is being shared (or even could be shared) through this file, only functionality.
    The server and client(s) have their own copies of this file and cannot communicate through the core.
*/
const Player = require('./player');

module.exports = {

  getLocationObj: function(x, y) {
    return {x, y};
  },
  getDimensionsObj: function(h, w) {
    return {h, w};
  },
  getCommandsObj: function(){
    return {left: false, right: false, up: false, down: false};
  },

  checkBoundry: function(loc, dim){
    var was_correction = false;
    if(loc.x + dim.w > 600) {loc.x = 600-dim.w;was_correction = true}
    if(loc.y + dim.h > 400) {loc.y = 400-dim.h;was_correction = true}
    if(loc.x < 0) {loc.x = 0;was_correction = true}
    if(loc.y < 0) {loc.y = 0;was_correction = true}
    return {loc, was_correction};
  },

  checkIntersect: function(obj1, obj2){
    let loc1 = obj1.location;
    let dim1 = obj1.dimensions;
    let loc2 = obj2.location;
    let dim2 = obj2.dimensions;

    return (loc1.x+dim1.w > loc2.x && loc1.x < loc2.x+dim2.w &&
            loc1.y+dim1.h > loc2.y && loc1.y < loc2.y+dim2.h)
  },


  anyIntersect: function(primary, list, to_ignore) {
      for(i in list){
        if(i!=to_ignore && this.checkIntersect(primary, list[i])){
          return true;
        }
      }
      return false;
  },

  connection: function() {
      return "core module connected";
  }
}
