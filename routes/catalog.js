var express = require("express");
var router = express.Router();

var catalog_controller = require("../controllers/catalogController");

router.get("/", catalog_controller.index);

module.exports = router;