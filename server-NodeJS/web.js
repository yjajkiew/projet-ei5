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
var util 	= require('util');
var url 	= require('url');
// Import work layer
var metier 	= require('./metier');
// Globals Variables 
var server 	= new express();
//var myArgs 	= process.argv.slice(2);	// get ride of the first two argument (1:node ; 2:path)
var PORT 	= process.argv[2] || 8080;


//////// URL REQUEST HANDLER
// use body parser
server.use(express.bodyParser());

server
	// Allow CORS (tricky !)
	.all('/*', function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	})

	// Arduino list query
	.get(	// test : http://localhost:8080/rest/arduinos
		'/rest/arduinos', function(req,res) {
		util.log('[WEB] Query : Arduino list');
		metier.arduinos(function(arduinos) {
			res.setHeader('Content-Type', 'application/json');
			res.send(arduinos);
		});
	})

	// LED blink query
	.get(	// test : http://localhost:8080/rest/arduinos/blink/192.168.2.3/192.168.2.3/8/100/10
		'/rest/arduinos/blink/:idCommand/:idArduino/:pin/:lenght/:number', function(req,res) {
		var p = req.params;
		util.log('[WEB] Query : LED blink [ ' + p.idCommand + ' , ' + p.idArduino + ' , ' + p.pin + ' , ' + p.lenght + ' , ' + p.number + ' ]');
		metier.blink(p.idCommand, p.idArduino, p.pin, p.lenght, p.number, function(err, data) {
			checkError(err, data, function(response) {
				res.send(response);
			});
		});
	})

	// READ command
	.get(	// test : http://localhost:8080/rest/arduinos/pinRead/192.168.2.3/192.168.2.3/8/b
		'/rest/arduinos/pinRead/:idCommand/:idArduino/:pin/:mode', function(req,res) {
		var p = req.params;
		util.log('[WEB] Query : Read [ ' + p.idCommand + ' , ' + p.idArduino + ' , ' + p.pin + ' , ' + p.mode + ' ]');
		metier.read(p.idCommand, p.idArduino, p.pin, p.mode, function(err, data) {
			checkError(err, data, function(response) {
				res.send(response);
			});
		});
	})

	// WRITE command
	.get(	// test : http://localhost:8080/rest/arduinos/pinWrite/192.168.2.3/192.168.2.3/8/b/1
		'/rest/arduinos/pinWrite/:idCommand/:idArduino/:pin/:mode/:val', function(req,res) {
		var p = req.params;
		util.log('[WEB] Query : Command [ ' + 'write' + ' , ' + p.idCommand + ' , ' + p.idArduino + ' , ' + p.pin + ' , ' + p.mode + ' , ' + p.val + ' ]');
		metier.write(p.idCommand, p.idArduino, p.pin, p.mode, p.val, function(err, data) {
			checkError(err, data, function(response) {
				res.send(response);
			});
		});
	})

	// COMMAND (POST)
	.post(	// test : http://localhost:8080/rest/arduinos/192.168.2.3/192.168.2.3/
			// json in post (pw + pr + cl) : [{"id":"1","pa":{"val":"0","pin":"8","mod":"b"},"ac":"pw"}, {"id":"2","pa":{"pin":"8","mod":"a"},"ac":"pr"}, {"id":"3","ac":"cl","pa":{"pin":"8","dur":"100","nb":"10"}}]
		'/rest/arduinos/:command/:idArduino', function(req, res) {
		// allow CORS
		// res.header("Access-Control-Allow-Origin", "*");
		// res.header("Access-Control-Allow-Headers", "X-Requested-With");
		// parameters from URL
		var p = req.params;
		// parameters from POST
		var params = req.body;
		// logs
		util.log('[WEB] Query : URL=[ ' + p.command + ' , ' + p.idArduino + ' ] ; POST=' + JSON.stringify(params));	// direct acces of the key 'id': req.body['id']
		metier.cmd(p.idArduino, params, function(err, data) {
			checkError(err, data, function(response) {
				res.send(response);
			});
		});
	})

	// ERROR : command not found
	.use(
		function(req,res) {
			// set content type
			//res.setHeader('Content-Type', 'text/plain');
			if (req.url != '/favicon.ico') {	// get ride of favicon query from browser
				// build error message
				var errorMessage = 'Wrong URL request : ' + url.parse(req.url).pathname;
				// send it back
				checkError(errorMessage, null, function(response) {
					res.send(response);
				});
				util.log('[WEB] Wrong url [ ' + url.parse(req.url).pathname + ' ]');
			}
		}
	)

	// Connection close
	.on('close', function() {
		util.log('[WEB] Connection closed');
	})

	// On errors
	.on('error', function(err) {
		util.log ('[WEB] Error on connection : ' + err.code);
	});


//////// METHODES
function checkError(err, data, callback) {
	if (err) {
		// build the error message & send it back
		jsonErrorMessage = {data:{message:err}};
		callback(JSON.stringify(jsonErrorMessage));
	}
	else {
		// send back the stringified JSON data
		callback(data);
	}
}

//////// LAUNCH SERVER (PORT 8080)
server.listen(PORT, function() {
	// log
	util.log('[WEB] Server launched on port ' + PORT);
});
