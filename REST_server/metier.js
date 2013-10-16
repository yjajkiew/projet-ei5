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
//var export = include('export');
var util = require('util');

//////// PUBLIC functions
exports.urlToJson = function(parameters) {
	// check pamaeters (accordingly to case : use count(param))

	// parse to JSON

	// log
	util.log("Call : urlToJson");
}


//////// PRIVATE functions