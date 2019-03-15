var express = require("express");
var router = express.Router();

var user_controller = require("../controllers/userController");

router.get("/", function(req, res) {res.redirect("/user/registration");});
router.get("/registration", user_controller.regform);
router.post("/registration", user_controller.registration);
router.get("/registration/confirm/:hash", user_controller.confirm_registration);
router.get("/info/:username", user_controller.user_info);
router.get("/uinfo", user_controller.get_user);
router.get("/login", user_controller.login_form);
router.post("/login", user_controller.login);
router.get("/logout", user_controller.logout);

module.exports = router;


