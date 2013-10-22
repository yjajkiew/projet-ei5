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
net.createServer(function(sock) {
	var data = ''; 
	
	// We have a connection - a socket object is assigned to the connection automatically
	console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    
	sock.on('data', function(chunk) { //called every time data is received
        	data += chunk;  //add data chunk to data  
	});
	
	sock.on('end', function() { //called when end of line character is received
		//console.log('DATA ' + sock.remoteAddress + ': ' + data);
		arduinos.push(data);
	});
    
	// Add a 'close' event handler to this instance of socket
	sock.on('close', function(data) {
		console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
	});
    
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);

function getArduinos() { //return arduinos array, containing string from arduinos' registrations
	return arduinos;
}

exports.getArduinos = getArduinos;
