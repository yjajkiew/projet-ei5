//********//
//  [WEB] //
//********//
// -> get request URL
// -> parse the URL and extract query parameters (ardiuno ip, commands, ...) and data from POST
// -> send query to 'metier.js' for processing (params + data from POST)
// -> get JSON answer from [METIER] (which one get it from the [DAO] layer)
// -> serialize JSON from [METIER]
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
var BASE_PATH = '/rest/arduinos';



/////////////////
// MIDDLEWARES //
///////////////// for the express framework

server.configure(function(){
	// server.use(express.logger());  // log all http requests in console
	server.use(rawBody);	// POST body parser (see at the bottom)
	server.use(express.static(__dirname + '/public'));	// serve static files
	server.use(express.favicon(__dirname + '/public/favicon.ico')) // activate indicated favicon
});


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
	res.setHeader('Content-Type', 'application/json');
	// note : "next" statement is use to call next middleware
	next();
})

// jQuery Client: http://localhost:8080/
.get('/', function(req,res) {
	res.setHeader('Content-Type', 'text/html');
	util.log('[WEB] Query : jQuery Client');
	var index = fs.readFile('./public/index.html')
	res.send(index);
})

// Arduino list query: http://localhost:8080/rest/arduinos
.get(BASE_PATH, function(req, res) {
	util.log('[WEB] Query : Arduino list');
	metier.arduinos(function(arduinos) {
		// serialize & send answer
		answer = JSON.stringify(arduinos);
		util.log('[WEB] ARDUINOS sending back : ' + answer); 
		res.send(answer);
	});
})

// LED blink query: http://localhost:8080/rest/arduinos/blink/192.168.2.3/192.168.2.3/8/100/10
.get(BASE_PATH + '/blink/:idCommand/:idArduino/:pin/:lenght/:number', function(req,res) {
	var p = req.params;
	util.log('[WEB] Query : LED blink [ ' + p.idCommand + ' , ' + p.idArduino + ' , ' + p.pin + ' , ' + p.lenght + ' , ' + p.number + ' ]');
	metier.blink(p.idCommand, p.idArduino, p.pin, p.lenght, p.number, function(jsonObject) {
		// serialize & send answer
		answer = JSON.stringify(jsonObject);
		util.log('[WEB] BLINK sending back : ' + answer); 
		res.send(answer);
	});
})

// READ command: http://localhost:8080/rest/arduinos/pinRead/192.168.2.3/192.168.2.3/8/b
.get(BASE_PATH + '/pinRead/:idCommand/:idArduino/:pin/:mode', function(req,res) {
	var p = req.params;
	util.log('[WEB] Query : Read [ ' + p.idCommand + ' , ' + p.idArduino + ' , ' + p.pin + ' , ' + p.mode + ' ]');
	metier.read(p.idCommand, p.idArduino, p.pin, p.mode, function(jsonObject) {
		// serialize & send answer
		answer = JSON.stringify(jsonObject);
		util.log('[WEB] READ sending back : ' + answer); 
		res.send(answer);
	});
})

// WRITE command: http://localhost:8080/rest/arduinos/pinWrite/192.168.2.3/192.168.2.3/8/b/1
.get(BASE_PATH + '/pinWrite/:idCommand/:idArduino/:pin/:mode/:val', function(req,res) {
	var p = req.params;
	util.log('[WEB] Query : Command [ ' + 'write' + ' , ' + p.idCommand + ' , ' + p.idArduino + ' , ' + p.pin + ' , ' + p.mode + ' , ' + p.val + ' ]');
	metier.write(p.idCommand, p.idArduino, p.pin, p.mode, p.val, function(jsonObject) {
		// serialize & send answer
		answer = JSON.stringify(jsonObject);
		util.log('[WEB] WRITE sending back : ' + answer); 
		res.send(answer);
	});
})

// COMMAND (POST): http://localhost:8080/rest/arduinos/192/192.168.2.3
// json: (pw + pr + cl) : [{"id":"1","pa":{"val":"0","pin":"8","mod":"b"},"ac":"pw"}, {"id":"2","pa":{"pin":"8","mod":"a"},"ac":"pr"}, {"id":"3","ac":"cl","pa":{"pin":"8","dur":"100","nb":"10"}}]
.post(BASE_PATH + '/:command/:idArduino', function(req, res) {
	// parameters from URL
	var p = req.params;
	// POST data
	var params = req.rawBody;
	// log
	util.log('[WEB] POST command (' + req.ip + ') - ' + 'URL=' + req.url + ' POST=' + JSON.stringify(params));
	// console.log(req.route);
	// send to METIER
	metier.asyncPostCmd(p.idArduino, params, function(jsonObject) {
		// serialize & send answer
		answer = JSON.stringify(jsonObject);
		util.log('[WEB] POST sending back : ' + answer); 
		res.send(answer);
	});
})

// ERROR : wrong URL
.use(
	function(err,req,res,next) {
		// get ride of favicon query from browser
		if (req.url != '/favicon.ico') {
			if(err) {
				// if we encountered an error previously :
				var errorMessage = '[WEB] Error -> ' + err;
				buildJsonStringError(errorMessage, function(jsonStringError) {
					res.send(sonStringError);
				});
				util.log('[WEB] Error Stack Trace -> ' + err.stack);
			} else {
				// if it's a wrong URL :
				var errorMessage = '[WEB] Wrong URL request : [' + url.parse(req.url).pathname + ']';
				buildJsonStringError(errorMessage, function(jsonStringError) {
					res.send(jsonStringError);
				});
				util.log(errorMessage);
			}
		}
	}
);


////////////
// SERVER //
////////////

server.listen(PORT, function() {
	// log
	util.log('[WEB] Server launched on port ' + PORT);
});


//////////////
// Methodes //
//////////////

// hand-made body parser
function rawBody(req, res, next) {
	req.setEncoding("utf8");
	req.rawBody = '';
	
	req.on("data", function(chunk){ 
		req.rawBody += chunk;
	});
	
	req.on("end", function() {
		next();
	});

	// req.on("err", function() {
	// 	next(err);
	// });
}


// build JSON string error message
function buildJsonStringError(msg, callback) {
	// build the error message & send it back
	var jsonErrorMessage = {data:{message:msg}};
	callback(JSON.stringify(jsonErrorMessage));
}