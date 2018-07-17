'use strict'

const Sprite = require('./sprite');
const Camera = require('./camera');
const ImageContainer = require('./image_container').getImageContainer();

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

const changeCanvasToFull = function() {
  let canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

changeCanvasToFull();

var draw_self_debugger = false;

var renderer = module.exports = {

  setMainPlayer: function(player){
      let sprite_title = player.sprite_title;
      player.setSprites(new Sprite(player.top_sprite_title, player.dimensions, 2),
                        new Sprite(player.bottom_sprite_title, player.dimensions, 2));

      this.main_player = player;
      this.camera = new Camera(player);
  },

  setOthers: function(others, self_index){
    // for(let o of others){
    //   o.sprite = new Sprite("Person", o.dimensions, .5);
    // }
    this.others = others;
    this.self_index = self_index;
  },

  setBullets: function(bullets){
    this.bullets = bullets;
  },

  setSelfIndex(i){
    this.self_index = i;
  },

  getCanvasContext: function(){
    return ctx;
  },

  changeCanvasToFull: function() {
    changeCanvasToFull();
    this.camera.centerToAnchor();
  },

  render: function(){
    // console.log(window.innerHeight);
    // changeCanvasToFull();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.camera.updateLocation();
    this.camera.drawCollision(platform, "blue");

    let mouse_loc = this.camera.getMouseLocation();

    this.main_player.setOrientation(mouse_loc);

    for(var i=this.bullets.length-1; i>=0; i--){
      let b = this.bullets[i];
      ctx.save();
      ctx.globalAlpha=b.transparency;
      this.camera.drawLineObj(b.trajectory, b.color)
      b.fade();
      ctx.restore();

      if(b.isFinished()){
        this.bullets.splice(i);
      }
    }

    ctx.fillStyle = "white";
    ctx.font="15px Arial";
    for(var i in this.others){
      if (i != this.self_index || draw_self_debugger && i < this.others.length){
        this.drawPerson(this.others[i])
        this.camera.writeText(this.others[i].name, this.others[i].location.x, this.others[i].location.y+5);
      }
    }

    this.drawPerson(this.main_player)
  },

  drawPerson(p){
    if(p.moving){
      this.camera.drawSpriteDirectional(p.bottom, p.location.x, p.location.y, p.orientation);
    }
    if(p.top.cur_frame === 0){
      this.camera.drawSpriteStatic(p.top, p.location.x, p.location.y, p.orientation);
    }
    else {
      this.camera.drawSpriteDirectional(p.top, p.location.x, p.location.y, p.orientation);
    }
  }
}

var platform = {};
platform.location = {x:0, y:0};
platform.dimensions = {h:400,w:600};
