// Acheck arduino state
function heartbeat(arduino, callback) {
	// Connect to Arduino server
	var client = net.connect({host:arduino.ip, port:arduino.port},function() { //'connect' listener
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

	// 'End' event
	.on('end', function() {
		arduinoAnswer = '';
		callback(true);
	})

	// 'error' event
	.on('error', function(err) {
		callback(false);
	});
}

// iterate trought the erduino list and do hearbeat
var arduinosCheck = function(arduinos) {
	arduinos.forEach(arduino, function() {
		heartbeat(arduino, function(checkBoolean) {
			if (!checkBoolean) {
				util.log('[DAO-HeartBeat] Arduino : ' + arduino.id + ' didn\'t respond, removing from collection');
			}
			else {
				util.log('[DAO-HeartBeat] Arduino : ' + arduino.id + ' echo OK');
			}
		});
	});
}

// call heartbeat periodically
setInterval(function() {
	util.log('[DAO] Checking arduinos in the collection')
	arduinosCheck(arduinos);
}, 5000);


// // 1st parameter in async.map() is the array of items
// async.each(items,
//   // 2nd parameter is the function that each item is passed into
//   function(item, callback){
//     // Call an asynchronous function (often a save() to MongoDB)
//     item.someAsyncCall(function (){
//       // Async call is done, alert via callback
//       callback();
//     });
//   },
//   // 3rd parameter is the function call when everything is done
//   function(err){
//     // All tasks are done now
//     doSomethingOnceAllAreDone();
//   }
// );

async.each(openFiles, function( file, callback) {

  // Perform operation on file here.
  console.log('Processing file ' + file);
  callback();

  if( file.length > 32 ) {
    console.log('This file name is too long');
    callback('File name too long');

    return;
  } else {
    console.log('File saved');
    callback();
  }
}, function(err){
    // if any of the saves produced an error, err would equal that error
    if( err ) {
      // One of the iterations produced an error.
      // All processing will now stop.
      console.log('A file failed to process');
    } else {
      console.log('All files have been processed successfully');
    }
});