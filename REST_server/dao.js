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
// variables:
	HOST = '192.168.2.1',		// Registration server IP
 	PORT = 100,					// Registration server PORT
	arduinos = [],				// array containing connected arduinos properties, as JSON objects
	currentArduino,
	arduinoIp = '192.168.2.3',
	arduinoPort = 102,
	lastIndex = 0;



//////// CLIENT : send request to Arduino
exports.send = function(idArduino, jsonString) {
	//return jsonObject;

	// Get Arduino info
	//currentArduino = getArduinoProperties(idArduino);
	//arduinoIp = JSON.stringify(currentArduino.id);
	//arduinoPort = JSON.stringify(currentArduino.port);

	// Connect to Arduino server
	var client = net.connect({host:arduinoIp, port:arduinoPort},function() { //'connect' listener
		util.log('sending to Arduino @ ' + HOST + ":" + PORT);
		client.write(jsonString);
	})

	.on('data', function(data) {
		util.log("received : " + data.toString());
		client.end();
		return data;
	})

	.on('end', function() {
		util.log('Disconnected from Arduino');
	})

	.on('error', function(err) {
		util.log("Error while connecting to Arduino server : " + err.code);
	});
}



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



//////// SERVER : listen to arduinos
//return arduinos array, containing string from arduinos' registrations
exports.getArduinos = function getArduinos() {
	return arduinos;
};

//registration server
var server = net.createServer(function(sock) {

	var data = ''; 
	
	// We have a connection - a socket object is assigned to the connection automatically
	util.log('New Arduino : ' + sock.remoteAddress +':'+ sock.remotePort);
    
	sock.on('data', function(chunk) { //called every time data is received
        	data += chunk;  //add data chunk to data  
	})
	
	.on('end', function() { //called when eol character '\0' is received
		arduinos.push(JSON.parse(data));
	})
    
	// Add a 'close' event handler to this instance of socket
	.on('close', function(data) {
		util.log('Arduino info : ' + JSON.stringify(arduinos[lastIndex]));
		lastIndex++;
	});
});

// handle server error
server.on('error', function(err) {
	switch (err.code) {
		case 'EADDRINUSE' :
			util.log('Network address already in use, retrying in 10 sec...');
		    setTimeout(function () {
			    server.close();
			    server.listen(PORT, HOST);
	    	},10000);
			break;

		case 'EADDRNOTAVAIL' :
			util.log("Network interface not available ! Please check network config, retrying in 10 sec...");
			setTimeout(function () {
			    server.listen(PORT, HOST);
	    	},10000);
			break;
		default:
			util.log("Unhandled error : " + err);
			break;
	}
});

// launch server
server.listen(PORT, HOST, function() {
	util.log('Server listening for new Arduinos on ' + HOST +':'+ PORT);
});



