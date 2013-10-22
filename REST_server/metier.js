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

// Commande format : {"id":"1","ac":"cl","pa":{"pin":"8","dur":"100","nb":"10"}}
//////// PUBLIC functions
// get arduino list
exports.arduinos = function() {
	util.log("METIER : arduinos");
}

// LED blink
exports.blink = function(idCommand, idArduino, pin, lenght, number) {
	// build json object
	var jsonObject = { id:idCommand, ac:"cl", pa:{pin:pin, dur:lenght, nb:number}};
	// send to "dao" and return result to "web"
	return dao.send(idArduino, JSON.stringify(jsonObject));
}

// READ command  {"id":"4","ac":"pr","pa":{"pin":"0","mod":"a"}}
exports.read = function(idCommand, idArduino, pin, mode) {
	// build json object
	var jsonObject = { id:idCommand, ac:"pr", pa:{pin:pin, dur:lenght, nb:number}};
	// send to "dao" and return result to "web"
	return dao.send(idArduino, JSON.stringify(jsonObject));
}

// WRITE command
exports.write = function(idCommand, idArduino, pin, mode, value) {
	// build json object
	var jsonObject = { id:idCommand, ac:"pw", pa:{pin:pin, mod:mode, val:value}};
	// send to "dao" and return result to "web"
	return dao.send(idArduino, JSON.stringify(jsonObject));
}

// command (in POST)
exports.cmd = function(idArduino, parametres) {
	// build json object
	var jsonObject = { id:idCommand, ac:"cl", pa:{pin:pin, dur:lenght, nb:number}};
	// send to "dao" and return result to "web"
	return dao.send(idArduino, JSON.stringify(jsonObject));
}


//////// PRIVATE functions







