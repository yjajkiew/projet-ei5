//////// CLIENT : send request to Arduino

// Imports modules:
var net = require('net'),
	util = require('util'),
// variables
	currentArduino,
	arduinoIp = '192.168.2.3',
	arduinoPort = 102,
	local = '192.168.2.1',
	lastIndex = 0,
	arduinoAnswer;


// Connect to Arduino server
var client = net.connect(arduinoPort, arduinoIp, local, function() { //'connect' listener
	jsonString = "{\"id\":\"1\",\"ac\":\"cl\",\"pa\":{\"pin\":\"9\",\"dur\":\"100\",\"nb\":\"10\"}}";
	util.log('Sending : ' + jsonString);
	client.write(jsonString);
});

client.on('data', function(chunk) {
	arduinoAnswer += chunk;
	client.end();
});

client.on('end', function() {
 	util.log('Received : ' + JSON.stringify(arduinoAnswer));
});

client.on('error', function(err) {
	util.log(err);
});
