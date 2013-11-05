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

// Client variables
var	arduino;
var	arduinoIp = '192.168.2.3';
var	arduinoPort = 102;
var	arduinoAnswer = '';

// Server variables:
var	HOST = '192.168.2.1';		// Registration server IP
var	PORT = 100;					// Registration server PORT
var	arduinos = new Array();		// array containing connected arduinos properties, as JSON objects
var	data = '';					// string containing received chunks


// send JSON command to arduino
exports.send = function(idArduino, jsonString, callback) {
	
	// Get Arduino info
	// getObjectIndex(arduinos, idArduino, function(err, data) {
	// 	arduino = data;
	// });
	util.log('Arduinos [0]=' + arduinos[0]);
	arduinos.forEach(function(ard) {
		util.log('ard : ' + ard);
		util.log('ard.id : ' + JSON.stringify(ard.id));
		util.log('idArduino : ' + idArduino);
		if (ard.id === idArduino) {
			util.log('founded');
			arduino = ard;
		}
	});
	//util.log('[DAO] Current arduino : ' + arduino.id + ':' + arduino.port);
	//currentArduino = getArduinoProperties(idArduino);
	//arduinoIp = JSON.stringify(currentArduino.id);
	//arduinoPort = JSON.stringify(currentArduino.port);

	// Connect to Arduino server
	var client = net.connect({host:arduinoIp, port:arduinoPort},function() { //'connect' listener
		util.log('[DAO] Sending : ' + jsonString + ' to Arduino @ ' + arduinoIp + ":" + arduinoPort);
		client.write(jsonString);
	})

	.on('data', function(chunk) {	// NOTE : arduino need to register itself befor beeing able to respond to query !
		arduinoAnswer+=chunk;
		client.end();
	})

	.on('end', function() {
		arduinoAnswer = arduinoAnswer.replace(/(\r\n|\n|\r)/gm,'');	// get ride of EOL chars
		util.log('[DAO] Disconnected, received : ' + arduinoAnswer);
		callback(null, arduinoAnswer);
		arduinoAnswer = '';
	})

	.on('error', function(err) {
		util.log('[DAO] Error while connecting to Arduino server : ' + err.code);
		callback(err.code, null);
	});
}



//////// SERVER : listen to arduinos

//registration server
var server = net.createServer(function(sock) {

	// We have a connection - a socket object is assigned to the connection automatically
	util.log('[DAO] New Arduino : ' + sock.remoteAddress +':'+ sock.remotePort);
    
	sock.on('data', function(chunk) { //called every time data is received
    	data += chunk;  //add data chunk to data
	})
	
	.on('end', function() { //called when eol character '\0' is received
		data = data.replace(/(\r\n|\n|\r)/gm,'');	// get ride of EOL chars
		if(objectInTable(arduinos, data)) {
			util.log('[DAO] Arduino already registered');
		}
		else {
			arduinos.push(data);
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

// check if connexions to arduino are still alive
// setInterval(function (err) {
// 	arduinos.forEach(function(arduino) {
// 		var client = net.connect({host:arduino.arduinoIp, port:arduino.arduinoPort},function() {
// 			util.log('[DAO] Checking connection');
// 			client.write('some stuff');
// 		})

// 		.on('error', function(err) {
// 			util.log('[DAO] Arduino not responding, removing : ' + JSON.stringify(arduino));
// 			var index = arduinos.indexOf(arduino);	// getting arduino index in table
// 			arduinos.splice(index,1);	// removing at the index position
// 		});
// 	})
// },10000);



//////// METHODES

// check if an object is in an array
var objectInTable = function(table, object) {
	var isPresent = false;
	table.forEach(function(item) {
		if (item === object) {
			isPresent = true;
		}
	})
	if (isPresent) {
		return true;
	}
	else {
		return false;
	}
};

// get arudino data from table & id
var getObjectIndex = function(table, id, callback) {
	table.forEach(function(object) {
		util.log('object');
		object.forEach(function(property) {
			util.log('property');
			if (property === id) {
				util.log('founded');
				callback(null, 1);
			}
		})
	})
};

//return arduinos array, containing string from arduinos' registrations
exports.getArduinos = function() {
	return arduinos;
};
