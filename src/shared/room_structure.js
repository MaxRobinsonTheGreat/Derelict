'use strict'

const Room = require('./room');

var rooms = []; //2d array

module.exports = {
  //only call from server
  init: function(r_total, c_total){
    this.r_total = r_total;
    this.c_total = c_total;
    for(var c=0; c<c_total; c++){
      var column = [];
      for(var r=0; r<r_total; r++){
        //           right, top, left, bottom
        let doors = [true, true, true, true];
        if(c === 0)              doors[2] = false;
        else if(c == c_total-1)  doors[0] = false;
        if(r === 0)              doors[1] = false;
        else if(r == r_total-1)  doors[3] = false;

        column.push(new Room("empty", c*300, r*300, doors));
      }
      rooms.push(column);
    }
  },

  set: function(){
    // given a json obect from the server, the room should be constructed from here
    // TODO: instantiate the room_structure from the server then send init data
    //       to this function rather than instantiate in the client.
  },

  update: function(player){
    var c = player.room_location.c;
    var r = player.room_location.r;
    var cur_room = rooms[c][r];

    if(!cur_room.contains(player)){
      cur_room = this.changePlayerRoom(player, c, r);
      if(!cur_room){
        console.log("Lost track of player \"" + player.name + "\" room!");
        return;
      }
    }

    cur_room.updateSmoothCollisions(player);

  },

  changePlayerRoom(player, c, r){
    var room = rooms[c];

    //ensure that the colomn we are check exists
    if(rooms[c]){
      var room = rooms[c][r+1];
      if(room && room.contains(player)){
        player.room_location = {c, r:r+1};
        return room;
      }
      room = rooms[c][r-1];
      if(room && room.contains(player)){
        player.room_location = {c, r:r-1};
        return room;
      }
    }
    //ensure that the colomn we are check exists
    if(rooms[c+1]){
      room = rooms[c+1][r];
      if(room && room.contains(player)){
        player.room_location = {c:c+1, r};
        return room;
      }
    }
    //ensure that the colomn we are check exists
    if(rooms[c-1]){
      room = rooms[c-1][r];
      if(room && room.contains(player)){
        player.room_location = {c:c-1, r};
        return room;
      }
    }
  },

  draw(camera){
    for(var r=0; r<this.r_total; r++){
      for(var c=0; c<this.c_total; c++){
        rooms[c][r].draw(camera);
      }
    }
  },

  getRoomAt(r, c){
    return rooms[c][r];
  }
}
