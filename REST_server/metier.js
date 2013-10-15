var express = require('express');
var app = express();

////////////// URL REQUEST HANDLER
// Arduino list
app.get('/server-restServer/arduinos', function(req, res, next) {
	res.type('text/plain'); // set content-type
	res.send('query arduino list'); // send text response
});

// LED blink
app.get("/server-restServer/arduinos/blink/:idcommande/:ipArduino/:pin/:lenght/:number", function(req, res, next){
	//if (req.params.format == null) {res.send("error");}
	var id = 1;
	res.send(id);
});

// Send commands
app.get("/server-restServer/arduinos/:command/:idcommande/:ipArduino/:pin/:mode/:value", function(req, res, next){
	//if (req.params.format == null) {res.send("error");}
	var id = 2;
	res.send(id);
});

// Error
// app.get(function(err, req, res, next){
// 	res.status(404).send('Wrong url, command not found !');
// 	next();
// });


////////////// PARAMETER HANDLING

app.listen(process.env.PORT || 8080);