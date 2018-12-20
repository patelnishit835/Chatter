var express = require("express");

var app = express();

// Database Config

var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/chatter");

var messageSchema = mongoose.Schema({
	name: {type: String, default: "Anonymous"},
	message: String
});

var Message = mongoose.model("Message", messageSchema);

// App config
// app.set("view engine", "ejs");
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname));

// HTTP CONFIGURATION

var http = require('http').Server(app);
var io = require('socket.io')(http);

// Routes

app.get('/chatter', function(req, res) {
	Message.find({}, function(err, messages) {
		if(err) {
			console.log("The error in /messages: " + err);
		}
		else {
			res.send(messages);
		}
	})
});

app.post('/chatter', async function(req, res) {
	var message = new Message(req.body);

	message.save(function(err) {
		if(err) {
			res.sendStatus(500);
		}
		io.emit('message', req.body);
	});
});

// SOCKET IO CONFIG

io.on('connection', function(socket) {
	console.log('A user is connected!');
});


var server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});