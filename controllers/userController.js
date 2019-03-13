var User = require("../models/user"),
    nodemailer = require("nodemailer"),
    uuidv4 = require("uuid/v4"),
    config = require("../config.json");

exports.regform = function(req, res) {
    res.render("regform");
}

exports.user_info = function(req, res, next) {
    User.findOne({username:req.params.username}, function(err, user) {
        if(err) return next(err);
        if(!user) {
            return next(new Error('User not found.'));
        }
        res.render("user_info", {username: user.username});
    });
}

exports.registration = function(req, res, next) {
    var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        nameRegex = /^[a-zA-Z_0-9]+$/,
        hash = uuidv4();

    if(!emailRegex.test(req.body.email)) {
        return next(new Error("Invalid email."));
    }
    if(!nameRegex.test(req.body.username)) {
        return next(new Error("Invalid username(use only alphabet symbols and underscores)."));
    }
        
        
    var user = new User({
        username:req.body.username,
        password:req.body.password,
        email:req.body.email,
        hash:hash
    });

    user.save(function(err) {
        if(err) return next(err);
        sendMail(req.body.email, hash, next);
        res.send("Success! Check your email to complete registration.");
    });
}

function sendMail(email, hash, next) {
    var transporter = nodemailer.createTransport({
        service: config.email.service,
        auth: {
          user: config.email.user,
          pass: config.email.password
        }
    });

    var mailOptions = {
        from: config.email.user,
        to: email,
        subject: 'Confirm registration on somesite.com',
        text: 'Your link: http://192.168.80.3:5000/user/registration/confirm/' + hash
      };

    transporter.sendMail(mailOptions, function(err, info){
        if (err) {
            return next(err);
        } else {
          console.log('Email sent: ' + info.response);
        }
    }); 
}

exports.confirm_registration = function(req, res, next) {
    var hash = req.params.hash;
    User.findOne({hash:hash}, function(err, user) {
        if(err) return next(err);
        if(user.active !== 'false') {
            return next(new Error("This user is already active."));
        }
        user.active = true;
        user.hash = undefined;
        user.save();
        res.render("info", {info:"Confirmed successfully."});
    });
}

exports.login_form = function(req, res) {
    res.render("loginfrm");
}

exports.login = function(req, res, next) {
    User.findOne({username:req.body.username}, function(err, user) {
        if(err) return next(err);

        if(!user) {
            return next(new Error("No user with such name(" + req.body.username + ');'));
        }

        if(user.hash && user.active === 'false') {
            next(new Error("This login hasn't been confirmed."));
        }

        user.comparePassword(req.body.password, function(err, match) {
            if(err) return next(err);

            if(!match) {
                return next(new Error("Wrong password"));
            }
            req.session.user = user._id;
            res.redirect("/catalog");
        });
    });
}