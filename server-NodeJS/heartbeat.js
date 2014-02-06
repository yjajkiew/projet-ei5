// Async arduino heartbeat
function heartbeat(arduino, callback) {
	var heartbeatText = '';

	// Connect to Arduino server
	var client = net.connect({host:arduino.id, port:arduino.port},function() { //'connect' listener
		// build json object
		var jsonObject = {id:"1",ac:"ec",pa:{}};
		var jsonString = JSON.stringify(jsonObject);
		heartbeatText += '[DAO-HeartBeat] Checking Arduino @ ' + arduino.id + ":" + arduino.port;
		client.write(jsonString);
	})

	// Receive data from Arduino
	.on('data', function(chunk) {	// NOTE : arduino need to register itself befor beeing able to respond to query !
		arduinoAnswer+=chunk;
		client.end();
	})

	// 'End' event, just log
	.on('end', function() {
		arduinoAnswer = arduinoAnswer.replace(/(\r\n|\n|\r)/gm,'');	// get ride of EOL chars '\r\n'
		heartbeatText += ' => OK !';
		arduinoAnswer = '';
		//log 
		util.log(heartbeatText);
	})

	// 'error' event, remove arduino
	.on('error', function(err) {
		// delete arduino
		if (arduinos.remove(arduino.id) === undefined) {
			util.log('[DAO-HeartBeat] arduino : ' + arduino.id + ' already removed from collection');
		}
		else {
			util.log('[DAO-HeartBeat] Arduino : ' + arduino.id + ' not responding, removing from collection');
		}
	});
}

// Final task (same in all the examples)
function final() { console.log('Done', results); }

// A simple async series:
var arduinosCheck = function(arduinos) {
	var items = arduinos;
	var results = [];
	function series(item) {
	  	if(item) {
	    	heartbeat( item, function(result) {
	      		results.push(result);
	      		return series(items.shift());
	    	});
	  	} else {
	    	// return final();
	  	}
	}
	series(items.shift());
}

// call heartbeat repetedly
setInterval(function() {
	arduinosCheck(arduinos);
}, 5000);