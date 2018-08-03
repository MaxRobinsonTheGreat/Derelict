'use strict'

const Sprite = require('./sprite');
const Camera = require('./camera');
const ImageContainer = require('./image_container').getImageContainer();
const AudioContainer = require('../sound_effects/audio_container').loadAudioFiles();
const HumanSprite = require('./human_sprite');

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

const changeCanvasToFull = function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

window.onload = function(){
  changeCanvasToFull();
  renderer.camera.centerToAnchor();
}

var draw_self_debugger = false;

var renderer = module.exports = {

  setMainPlayer: function(player){
    this.camera = new Camera(player);

    var s = new HumanSprite(player, this.camera);

    player.setSprite(s);
    this.main_player = player;
  },

  setOthers: function(others, self_index){
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
        this.others[i].draw(this.camera);
        this.camera.writeText(this.others[i].name, this.others[i].location.x, this.others[i].location.y+5);
      }
    }

    this.main_player.draw(this.camera);
  }
}

var platform = {};
platform.location = {x:0, y:0};
platform.dimensions = {h:300,w:300};
