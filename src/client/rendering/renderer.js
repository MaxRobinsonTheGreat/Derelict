'use strict'

const Sprite = require('./sprite');
const Camera = require('./camera');
const ImageContainer = require('./image_container').getImageContainer();
const changeCanvasToFull = require('./changeCanvasToFull');

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

changeCanvasToFull();
// $('window').resize(changeCanvasToFull());

///this stuff is temporary. The fullscreen should happen before the game is started
//it can only go fullscreen when you press
// addEventListener("click", function() {
//   var el = canvas,
//     rfs = el.requestFullscreen
//       || el.webkitRequestFullScreen
//       || el.mozRequestFullScreen
//       || el.msRequestFullscreen
//   ;
//
//   rfs.call(el);
//
//   canvas.width = window.innerWidth;
//   // console.log("resize "+document.body.clientHeight);
//   canvas.height = window.innerHeight;
//
//   renderer.camera.centerToAnchor();
// });
//^^this makes it go full screen on click

// set to true if you want to see the most recent server's version of the main players box
var draw_self_debugger = false;

var renderer = module.exports = {

  setMainPlayer: function(player){
      let sprite_title = player.sprite_title;
      player.setSprite(new Sprite(player.sprite_title, player.dimensions, 2));

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

  setSelfIndex(i){
    this.self_index = i;
  },

  getCanvasContext: function(){
    return ctx;
  },

  render: function(){
    // console.log(window.innerHeight);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.camera.updateLocation();
    this.camera.drawCollision(platform, "blue");

    this.camera.drawObjWithSprite(this.main_player);


    ctx.fillStyle = "white";
    ctx.font="15px Arial";
    for(var i in this.others){
      if (i != this.self_index || draw_self_debugger && i < this.others.length){
        this.camera.drawObjWithSprite(this.others[i]);
        this.camera.writeText(this.others[i].name, this.others[i].location.x, this.others[i].location.y+5);
      }
    }

    let mouse_loc = this.camera.getMouseLocation();
    // let gun_point = this.main_player.getGunpoint();

    this.main_player.setOrientation(mouse_loc);

    this.camera.drawLineObj(this.main_player.aim);
  }
}

var platform = {};
platform.location = {x:0, y:0};
platform.dimensions = {h:400,w:600};
