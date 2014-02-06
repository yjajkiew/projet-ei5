//********//
//  [WEB] //
//********//
// -> get request URL
// -> parse the URL and extract query parameters (ardiuno ip, commands, ...)
// -> send query to 'metier.js' for processing
// -> get JSON answer from [METIER] (which one get it from the [DAO] layer)
// -> transmit JSON answer to Client


// Import required modules
var express = require('express');
var http	= require('http');
var util 	= require('util');
var url 	= require('url');
var fs 		= require('fs');

// Import work layer
var metier 	= require('./metier');

// Globals Variables 
var server 	= new express();
var PORT 	= process.argv[2] || 8080;
var BASE_PATH = "/rest/arduinos";

// Client : index.html
var index = fs.readFileSync('./public/index.html');



/////////////////
// MIDDLEWARES //
///////////////// for the express framework

// server.use(express.logger());  // log all request in console
server.use(express.bodyParser());	// use url parser
server.use(express.static(__dirname + '/public'));	// serve static files
server.use(express.favicon(__dirname + '/public/favicon.ico')) // activate indicated favicon



////////////
// ROUTES //
////////////
// all request go trought each route until the good one is reached
// if no matching route is found, the default one (.use) send back an error JSON

server

// Allow CORS, tricky ! (needed when working under the same Domain Name like "localhost")
.all('/*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	// note : "next" statement is use to call next middleware
	next();
})

// Arduino list query: http://localhost:8080/rest/arduinos
.get(BASE_PATH, function(req, res) {
	util.log('[WEB] Query : Arduino list');
	metier.arduinos(function(arduinos) {
		res.send(arduinos);
	});
})

// jQuery Client: http://localhost:8080/
.get('/', function(req,res) {
	res.setHeader('Content-Type', 'text/html');
	util.log('[WEB] Query : jQuery Client');
	res.send(index);
})

// LED blink query: http://localhost:8080/rest/arduinos/blink/192.168.2.3/192.168.2.3/8/100/10
.get(BASE_PATH + '/blink/:idCommand/:idArduino/:pin/:lenght/:number', function(req,res) {
	var p = req.params;
	util.log('[WEB] Query : LED blink [ ' + p.idCommand + ' , ' + p.idArduino + ' , ' + p.pin + ' , ' + p.lenght + ' , ' + p.number + ' ]');
	metier.blink(p.idCommand, p.idArduino, p.pin, p.lenght, p.number, function(jsonObject) {
		res.send(jsonObject);
	});
})

// READ command: http://localhost:8080/rest/arduinos/pinRead/192.168.2.3/192.168.2.3/8/b
.get(BASE_PATH + '/pinRead/:idCommand/:idArduino/:pin/:mode', function(req,res) {
	var p = req.params;
	util.log('[WEB] Query : Read [ ' + p.idCommand + ' , ' + p.idArduino + ' , ' + p.pin + ' , ' + p.mode + ' ]');
	metier.read(p.idCommand, p.idArduino, p.pin, p.mode, function(jsonObject) {
		res.send(jsonObject);
	});
})

// WRITE command: http://localhost:8080/rest/arduinos/pinWrite/192.168.2.3/192.168.2.3/8/b/1
.get(BASE_PATH + '/pinWrite/:idCommand/:idArduino/:pin/:mode/:val', function(req,res) {
	var p = req.params;
	util.log('[WEB] Query : Command [ ' + 'write' + ' , ' + p.idCommand + ' , ' + p.idArduino + ' , ' + p.pin + ' , ' + p.mode + ' , ' + p.val + ' ]');
	metier.write(p.idCommand, p.idArduino, p.pin, p.mode, p.val, function(jsonObject) {
		res.send(jsonObject);
	});
})

// COMMAND (POST): http://localhost:8080/rest/arduinos/192/192.168.2.3
// json: (pw + pr + cl) : [{"id":"1","pa":{"val":"0","pin":"8","mod":"b"},"ac":"pw"}, {"id":"2","pa":{"pin":"8","mod":"a"},"ac":"pr"}, {"id":"3","ac":"cl","pa":{"pin":"8","dur":"100","nb":"10"}}]
.post(BASE_PATH + '/:command/:idArduino', function(req, res) {
	// parameters from URL
	var p = req.params;
	// parameters from POST
	var params = req.body;
	// logs
	util.log('[WEB] Query : URL=[ ' + p.command + ' , ' + p.idArduino + ' ] ; POST=' + JSON.stringify(params));	// direct acces of the key 'id': req.body['id']
	metier.postCmd(p.idArduino, params, function(answer) {
		res.send(answer);
	});
})

// ERROR : wrong URL
.use(
	function(req,res) {
		// get ride of favicon query from browser
		if (req.url != '/favicon.ico') {
			// build error message
			var errorMessage = '[WEB] Wrong URL request : [' + url.parse(req.url).pathname + ']';
			var jsonErrorMessage = {data:{message:errorMessage}};
			// send it back
			res.send(jsonErrorMessage);
			util.log(errorMessage);
		}
	}
);

// Connection close
server.on('close', function() {
	util.log('[WEB] Connection closed');
})

// On errors
server.on('error', function(err) {
	util.log('[WEB] Error on connection : ' + err.code);
});



////////////
// SERVER //
////////////

server.listen(PORT, function() {
	// log
	util.log('[WEB] Server launched on port ' + PORT);
});