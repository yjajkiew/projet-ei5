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
// Arduino list query
server.get('/server-restServer/arduinos', function(req,res) {
	util.log("Query : Arduino list");
	res.send('Arduino list');
})

// LED blink query
.get("/server-restServer/arduinos/blink/:idcommande/:ipArduino/:pin/:lenght/:number", function(req,res) {
	// test : http://localhost:8080/server-restServer/arduinos/blink/cmd1/192.168.1.1/9/100/10
	var p = req.params;
	metier.urlToJson(p);
	util.log("Query : LED blink [ " + p.idcommande + " , " + p.ipArduino + " , " + p.pin + " , " + p.lenght + " , " + p.number + " ]");
	res.send("LED blink");
})

// Send read command
.get("/server-restServer/arduinos/read/:idcommande/:ipArduino/:pin/:mode/", function(req,res) {
	// test : http://localhost:8080/server-restServer/arduinos/cmd1/1/192.168.1.1/9/write/1
	var p = req.params;
	util.log("Query : Command [ " + "read" + " , " + p.idcommande + " , " + p.ipArduino + " , " + p.pin + " , " + p.mode + " , " + p.val + " ]");
	res.send("Command");
})

// Send write command
.get("/server-restServer/arduinos/write/:idcommande/:ipArduino/:pin/:mode/:val", function(req,res) {
	// test : http://localhost:8080/server-restServer/arduinos/cmd1/1/192.168.1.1/9/write/1
	var p = req.params;
	util.log("Query : Command [ " + "write" + " , " + p.idcommande + " , " + p.ipArduino + " , " + p.pin + " , " + p.mode + " , " + p.val + " ]");
	res.send("Command");
})

// Send command
.get("/server-restServer/arduinos/:command/:ipArduino", function(req,res) {
	// test : http://localhost:8080/server-restServer/arduinos/cmd1/192.168.1.1/
	var p = req.params;
	util.log("Query : Command [ " + p.command + " , " + p.ipArduino + " ]");
	res.send("Command");
})

// Error : command not found
.use(
	function(req,res, next) { 
		// set content type
		res.setHeader('Content-Type', 'text/plain');
		// create JSON answer
		var jsonErrorObject = {"id":"1","er":"1000","et":{}};
		// send serialized JSON to client
		res.send(JSON.stringify(jsonErrorObject)); // http.statu = 200 ????
		util.log("Wrong url [ " + url.parse(req.url).pathname + " ]");
		//next();	// go to next middleware
	}
);


//////// EVENTS
server.on('close', function() { 
	util.log('Connection closed');
})


//////// LAUNCH SERVER (PORT 8080)
server.listen(8080);


