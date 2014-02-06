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
// Import other layer
var arduinosCollection = require('./Collection');
// var heartbeat = require('./heartbeat');



////////////
// CLIENT //
//////////// send request to Arduino

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
	if (arduino == undefined) {
		// arduino not in the collection, send back error message
		var errorMsg = '[DAO] Arduino not connected / not in the collection => try to re-connect / reset)';
		util.log(errorMsg);
		buildJsonError(errorMsg, function(jsonError) {
			callback(jsonError);
		});
	}
	else {
		// Connect to Arduino server
		var client = net.connect({host:arduino.id, port:arduino.port},function() { //'connect' listener
			util.log('[DAO] Sending : ' + jsonString + ' to Arduino @ ' + arduino.id + ":" + arduino.port);
			client.write(jsonString);
		})

		// settings
		

		// Receive data from Arduino
		.on('data', function(chunk) {	// NOTE : arduino need to register itself befor beeing able to respond to query !
			arduinoAnswer+=chunk;
			client.end();
		})

		// 'End' event, arduino answer
		.on('end', function() {
			// clean the string received & send it back to [METIER] & log
			arduinoAnswer = arduinoAnswer.replace(/(\r\n|\n|\r)/gm,'');	// get ride of EOL chars '\r\n'
			util.log('[DAO] Disconnected, received : ' + arduinoAnswer);
			callback(arduinoAnswer);
			// reset the answer for next call
			arduinoAnswer = '';
		})

		// error handling
		.on('error', function(err) {
			// send back error message & log
			var errorMsg = '[DAO] Error while sending json to Arduino : ' + err.code;
			buildJsonError(errorMsg, function(jsonError) {
				callback(jsonError);
			});
			util.log(errorMsg);

			// delete arduino
			if (arduinos.remove(arduino.id) === undefined) {
				util.log('[DAO] arduino : ' + arduino.id +  ' already removed from collection ');
			}
			else {
				util.log('[DAO] Arduino not responding, removing from collection: ' + arduino.id);
			}
		});
	}
}



////////////
// SERVER //
//////////// arduinos registration

var server = net.createServer(function(sock) {
	// We have a connection - a socket object is assigned to the connection automatically
	sock.on('data', function(chunk) { //called every time data is received
    	data += chunk;  //add data chunk to data
	})
	
	.on('end', function() { //called when eol character '\0' is received
		data = data.replace(/(\r\n|\n|\r)/gm,'');	// get ride of EOL chars '\r\n'
		try {
			data = JSON.parse(data);	// parse JSON object
			if(arduinos.add(data.id, data) === undefined) {
				util.log('[DAO] Arduino already registered');
			}
			else {
				util.log('[DAO] Arduino saved : ' + JSON.stringify(data));
			}
		}catch(err) {
			util.log('[DAO] Error while parsing arduino JSON registration : ' + err.message)
		}
		data = '';
	})
    
	// Add a 'close' event handler to this instance of socket
	.on('close', function(data) {
		//	util.log('[DAO] Connection closed');
	});
});

// handle server error
server.on('error', function(err) {
	switch (err.code) {
		case 'EADDRINUSE' :
			util.log('[DAO] Network address already in use, retrying in 10 sec...');
		    setTimeout(function () {
			    server.close();
			    server.listen(PORT, HOST);
	    	},10000);
			break;

		case 'EADDRNOTAVAIL' :
			util.log('[DAO] Network unreachable -> Check ethernet cable, retrying in 10 sec...');
			setTimeout(function () {
			    server.listen(PORT, HOST);
	    	},10000);
			break;
		default:
			util.log('[DAO] Unhandled error in Arduino registration server : ' + err.code);
			break;
	}
});

// launch server
server.listen(PORT, HOST, function() {
	util.log('[DAO] Server listening for new Arduinos on ' + HOST +':'+ PORT);
});



//////////////
// METHODES //
//////////////

// build JSON error message
function buildJsonError(msg, callback) {
	// build the error message & send it back
	var jsonErrorMessage = {data:{message:msg}};
	callback(jsonErrorMessage);
}

// return arduinos array, containing string from arduinos' registrations
exports.getArduinos = function(callback) {
	callback(arduinos);
};