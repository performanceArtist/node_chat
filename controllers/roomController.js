var Room = require("../models/room");

exports.create_get = function(req, res) {
    res.render("create_room", {title:"Create room"});
}

exports.create_post = function(req, res, next) {
    var nameRegex = /^[a-zA-Z0-9_]+$/;

    if(!nameRegex.test(req.body.name)) {
        return next(new Error("Invalid room name(use only alphabet symbols and underscores)."));
    }
    
    if(req.body.max_users) {
        var num = parseInt(req.body.max_users, 10);

        if(isNaN(num) || num<1 || num>50) {
            return next(new Error("Invalid number of users."));
        }
    }

    if(req.body.info) {
        if(req.body.info.length > 500) {
            return next(new Error("Maximum description length is 500 symbols."));
        }
    }

    Room.findOne({name:req.body.name}, function(err, room) {
        if(err) return next(err);

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
            res.redirect("/");
        });             
    });
}

exports.get_room_info = function(req, res, next) {
    Room.findOne({name:req.params.name}, function(err, room) {
        if(err) return next(err);
        if(!room) return next(new Error("No room found"));

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
    var nameRegex = /^[a-zA-Z_0-9]+$/;

    if(!nameRegex.test(req.body.username)) {
        return next(new Error("Invalid username(use only alphabet symbols and underscores)."));
    }

    Room.findOne({name:req.params.name}, function(err, room) {
        if(err) return next(err);

        if(!room) return next(new Error("No room found"));

        if(includes(room.users, req.body.username)) {
            return next(new Error("This name is taken"));
        }

        if(room.max_users && room.users.length + 1 > room.max_users) {
            return next(new Error("This room is full"));
        }

        if(!room.password) {
            res.render("room", 
                       {name:room.name, username:req.body.username, users:room.users}, 
                       function(err, html) {
                           if(err) return next(err);
                           console.log(req.body.username);
                           room.users.push(req.body.username);
                           room.save();
                           res.send(html);
                       });
        } else {
            room.comparePassword(req.body.password, function(err, match) {
                if(err) return next(err);
                if(!match) return next(new Error("Wrong password"));

                res.render("room", 
                           {name:room.name, username:req.body.username, users:room.users}, 
                           function(err, html) {
                               if(err) return next(err);
                               room.users.push(req.body.username);
                               room.save();
                               res.send(html);
                           });
            });
        }
    });
}
