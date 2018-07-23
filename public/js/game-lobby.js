window.onload = function() {
  getGameList();
  $("refresh").click(function() {
    getGameList();
  });

}

function getGameList(){
  $.get({url: "/game-list", success: function(result) {
    $(".game-list").empty();


    // THIS IS NOT CURRENTLY FUNCTIONAL FOR LISTS LONGER THAN ONE
    for(var name of result.names){
      $(".game-list").append('<p class="gameslot">' + name + '</p>');

      $(".game-list").click(function() {
        let username = localStorage.getItem("username");

        $.post({url: "/join-game", data: {username, name}, success: function(result) {
          document.open();
          document.write(result);
          document.close();
        }});
      });
    }
  }});
}

window.onbeforeunload = function() {
  let username = localStorage.getItem("username");
  $.post({url: "/remove-username", data: {username}});
}
