/////////////////
// VARIABLES : //
/////////////////
var SERVER_PORT = 80;
var SERVER_ADDRESS = 'localhost';
var SERVER_BASE_PATH = "/rest/arduinos";
var baseUrl = "http://" + SERVER_ADDRESS + ':' + SERVER_PORT + SERVER_BASE_PATH;

// Browser is ready
$(function() {
	// Document is ready
	$(document).ready (function() {

		//////////////////////
		// INITIALISATION : //
		//////////////////////

		// get arduino list from REST Server
		// WARNING => need to refresh all the drop-down list here !!!!!
		// 4 request, not really great...
		// TODO later : 
		// use 1 "init" function
		// OR : use the same option (saved in a shared table ie.) for all the DD list box, 
		// OR : use the same DDLB on all 4 pages.
		getArduinoList("#arduinosListBlink");
		getArduinoList("#arduinosListRead");
		getArduinoList("#arduinosListWrite");
		getArduinoList("#arduinosListPost");

		// hide AJAX loading indicator
		$(".loading").hide();


		///////////////
		// BUTTONS : //
		///////////////

		// Refresh button
		$(".refreshButton").click(function() {
			// WARNING : this is working if the BUTTON NAME IS THE SAME AS THE LIST ID !!!!
			// get the list id & get the arduino list from the server & populate the list
			var listId = "#" + $(this).attr("name");
			getArduinoList(listId);
			console.log('[REFRESH] ' + listId);
		});


		///////////////
		// LOADING : //
		///////////////

		$(document).ajaxStart(function () {
		    $(".loading").show();
		});

		$(document).ajaxComplete(function () {
		    $(".loading").hide();
		});


		/////////////
		// FORMS : //
		/////////////

		// Form reset button
		$('.resetButton').click(resetForm);

		// add IPv4 Address Validator
		$.validator.addMethod('ipv4', function(value) {
		    // var ipv4 = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/;
		    var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		    return value.match(ipv4);
		}, 'Invalid IPv4 address, should be : "255.255.255.255"');

		// add url path validator
		$.validator.addMethod('path', function(value) {
		    var path = /^([\/\w \.-]*)*\/?$/ ;
		    return value.match(path);
		}, 'Invalid url path, should be : "/something/else/or/whatever"');

		// Blink form
		$("#blinkForm").validate({
			// Specify the validation rules
	        rules: {
	            cmdIdBlink: {required: true, maxlength: 3, number: true},
	            pinBlink: {required: true,  range: [0,9], number: true},
	            lenghtBlink: {required: true, range: [50,10000], number: true},
	            nbBlink: {required: true, range: [1,100], number: true}
	        },

	        // Specify the validation error messages
	        messages: {
	            cmdIdBlink: {
	                required: "Please choose an ID",
	                number: "please enter a number"
	            }
	        },

	        // handler for the form
			submitHandler: function(form) {
				// event.preventDefault();	// don't need it anymore (no submit on the form !!!)
				var idCmd = $("#cmdIdBlink").val();
				var idArduino = $("#arduinosListBlink option:selected").val();
				var pin =  $('#pinBlink').val();
				var lenght = $('#lenghtBlink').val();
				var nbBlink = $('#nbBlink').val();
				console.log('[BLINK] @' + baseUrl + ' -  idArduino : ' + idArduino + " - pin blink: " + pin + " - lenght: " + lenght + " - nb blink: " + nbBlink);
				doBlink(idCmd, idArduino, pin, lenght, nbBlink);
	        }
		});

		// Pin Read form
		$("#pinReadForm").validate({
			rules: {
			    cmdIdRead: {required: true, maxlength: 3, number: true},
			    pinRead: {required: true,range: [0,13], number: true},
			    modeRead: {required: true}
			},

	        // handler for the form
			submitHandler: function(form) {
				var idCmd = $("#cmdIdRead").val();
				var idArduino = $("#arduinosListRead option:selected").val();
				var pin =  $('#pinRead').val();
				var mode = $('#modeRead option:selected').val();
				console.log('[READ] @' + baseUrl + ' - idArduino: ' + idArduino + " - command ID: " + idCmd + " - pin read: " + pin + " - mode: " + mode);
				if ((mode == 'a' && (pin>5 || pin<0) || (mode=='b' && (pin<0 || pin>13)))) {
					alert("Wrong PIN : [0-13] binary - [0-5] analog");
				}else{
					doPinRead(idCmd, idArduino, pin, mode);
				}
	        }
		});

		// Pin Write form
		$("#pinWriteForm").validate({
			// Specify the validation rules
	        rules: {
	            cmdIdWrite: {required: true, maxlength: 3, number: true},
	            pinWrite: {required: true, range: [0,13], number: true},
	            modeWrite: {required: true},
	            valueWrite: {required: true, number: true}	// WARNING : need to test value here, according to BINARY // ANALOG
	        },

	        // handler for the form
			submitHandler: function(form) {
				var idCmd = $("#cmdIdWrite").val();
				var idArduino = $("#arduinosListWrite option:selected").val();
				var pin =  $('#pinWrite').val();
				var mode = $('#modeWrite').val();
				var value = $('#valueWrite').val();
				console.log('[WRITE] @' + baseUrl + ' - idArduino : ' + idArduino + " - command ID: " + idCmd + " - pin write: " + pin + " - mode:" + mode + " - value: " + value);
				if ((mode == 'a' &&(pin>5 || pin<0) ||(mode=='b' && (pin<0 || pin>13)))) {
					alert("Wrong PIN : [0-13] binary - [0-5] analog");
				}else{
					doPinWrite(idCmd, idArduino, pin, mode, value);
				}
	        }
		});

		// POST form
		$("#postForm").validate({
			// Specify the validation rules
	        rules: {
	            cmdIdPost: {required: true, maxlength: 3, number: true},
	            jsonStringPost: {required: true}	// WARNING : need to check JSON format
	        },

	        // handler for the form
			submitHandler: function(form) {
				// check the JSON string unbtergrity
				try{
					var jsonString = '[' + $('#jsonStringPost').val() + ']';
					var theJSON = jQuery.parseJSON(jsonString);
					var idCmd = $("#cmdIdPost").val();
					var idArduino = $("#arduinosListPost option:selected").val();
					console.log('[POST] @' + baseUrl + ' - idArduino : ' + idArduino + " - json string : " + jsonString);
					doPost(idCmd, idArduino, jsonString);
				}catch (error) {
					alert('Wrong JSON string, check structure !');
					return;
				}
				
	        }
		});

		// Change server address
		$("#settingsForm").validate({
			// Specify the validation rules & messages
	        rules: {
	            serverAddress: {required: true, ipv4: true},
	            serverPort: {required: true, number: true, maxlength: 4},
	            serverPath: {required: true, path: true}
	        },

	        // handler for the form
	        submitHandler: function(form) {
	        	// get new ip address
	        	SERVER_ADDRESS = $("#serverAddress").val();
	        	SERVER_PORT = $("#serverPort").val();
	        	SERVER_BASE_PATH = $("#serverPath").val()
	        	// Re-build server base URL
	        	baseUrl = "http://" + SERVER_ADDRESS + ':' + SERVER_PORT + SERVER_BASE_PATH;
	        	// log & display
	        	message = 'New server address : ' + baseUrl;
	        	console.log('[SETTINGS] ' + message);
	        	alert(message);
	        	// return to menu
	        	$("body").pagecontainer("change", "#main");
	        }
		});
	})
});


////////////////
// METHODES : //
////////////////

// clear form fields
function resetForm () { 
	$(':input')
	.not(':button, :submit, :reset, :hidden') 
	.val('')
	.prop('checked', false)
	.prop('selected', false);
}

// get arduino list from REST server & populate selected drop-down list
function getArduinoList(idList) {
	// clear the list :
	$(idList).empty();

	// do AJAX GET
	getAjax(baseUrl, function(jsonObject) {
   		var jsonData = jsonObject.data;
   		jsonData.forEach(function(arduino) {
   			// Add the option to the Drop-Down list
   			$(idList).append('<option value=' + arduino.id + '>' + arduino.id + '</option>');
		});
		// refresh the list
		$(idList).change();
	})
}


function doBlink(idCmd, idArduino, pin, lenght, nbBlink) { // http://localhost:8080/rest/arduinos/blink/192.168.2.3/192.168.2.3/8/100/10
	if (idArduino == null) {
		alert("[DOBLINK] Wrong arduino ID : " + idArduino);
	} else {
		// build the request URL
		var requestUrl = baseUrl + "/blink/" + idCmd + "/" + idArduino + "/" + pin + "/" + lenght + "/" + nbBlink;

		// do AJAX GET
		getAjax(requestUrl, function(jsonObject) {
			//alert(JSON.stringify(jsonObject), 'Result'); ==> to much limited, need to use a modal dialogue pop-up
			$( "#blinkResult" ).html(JSON.stringify(jsonObject));
		})
	}
}

function doPinRead(idCmd, idArduino, pin, mode) { // http://localhost:8080/rest/arduinos/pinRead/192.168.2.3/192.168.2.3/8/b
	if (idArduino == null) {
		alert("[DOREAD] Wrong arduino ID : " + idArduino);
	} else {
		// WARNING : need to test each case (binary / analog) !!!
		// build the request URL
		var requestUrl = baseUrl + "/pinRead/" + idCmd + "/" + idArduino + "/" + pin + "/" + mode;

		// do AJAX GET
		getAjax(requestUrl, function(jsonObject) {
			$( "#readResult" ).html(JSON.stringify(jsonObject));
		})
	}
}

function doPinWrite(idCmd, idArduino, pin, mode, value) { // http://localhost:8080/rest/arduinos/pinWrite/192.168.2.3/192.168.2.3/8/b/1
	if (idArduino == null) {
		alert("[DOWRITE] Wrong arduino ID : " + idArduino);
	} else {
		// WARNING : need to test each case (binary / analog) !!!
		// build the request URL
		var requestUrl = baseUrl + "/pinWrite/" + idCmd + "/" + idArduino + "/" + pin + "/" + mode + "/" + value;

		// do AJAX GET
		getAjax(requestUrl, function(jsonObject) {
			$( "#writeResult" ).html(JSON.stringify(jsonObject));
		})
	}
}
		
function doPost(idCmd, idArduino, jsonString) { // http://localhost:8080/rest/arduinos/192.168.2.3/192.168.2.3/
	if (idArduino == null) {
		alert("[DOPOST] Wrong arduino ID : " + idArduino);
	} else {
		// build the request URL
		var requestUrl = baseUrl + "/" + idCmd + "/" + idArduino;
		// console.log(jsonString);

		// do AJAX POST
		$.ajax({
			type: "post",
			url: requestUrl,
			contentType: "application/json; charset=utf-8",
			data: jsonString,
			// dataType: "json"
		})

		.done(function(result) {
			$( "#postResult" ).html(result);
			console.log("[DOPOST] json answer: " + JSON.stringify(result));
		})

		.fail(function(err) {
			alert('Post cmd failled');
		})
	}
}

function getAjax(url, callback) {
	$.ajax({
		type: "get",
		url: url,
		dataType: "json"
	})

	.done(function(result) {
		callback(result);
		console.log("[GET] json answer: " + result);
	})

	.fail(function(err) {
		alert('GET failed : ' + err.status);
	})
}

	// setup ajax error handler (verbose)
	// $.ajaxSetup({
 //        error: function(jqXHR, exception) {
 //            if (jqXHR.status === 0) {
 //                alert('Not connected.\n Verify Network.');
 //            } else if (jqXHR.status == 404) {
 //                alert('Requested page not found. [404]');
 //            } else if (jqXHR.status == 500) {
 //                alert('Internal Server Error [500].');
 //            } else if (exception === 'parsererror') {
 //                alert('Requested JSON parse failed.');
 //            } else if (exception === 'timeout') {
 //                alert('Time out error.');
 //            } else if (exception === 'abort') {
 //                alert('Ajax request aborted.');
 //            } else {
 //                alert('Uncaught Error.\n' + jqXHR.responseText);
 //            }
 //        }
	// });