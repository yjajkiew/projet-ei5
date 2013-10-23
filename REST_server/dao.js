//************//
// Couche DAO //
//************//
// -> CLIENT : receive JSON frame from "metier.js"
// -> CLIENT : send JSON frame to Arduino
// -> CLIENT : get Arduino JSON answer
// -> SERVER : keep a track of connected Arduinos
// -> Transmit JSON answer to 'metier.js'


// Imports modules:
var util = require('util'),
	net = require('net'),



//////// CLIENT : send request to Arduino

// variables
	currentArduino,
	arduinoIp = '192.168.2.3',
	arduinoPort = 102,
	lastIndex = 0,
	arduinoAnswer;

// send JSON command to arduino
exports.send = function(idArduino, jsonString) {
	//return jsonObject;

	// Get Arduino info
	//currentArduino = getArduinoProperties(idArduino);
	//arduinoIp = JSON.stringify(currentArduino.id);
	//arduinoPort = JSON.stringify(currentArduino.port);

	// Connect to Arduino server
	var client = net.connect({host:arduinoIp, port:arduinoPort},function() { //'connect' listener
		//util.log('[DAO] Sending to Arduino @ ' + HOST + ":" + PORT);
		var jsonObject = "{\"id\":\"1\", \"ac\":\"cl\", \"pa\":{\"pin\":\"9\", \"dur\":\"100\", \"nb:10\"}}";
		util.log('[DAO] Sending ' + jsonObject + ' to Arduino @ ' + arduinoIp + ":" + arduinoPort);
		client.write(jsonObject);
	})

	.on('data', function(chunk) {
		//if (/^\s*$/.test(chunk)) util.log('line is blank');
		//while (arduinoAnswer.push(chunk)) {
		//	arduinoAnswer.push(chunk);
		//	util.log(chunk);
		//}
		while (chunk =! '') {
			arduinoAnswer += chunk;
			//util.log(chunk);
		}
		util.log(arduinoAnswer);
		client.end();
	})

	.on('end', function() {
		util.log("[DAO] Disconnected from arduino, received : " + data.toString());
		return arduinoAnswer;
	})

	.on('error', function(err) {
		util.log("[DAO] Error while connecting to Arduino server : " + err.code);
	});
}



//////// SERVER : listen to arduinos

// variables:
var	HOST = '192.168.2.1',		// Registration server IP
 	PORT = 100,					// Registration server PORT
	arduinos = [],				// array containing connected arduinos properties, as JSON objects
	isPresent,
	data = ''; 

//registration server
var server = net.createServer(function(sock) {

	// We have a connection - a socket object is assigned to the connection automatically
	util.log('[DAO] New Arduino : ' + sock.remoteAddress +':'+ sock.remotePort);
    
	sock.on('data', function(chunk) { //called every time data is received
        	data += chunk;  //add data chunk to data  
	})
	
	.on('end', function() { //called when eol character '\0' is received
		arduinos.forEach(function(ard) {
			//check if arduino is already present
			if (ard.id == data.id) {
				isPresent = true;
				util.log("[DAO] Arduino already registered");
			}
		});
		// add current arduino if OK
		if (!isPresent) {
			arduinos.push(data);
			util.log("[DAO] Arduino saved : " + JSON.stringify(arduinos[lastIndex]));
		}
	})
    
	// Add a 'close' event handler to this instance of socket
	.on('close', function(data) {
		util.log('[DAO] Connection closed');
		lastIndex++;
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
			util.log("[DAO] Network interface not available ! Please check network config, retrying in 10 sec...");
			setTimeout(function () {
			    server.listen(PORT, HOST);
	    	},10000);
			break;
		default:
			util.log("[DAO] Unhandled error in Arduino registration server : " + err);
			break;
	}
});

// launch server
server.listen(PORT, HOST, function() {
	util.log('[DAO] Server listening for new Arduinos on ' + HOST +':'+ PORT);
});



//////// METHODES

// find arduino by id (ip)
var getArduinoProperties = function(idArduino) {
	arduinos.forEach(function(arduino)
	{
		if (arduino.id == idArduino) {
			util.log(JSON.stringify(arduino));
			return arduino;
		}
	})
}

//return arduinos array, containing string from arduinos' registrations
exports.getArduinos = function getArduinos() {
	return arduinos;
};



