/////////////////////////
// REGISTRATION SERVER //
///////////////////////// arduinos registration

// externals modules
var	net = require('net');
var util = require('util');
var async = require('async');
var Arduino = require('./Arduino.js');

// server variables
var	HOST = '192.168.2.1';
var	PORT = 100;	
var	registrationData = '';
var arduinos = [];

// heartbeat variables
var arduinoAnswer = '';


// server configuration
var server = net.createServer(function(sock) {
	sock.on('data', function(chunk) {
		// add data chunk to data
    	registrationData += chunk;
	})
	
	.on('end', function() {
		// get ride of EOL chars '\r\n'
		registrationData = registrationData.replace(/(\r\n|\n|\r)/gm,'');
		// register arduino
		doRegistration(registrationData, arduinos);
		registrationData = '';
		// display arduino array
		util.log('Current arduinos array : ' + arduinos.toString());
	})
});

// launch server
server.listen(PORT, HOST, function() {
	util.log('[DAO] Server listening for new Arduinos on ' + HOST +':'+ PORT);
});

// registration methode
var doRegistration = function(registrationData, arduinos) {
	var register = true;
	try {
		// parse JSON object
		jsonArduino = JSON.parse(registrationData);

		// check if arduino is already in our arduinos array
		arduinos.forEach(function(arduino) {
			if (arduino.getId() == jsonArduino.id) {
				// if we already saved the arduino, log & save state
				util.log('[DAO] Arduino already registered');
				register = false;
			}
		});

		// if not saved, we add the arduino to our Arduinos array
		if(register) {
			var arduino = new Arduino(jsonArduino.id, jsonArduino.mac, jsonArduino.port, jsonArduino.desc);
			arduinos.push(arduino);
			util.log('[DAO] Arduino saved : ' + JSON.stringify(jsonArduino));
		}
	}catch(err) {
		util.log('[DAO] Error while parsing arduino JSON registration : ' + err.message)
	}
}



///////////////
// HEARTBEAT //
///////////////

// Call heartbeat periodically
setInterval(function() {
	asyncArduinoCheck(arduinos);
}, 10000);

// Iterate trought the arduino list and do hearbeat
function asyncArduinoCheck (arduinosArray) {
	if (arduinosArray.length > 0) {
	    // start async call on our collection
	    async.each(

	    	// the array to iterate over
	    	arduinosArray,

	    	// the iterator function (arduino = current arduino in collection)
	        function(arduino, callback) {
	        	heartbeat(arduino) {
	        		callback();
	        	};
	        },

			// the final callback (or when error occured)
	        function(err) {
	            if (err) {
	                util.log('[DAO] Error occured while checking arduinos : ' + err)
	            }
	        }  
	    );
	} else {
		util.log('[DAO-HeartBeat] No arduino in collection')
	}
}

// Check arduino state
function heartbeat(arduino, callback) {
	// Connect to Arduino server
	var client = net.connect({host:arduino.id, port:arduino.port},function() { //'connect' listener

		// build json object
		var jsonObject = {id:"1",ac:"ec",pa:{}};
		var jsonString = JSON.stringify(jsonObject);
		client.write(jsonString);
	})

	// Receive data from Arduino
	.on('data', function(chunk) {
		arduinoAnswer+=chunk;
		client.end();
	})

	.on('end', function() {
		arduinoAnswer = '';
		callback(true);
	})

	// 'error' event
	.on('error', function(err) {
		callback(false);
	});
}


	        		if (!check) {
	        			util.log('[DAO-HeartBeat] Arduino ' + arduino.id + ':' + arduino.port + ' didn\'t respond');
	        		} else {
						util.log('[DAO-HeartBeat] Arduino ' + arduino.id + ':' + arduino.port + ' echo OK');
	        		}