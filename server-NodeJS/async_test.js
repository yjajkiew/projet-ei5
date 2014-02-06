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



var results = [];
async.forEach(jsonObjectList, function(jsonObject, callback) { // iterate trought the json array
    // call post cmd for each json in the array
    doCmd(idArduino, jsonObject, function(jsonArduino) {
        results.push(jsonArduino);
    });
}, function(err) {
    callback(results);
});



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
