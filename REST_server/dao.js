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


//////// CLIENT : send request to Arduino
exports.send = function(ipArduino, jsonObject) {
	return jsonObject;
}

//////// SERVER : receive arduino authntication


