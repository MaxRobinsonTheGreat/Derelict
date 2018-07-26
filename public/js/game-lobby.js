window.onload = function() {
  getGameList();
  $("#refresh-button").click(function() {
    getGameList();
  });
}

function getGameList(){
  $.get({url: "/game-list", success: function(result) {
    $(".game-list").empty();

    for(var name of result.names){
      $(".game-list").append('<p class="gameslot">' + name + '</p>');
    }

    $(".gameslot").click(function() {
      let username = sessionStorage.getItem("username");
      let game_name = this.textContent;

      // console.log(username);
      goFullScreen();
      $.post({url: "/join-game", data: {username, game_name}, success: function(result) {
        document.open();
        document.write(result);
        document.close();
      }});
    });
  }});
}

function goFullScreen() {
  var page = document.body;
  if (page.requestFullscreen)
    page.requestFullscreen();
  else if (page.mozRequestFullScreen) {}  /* Firefox */
    // page.mozRequestFullScreen();
  else if (page.webkitRequestFullscreen) /* Chrome, Safari and Opera */
    page.webkitRequestFullscreen();
  else if (view_port.msRequestFullscreen) /* IE/Edge */
    page.msRequestFullscreen();
};

// window.onbeforeunload = function() {
//   let username = sessionStorage.getItem("username");
//   sessionStorage.removeItem("username");
//   $.post({url: "/remove-username", data: {username}});
// }
