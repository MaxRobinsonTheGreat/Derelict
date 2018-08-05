'use strict'

//facing up
var door_w = 75;
var door_h = 10;

module.exports = class DoorStructure{
  constructor(doors, room){
    if(! doors instanceof Array || doors.length != 4){
      console.log("Doors object is incorrect. Should be array with 4 booleans");
      return;
    }

    // doors = [right, up, left, down]
    let right=0, up=1, left=2, down=3;
    let facing_up=true, facing_side=false;

    let loc = room.location;
    let dim = room.dimensions;

    if(doors[right])
      this.right=(this.makeDoor(dim.w + loc.x,
                          (dim.h/2)-(door_w/2) + loc.y,
                          facing_side));
    if(doors[up])
      this.up=(this.makeDoor((dim.w/2)-(door_w/2) + loc.x,
                        loc.y - door_h,
                        facing_up));
    if(doors[left])
      this.left=(this.makeDoor(loc.x - door_h,
                          (dim.h/2)-(door_w/2) + loc.y,
                          facing_side));
    if(doors[down])
      this.down=(this.makeDoor((dim.w/2)-(door_w/2) + loc.x,
                          loc.y+dim.h,
                          facing_up));

    /* If there is a door, it will contain an object. If there is no door
       then it will be null */
  }

  makeDoor(x, y, facing_up){
    var door = {};
    door.x = x;
    door.y = y;
    if(facing_up)
      this.dimensions = {w:door_w, h:door_h};
    else
      this.dimensions = {w:door_h, h:door_w}
    return door;
  }

}
