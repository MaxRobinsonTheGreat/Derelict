'use strict'

module.exports = class Line{

	constructor(){
    this.start = {x:0, y:0};
    this.end = {x:0, y:0};

  }

  setPoints(x1, y1, x2, y2){
    this.setStart(x1, y1);
    this.setEnd(x2, y2);
  }

  makeByOrientation(x, y, theta, mag){
    let x2 = x + (Math.cos(theta*Math.PI/180) * mag);
    let y2 = y + (Math.sin(theta*Math.PI/180) * mag);
    this.setPoints(x, y, x2, y2);
  }

  setStart(x, y){
    this.start = {x, y};
  }

  setEnd(x, y){
    this.end = {x, y};
  }

  getMagnitude(){
		let x1 = this.start.x;
		let y1 = this.start.y;
		let x2 = this.end.x;
		let y2 = this.end.x;
    return Math.sqrt(Math.abs((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2)));
  }
}
