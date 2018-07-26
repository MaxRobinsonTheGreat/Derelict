window.onload = function() {
  checkSessionStorage();
  setLoginClickListener();
}

function setLoginClickListener() {
  $("#login-form").submit(function(e) {
    e.preventDefault();
    let username = document.getElementById("username").value;
    $.post({url:"/login", data: {username}, success: function(result) {
      if(result == true) {
        sessionStorage.setItem("username", username);
        $.post({url: "/game-lobby", data: {username}, success: function(result) {
          document.open();
          document.write(result);
          document.close();
        }});
      } else {
        alert("Username is already taken...");
      }
    }});
  });
  return false;
}

function checkSessionStorage() {
  if (sessionStorage.getItem("username") != null) {
    let username = sessionStorage.getItem("username");
    $.post({url: "/game-lobby", data: {username}, success: function(result) {
      document.open();
      document.write(result);
      document.close();
    }});
  }
}
