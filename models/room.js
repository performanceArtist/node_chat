var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'),
    SALT_WORK_FACTOR = 10;

var RoomSchema = new Schema(
    {
        name:{type:String, required:true, unique:true, max:50},
        info:{type:String, max:500},
        max_users:{type:Number},
        users:{type:[String]},
        private:{type:String},
        password:{type:String}
    }
);

RoomSchema
.virtual("url")
.get(function() {
    return "/catalog/room/" + this.name;
});

RoomSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

RoomSchema.methods.removeUser = function(name) {
    console.log(this.users, name);
    for(var i=0, m=this.users.length; i<m; i++) {
        if(this.users[i] === name) {
            this.users.splice(i, 1);
            console.log(this.users);
            return;
        }
    }
    console.log("No user found");
}

RoomSchema.pre('save', function(next) {
    var room = this;

if(!room.password) {return next();}
// only hash the password if it has been modified (or is new)
if (!room.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(room.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            room.password = hash;
            next();
        });
    });
});

module.exports = mongoose.model("Room", RoomSchema);