var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var morgan  = require("morgan")
var session = require("express-session");
var uuidv4 = require("uuid/v4");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

io.origins('http://127.0.0.1:5000');

//routes
var roomRouter = require("./routes/room");
var catalogRouter = require("./routes/catalog");
var userRouter = require("./routes/user");

var Room = require("./models/room");

//sockets setup
io.on("connection", function(socket) {
	socket.on("room", function(room) {
		console.log(room.user + " connected");
		socket.join(room.room);
		io.in(room.room).emit('new_user', room.user);
		//io.in(room).emit('message', 'cowabunga');
		socket.on('chat_message', function(msg){
			io.in(room.room).emit('chat_message', msg);
		});
		socket.on('disconnect', function() {
			Room.findOne({name:room.room}, function(err, rmm) {
				if(err) next(err);
				rmm.removeUser(room.user);
				rmm.save();
				io.in(room.room).emit("remove_user", room.user);
			});
			//io.emit('removeUser', {username: });
			console.log(room.user + " disconnected");
		});
	});
});

//session setup
app.use(session({
	genid: (req) => {
	  console.log(req.sessionID);
	  return uuidv4(); // use UUIDs for session IDs
	},
	secret: '69c82b7a2e2f4a45df238dd80a5b1dd2',
	resave: false,
	saveUninitialized: true
  }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//serve static files
app.use(express.static(path.join(__dirname, 'static')));

//logger
app.use(morgan("dev"));

//body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//db setup
var mongoDB = 'mongodb://127.0.0.1/megagame';
mongoose.connect(mongoDB, {useNewUrlParser:true});
//mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//routes setup
app.get('/', function(req, res) {
	res.redirect('/catalog');
  });

app.use("/catalog", catalogRouter);
app.use("/room", roomRouter);
app.use("/user", userRouter);

//404
app.get('*', function(req, res){
	res.status(404).sendFile("/static/html/404.html", {root:__dirname});
});

process.on('SIGINT', function() {
	Room.find({}, function(err, rooms) {
		if(err) {
			console.log(err);
			return;
		}
		rooms.forEach(room => {
			room.users = [];
			room.save();
		});
	});
	process.exit();
});

//server start
const port = 5000;
const host = "127.0.0.1";

server.listen(port, function() {
	console.log("Listening on port " + port + "...");
});
