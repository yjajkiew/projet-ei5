//************//
// Couche DAO //
//************//
// -> CLIENT : receive JSON frame from "metier.js"
// -> CLIENT : send JSON frame to Arduino
// -> CLIENT : get Arduino JSON answer
// -> SERVER : keep a track of connected Arduinos
// -> Transmit JSON answer to 'metier.js'


// Imports modules:
var util = require('util');
var	net = require('net');
var arduinosCollection = require('./Collection');



//////// CLIENT : send request to Arduino

// Client variables
var	arduino;
var	arduinoAnswer = '';

// Server variables:
var	HOST = '192.168.2.1';		// Registration server IP
var	PORT = 100;					// Registration server PORT
var	data = '';					// string containing received chunks
var	arduinos = new arduinosCollection.collection();		// collection containing connected arduinos properties, as JSON objects


// send JSON command to arduino
exports.send = function(idArduino, jsonString, callback) {

	// Get Arduino info
	arduino = arduinos.item(idArduino);

	// check if arduino exist
	if (arduino != undefined) {
		// Connect to Arduino server
		var client = net.connect({host:arduino.ip, port:arduino.port},function() { //'connect' listener
			util.log('[DAO] Sending : ' + jsonString + ' to Arduino @ ' + arduino.id + ":" + arduino.port);
			client.write(jsonString);
		})

		// Receive data from Arduino
		.on('data', function(chunk) {	// NOTE : arduino need to register itself befor beeing able to respond to query !
			arduinoAnswer+=chunk;
			client.end();
		})

		// 'End' event, save data
		.on('end', function() {
			arduinoAnswer = arduinoAnswer.replace(/(\r\n|\n|\r)/gm,'');	// get ride of EOL chars
			util.log('[DAO] Disconnected, received : ' + arduinoAnswer);
			callback(null, arduinoAnswer);
			arduinoAnswer = '';
		})

		// 
		.on('error', function(err) {
			util.log('[DAO] Error while connecting to Arduino server : ' + err.code);
			callback(err.code, {data:{"id":"1","er":"3000","et":{}}});
		});
	}
	else {
		var jsonErrorObject = {data:{"id":"1","er":"4000","et":{}}};
		callback(NULL, jsonErrorObject);
	}
}



//////// SERVER : registration of the arduinos

//registration server
var server = net.createServer(function(sock) {

	// We have a connection - a socket object is assigned to the connection automatically
	util.log('[DAO] New Arduino : ' + sock.remoteAddress +':'+ sock.remotePort);
    
	sock.on('data', function(chunk) { //called every time data is received
    	data += chunk;  //add data chunk to data
	})
	
	.on('end', function() { //called when eol character '\0' is received
		data = data.replace(/(\r\n|\n|\r)/gm,'');	// get ride of EOL chars
		data = JSON.parse(data);					// parse JSON object
		
		if(arduinos.add(data.id, data) === undefined) {
			util.log('[DAO] Arduino already registered');
		}
		else {
			util.log('[DAO] Arduino saved : ' + JSON.stringify(data));
		}
		data = '';
	})
    
	// Add a 'close' event handler to this instance of socket
	.on('close', function(data) {
		util.log('[DAO] Connection closed');
	});
});

// handle server error
server.on('error', function(err) {	// NOTE : put in external handler for both client AND server !!!!
	switch (err.code) {
		case 'EADDRINUSE' :
			util.log('[DAO] Network address already in use, retrying in 10 sec...');
		    setTimeout(function () {
			    server.close();
			    server.listen(PORT, HOST);
	    	},10000);
			break;

		case 'EADDRNOTAVAIL' :
			util.log('[DAO] Network interface not available ! Check network config, retrying in 10 sec...');
			setTimeout(function () {
			    server.listen(PORT, HOST);
	    	},10000);
			break;
		default:
			util.log('[DAO] Unhandled error in Arduino registration server : ' + err);
			break;
	}
});

// launch server
server.listen(PORT, HOST, function() {
	util.log('[DAO] Server listening for new Arduinos on ' + HOST +':'+ PORT);
});



//////// METHODES

// return arduinos array, containing string from arduinos' registrations
exports.getArduinos = function() {
	return arduinos;
};

// check if connexions to arduino are still alive
// setInterval(function (err) {
// 	if (arduinos.count > 0) {
// 		arduinos.forEach(function(arduino) {
// 			var answer = '';
// 			var client = net.connect({host:arduino.id, port:arduino.port},function() {
// 				util.log('[DAO] Checking arduino : ' + arduino.id + ':' + arduino.port);
// 				client.write('someStupidStuff');
// 			})

// 			.on('data', function(chunk) {
// 				answer+=chunk;
// 				client.end();
// 			})

// 			.on('end', function() {
// 				answer = answer.replace(/(\r\n|\n|\r)/gm,'');
// 				util.log('[DAO] Ok, answer : ' + answer);
// 				answer = '';
// 			})

// 			.on('error', function(err) {
// 				util.log('[DAO] Not responding, removing : ' + arduino.id);
// 				arduinos.remove(arduino.id);
// 			});
// 		})
// 	}
// 	else {
// 		util.log('[DAO] No arduino connected');
// 	}
// },10000);
