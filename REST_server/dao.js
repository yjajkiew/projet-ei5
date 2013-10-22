//************//
// Couche DAO //
//************//
// -> CLIENT : receive JSON frame from "metier.js"
// -> CLIENT : send JSON frame to Arduino
// -> CLIENT : get Arduino JSON answer
// -> SERVER : keep a list of connected Arduinos
// -> Transmit JSON answer to 'metier.js'

// Imports modules:
var util = require('util');
var net = require('net');

//////// CLIENT : send request to Arduino
exports.send = function(ipArduino, jsonObject) {

	return jsonObject;
}

//////// SERVER : receive arduino authntication
var HOST = '192.168.2.1';
var PORT = 100;
var arduinos = [];

//registration server
var server = net.createServer(function(sock) {

	var data = ''; 
	
	// We have a connection - a socket object is assigned to the connection automatically
	console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    
	sock.on('data', function(chunk) { //called every time data is received
        	data += chunk;  //add data chunk to data  
	})
	
	.on('end', function() { //called when end of line character is received
		//console.log('DATA ' + sock.remoteAddress + ': ' + data);
		arduinos.push(data);
	})
    
	// Add a 'close' event handler to this instance of socket
	.on('close', function(data) {
		console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
	});
});

// launch server
server.listen(PORT, HOST, function() {
	util.log('Server listening on ' + HOST +':'+ PORT);
});



// handle server error
server.on('error', function (err) {
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


exports.getArduinos = function getArduinos() { //return arduinos array, containing string from arduinos' registrations
	return arduinos;
};
