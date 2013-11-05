//************//
// Couche WEB //
//************//
// -> get request URL
// -> extract query from URL (Object : parameter)
// -> send query to 'metier.js' for processing
// -> get JSON answer from 'metier.js' (from the Arduino)
// -> transmit JSON answer to Client


// Import required modules
var express = require('express');
var	util = require('util');
var	url = require('url');
// Import other layers
var	metier = require('./metier');
// Globals Variables 
var	server = express();


//////// URL REQUEST HANDLER
// use body parser
server.use(express.bodyParser());
// server.use(express.bodyDecoder());

server
// Arduino list query
.get(	// test : http://localhost:8080/server-restServer/arduinos
	'/server-restServer/arduinos', function(req,res) {
	util.log('[WEB] Query : Arduino list');
	res.send(metier.arduinos())	;
	next();
})

// LED blink query
.get(	// test : http://localhost:8080/server-restServer/arduinos/blink/1/192.168.2.3/9/100/10
	'/server-restServer/arduinos/blink/:idCommand/:idArduino/:pin/:lenght/:number', function(req,res) {
	var p = req.params;
	util.log('[WEB] Query : LED blink [ ' + p.idCommand + ' , ' + p.idArduino + ' , ' + p.pin + ' , ' + p.lenght + ' , ' + p.number + ' ]');
	metier.blink(p.idCommand, p.idArduino, p.pin, p.lenght, p.number, function(err, data) {
		res.send(data);
	});
})

// READ command
.get(	// test : http://localhost:8080/server-restServer/arduinos/pinRead/1/192.168.2.3/9/a
	'/server-restServer/arduinos/pinRead/:idCommand/:idArduino/:pin/:mode', function(req,res) {
	var p = req.params;
	util.log('[WEB] Query : Command [ ' + 'read' + ' , ' + p.idCommand + ' , ' + p.idArduino + ' , ' + p.pin + ' , ' + p.mode + ' ]');
	metier.read(p.idCommand, p.idArduino, p.pin, p.mode, function(err, data) {
		res.send(data);
	});
})

// WRITE command
.get(	// test : http://localhost:8080/server-restServer/arduinos/pinWrite/1/192.168.2.3/9/a/1
	'/server-restServer/arduinos/pinWrite/:idCommand/:idArduino/:pin/:mode/:val', function(req,res) {
	var p = req.params;
	util.log('[WEB] Query : Command [ ' + 'write' + ' , ' + p.idCommand + ' , ' + p.idArduino + ' , ' + p.pin + ' , ' + p.mode + ' , ' + p.val + ' ]');
	metier.write(p.idCommand, p.idArduino, p.pin, p.mode, p.val, function(err, data) {
		res.send(data);
	});
})

// COMMAND (POST)
.post(	// test : http://localhost:8080/server-restServer/arduinos/cmd1/192.168.2.3/
	'/server-restServer/arduinos/:command/:idArduino', function(req, res) {
	// parameters from URL
	var p = req.params;
	// parameters from POST
    var params = req.body;
    // logs
	util.log('[WEB] Query : URL=[ ' + p.command + ' , ' + p.idArduino + ' ] ; POST=' + JSON.stringify(params));	// direct acces of the key 'id': req.body['id']
	metier.cmd(p.idArduino, params, function(err, data) {
		res.send(data);
	});
})

// ERROR : command not found
.use(
	function(req,res, next) {
		// set content type
		res.setHeader('Content-Type', 'text/plain');
		if (req.url != '/favicon.ico') {	// get ride of favicon query from browser
			// create JSON answer
			var jsonErrorObject = {"id":"1","er":"1000","et":{}};	// send back error code specific to REST server
			// send serialized JSON to client
			res.send(JSON.stringify(jsonErrorObject)); // http.statu = 200 ????
			util.log('[WEB] Wrong url [ ' + url.parse(req.url).pathname + ' ]');
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