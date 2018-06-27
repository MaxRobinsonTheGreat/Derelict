module.exports = class {
  constructor() {
    this.location = {x:20, y:20};
    this.dimensions = {h:40, w:40};
    this.center = this.getCenter();
    this.commands = {left: false, right: false, up: false, down: false};
    this.speed = 100; //pixels per second
    this.last_update = Date.now();
    this.orientation = 0;
    this.sprite_title = "Officer";
  }

  setSprite(s){
    this.sprite = s;
  }

  getCenter(){
    let x = this.location.x + this.dimensions.w / 2;
    let y = this.location.y + this.dimensions.h / 2;
    return {x, y}
  }

  move(time){
    var old_loc = Object.assign({}, this.location);
    var dist = (time/1000)*this.speed;
    this.moving = false;
    if(this.commands.left) {this.location.x-=dist;this.moving = true;}
    if(this.commands.right) {this.location.x+=dist;this.moving = true;}
    if(this.commands.up) {this.location.y-=dist;this.moving = true;}
    if(this.commands.down) {this.location.y+=dist;this.moving = true;}
    return(old_loc);
  }

  setOrientation(mouse_location){
    this.center = this.getCenter();

    let mouse_x = mouse_location.x;
    let mouse_y = mouse_location.y;

    let adjacent = mouse_x - this.center.x;
    let opposite = mouse_y - this.center.y;

    let rad2deg = 180/Math.PI;
    if (adjacent === 0) {
      return;
    }
    else if (adjacent > 0 && opposite < 0) { //First Quadrant
      let orientation = Math.atan(-opposite/-adjacent) * rad2deg;
      this.orientation = orientation + 360;
    }
    else if (adjacent > 0 && opposite > 0) { //Second Quadrant
      this.orientation = Math.atan(opposite/adjacent) * rad2deg;
    }
    else if (adjacent < 0 && opposite > 0) { //Third Quadrant
      let orientation = Math.atan(opposite/adjacent) * rad2deg;
      this.orientation = orientation + 180;
    }
    else if (adjacent < 0 && opposite < 0) { //Fourth Quadrant
      let orientation = Math.atan(opposite/adjacent) * rad2deg;
      this.orientation = orientation + 180;
    }
  }
}
