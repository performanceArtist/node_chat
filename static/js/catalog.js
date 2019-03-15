window.onload = function() {
    var el = document.getElementsByClassName("room_link");
    if(el) {
        for(var i=0, m=el.length; i<m; i++) {
            el[i].addEventListener("click", function() {ajSearch(this.id);});
        }
    }
}

function ajSearch(name) {
    sendGet("/room/join/" + name, function(data) {
        document.getElementById("roominfo").innerHTML = data;
    });
}

function sendGet(url, callback) {
	xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			callback(xmlhttp.responseText);
		}
	};
	xmlhttp.open('GET', url, true);
	xmlhttp.send();
}

