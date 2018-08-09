const Sprite = require('./sprite');

module.exports = class RoomSprite{
  constructor(room) {
    this.room = room;
    var floor_title = "Floor";

    this.floor = new Sprite(floor_title, room.dimensions, 2);
  }

  draw(camera){
    camera.drawSprite(this.floor, this.room.location.x, this.room.location.y);
  }
}
