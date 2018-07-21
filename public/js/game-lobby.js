window.onload = function() {
  $("button").click(function() {
    console.log("sending...");
    $.get({url: "/game-list", success: function(result) {
      $(".game-list").append('<p class="game">' + result.game + '</p>');

      let game_name = result.game;
      let username = localStorage.getItem("username");

      $(".game").click(function() {
        console.log("entering game...");
        $.post({url: "/join-game", data: {username, game_name}, success: function(result) {
          document.open();
          document.write(result);
          document.close();
        }});
      });
    }});
  });
}

window.onbeforeunload = function() {
  let username = localStorage.getItem("username");
  $.post({url: "/remove-username", data: {username}});
}
