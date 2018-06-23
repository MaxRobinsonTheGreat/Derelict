module.exports = class {
  constructor() {
    this.location = {x:20, y:20};
    this.dimensions = {h:100, w:50};
    this.center = this.getCenter();
    this.commands = {left: false, right: false, up: false, down: false};
    this.speed = 100; //pixels per second
    this.last_update = Date.now();
    this.orientation = 0;
    this.sprite_title = "Alien";
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
    if(this.commands.left) this.location.x-=dist;
    if(this.commands.right) this.location.x+=dist;
    if(this.commands.up) this.location.y-=dist;
    if(this.commands.down) this.location.y+=dist;
    return(old_loc);
  }

  setOrientation(mouse_x, mouse_y){
    this.center = this.getCenter();

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
