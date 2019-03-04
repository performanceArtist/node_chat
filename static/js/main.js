window.onload = function() {
    document.getElementById("search").onsubmit = function() { 
        ajSearch(document.getElementById("search_string").value); 
    }

    var el = document.getElementsByClassName("room_link");
    if(el) {
        for(var i=0, m=el.length; i<m; i++) {
            el[i].addEventListener("click", function() {ajSearch(this.innerHTML);});
        }
    }
}

function ajSearch(name) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("info").innerHTML = this.responseText;
       }
    };
 
    var url = "/room/join/" + name;
    xhttp.open("GET", url, true);
    xhttp.send(); 
}

function showMenu() {
    var menu = document.createElement('div'),
        navmenu = document.getElementById("navmenu"),
        nav = document.getElementById("nav");

    navmenu.style.display = "";
    console.log(this.style.top);
    /*
    menu.style.top = 100 + "px";
    menu.style.left = 10 + "px";
    */
    menu.setAttribute("id", "menu");
    //referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    nav.parentNode.insertBefore(menu, nav.nextSibling);
    menu.appendChild(navmenu);

    showMenu = function() {
        var el = document.getElementById("menu");

        if(el) {
            if(el.style.display != "none") el.style.display = "none";
            else el.style.display = "inline-block";
            return;
        }
    }
}