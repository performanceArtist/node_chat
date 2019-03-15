var socket = io.connect("https://guarded-island-67241.herokuapp.com");
var room = document.getElementById("thisroom").innerHTML;
var showuser = document.getElementById("thisuser").innerHTML;
var user = document.querySelector("#thisuser span").innerHTML;

console.log(user, showuser);

function updateScroll() {
    var el = document.getElementById("messages");
    var click = false;

    el.onmousedown = function() { click = true; }
    el.onmouseup = function() { click = false; }

    return function() {
        if(!click) el.scrollTop = el.scrollHeight;
    }
}

window.onload = function() {
    var upd = updateScroll();
    setInterval(upd, 300);
}

socket.on('connect', function() {
    socket.emit('room', {room:room, user:user, username:showuser});
});

socket.on('new_user', function(room) {
	if(document.getElementById(room.user)) return;
    document.getElementById("online").innerHTML += '<li id="' + room.user + '">' + room.username + '</li>';
});

socket.on('remove_user', function(name) {
    var temp = document.getElementById(name);
    temp.parentNode.removeChild(temp);
});

socket.on('message', function(data) {
  console.log(data);
});

socket.on('chat_message', function(msg) {
	var el = document.createElement("div");
		el.innerHTML = msg.username + ": " + msg.message;
      document.getElementById("messages").appendChild(el);
});

function sendMessage(e) {
    e.preventDefault();
    var el = document.getElementById("message");
    //console.log(el.value);
    if(el.value) {
        socket.emit("chat_message", {message:el.value, user:user, username:showuser});
        el.value = "";
    }
}

