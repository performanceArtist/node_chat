var Room = require("../models/room");

exports.index = function(req, res, next) {
    Room.find({}, function(err, docs) {
        if(err) return next(err);
        res.render("catalog", {title:"Catalog", rooms:docs, user:req.session.user});
    });
}
