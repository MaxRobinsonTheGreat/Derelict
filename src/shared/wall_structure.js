'use strict'

//       __
//      | |
//      | |
//      | |  H
//      | |
//      |_|
//       W
// This diagram shows what the default values for the walls and doors mean.
// When on its side, the door_w would then describe the h dimension of the
// door. **The values are reversed when the orientation is flipped**. This
// can get very messy, but I have tried to keep it as readable as possible.
// -Max

var door_h = 75;
var door_w = 10;
var wall_w = door_w;

module.exports = class WallStructure{
  constructor(doors_list, room){
    if(! doors_list instanceof Array || doors_list.length != 4){
      console.log("Doors object is incorrect. Should be array with 4 booleans");
      return;
    }

    let walls = [];

    // doors pattern is [right, top, left, bottom]
    let right=0, top=1, left=2, bottom=3;


    let max_w = room.dimensions.w;
    let max_h = room.dimensions.h;

    let top_y = room.location.y;
    let left_x = room.location.x;

    // The walls are should be completely inside this room, so locs should be offset
    let bottom_y = top_y + max_h - wall_w;
    let right_x = left_x + max_w - wall_w;

    //when a wall is cut in half by a door, this is how big it can be
    let half_w = max_w/2 - door_h/2;
    let half_h = max_h/2 - door_h/2;


    ////////////////////////////////////////////////////RIGHT
    if(doors_list[right]){
      //if there is a door on the right, make two walls
      walls.push(
        this.makeWall(
          right_x,
          top_y,
          half_h,
          wall_w
        )
      );
      walls.push(
        this.makeWall(
          right_x,
          top_y + half_h + door_h,
          half_h,
          wall_w
        )
      );
    }
    else{
      // if there is no door, just add one full wall
      walls.push(
        this.makeWall(
          right_x,
          top_y,
          max_h,
          wall_w
        )
      );
    }
    ////////////////////////////////////////////////////TOP
    if(doors_list[top]){
      walls.push(
        this.makeWall(
          left_x,
          top_y,
          wall_w,
          half_w
        )
      );
      walls.push(
        this.makeWall(
          left_x + half_w + door_h,
          top_y,
          wall_w,
          half_w
        )
      );
    }
    else{
      walls.push(
        this.makeWall(
          left_x,
          top_y,
          wall_w,
          max_w
        )
      );
    }
    ////////////////////////////////////////////////////LEFT
    if(doors_list[left]){
      walls.push(
        this.makeWall(
          left_x,
          top_y,
          half_h,
          wall_w
        )
      );
      walls.push(
        this.makeWall(
          left_x,
          top_y + half_h + door_h,
          half_h,
          wall_w
        )
      );
    }
    else{
      walls.push(
        this.makeWall(
          left_x,
          top_y,
          max_h,
          wall_w
        )
      );
    }
    ////////////////////////////////////////////////////BOTTOM
    if(doors_list[bottom]){
      walls.push(
        this.makeWall(
          left_x,
          bottom_y,
          wall_w,
          half_w
        )
      );
      walls.push(
        this.makeWall(
          left_x + half_w + door_h,
          bottom_y,
          wall_w,
          half_w
        )
      );
    }
    else{
      walls.push(
        this.makeWall(
          left_x,
          bottom_y,
          wall_w,
          max_w
        )
      );
    }

    this.obstacles = walls;
  }

  makeWall(x, y, h, w){
    var wall = {};
    wall.location = {x, y};
    wall.dimensions = {h, w};
    return wall;
  }

  draw(camera){
    for (var o of this.obstacles){
      camera.drawCollision(o, "red");
    }
  }
}
