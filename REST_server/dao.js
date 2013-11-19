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
		var client = net.connect({host:arduino.id, port:arduino.port},function() { //'connect' listener
			// set the socket timeout
			// setTimeout(5000, function() {
			// 	client.end();
			// });
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
			arduinoAnswer = arduinoAnswer.replace(/(\r\n|\n|\r)/gm,'');	// get ride of EOL chars '\r\n'
			callback(null, arduinoAnswer);
			util.log('[DAO] Disconnected, received : ' + arduinoAnswer);
			arduinoAnswer = '';
		})

		// error handling
		.on('error', function(err) {
			// send back error message & deleting arduino
			var errorMessage = 'Error while sending json to Arduino : ' + err.code;
			callback(errorMessage, null);

			// logging
			util.log(errorMessage);
			if (arduinos.remove(arduino.id) === undefined) {
				util.log('[DAO] arduino : ' + arduino.id +  ' already removed from collection ');
			}
			else {
				util.log('[DAO] Arduino not responding, removing from collection: ' + arduino.id);
			}
		});
	}
	else {
		// arduino not in the collection, send back error message
		var errorMessage = 'Arduino not connected / not in the collection, try to reset)';
		callback(errorMessage, null);
	}
}



//////// SERVER : arduinos registration

var server = net.createServer(function(sock) {

	// We have a connection - a socket object is assigned to the connection automatically
	util.log('[DAO] New Arduino : ' + sock.remoteAddress +':'+ sock.remotePort);
    
	sock.on('data', function(chunk) { //called every time data is received
    	data += chunk;  //add data chunk to data
	})
	
	.on('end', function() { //called when eol character '\0' is received
		data = data.replace(/(\r\n|\n|\r)/gm,'');	// get ride of EOL chars '\r\n'
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
			util.log('[DAO] Arduino not connected ! Check network config, retrying in 10 sec...');
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
exports.getArduinos = function(callback) {
	// var errorMessage = null;
	// // if collection is empty
	// if (!arduinosCollection.count > 0) {
	// 	errorMessage = 'no arduinos in the collection';
	// }
	// // return to [metier]

	// return the colleciton to [METIER]
	callback(arduinos);
};
