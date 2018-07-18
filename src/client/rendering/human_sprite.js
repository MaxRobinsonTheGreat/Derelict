const Sprite = require('./sprite');

module.exports = class HumanSprite{
  constructor(container) {
    this.container = container;
    var top_title = "Officer";
    var bottom_title = "Legs";

    this.top = new Sprite(top_title, container.dimensions, 2),
    this.bottom = new Sprite(bottom_title, container.dimensions, 2);
  }

  draw(camera){
    var p = this.container;
    if(p.moving){
      camera.drawSpriteDirectional(this.bottom, p.location.x, p.location.y, p.orientation);
    }
    if(this.top.cur_frame === 0){
      camera.drawSpriteStatic(this.top, p.location.x, p.location.y, p.orientation);
    }
    else {
      camera.drawSpriteDirectional(this.top, p.location.x, p.location.y, p.orientation);
    }
  }
}
