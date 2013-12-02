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
exports.arduinos = function(callback) {
	var arduinosTable = [];
	var jsonObject;

	// get arduino from [DAO]
	dao.getArduinos(function(arduinosCollection) {
		// build the table
		arduinosCollection.forEach(function(ard) {
			//create json object using the expected format
			var jsonArduino = {id:ard.id,port:ard.port,description:ard.desc,ip:ard.id,mac:ard.mac}; 
			arduinosTable.push(jsonArduino);
		});
	});
	// bulid JSON object
	jsonObject = {data:arduinosTable};
	// send it back
	callback(JSON.stringify(jsonObject));
}

// LED blink
exports.blink = function(idCommand, idArduino, pin, lenght, number, callback) {
	// build json object
	var jsonObject = {id:idCommand,ac:"cl",pa:{pin:pin,dur:lenght,nb:number}};
	util.log('[METIER] Blink : ' + JSON.stringify(jsonObject));

	// send to "dao" and return result to "web"
	sendToDao(idArduino, jsonObject, function(err, data) {
		callback(err, data);
	});
}

// READ command  {"id":"4","ac":"pr","pa":{"pin":"0","mod":"a"}}
exports.read = function(idCommand, idArduino, pin, mode, callback) {
	// build json object
	var jsonObject = {id:idCommand,ac:"pr",pa:{pin:pin,mod:mode}};
	util.log('[METIER] Read : ' + JSON.stringify(jsonObject));

	// send to "dao" and return result to "web"
	sendToDao(idArduino, jsonObject, function(err, data) {
		callback(err, data);
	});
}

// WRITE command
exports.write = function(idCommand, idArduino, pin, mode, value, callback) {
	// build json object
	var jsonObject = {id:idCommand,ac:"pw",pa:{pin:pin,mod:mode,val:value}};
	util.log('[METIER] Write : ' + JSON.stringify(jsonObject));
	
	// send to "dao" and return result to "web"
	sendToDao(idArduino, jsonObject, function(err, data) {
		callback(err, data);
	});
}

// command (in POST)
exports.cmd = function(idArduino, jsonObjectList, callback) {
	// iterating trought list of comands
	for (var index in jsonObjectList) {
		switch(jsonObjectList[index].ac) {
			case "pw" :
				util.log('[METIER] command : pw');
				// build JSON object
				if (jsonObjectList[index].id && jsonObjectList[index].pa.pin && jsonObjectList[index].pa.mod && jsonObjectList[index].pa.val) {
					var jsonObject = {id:jsonObjectList[index].id,ac:"pw",pa:jsonObjectList[index].pa};
					
					// send to "dao" and return result to "web"
					sendCmdToDao(idArduino, jsonObject, function(err, data) {
						callback(err, data);
					});
				}
				break;

			case 'pr' :
				util.log('[METIER] command : pr');
				if (jsonObjectList[index].id && jsonObjectList[index].pa.pin && jsonObjectList[index].pa.mod) {
					// build JSON object
					var jsonObject = {id:jsonObjectList[index].id,ac:"pr",pa:jsonObjectList[index].pa};
					
					// send to "dao" and return result to "web"
					sendCmdToDao(idArduino, jsonObject, function(err, data) {
						callback(err, data);
					});
				}
				break;

			case 'cl' :
				util.log('[METIER] command : cl');
				if (jsonObjectList[index].id && jsonObjectList[index].pa.pin && jsonObjectList[index].pa.dur && jsonObjectList[index].pa.nb) {
					// build JSON object
					var jsonObject = {id:jsonObjectList[index].id,ac:"cl",pa:jsonObjectList[index].pa};
					
					// send to "dao" and return result to "web"
					sendCmdToDao(idArduino, jsonObject, 0, function(err, data) {
						callback(err, data);
					});
				}
				break

			default :
				util.log('[METIER] post : no action founded !')
		}
	}
}


// send callback (communication with DAO : single function)
function sendToDao(idArduino, jsonObject, callback) {
	dao.send(idArduino, JSON.stringify(jsonObject), function(err, data) {

		// if data exist, build the answer
		if (data != null) {
			try {
				data = JSON.parse(data);
				if (data.er == '0') {
					data = JSON.stringify({data:{id:data.id, erreur:data.er, etat:data.et, json:null}});
				}
				else {
					data = JSON.stringify({data:{id:data.id, erreur:data.er, etat:data.et, json:data}});
				}
			} catch(err) {
				var errorMessage = err + '[METIER] Error while parsing data from arduino : ' + err.message;
				util.log(errorMessage);
				err = JSON.stringify({data:{message:errorMessage}});
				data = null;
			}
		}

		// send back err & data
		callback(err, data);
	});
}

function sendCmdToDao(idArduino, jsonObject, callback) {
        dao.send(idArduino, JSON.stringify(jsonObject), function(err, data) {

        // if data exist, build the answer
        if (data != null) {
                try {
                        data = JSON.parse(data);
                        if (data.er == '0') {
                                data = JSON.stringify({data:[{id:data.id, erreur:data.er, etat:data.et, json:null}]});
                        }
                        else {
                                data = JSON.stringify({data:[{id:data.id, erreur:data.er, etat:data.et, json:data}]});
                        }
                } catch(err) {
                        var errorMessage = err + '[METIER] Error while parsing data from arduino : ' + err.message;
                        util.log(errorMessage);
                        err = JSON.stringify({data:{message:errorMessage}});
                        data = null;
                }
        }

        // send back err & data
        callback(err, data);
        });
}