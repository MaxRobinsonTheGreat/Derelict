const Line = require('./line');
const Bullet = require('./bullet');

module.exports = class Player{
  constructor() {
    this.location = {x:20, y:20};
    this.dimensions = {h:40, w:40};
    this.center = this.getCenter();
    this.gun_offset = {x:40, y:8}; //when facing right, these values are the relative transform away from the center to the gunpoint
    this.commands = {left: false, right: false, up: false, down: false, left_click: false};
    this.speed = 100; //pixels per second
    this.last_update = Date.now();
    this.orientation = 0; //degrees
    this.aim = new Line();
    this.bullet_wait_time = 200; //ms
    this.last_bullet_time = 0;
  }

  setSprite(human_sprite){
    this.sprite = human_sprite;
  }

  draw(camera){
    this.sprite.draw(camera)
  }

  getCenter(){
    let x = this.location.x + this.dimensions.w / 2;
    let y = this.location.y + this.dimensions.h / 2;
    return {x, y}
  }

  getGunpoint(){
    let center = this.getCenter();

    let x = this.gun_offset.x;
    let y = this.gun_offset.y;

    let rads = this.orientation*Math.PI/180;

    let x_over = (Math.cos(rads) * x);
    let x_up =  (Math.sin(rads) * x);

    rads = (this.orientation+90)*Math.PI/180;

    let y_over = (Math.cos(rads) * y);
    let y_up =  (Math.sin(rads) * y);

    x = x_over + y_over + center.x;
    y = y_up + x_up + center.y;

    return {x, y};
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

  excecuteCommands(){
    var bullet;
    if(this.commands.left_click)
      bullet = this.attack();
    return bullet;
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
    let gun_point = this.getGunpoint();
    this.aim.makeByOrientation(gun_point.x, gun_point.y, this.orientation, 100);
  }

  attack(){
    if(Date.now()-this.last_bullet_time >= this.bullet_wait_time){
      if(this.sprite)
        this.sprite.top.setFrame(1);
      var bullet = new Bullet();
      bullet.fireFrom(this);
      this.last_bullet_time = Date.now();
      return bullet;
    }

   return null;
  }
}
