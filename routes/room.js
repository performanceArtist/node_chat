var express = require("express");
var router = express.Router();

var room_controller = require("../controllers/roomController");

router.get("/", function(req, res){
    res.redirect("/catalog");
});

router.get("/create", room_controller.create_get);
router.post("/create", room_controller.create_post);
router.get("/join/:name", room_controller.get_room_info);
router.post("/join/:name", room_controller.join_room);

module.exports = router;