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
var async = require('async');
// Import other layers
var	dao = require('./dao');
// Import Arduino error message (JSON object)
var arduinoErrors = require('./ArduinoErrors.js');


/////////////
// HANDLER //
/////////////

// get arduino list
var arduinos = function(callback) {
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
	// build JSON object
	jsonObject = {data:arduinosTable};
	// send it back & log
	callback(jsonObject);
	var arduinoNbr = arduinosTable.length;
	var plural = arduinoNbr >1 ? 's' : '';
	util.log('[METIER] Sending info for ' + arduinoNbr + ' Arduino' + plural);
}

// LED blink
var blink = function(idCommand, idArduino, pin, length, number, callback) {
	// check the parameters
	checkBlink(idCommand, pin, length, number, function(check, jsonObject) {
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
var read = function(idCommand, idArduino, pin, mode, callback) {
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
var write = function(idCommand, idArduino, pin, mode, value, callback) {
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

// POST command
function asyncPostCmd(idArduino, jsonObjectList, callback) {
	// re-build the array (check if any error in the array)
	var jsonArray = [];
	try {
		jsonObjectList.forEach(function(item) {
			jsonArray.push(item);
		});
	} catch(err) {
		errorMessage = '[METIER] POST -> not an array of JSON, should be: [json1, json2, ..., jsonN]';
		util.log(errorMessage);
		buildJsonError(errorMessage, function(jsonError) {
			callback(jsonError);
		});
	}
	// result array
	var results = [];

    // start async call on our collection
    async.eachSeries(
		// the array to iterate over
		jsonArray,

		// the iterator function
		function(jsonObject, callback) {
			doCmd(idArduino, jsonObject, function(jsonArduino) {
				results.push(jsonArduino);
				//callback (telling the iterator that the task is over)
				callback();
			});
		},

		// the final callback (or when error occured)
		function(err) {
			if (err) {
				util.log('[DAO] Error occured while checking arduinos : ' + err)
			}
			callback(results);
    	}  
    )
}


// handle one command (in POST)
var doCmd = function(idArduino, jsonObject, callback) {
	// getting cmd case
	switch(jsonObject.ac) {

		case 'cl' :
			// chack param presence
			if (jsonObject.id && jsonObject.pa.pin && jsonObject.pa.dur && jsonObject.pa.nb) {
				util.log('[METIER] Post command : Blink');
				// call previous "blink" function
				blink(jsonObject.id, idArduino, jsonObject.pa.pin, jsonObject.pa.dur, jsonObject.pa.nb, function(jsonArduino) {
					callback(jsonArduino);
				});
			}
			else {
				// if some parameters are missing, send back error to [WEB]
				errorMessage = '[METIER] POST Blink -> missing parameters, need: [id,pin,mode]';
				util.log(errorMessage);
				buildJsonError(errorMessage, function(jsonError) {
					callback(jsonError);
				});
			}
		break;

		case 'pr' :
			if (jsonObject.id && jsonObject.pa.pin && jsonObject.pa.mod) {
				util.log('[METIER] Post command : PinRead');
				// call previous "read" function
				read(jsonObject.id, idArduino, jsonObject.pa.pin, jsonObject.pa.mod, function(jsonArduino) {
					callback(jsonArduino);
				});
			}
			else {
				// if some parameters are missing, send back error to [WEB]
				errorMessage = '[METIER] POST Read -> missing parameters, need: [id,pin,mode]';
				util.log(errorMessage);
				buildJsonError(errorMessage, function(jsonError) {
					callback(jsonError);
				});
			}
		break;

		case "pw" :
			// check param number
			if (jsonObject.id && jsonObject.pa.pin && jsonObject.pa.mod && jsonObject.pa.val) {
				util.log('[METIER] Post command : PinWrite');
				// call previous "write" function
				write(jsonObject.id , idArduino, jsonObject.pa.pin, jsonObject.pa.mod, jsonObject.pa.val, function(jsonArduino) {
					callback(jsonArduino);
				});
			}
			else{
				// if some parameters are missing, send back error to [WEB]
				errorMessage = '[METIER] POST Write -> missing parameters, need: [id,pin,mode,val]';
				util.log(errorMessage);
				buildJsonError(errorMessage, function(jsonError) {
					callback(jsonError);
				});
			}
		break;

		default :
			// return error to "web"
			var errorMessage = '[METIER] POST : "ac" parameters missing in JSON, cannot proceed POST cmd';
			util.log(errorMessage);
			buildJsonError(errorMessage, function(jsonError) {
				// callback(jsonError);
			});
		break;
	}
}


///////////////
// FUNCTIONS //
///////////////

// send builded json to [DAO]
function sendToDao(idArduino, jsonObject, callback) {
	// stringify the JSON query and send it to [DAO]
	dao.send(idArduino, JSON.stringify(jsonObject), function(jsonArduino) {
		try {
<<<<<<< HEAD
			// if we had an error in [DAO], send it back directly (Warning : JSON object here !)
			if (jsonArduino.data) {
				callback(jsonArduino)
			} else {
				// try to parse the jsonArduino answer (Warning : string here !)
				jsonArduino = JSON.parse(jsonArduino);

				
=======
			// try to parse the jsonArduino answer
			jsonArduino = JSON.parse(jsonArduino);

			// if arduino returned an error code
			if (jsonArduino.er != '0') {	
				// we link the error code to it's text
				arduinoErrors.forEach(function(error) {
					if (error.key === jsonArduino.er) {
						jsonArduino.er = error.val;
					}
					else {
						jsonArduino.er += '(not registered)';
					}
				});
				// build the answer & send it back
				jsonAnswer = {data:{id:jsonArduino.id, erreur:jsonArduino.er, etat:jsonArduino.et, json:jsonArduino}};
				callback(jsonAnswer);
			}
			else {	// if we have a "normal" answer
				jsonAnswer = {data:{id:jsonArduino.id, erreur:jsonArduino.er, etat:jsonArduino.et, json:null}};
				callback(jsonAnswer);
>>>>>>> c4037279b6b3e6f9aa6e43ac9370f5b8c867ff64
			}
		} catch(err) {
			// error while parsing the JSON, sending back to [WEB] & log
			var errorMsg = '[METIER] Processing arduino JSON failed -> ' + err;
			util.log(errorMsg);
			buildJsonError(errorMsg, function(jsonObject) {
				callback(jsonObject);
			});
		}

		// if arduino returned an error code
		if (jsonArduino.er != '0') {	
			// we link the error code to it's text
			arduinoErrors.list.forEach(function(error) {
				if (error.key === jsonArduino.er) {
					jsonArduino.er = error.val;
				}
			});
			// build the answer & send it back
			jsonAnswer = {data:{id:jsonArduino.id, erreur:jsonArduino.er, etat:jsonArduino.et, json:jsonArduino}};
			callback(jsonAnswer);
		}
		else {	// if we have a "normal" answer
			jsonAnswer = {data:{id:jsonArduino.id, erreur:jsonArduino.er, etat:jsonArduino.et, json:null}};
			callback(jsonAnswer);
		}
	});
}

// check blink parameters & build JSON to send to arduino
function checkBlink(idCommand, pin, length, number, callback) {
	// do check
	var errorMessage = '';

	// CommandId
	if (!isNaN(idCommand)) {
		if (idCommand<0 || idCommand>99999 ){
			errorMessage += ' ( ' + idCommand +' )->CMD ID must be a number [0-99999];';
		}
	} else {
		if (idCommand.length > 100 ){
			errorMessage += ' ( ' + idCommand +' )->CMD ID to long [0-100];';
		}
	}
	// Pin
	if( pin<0 || pin>13 || isNaN(pin) ) {
		errorMessage += ' ( ' + pin +' )->PIN must be a number [0-13];';
	}
	// Length
	if(length<100 || length>2000 || isNaN(length)) {
		errorMessage +=  ' ( ' + length +' )->LENGTH must be a number [100-2000];';
	}
	// Number
	if(number<2 || number>1000 || isNaN(number)) {
		errorMessage += ' ( ' + number +' )->NB BLINK must be a number [2-100];';
	}

	// if some params aren't good, send false & JSON object error message
	if(errorMessage != '') {
		var errorMsg = '[METIER] Wrong BLINK parameters: [ ' + errorMessage + ']';
		buildJsonError(errorMsg, function(jsonObject) {
			callback(false, jsonObject);
		});
	}else {
		// if params are ok, build the JSON to send to Arduino
		var jsonObject = {id:idCommand,ac:"cl",pa:{pin:pin,dur:length,nb:number}};
		callback(true, jsonObject);
	}
}

// check pin read parameters & build JSON to send to arduino
function checkRead(idCommand, pin, mode, callback) {
	// error string
	var errorMessage = '';

	// CommandId
	if (!isNaN(idCommand)) {
		if (idCommand<0 || idCommand>99999 ){
			errorMessage += ' ( ' + idCommand +' )->CMD ID must be a number [0-99999];';
		}
	} else {
		if (idCommand.length > 100 ){
			errorMessage += ' ( ' + idCommand +' )->CMD ID to long [0-100];';
		}
	}
	// Mode
	if(mode != 'a' && mode != 'b') {
		errorMessage += ' ( ' + mode +' )->MOD must be a letter [a/b] (Warning : no PIN check);';
	}else {
		// Pin
		if(mode==='a' && (pin<0 || pin>5 || isNaN(pin))) {
			errorMessage += ' ( ' + pin +' )->PIN must be a number [0-5](analog);';
		}
		if(mode==='b' && (pin<1 || pin>13 || isNaN(pin))) {
			errorMessage += ' ( ' + pin +' )->PIN must be a number [1-13](binary);';
		}
	}

	// if some params aren't good, send false & JSON object error message
	if(errorMessage != '') {
		var errorMsg = '[METIER] Wrong READ parameters: [ ' + errorMessage + ']';
		buildJsonError(errorMsg, function(jsonObject) {
			callback(false, jsonObject);
		});
	}else {
		// if params are ok, build the JSON to send to Arduino
		var jsonObject = {id:idCommand,ac:"pr",pa:{pin:pin,mod:mode}};
		callback(true, jsonObject);
	}
}

// check pin read parameters & build JSON to send to arduino
function checkWrite(idCommand, pin, mode, value, callback) {
	// error string
	var errorMessage = '';

	// CommandId
	if (!isNaN(idCommand)) {
		if (idCommand<0 || idCommand>99999 ){
			errorMessage += ' ( ' + idCommand +' )->CMD ID must be a number [0-99999];';
		}
	} else {
		if (idCommand.length > 100 ){
			errorMessage += ' ( ' + idCommand +' )->CMD ID to long [0-100];';
		}
	}
	// Mode
	if(mode != 'a' && mode != 'b') {
		errorMessage += ' ( ' + mode +' )->MOD must be a letter [a/b] (Warning : no PIN / VALUE check);';
	}else {
		// Pin
		if(mode==='a' && (pin<0 || pin>5 || isNaN(pin))) {
			errorMessage += ' ( ' + pin +' )->PIN must be a number [0-5](analog);';
		}
		if(mode==='b' && (pin<0 || pin>13 || isNaN(pin))) {
			errorMessage += ' ( ' + pin +' )->PIN must be a number [0-13](binary);';
		}
		// Value
		if(mode=='a' && (value<0 || value>255 || isNaN(value))){
			errorMessage += ' ( ' +  value +' )->VALUE must be a number [0-255](analog);';
		}
		if(mode=='b' && (value<0 || value>1 || isNaN(value))){
			errorMessage += ' ( ' +  value +' )->VALUE must be a number [0/1](binary);';
		}
	}

	// if some params aren't good, send false & JSON object error message
	if(errorMessage != '') {
		var errorMsg = '[METIER] Wrong WRITE parameters: [ ' + errorMessage + ']';
		buildJsonError(errorMsg, function(jsonObject) {
			callback(false, jsonObject);
		});
	}else {
		// if params are ok, build the JSON to send to Arduino
		var jsonObject = {id:idCommand,ac:"pw",pa:{pin:pin,mod:mode,val:value}};
		callback(true, jsonObject);
	}
}

// build JSON object error message
function buildJsonError(msg, callback) {
	// build the error message & send it back
	var jsonErrorMessage = {data:{message:msg}};
	callback(jsonErrorMessage);
}


/////////////
// EXPORTS //
/////////////

// Export modules
module.exports.arduinos = arduinos;
module.exports.blink = blink;
module.exports.read = read;
module.exports.write = write;
<<<<<<< HEAD
// module.exports.postCmd = postCmd;
module.exports.asyncPostCmd = asyncPostCmd;
=======
module.exports.postCmd = postCmd;
>>>>>>> c4037279b6b3e6f9aa6e43ac9370f5b8c867ff64
