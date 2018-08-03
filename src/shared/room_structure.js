'use strict'

const Room = require('./room');

module.exports = {
  rooms: [][],

  //only call from server
  init: function(r_total, c_total){
    for(var r=0; r<r_total; r++){
      for(var c=0; c<c_total; c++){
        rooms[r].push(new Room("empty", r*300, c*300));
      }
    }
  },

  checkWallCollision: function(player){
    
  }
}
