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
var util = require('util');
// Import other layers
var	dao = require('./dao');


// get arduino list
exports.arduinos = function() {
	var arduinos = dao.getArduinos();
	var arduinosTable = [];
	
	arduinos.forEach(function(ard) {
		//create json object using the expected format
		var jsonArduino = {id:ard.id,port:ard.port,description:ard.desc,ip:ard.ip,mac:ard.mac}; 
		arduinosTable.push(JSON.stringify(jsonArduino));	// stringify ??? -> test with client
	});
	return arduinos;
}

// LED blink
exports.blink = function(idCommand, idArduino, pin, lenght, number, callback) {
	// build json object
	var jsonObject = {id:idCommand,ac:"cl",pa:{pin:pin,dur:lenght,nb:number}};
	util.log('[METIER] Blink : ' + JSON.stringify(jsonObject));
	// send to "dao" and return result to "web"
	dao.send(idArduino, JSON.stringify(jsonObject), function(err, data) {
		callback(err, data);
	});
}

// READ command  {"id":"4","ac":"pr","pa":{"pin":"0","mod":"a"}}
exports.read = function(idCommand, idArduino, pin, mode, callback) {
	// build json object
	var jsonObject = {id:idCommand,ac:"pr",pa:{pin:pin,mod:mode}};
	util.log('[METIER] Read : ' + JSON.stringify(jsonObject));
	// send to "dao" and return result to "web"
	dao.send(idArduino, JSON.stringify(jsonObject), function(err, data) {
		callback(err, data);
	});
}

// WRITE command
exports.write = function(idCommand, idArduino, pin, mode, value, callback) {
	// build json object
	var jsonObject = {id:idCommand,ac:"pw",pa:{pin:pin,mod:mode,val:value}};
	util.log('[METIER] Write : ' + JSON.stringify(jsonObject));
	// send to "dao" and return result to "web"
	dao.send(idArduino, JSON.stringify(jsonObject), function(err, data) {
		callback(err, data);
	});
}

// command (in POST)
exports.cmd = function(idArduino, jsonObjectList, callback) {
	// iterating trought list of comands
	for (var index in jsonObjectList) {
		util.log('[METIER] Command : '	 + jsonObjectList[index]);
		switch(jsonObjectList[index].ac) {
			case "pw" :
				util.log('[METIER] post : pw');
				// build JSON object
				var jsonObject = {id:jsonObjectList[index].id,ac:"pw",pa:jsonObjectList[index].pa};
				// send to DAO
				dao.send(idArduino, JSON.stringify(jsonObject), function(err, data) {
					callback(err, data);
				});
				break;
			case 'pr' :
				util.log('[METIER] post : pr');
				// build JSON object
				var jsonObject = {id:jsonObjectList[index].id,ac:"pr",pa:jsonObjectList[index].pa};
				// send to DAO
				dao.send(idArduino, JSON.stringify(jsonObject), function(err, data) {
					callback(err, data);
				});
				break;
			case 'cl' :
				util.log('[METIER] post : cl');
				// build JSON object
				var jsonObject = {id:jsonObjectList[index].id,ac:"cl",pa:jsonObjectList[index].pa};
				// send to DAO
				dao.send(idArduino, JSON.stringify(jsonObject), function(err, data) {
					callback(err, data);
				});
				break
			default :
				util.log('[METIER] post : no action founded !')
		}
		// send to "dao" and return result to "web"
		// dao.send(idArduino, jsonString, function(err, data) {
		// 	callback(err, data);
		// });
	}
}