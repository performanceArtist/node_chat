var Room = require("./models/room");

module.exports = function(server) {
    var io = require("socket.io")(server);
    
    io.on("connection", function(socket) {
        socket.on("room", function(room) {
            console.log(room.user + " connected");

            socket.join(room.room);
            io.in(room.room).emit('new_user', {user:room.user, username:room.username});

            socket.on('chat_message', function(msg){
                io.in(room.room).emit('chat_message', msg);
            });

            socket.on('disconnect', function() {
                console.log(room.user);
                Room.findOne({name:room.room}, function(err, rmm) {
                    if(err) next(err);
                    rmm.removeUser(room.user);
                    rmm.save();
                    io.in(room.room).emit("remove_user", room.user);
                });
                console.log(room.user + " disconnected");
            });

        });
    });
    return io;
}
