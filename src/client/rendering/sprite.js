'use strict'

const ImageContainer = require('./image_container');

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

module.exports = class {

	constructor(title, container, resize_factor){
		let s = ImageContainer.get(title);

		this.container = container;

		this.resize_factor = resize_factor;

		this.rows = s.rows;
		this.cols = s.cols;
		this.wait_time = 1000/s.fps;
		this.img = s.img;

		this.cur_frame = 0;
		this.cur_row = 0;
		this.srcX = 0;
		this.srcY = 0;
		this.last_update_time = Date.now();
		this.off_set_x = 0;
		this.off_set_y = 0;

		if(!this.img.complete){
			ImageContainer.pushOutDated(this);
		}
		else{
			this.frame_width = this.img.width/this.cols;
			this.frame_height = this.img.height/this.rows;

			this.width = this.frame_width;
			this.height = this.frame_height;
			if(this.resize_factor) {
				this.resizeBy(this.resize_factor);
			}
			this.center();
		}
	}

	imageFinished(){

		this.frame_width = this.img.width/this.cols;
		this.frame_height = this.img.height/this.rows;

		this.width = this.frame_width;
		this.height = this.frame_height;

		this.resizeBy(this.resize_factor);

		this.center();
	}



	resizeTo(h, w){
		this.width = w;
		this.height = h;
	}

	resizeBy(factor){
		this.width = this.frame_width*factor;
		this.height = this.frame_height*factor;
		Math.round(this.height);
		Math.round(this.width);
		this.resize_factor = factor;
	}

	center(){
		this.off_set_x = this.container.w/2 - this.width/2;
		this.off_set_y = this.container.h/2 - this.height/2;
		// this.container = {h, w};
	}

	setRow(r){
		if(r < 0 || r >= this.rows) return;
		this.cur_row = r;
		this.srcY = this.cur_row * this.frame_height;
	}

	updateFrame(){
		var delta_time = Date.now()-this.last_update_time;
		if(delta_time < this.wait_time)
			return;
		this.last_update_time = Date.now();

		if(++this.cur_frame >= this.cols){
			this.cur_frame = 0;
		}

		//Calculating the x coordinate for spritesheet
		this.srcX = this.cur_frame * this.frame_width;
	}

	drawDirectional(x, y, theta){

		if(theta >= 315 || theta <= 45)
			this.setRow(2); //right
		else if(theta > 45 && theta <= 135)
			this.setRow(0); //down
		else if(theta > 135 && theta <= 225)
			this.setRow(1); //left
		else
			this.setRow(3); //up
		this.draw(x, y);
	}

	draw(x, y){
		if(!this.img.complete) return;

		this.updateFrame();
		ctx.drawImage(this.img,this.srcX,this.srcY,
		this.frame_width,this.frame_height,
		x+this.off_set_x,y+this.off_set_y,
		this.width,this.height);
	}

	drawStatic(x, y, r, c){
		if(!this.img.complete) return;

		this.srcX = c * this.frame_width;
		this.srcY = r * this.frame_height;

		ctx.drawImage(this.img,this.srcX,this.srcY,
		this.frame_width,this.frame_height,
		x+this.off_set_x,y+this.off_set_y,
		this.width,this.height);
	}
}
