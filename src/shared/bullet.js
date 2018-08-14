'use strict'

const Line = require('./line');

module.exports = class Bullet{

    // This section is called on both client and server (fireFrom, fire)

    fireFrom(owner){
      this.owner = owner;
      let gun_point = owner.getGunpoint();
      let orientation = owner.orientation + 2.5 - Math.random() * 5;
      if (orientation >= 360) orientation -= 360;
      if (orientation < 0) orientation += 360;
      this.fire(gun_point.x ,gun_point.y, orientation);
    }

    fire(x, y, theta){
      this.trajectory = new Line();
      this.trajectory.makeByOrientation(x ,y, theta, 500);
      this.orientation = theta;
    }

    set(x1, y1, x2, y2){
      this.trajectory = new Line();
      this.trajectory.setPoints(x1 ,y1, x2, y2);
    }

    //given a list, find the closest collision point
    findNearestCollision(boxes, to_ignore){
      var closest_box = null;
      var lowest_mag = this.trajectory.getMagnitude();
      for(var b of boxes){
        if(b == to_ignore){ continue;}
        //use fast/efficient method before the most costly point-finding algorithm
        if(this.trajectory.checkBoxIntersect(b)){
          var collision_point = this.trajectory.boxIntersectAt(b);
          if(!collision_point){
            console.log("A collision was detected but no intersection point \
            was found. There must be a bug.");
          }
          this.trajectory.end = collision_point;
          var new_mag = this.trajectory.getMagnitude();
          if(new_mag < lowest_mag){
            lowest_mag = new_mag;
            closest_box = b;
          }
        }
      }
      return closest_box;
    }

    collide(box){
      if(this.trajectory.checkBoxIntersect(box)){
        var point = this.trajectory.boxIntersectAt(box)
        if(!point){
          console.log("A bullet hit a box but there was no intersection point... bug");
          return;
        }
        this.trajectory.setEnd(point.x, point.y);
      }
    }


    //This section is called on only client (startFade, fade, isFinished)

    startFade(){
      this.last_update = Date.now();
      this.color = "#f4d742";
      this.fade_rate = .2; //fades 20% every 100 ms
      this.transparency = 1;
    }

    fade(){
      let delta_time = Date.now() - this.last_update;
      this.transparency -= this.fade_rate * delta_time/100; //

      if(this.isFinished())
        this.transparency = 0;
    }

    isFinished(){
      return this.transparency <= 0;
    }

}
