function saveUsername() {
  let username = document.getElementById("username").value;
  localStorage.setItem("username", username);

  return false;
}
