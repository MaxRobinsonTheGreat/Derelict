const changeCanvasToFull = module.exports = function() {
  console.log("Change Canvas to FULL");
  let canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
