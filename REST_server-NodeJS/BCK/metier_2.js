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


// Imports
var util = require('util');


//////// PUBLIC functions
// get arduino list
exports.arduinos = function(parameters) {

}

// LED blink
exports.blink = function(paramters) {
	// check : 5 parameters
	if (count(parameters) == 5){

		// param1=int(1)
		var regexPattern = /^Status: ([0-9\.]+) \(([a-zA-Z ]+)\)$/
		var result = string.match(regex);
		var statusNumber = result[1];
		var statusString = result[2];

		// param2=string(xxx.xxx.xxx.xxx)

		// param3=int(1->13&0->5)

		// param4=int(>0)

		// param5=int(>0)
	}

	

	// send to "dao" & wait for answer befor return to "web"
}


//////// PRIVATE functions







