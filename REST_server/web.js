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
var util = require('util');
var url = require('url');

// Globals Variables 
var server = express();


////////////// URL REQUEST HANDLER
// Arduino list query
server.get('/server-restServer/arduinos', function(req,res) {
	util.log("Query : Arduino list");
	res.send('Arduino list');
})

// LED blink query
.get("/server-restServer/arduinos/blink/:idcommande/:ipArduino/:pin/:lenght/:number", function(req,res) {
	// test : http://localhost:8080/server-restServer/arduinos/blink/cmd1/192.168.1.1/9/100/10
	var p = req.params;
	util.log("Query : LED blink [ " + p.idcommande + " , " + p.ipArduino + " , " + p.pin + " , " + p.lenght + " , " + p.number + " ]");
	res.send("LED blink");
})

// Send commands query
.get("/server-restServer/arduinos/:command/:idcommande/:ipArduino/:pin/:mode/:val", function(req,res) {
	// test : http://localhost:8080/server-restServer/arduinos/cmd1/1/192.168.1.1/9/write/1
	var p = req.params;
	util.log("Query : Command [ " + p.command + " , " + p.idcommande + " , " + p.ipArduino + " , " + p.pin + " , " + p.mode + " , " + p.val + " ]");
	res.send("Command");
})

// Error in URL
.use(
	function(req,res) { 
		res.setHeader('Content-Type', 'text/plain');
		res.send(404, 'Page introuvable !'); 
		util.log("404 : wrong url [ " + url.parse(req.url).pathname + " ]");
	}
);


////////////// EVENTS
server.on('close', function() { 
	util.log('Connection closed');
})


////////////// LAUNCH SERVER (PORT 8080)
server.listen(8080);


