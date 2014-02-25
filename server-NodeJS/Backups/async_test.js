/********************************************************************************/

// each(arr, iterator, callback)
// --> Applies an iterator function to each item in an array, in parallel. 
// arr -> array to iterate over
// iterator(item, callback) -> A function to apply to each item in the array. The iterator is passed a callback(err) which must be called once it has completed. If no error has occured, the callback should be run without arguments or with an explicit null argument.
// callback(err) -> A callback which is called after all the iterator functions have finished, or an error has occurred.

/********************************************************************************/

// eachSeries(arr, iterator, callback)
// -> same as each, but the next iterator is only called once the current one has completed processing

/********************************************************************************/

async.eachSeries(
  // array
  [ 2, 3, 5, 7, 11 ],

  // iterator
  function (item, callback) {
    console.log(item);
    callback(); // Alternatively: callback(new Error());
  },

  //callback
  function (err) {
    if (err) { throw err; }
    console.log('Well done :-)!');
  }
);

/********************************************************************************/

function asyncArduinoCheck (arduinosCollection) {
    // start async call on our collection
    async.each(
      // the array to iterate over
      arduinosCollection,

      // the iterator function
      function(currentArduino, callback) {
          // remove or not our arduino according to boolean
          callback()
      },

      // the final callback (or when error occured)
      function(err) {
          if (err) {
              util.log('[DAO] Error occured while checking arduinos : ' + err)
          }
      }  
    )
}

/********************************************************************************/

// Async task (same in all examples in this chapter)
function async(arg, callback) {
  console.log('do something with \''+arg+'\', return 1 sec later');
  setTimeout(function() { callback(arg * 2); }, 1000);
}

// Final task (same in all the examples)
function final() { console.log('Done', results); }

// A simple async series:
var items = [ 1, 2, 3, 4, 5, 6 ];
var results = [];
function series(item) {
  if(item) {
    async( item, function(result) {
      results.push(result);
      return series(items.shift());
    });
  } else {
    return final();
  }
}
series(items.shift());

/********************************************************************************/

// Include the async package
// Make sure you add "node-async" to your package.json for npm
async = require("async");
  
// 1st parameter in async.map() is the array of items
async.each(items,
  // 2nd parameter is the function that each item is passed into
  function(item, callback){
    // Call an asynchronous function (often a save() to MongoDB)
    item.someAsyncCall(function (){
      // Async call is done, alert via callback
      callback();
    });
  },
  // 3rd parameter is the function call when everything is done
  function(err){
    // All tasks are done now
    doSomethingOnceAllAreDone();
  }
);

/********************************************************************************/

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

/********************************************************************************/

async.parallel([
    function(callback) { //This is the first task, and callback is its callback task
        db.save('xxx', 'a', function(err) {
            //Now we have saved to the DB, so let's tell async that this task is done
            callback();
        });
    },
    function(callback) { //This is the second task, and callback is its callback task
        db.save('xxx', 'b', callback); //Since we don't do anything interesting in db.save()'s callback, we might as well just pass in the task callback 
    }
], function(err) { //This is the final callback
    console.log('Both a and b are saved now');
});