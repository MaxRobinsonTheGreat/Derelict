'use strict'

const Sprite = require('./sprite');
const ImageContainer = require('./image_container').getImageContainer();

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

var mouse_x = 0;
var mouse_y = 0;

// set to true if you want to see the most recent server's version of the main players box
var draw_self_debugger = false;

var renderer = module.exports = {

  setMainPlayer: function(player){
      let sprite_title = player.sprite_title;
      player.setSprite(new Sprite("Alien", player.dimensions, 2));

      this.main_player = player;
  },

  setOthers: function(others, self_index){
    for(let o of others){
      o.sprite = new Sprite("Person", o.dimensions, .5);
    }
    this.others = others;
    this.self_index = self_index;
  },

  setSelfIndex(i){
    this.self_index = i;
  },

  getCanvasContext: function(){
    return ctx;
  },

  render: function(){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  	this.drawBox(this.main_player, "blue");
    this.main_player.sprite.drawDirectional(this.main_player.location.x, this.main_player.location.y, this.main_player.orientation);

    for(var i in this.others){
      if (i != this.self_index || draw_self_debugger && i < this.others.length){
         this.drawBox(this.others[i], "red");
         this.others[i].sprite.draw(this.others[i].location.x, this.others[i].location.y);
      }
    }
    ctx.beginPath();
    ctx.moveTo(this.main_player.center.x, this.main_player.center.y);
    ctx.lineTo(mouse_x, mouse_y);
    ctx.stroke();

    this.main_player.setOrientation(mouse_x, mouse_y);
  },

  drawBox: function(box, color){
    ctx.fillStyle = color;
    ctx.fillRect(box.location.x, box.location.y,
                 box.dimensions.w, box.dimensions.h);
  }

}

$("body").mousemove(function(e) {
  var rect = canvas.getBoundingClientRect();
  mouse_x = e.clientX - rect.left;
  mouse_y = e.clientY - rect.top;
});
