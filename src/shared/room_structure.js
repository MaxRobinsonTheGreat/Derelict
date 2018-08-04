'use strict'

const Room = require('./room');

var rooms = []; //2d array

module.exports = {
  //only call from server
  init: function(r_total, c_total){
    this.r_total = r_total;
    this.c_total = c_total;
    for(var r=0; r<r_total; r++){
      var row = [];
      for(var c=0; c<c_total; c++){
        row.push(new Room("empty", r*310, c*310));
      }
      rooms.push(row);
    }
  },

  set: function(){

  },

  checkWallCollision: function(player){
    var room = player.room;
    room.checkBoundry(player);
  },

  draw(camera){
    for(var r=0; r<this.r_total; r++){
      for(var c=0; c<this.c_total; c++){
        rooms[r][c].draw(camera);
      }
    }
  }
}
