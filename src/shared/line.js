'use strict'
const computeGridPosition = require("./computeGridPosition");


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

	//uses Cohen–Sutherland_algorithm
	checkBoxIntersect(box) {
		let codeStart = computeGridPosition(box, this.start);
		let codeEnd = computeGridPosition(box, this.end);

		let start = Object.assign({}, this.start); //need to not be pointers?
		let end = Object.assign({}, this.end);
		let xmin = box.location.x;
		let ymin = box.location.y
		let ymax = box.location.y+box.dimensions.h;
		let xmax = box.location.x+box.dimensions.w;

		const LEFT = 1;
		const RIGHT = 2;
		const BOTTOM = 4;
		const TOP = 8;

		while (true) {
			if (!(codeStart | codeEnd)) {
				return true;
			}
			else if (codeStart & codeEnd) {
				return false;
			}
			else {
				let x=0;
				let y=0;

				let codeOut = codeStart ? codeStart : codeEnd;

				if (codeOut & TOP) {    // point is above the clip window
					x = start.x + (end.x - start.x) * (ymax - start.y) / (end.y - start.y);
					y = ymax;
				} else if (codeOut & BOTTOM) { // point is below the clip window
					x = start.x + (end.x - start.x) * (ymin - start.y) / (end.y - start.y);
					y = ymin;
				} else if (codeOut & RIGHT) {  // point is to the right of clip window
					y = start.y + (end.y - start.y) * (xmax - start.x) / (end.x - start.x);
					x = xmax;
				} else if (codeOut & LEFT) {   // point is to the left of clip window
					y = start.y + (end.y - start.y) * (xmin - start.x) / (end.x - start.x);
					x = xmin;
				}

				if (codeOut === codeStart) {
					start.x = x;
					start.y = y;
					codeStart = computeGridPosition(box, start);
				}
				else {
					end.x = x;
					end.y = y;
					codeEnd = computeGridPosition(box, end);
				}
			}
		}
	}
}
