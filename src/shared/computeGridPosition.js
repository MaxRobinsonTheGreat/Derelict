//uses Cohen–Sutherland_algorithm
module.exports = function(box, point) {
  const INSIDE = 0;
  const LEFT = 1;
  const RIGHT = 2;
  const BOTTOM = 4;
  const TOP = 8;

  let code = INSIDE;

  if (point.x < box.location.x) {
    code |= LEFT;
  }
  else if (point.x > (box.location.x+box.dimensions.w)) {
    code |= RIGHT;
  }
  if (point.y < box.location.y) {
    code |= BOTTOM;
  }
  else if (point.y > (box.location.y+box.dimensions.h)) {
    code |= TOP;
  }

  return code;
}
