var express = require("express"),
	app = express(),
	path = require("path"),
	morgan  = require("morgan"),
	mongoose = require("mongoose"),
	session = require("express-session"),
	uuidv4 = require("uuid/v4"),
	server = require("http").Server(app),
	io = require("./ioInit")(server),
	config = require("./config.json");

//routes
var roomRouter = require("./routes/room"),
	catalogRouter = require("./routes/catalog"),
	userRouter = require("./routes/user");


// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//db setup
mongoose.connect(config.database.con_string, {useNewUrlParser:true});
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));


//logger
app.use(morgan("dev"));

//serve static files
app.use(express.static(path.join(__dirname, 'static')));

//session
app.use(session({
	genid: () => {
	  return uuidv4(); // use UUIDs for session IDs
	},
	secret: config.server.secret,
	resave: false,
	saveUninitialized: true
}));

//body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes setup
app.get('/', function(req, res) {
	res.redirect('/catalog');
});
app.use("/catalog", catalogRouter);
app.use("/room", roomRouter);
app.use("/user", userRouter);
app.get('*', function(req, res, next){
	return next(new Error("Page not found"));
});

//error handler
app.use(function (err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    console.error(err.stack || err);
    res.render('error', {error:err.message});
});

//cleanup
process.on('SIGINT', function() {
	var Room = require("./models/room");

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


server.listen(process.env.PORT);