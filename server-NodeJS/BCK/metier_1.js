var express = require('express');
var app = express();
var util = require('util');

////////////// URL REQUEST HANDLER
// Arduino list
app.get('/server-restServer/arduinos', function(req, res, next) {
	res.send('query arduino list');
});

// LED blink
app.get("/server-restServer/arduinos/blink/:idcommande/:ipArduino/:pin/:lenght/:number", function(req, res, next){
	//if (req.params.format == null) {res.send("error");}
	var id = 1;
	res.send("led blink");
});

// Send commands
app.get("/server-restServer/arduinos/:command/:idcommande/:ipArduino/:pin/:mode/:value", function(req, res, next){
	//if (req.params.format == null) {res.send("error");}
	var id = 2;
	res.send("command");
});

// Error
app.use(
	function(req, res, next){ 
		res.setHeader('Content-Type', 'text/plain');
		res.send(404, 'Page introuvable !'); 
		util.log("wrong request");
	}
);


////////////// PARAMETER HANDLING

app.listen(process.env.PORT || 8080);