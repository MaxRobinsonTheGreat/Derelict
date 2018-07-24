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
      $.post({url: "/join-game", data: {username, game_name}, success: function(result) {
        document.open();
        document.write(result);
        document.close();
      }});
    });
  }});
}

// window.onbeforeunload = function() {
//   let username = sessionStorage.getItem("username");
//   sessionStorage.removeItem("username");
//   $.post({url: "/remove-username", data: {username}});
// }
