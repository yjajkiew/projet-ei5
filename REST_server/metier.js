//***************//
// Couche METIER //
//***************//
// -> construct JSON frame from URL
// 		-> check parameters (types / values)
//		-> return error frame to "web.js" if wrong
//		-> go on if good
// -> send query JSON frame to 'dao.js' (to Arduino)
// -> get answer JSON frame from 'dao.js' (from Arduino)
// -> transmit JSON answer to 'web.js'


// Imports modules
var util = require('util'),
// Import other layers
	dao = require('./dao');


//////// PUBLIC functions
// get arduino list
exports.arduinos = function() {
	var arduinos = dao.getArduinos();
	var arduinosTable = [];
	
	arduinos.forEach(function(ard) {
		//create json object using the expected format
		var currentArduino = {id:ard.id, port:ard.port, description:ard.desc, ip:ard.ip, mac:ard.mac }; 
		arduinosTable.push(currentArduino);	// do we need to stringify ???
	});
	return arduinos;
}

// LED blink
exports.blink = function(idCommand, idArduino, pin, lenght, number) {
	// build json object
	var jsonObject = {id:idCommand, ac:'cl', pa:{pin:pin, dur:lenght, nb:number}};
	util.log("METIER : " + JSON.stringify(jsonObject));
	// send to "dao" and return result to "web"
	return dao.send(idArduino, JSON.stringify(jsonObject));
}

// READ command  {"id":"4","ac":"pr","pa":{"pin":"0","mod":"a"}}
exports.read = function(idCommand, idArduino, pin, mode) {
	// build json object
	var jsonObject = {id:idCommand, ac:"pr", pa:{pin:pin, mod:mode}};
	util.log("METIER : " + JSON.stringify(jsonObject));
	// send to "dao" and return result to "web"
	return (dao.send(idArduino, JSON.stringify(jsonObject)));
}

// WRITE command
exports.write = function(idCommand, idArduino, pin, mode, value) {
	// build json object
	var jsonObject = {id:idCommand, ac:"pw", pa:{pin:pin, mod:mode, val:value}};
	util.log("METIER : " + JSON.stringify(jsonObject));
	// send to "dao" and return result to "web"
	return dao.send(idArduino, JSON.stringify(jsonObject));
}

// command (in POST)
exports.cmd = function(idArduino, parametres) {
	// json object already ready
	// send to "dao" and return result to "web"
	return dao.send(idArduino, JSON.stringify(parametres));
}


//////// PRIVATE functions







