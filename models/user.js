var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'),
    SALT_WORK_FACTOR = 10;

var UserSchema = new Schema(
    {
        username:{type:String, unique:true, max:50},
        password:{type:String},
        active:{type:String, default:false},
        hash:{type:String},
        role:{type:String, default:"user"}
    }
);

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

UserSchema.pre('save', function(next) {
    var user = this;

if(!user.password) {return next();}
// only hash the password if it has been modified (or is new)
if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});
module.exports = mongoose.model("User", UserSchema);