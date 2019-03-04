var User = require("../models/user"),
    nodemailer = require("nodemailer"),
    uuidv4 = require("uuid/v4");

exports.regform = function(req, res) {
    res.render("regform");
}

exports.user_info = function(req, res, next) {
    User.findOne({username:req.params.username}, function(err, user) {
        if(err) return next(err);
        if(!user) {
            res.send("User not found.");
            return;
        }
        res.render("user_info", {username: user.username});
    });
}

exports.registration = function(req, res) {
    var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        nameRegex = /^[a-zA-Z_]+$/,
        error = "";
        hash = uuidv4();

        if(!emailRegex.test(req.body.email)) {
            error += "Invalid email.<br>";
        }

        if(!nameRegex.test(req.body.username)) {
            error += "Invalid username(use only alphabet symbols and underscores).<br>";
        }
        
        if(error) {
            res.send(error);
            return;
        }
        
    var user = new User({
        username:req.body.username,
        password:req.body.password,
        email:req.body.email,
        hash:hash
    });

    user.save(function(err) {
        if(err) return next(err);
        sendMail(req.body.email, hash);
        res.send("Success! Check your email to complete registration.");
    });
}

function sendMail(email, hash) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'nakedant19@gmail.com',
          pass: 'fakeandgay'
        }
    });

    var mailOptions = {
        from: 'nakedant19@gmail.com',
        to: email,
        subject: 'Confirm registration on somesite.com',
        text: 'Your link: http://192.168.80.3:5000/user/registration/confirm/' + hash
      };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    }); 
}

exports.confirm_registration = function(req, res, next) {
    var hash = req.params.hash;
    User.findOne({hash:hash}, function(err, user) {
        if(err) return (err);
        if(user.active !== 'false') {
            res.send("This user is already active.");
            return;
        }
        user.active = true;
        user.hash = undefined;
        user.save();
        res.send("Confirmed successfully.");
    });
}

exports.login_form = function(req, res) {
    res.render("loginfrm");
}

exports.login = function(req, res, next) {
    User.findOne({username:req.body.username}, function(err, user) {
        if(err) return next(err);

        if(!user) {
            res.send("No user with such name(" + req.body.username + ');');
            return;
        }

        if(user.hash && user.active === 'false') {
            res.send("This login hasn't been confirmed.");
            return;
        }

        user.comparePassword(req.body.password, function(err, match) {
            if(err) return next(err);

            if(!match) {
                res.send("Wrong password");
                return;
            }
            req.session.user = user._id;
            res.redirect("/catalog");
        });
    });
}