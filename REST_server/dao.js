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



//////// CLIENT : send request to Arduino

// variables
var	currentArduino;
var	arduinoIp = '192.168.2.3';
var	arduinoPort = 102;
var	arduinoAnswer = '';

// send JSON command to arduino
exports.send = function(idArduino, jsonString, callback) {
	// Get Arduino info
	//currentArduino = getArduinoProperties(idArduino);
	//arduinoIp = JSON.stringify(currentArduino.id);
	//arduinoPort = JSON.stringify(currentArduino.port);

	// Connect to Arduino server
	var client = net.connect({host:arduinoIp, port:arduinoPort},function() { //'connect' listener
		util.log('[DAO] Sending ' + jsonString + ' to Arduino @ ' + arduinoIp + ":" + arduinoPort);
		client.write(jsonString);
	})

	.on('data', function(chunk) {	// NOTE : arduino need to register itself befor beeing able to respond to query !
		arduinoAnswer+=chunk;
		client.end();
	})

	.on('end', function() {
		arduinoAnswer = arduinoAnswer.replace(/(\r\n|\n|\r)/gm,'');
		util.log('[DAO] Disconnected, received : ' + arduinoAnswer);
		callback(null, arduinoAnswer);
		arduinoAnswer = '';
	})

	.on('error', function(err) {
		util.log('[DAO] Error while connecting to Arduino server : ' + err.code);
		callback(err, null);
	});
}


//////// SERVER : listen to arduinos

// variables:
var	HOST = '192.168.2.1';		// Registration server IP
var	PORT = 100;					// Registration server PORT
var	arduinos = [];				// array containing connected arduinos properties, as JSON objects
var	data = '';					// string containing received chunks
var	isPresent;

//registration server
var server = net.createServer(function(sock) {

	// We have a connection - a socket object is assigned to the connection automatically
	util.log('[DAO] New Arduino : ' + sock.remoteAddress +':'+ sock.remotePort);
    
	sock.on('data', function(chunk) { //called every time data is received
    	data += chunk;  //add data chunk to data
	})
	
	.on('end', function() { //called when eol character '\0' is received
		//arduinos = addArduino(arduinos, data);
		arduinos.forEach(function(ard) {
			//check if arduino is already present
			if (ard.id == data.id) {
				isPresent = true;
				util.log('[DAO] Arduino already registered');
			}
		});
		// add current arduino if OK
		if (!isPresent) {
			arduinos.push(data);
			data = data.replace(/(\r\n|\n|\r)/gm,'');
			util.log('[DAO] Arduino saved : ' + data);
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
			util.log('[DAO] Network interface not available ! Please check network config, retrying in 10 sec...');
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

// add an arduino to the list
var addArduino = function(arduinos, arduino) {
	arduinos.forEach(function(ard) {
		var isPresent;
		//check if arduino is already present
		if (ard.id == arduino.id) {
			isPresent = true;
		}
		if (!isPresent) {
			arduinos.push(arduino);
			util.log('[DAO] Arduino saved : ' + data);
		}
		else {
			util.log('[DAO] Arduino already registered');
		}
	});
	return arduinos;
}

//return arduinos array, containing string from arduinos' registrations
exports.getArduinos = function getArduinos() {
	return arduinos;
};
