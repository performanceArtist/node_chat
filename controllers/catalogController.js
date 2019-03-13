var Room = require("../models/room"),
    User = require("../models/user");

exports.index = function(req, res, next) {
    Room.find({}, function(err, docs) {
        if(err) return next(err);
        res.render("catalog", {title:"Catalog", rooms:docs});
    });

    if(req.session.user) {
        User.findById(req.session.user, function(err, user) {
            if(err) return next(err);
            if(user) console.log(user.username);
        });
    }
}
