//************//
// Couche WEB //
//************//
// -> get request URL
// -> extract query from URL (Object : parameter)
// -> send query to 'metier.js' for processing
// -> get JSON answer from 'metier.js' (from the Arduino)
// -> transmit JSON answer to Client


// Import required modules
var express = require('express'),
	util = require('util'),
	url = require('url'),
// Import other layers
	metier = require('./metier'),
// Globals Variables 
	server = express();


//////// URL REQUEST HANDLER
// use body parser
server.use(express.bodyParser());

server
// Arduino list query
.get(	// test : http://localhost:8080/server-restServer/arduinos
	'/server-restServer/arduinos', function(req,res) {
	util.log("[WEB] Query : Arduino list");
	res.send(metier.arduinos());
})

// LED blink query
.get(	// test : http://localhost:8080/server-restServer/arduinos/blink/1/192.168.2.3/9/100/10
	"/server-restServer/arduinos/blink/:idcommande/:idArduino/:pin/:lenght/:number", function(req,res) {
	var p = req.params;
	util.log("[WEB] Query : LED blink [ " + p.idcommande + " , " + p.idArduino + " , " + p.pin + " , " + p.lenght + " , " + p.number + " ]");
	metier.blink(p.idCommand, p.idArduino, p.pin, p.lenght, p.number, function(err, data) {
		res.send(data);
	});
})

// READ command
.get(	// test : http://localhost:8080/server-restServer/arduinos/pinRead/1/192.168.2.3/9/write
	"/server-restServer/arduinos/pinRead/:idcommande/:idArduino/:pin/:mode", function(req,res) {
	var p = req.params;
	util.log("[WEB] Query : Command [ " + "read" + " , " + p.idcommande + " , " + p.idArduino + " , " + p.pin + " , " + p.mode + " ]");
	res.send(metier.read(p.idCommand, p.idArduino, p.pin, p.mode));
})

// WRITE command
.get(	// test : http://localhost:8080/server-restServer/arduinos/pinWrite/1/192.168.2.3/9/write/1
	"/server-restServer/arduinos/pinWrite/:idcommande/:idArduino/:pin/:mode/:val", function(req,res) {
	var p = req.params;
	util.log("[WEB] Query : Command [ " + "write" + " , " + p.idcommande + " , " + p.idArduino + " , " + p.pin + " , " + p.mode + " , " + p.val + " ]");
	res.send(metier.write(p.idCommand, p.idArduino, p.pin, p.mode, p.valeur));
})

// COMMAND (POST)
.post(	// test : http://localhost:8080/server-restServer/arduinos/cmd1/192.168.2.3/
	"/server-restServer/arduinos/:command/:idArduino", function(req, res) {
	var p = req.params;
	// parameters from POST
    var params = JSON.stringify(req.body);
    // logs
	util.log("[WEB] Query : URL=[ " + p.command + " , " + p.idArduino + " ] ; POST=" + JSON.stringify(req.body));	// direct acces of the key 'id': req.body['id']
	res.send(metier.cmd(p.idArduino, params));
})

// ERROR : command not found
.use(
	function(req,res, next) { 
		if (req.url != '/favicon.ico') {
			// set content type
		res.setHeader('Content-Type', 'text/plain');
		// create JSON answer
		var jsonErrorObject = {"id":"1","er":"1000","et":{}};
		// send serialized JSON to client
		res.send(JSON.stringify(jsonErrorObject)); // http.statu = 200 ????
		util.log("[WEB] Wrong url [ " + url.parse(req.url).pathname + " ]");
		//next();	// go to next middleware
		}
	}
);


//////// EVENTS 
server.on('close', function() { 
	util.log('[WEB] Connection closed');
});


//////// LAUNCH SERVER (PORT 8080)
server.listen(8080);


