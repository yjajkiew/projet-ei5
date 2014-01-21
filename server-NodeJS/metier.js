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
	callback(jsonObject);
}

// LED blink
exports.blink = function(idCommand, idArduino, pin, lenght, number, callback) {
	// check the parameters
	checkBlink(idCommand, pin, lenght, number, function(check, jsonObject) {
		// if we have an error
		if(check == false) {
			// send error back to [WEB] & log
			callback(jsonObject);
			util.log(jsonObject.data.message);
		}
		// if parameters are OK
		else {
			// send jsonObject to [DAO] & log
			util.log('[METIER] Blink -> send to DAO : ' + JSON.stringify(jsonObject));
			sendToDao(idArduino, jsonObject, function(jsonArduino) {
				// need to check errors in arduino answer
				callback(jsonArduino);
			});
		}
	});
}

// READ command  {"id":"4","ac":"pr","pa":{"pin":"0","mod":"a"}}
exports.read = function(idCommand, idArduino, pin, mode, callback) {
	// check the parameters
	checkRead(idCommand, pin, mode, function(check, jsonObject) {
		// if we have an error
		if(check == false) {
			// send error back to [WEB] & log
			callback(jsonObject);
			util.log(jsonObject.data.message);
		}
		// if parameters are OK
		else {
			// log & send jsonObject to [DAO]
			util.log('[METIER] Read -> send to DAO : ' + JSON.stringify(jsonObject));
			sendToDao(idArduino, jsonObject, function(jsonArduino) {
				// need to check errors in arduino answer
				callback(jsonArduino);
			});
		}
	});
}

// WRITE command
exports.write = function(idCommand, idArduino, pin, mode, value, callback) {
	// check the parameters
	checkWrite(idCommand, pin, mode, value, function(check, jsonObject) {
		// if we have an error
		if(check == false) {
			// send error back to [WEB] & log
			callback(jsonObject);
			util.log(jsonObject.data.message);
		}
		// if parameters are OK
		else {
			// log & send jsonObject to [DAO]
			util.log('[METIER] Write -> send to DAO : ' + JSON.stringify(jsonObject));
			sendToDao(idArduino, jsonObject, function(jsonArduino) {
				// need to check errors in arduino answer
				callback(jsonArduino);
			});
		}
	});
}

// command (in POST)
exports.cmd = function(idArduino, jsonObjectList, callback) {
	// iterating trought list of comands
	for (var index in jsonObjectList) {
		// getting cmd case
		switch(jsonObjectList[index].ac) {
			case "pw" :
				util.log('[METIER] Command : pw');
				// check param number
				if (jsonObjectList[index].id && jsonObjectList[index].pa.pin && jsonObjectList[index].pa.mod && jsonObjectList[index].pa.val) {
					// check the parameters
					checkWrite(jsonObjectList[index].id, jsonObjectList[index].pa.pin, jsonObjectList[index].pa.mod, jsonObjectList[index].pa.val, function(check, jsonObject) {
						// if we have an error
						if(check == false) {
							// send error back to [WEB] & log
							callback(jsonObject);
							util.log(jsonObject.data.message);
						}
						// if parameters are OK
						else {
							// send jsonObject to [DAO] & log
							util.log('[METIER] POST Write -> send to DAO : ' + JSON.stringify(jsonObject));
							sendToDao(idArduino, jsonObject, function(jsonArduino) {
								// need to check errors in arduino answer
								callback(jsonArduino);
							});
						}
					});
				}
				else{
					// if some parameters are missing, send back error to [WEB]
					errorMessage = '[METIER] POST Write -> missing parameters, need: [id,pin,mode,val]';
					buildJsonError(errorMessage, function(jsonError) {
						callback(jsonError);
					});
					util.log(errorMessage);
				}
				break;

			case 'pr' :
				util.log('[METIER] Command : pr');
				if (jsonObjectList[index].id && jsonObjectList[index].pa.pin && jsonObjectList[index].pa.mod) {
					// check the parameters
					checkRead(jsonObjectList[index].id, jsonObjectList[index].pa.pin, jsonObjectList[index].pa.mod, function(check, jsonObject) {
						// if we have an error
						if(check == false) {
							// send error back to [WEB] & log
							callback(jsonObject);
							util.log(jsonObject.data.message);
						}
						// if parameters are OK
						else {
							// send jsonObject to [DAO] & log
							util.log('[METIER] POST Read -> send to DAO : ' + JSON.stringify(jsonObject));
							sendToDao(idArduino, jsonObject, function(jsonArduino) {
								// need to check errors in arduino answer
								callback(jsonArduino);
							});
						}
					});
				}
				else {
					// if some parameters are missing, send back error to [WEB]
					errorMessage = '[METIER] POST Read -> missing parameters, need: [id,pin,mode]';
					buildJsonError(errorMessage, function(jsonError) {
						callback(jsonError);
					});
					util.log(errorMessage);
				}
				break;

			case 'cl' :
				util.log('[METIER] command : cl');
				// chack param presence
				if (jsonObjectList[index].id && jsonObjectList[index].pa.pin && jsonObjectList[index].pa.dur && jsonObjectList[index].pa.nb) {
					// check the parameters
					checkBlink(jsonObjectList[index].id, jsonObjectList[index].pa.pin, jsonObjectList[index].pa.dur, jsonObjectList[index].pa.nb, function(check, jsonObject) {
						// if we have an error
						if(check == false) {
							// send error back to [WEB] & log
							callback(jsonObject);
							util.log(jsonObject.data.message);
						}
						// if parameters are OK
						else {
							// send jsonObject to [DAO] & log
							util.log('[METIER] POST Blink -> send to DAO : ' + JSON.stringify(jsonObject));
							sendToDao(idArduino, jsonObject, function(jsonArduino) {
								// need to check errors in arduino answer
								callback(jsonArduino);
							});
						}
					});
				}
				else {
					// if some parameters are missing, send back error to [WEB]
					errorMessage = '[METIER] POST Blink -> missing parameters, need: [id,pin,mode]';
					buildJsonError(errorMessage, function(jsonError) {
						callback(jsonError);
					});
					util.log(errorMessage);
				}
				break;

			default :
				// return error to "web"
				var errorMessage = '[METIER] POST : no action founded !';
				buildJsonError(errorMessage, function(jsonError) {
					callback(jsonError);
				});
				util.log(errorMessage);
				break;
		}
	}
}

// send callback (from GET)
function sendToDao(idArduino, jsonObject, callback) {
	dao.send(idArduino, JSON.stringify(jsonObject), function(data) {

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
				var errorMessage = err + '[METIER] Error while parsing JSON from arduino : ' + err.message;
				util.log(errorMessage);
				err = JSON.stringify({data:{message:errorMessage}});
				data = null;
			}
		}else{
			var errorMessage = '[METIER] No data received from arduino';
			buildJsonError(errorMessage, function(jsonError) {
				callback(jsonError);
			});
		}
        // send back err & data
        callback(err, data);
		
	});
}

// send callback (from POST)
function sendCmdToDao(idArduino, jsonObject, callback) {
    dao.send(idArduino, JSON.stringify(jsonObject), function(err, data) {

        // if data exist, build the answer
        if (data != null) {
            try {
                    data = JSON.parse(data);
                    if (data.er == '0') {
                    	// WARNING : we need to build a table here, wich is different from the other function 'sendToDao' !!
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

// Check BLINK parameters
function checkBlink(idCommand, pin, length, number, callback) {
	// check params type / value
	var errorMessage = '';
	if (idCommand<0 || idCommand>1000){
		errorMessage += 'wrong id: ' + idCommand +' ; ';
	}
	if(pin<0 || pin >13) {
		errorMessage += 'wrong pin: ' + pin +' ; ';
	}
	if(length<0 || length>1000) {
		errorMessage += 'wrong length: ' + length +' ; ';
	}
	if(number<1 || number>1000) {
		errorMessage += 'wrong nbrs: ' + number +' ; ';
	}
	// if some params aren't good, send false & JSON string error message
	if(errorMessage != '') {
		var errorMsg = '[METIER] Blink -> parameters issue: [' + errorMessage + ']';
		buildJsonError(errorMsg, function(jsonObject) {
			callback(false, jsonObject);
		});
	}
	// if we are good, seend true & JSON string for arduino
	else{
		var jsonObject = {id:idCommand,ac:"cl",pa:{pin:pin,dur:length,nb:number}};
		callback(true, jsonObject);
	}
}

// Build READ json object
function checkRead(idCommand, pin, mode, callback) {
	// check params type / value
	var errorMessage = '';
	if (idCommand<0 || idCommand>1000){	// check id
		errorMessage += 'wrong id: ' + idCommand +' ; ';
	}
	if(mode != 'a' && mode != 'b') {	// check mode
		errorMessage += 'wrong mode: ' + mode +' ; ';
	}
	if(mode=='a' && (pin<0 || pin>5)) {
		errorMessage += 'wrong pin [0-5](a): ' + pin +' ; ';
	}
	if(mode=="b" && (pin<0 || pin>13)) {
		errorMessage += 'wrong pin [0-13](b): ' + pin +' ; ';
	}
	// if some params aren't good, send false & JSON string error message
	if(errorMessage != '') {
		var errorMsg = '[METIER] Read -> parameters issue: [' + errorMessage + ']';
		buildJsonError(errorMsg, function(jsonObject) {
			callback(false, jsonObject);
		});
	}
	// if we are good, seend true & JSON string for arduino
	else{
		var jsonObject = {id:idCommand,ac:"pr",pa:{pin:pin,mod:mode}};
		callback(true, jsonObject);
	}
}

// Build WRITE json object
function checkWrite(idCommand, pin, mode, value, callback) {
	// check params type / value
	var errorMessage = '';
	if (idCommand<0 || idCommand>1000){	// check id
		errorMessage += 'wrong id: ' + idCommand +' ; ';
	}
	if(mode != 'a' && mode != 'b') {	// check mode
		errorMessage += 'wrong mode: ' + mode +' ; ';
	}
	if(mode=='a' && (pin<0 || pin>5)) {	//
		errorMessage += 'wrong pin [0-5](a): ' + pin +' ; ';
	}
	if(mode=='b' && (pin<0 || pin>13)) {	//
		errorMessage += 'wrong pin [0-13](b): ' + pin +' ; ';
	}
	if(mode=='a' && (value<0 || value>255)){
		errorMessage += 'wrong value [0-255](a): ' + value +' ; ';
	}
	if(mode=='b' && (value<0 || value>1)){
		errorMessage += 'wrong value [0/1](b): ' + value +' ; ';
	}
	// if some params aren't good, send false & JSON string error message
	if(errorMessage != '') {
		var errorMsg = '[METIER] Write -> parameters issue: [' + errorMessage + ']';
		buildJsonError(errorMsg, function(jsonObject) {
			callback(false, jsonObject);
		});
	}
	// if we are good, seend true & JSON string for arduino
	else{
		var jsonObject = {id:idCommand,ac:"pw",pa:{pin:pin,mod:mode,val:value}};
		callback(true, jsonObject);
	}
}

// build JSON error message
function buildJsonError(msg, callback) {
	// build the error message & send it back
	var jsonErrorMessage = {data:{message:msg}};
	callback(jsonErrorMessage);
}