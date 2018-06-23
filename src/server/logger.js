var exports = module.exports = {};

var date;

exports.log = function(message){
  var new_d = new Date();

  if(date === undefined ||
     date.getDate() !== new_d.getDate() ||
     date.getMonth() !== new_d.getMonth() ||
     date.getYear() !== new_d.getYear() ) {
      console.log((new_d.getMonth()+1)+"-"+new_d.getDate()+"-"+new_d.getFullYear());
  }
  date = new_d;

  const timezoneOffsetHours = 6; //this is the offset for Mountain time, so the logging will be more clear to us
  var meridian = "AM";
  var hour = date.getUTCHours()-timezoneOffsetHours;

  if(hour<=0){
    hour+=12;
    meridian = "PM";
  }
  else if(hour>12){
    hour-=12;
    meridian = "PM";
  }

  var minute = date.getMinutes()+"";
  if(minute < 10){
    minute = "0"+minute;
  }

  var date_string = hour+":"+minute+" "+meridian;
  date_string = date_string.padEnd(10);

  console.log(date_string+"| "+message);
}


exports.deltaTime = function(delta_time){
  this.log("Delta Time: " + delta_time);
}

exports.locations = function(locations){
  this.log("Locations: " + locations);
}
