var socket = io.connect("http://127.0.0.1:5000");
var room = document.getElementsByClassName("room")[0].id;
var user = document.getElementsByClassName("user")[0].id;

console.log(room);

socket.on('connect', function() {
    socket.emit('room', {room:room, user:user});
});

socket.on('new_user', function(name) {
    document.getElementById("online").innerHTML += '<li id="' + name + '">' + name + '</li>';
});

socket.on('remove_user', function(name) {
    var temp = document.getElementById(name);
    temp.parentNode.removeChild(temp);
});

socket.on('message', function(data) {
  console.log(data);
});

socket.on('chat_message', function(msg){
	var el = document.createElement("li");
		el.innerHTML = msg.user + ": " + msg.message;
      document.getElementById("messages").appendChild(el);
});

function sendMessage(e) {
    e.preventDefault();
    var el = document.getElementById("message");
    console.log(el.value);
    if(el.value) {
        socket.emit("chat_message", {message:el.value, user:user});
        el.value = "";
    }
}

