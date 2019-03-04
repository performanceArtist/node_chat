var Room = require("../models/room");

exports.create_get = function(req, res) {
    res.render("create_room", {title:"Create room"});
}

exports.create_post = function(req, res, next) {
    var nameRegex = /^[a-zA-Z_]+$/,
        error = "";

    if(!nameRegex.test(req.body.name)) {
        error += "Invalid room name(use only alphabet symbols and underscores).<br>";
    }
    
    if(req.body.max_users) {
        var num = parseInt(req.body.max_users, 10);

        if(isNaN(num) || num<1 || num>50) {
            error += "Invalid number of users.<br>";
        }
    }

    if(req.body.info) {
        if(req.body.info.length > 500) {
            error += "Maximum description length is 500 symbols.<br>"
        }
    }

    if(error) {
        res.send(error);
        return;
    }

    Room.findOne({name:req.body.name}, function(err, room){
        if(err) next(err);

        if(room) {
            res.send("This name is taken.");
            return;
        }
 
        var room = new Room({
            name:req.body.name,
            info:req.body.info,
            max_users:req.body.max_users,
            users:[],
            private:req.body.private,
            password:req.body.password
        });

        room.save(function (err) {
            if (err) return next(err); 
            res.redirect("/room/join/" + room.name);
        });             
    });
}

exports.get_room_info = function(req, res, next) {
    Room.findOne({name:req.params.name}, function(err, room) {
        if(err) return next(err);
        if(!room) {
            res.send("<p>No room found</p>");
            return;
        }

        var pass = "";
        if (room.password) pass="true";
        res.render("room_info", 
        {name:room.name, info:room.info, password:pass}, 
        function(err, html) {
            if(err) return next(err);
            res.send(html);
        });
    });
}

function includes(arr, str) {
    for(var i=0, m=arr.length; i<m; i++) {
        if(arr[i] === str) return true;
    }
    return false;
}

exports.join_room = function(req, res, next) {
    var nameRegex = /^[a-zA-Z_0-9]+$/,
    error = "";

    if(!nameRegex.test(req.body.username)) {
        error += "Invalid username(use only alphabet symbols and underscores).<br>";
    }

    if(error) {
        res.send(error);
        return;
    }

    Room.findOne({name:req.params.name}, function(err, room) {
        if(err) return next(err);

        if(!room) {
            res.send("No room found");
            return;
        }

        //console.log(includes(room.users, req.params.name));
        if(includes(room.users, req.body.username)) {
            res.send("This name is taken");
            return;
        }

        if(room.max_users && room.users.length + 1 > room.max_users) {
            res.send("This room is full");
            return;
        }

        if(!room.password) {
            res.render("room", {name:room.name, username:req.body.username, users:room.users}, function(err, html) {
            if(err) return next(err);
            console.log(req.body.username);
            room.users.push(req.body.username);
            room.save();
            res.send(html);
            return;
            });
        } else {
            room.comparePassword(req.body.password, function(err, match) {
                if(!match) {
                    res.send("Wrong password");
                    return;
                }

                res.render("room", {name:room.name, username:req.body.username, users:room.users}, function(err, html) {
                    if(err) return next(err);
                    room.users.push(req.body.username);
                    room.save();
                    res.send(html);
                    return;
                });
            });
        }
    });
}
