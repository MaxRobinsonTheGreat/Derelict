'use strict'

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

var mouse_x = 0;
var mouse_y = 0;

module.exports = class Camera{
  constructor(anchor){
    this.location = {x:0, y:0};
    this.anchorTo(anchor);
    this.centerToAnchor();
  }

  anchorTo(anchor){
    this.anchor = anchor;
    this.off_set_x = anchor.location.x-this.location.x;
    this.off_set_y = anchor.location.y-this.location.y;
  }

  centerToAnchor(){
    //our location is equal to his center location minus half our size
    this.dimensions = {h:canvas.height, w:canvas.width};
    this.location.x = this.anchor.center.x-this.dimensions.w/2;
    this.location.y = this.anchor.center.y-this.dimensions.h/2;
    this.anchorTo(this.anchor);
  }

  resizeView(canvas_dimensions){
    this.dimensions = canvas_dimensions;
  }

  updateLocation(){
    this.location.x = this.anchor.location.x - this.off_set_x;
    this.location.y = this.anchor.location.y - this.off_set_y;
  }

  getMouseLocation(){
    return {x:mouse_x+this.location.x, y:mouse_y+this.location.y}
  }

  drawSprite(sprite, x, y){
    sprite.draw(x-this.location.x, y-this.location.y);
  }
  drawSpriteDirectional(sprite, x, y, theta){
    sprite.drawDirectional(x-this.location.x, y-this.location.y, theta);
  }

  drawObjWithSprite(o){
    if(!o.sprite){console.log("Object does not contain sprite");return;}
    if(o.orientation){
      if(o.moving){
        this.drawSpriteDirectional(o.sprite, o.location.x, o.location.y, o.orientation);
      }
      else {
        o.sprite.drawStaticDirectional(o.location.x-this.location.x, o.location.y-this.location.y, 0, 0, o.orientation);
      }
    }
    else
      this.drawSprite(o.sprite, o.location.x, o.location.y);
  }

  drawCollision(box, color){
      ctx.fillStyle = color;
      ctx.fillRect(box.location.x-this.location.x, box.location.y-this.location.y,
                   box.dimensions.w, box.dimensions.h);
  }

  drawLineObj(line, color){
    this.drawLine(line.start.x, line.start.y, line.end.x, line.end.y, color)
  }
  drawLine(x1, y1, x2, y2, color){
    ctx.strokeStyle=color;
    ctx.beginPath();
    ctx.moveTo(x1-this.location.x, y1-this.location.y);
    ctx.lineTo(x2-this.location.x, y2-this.location.y);
    ctx.stroke();
  }

  writeText(text, x, y){
    ctx.fillText(text, x-this.location.x, y-this.location.y)
  }
}
$("body").mousemove(function(e) {
  var rect = canvas.getBoundingClientRect();
  mouse_x = e.clientX - rect.left;
  mouse_y = e.clientY - rect.top;
});
