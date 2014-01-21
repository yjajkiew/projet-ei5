/////////////////
// VARIABLES : //
/////////////////
var SERVER_PORT = 8080;
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


		///////////////
		// BUTTONS : //
		///////////////

		// Refresh button
		$(".refreshButton").click(function() {
			// WARNING : this is working if the BUTTON NAME IS THE SAME AS THE LIST ID !!!!
			var listId = "#" + $(this).attr("name");
			getArduinoList(listId);
		});

		/////////////
		// FORMS : //
		/////////////

		// Form reset button
		$('.resetButton').click(resetForm);

		// Add ip validator to form validation
		$.validator.addMethod('IP4Checker', function(value) {
            var ip = "^(?:(?:25[0-5]2[0-4][0-9][01]?[0-9][0-9]?)\.){3}" + "(?:25[0-5]2[0-4][0-9][01]?[0-9][0-9]?)$";
                return value.match(ip);
            }, 'Invalid IP address');

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
				console.log('[BLINK] idArduino : ' + idArduino + " - pin blink: " + pin + " - lenght: " + lenght + " - nb blink: " + nbBlink);
				doBlink(idCmd, idArduino, pin, lenght, nbBlink);
	        }
		});

		// Pin Read form
		var binaryRange = [0,13];
		var analogRange = [0,5];
		$("#pinReadForm").validate({
			// // Specify the validation rules
			// rules: {
			// 	cmdIdRead: {required: true, maxlength: 3},
			// 	pinRead: {
			// 		required: true,
			// 		range: {
			// 			depends: function(element) {
			// 				if ($('#modeRead option:selected').val() == 'b') {
			// 					return binaryRange;
			// 				}
			// 				else {
			// 					return analogRange;
			// 				}
			// 			}
			// 		}
			// 	},
			// 	modeRead: {required: true}
			// },

			rules: {
			    cmdIdRead: {required: true, maxlength: 3, number: true},
			    pinRead: {required: true,range: [0,13], number: true},
			    modeRead: {required: true}
			},

	        // Specify the validation error messages
	        messages: {
	            // cmdIdRead: {
	            //     required: "Please choose an ID"
	            // }
	        },

	        // handler for the form
			submitHandler: function(form) {
				var idCmd = $("#cmdIdRead").val();
				var idArduino = $("#arduinosListRead option:selected").val();
				var pin =  $('#pinRead').val();
				var mode = $('#modeRead option:selected').val();
				console.log('[READ] idArduino: ' + idArduino + " - command ID: " + idCmd + " - pin read: " + pin + " - mode: " + mode);
				doPinRead(idCmd, idArduino, pin, mode);
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

	        // Specify the validation error messages
	        messages: {
	            // cmdIdWrite: {
	            //     required: "Please choose an ID"
	            // }
	        },

	        // handler for the form
			submitHandler: function(form) {
				var idCmd = $("#cmdIdWrite").val();
				var idArduino = $("#arduinosListWrite option:selected").val();
				var pin =  $('#pinWrite').val();
				var mode = $('#modeWrite').val();
				var value = $('#valueWrite').val();
				console.log('[WRITE] idArduino : ' + idArduino + " - command ID: " + idCmd + " - pin write: " + pin + " - mode:" + mode + " - value: " + value);
				doPinWrite(idCmd, idArduino, pin, mode, value);
	        }
		});

		// Pin Write form
		$("#postForm").validate({
			// Specify the validation rules
	        rules: {
	            cmdIdPost: {required: true, maxlength: 3, number: true},
	            jsonStringPost: {required: true}	// WARNING : need to check JSON format
	        },

	        // Specify the validation error messages
	        messages: {
	            // cmdIdPost: {
	            //     required: "Please choose an ID"
	            // }
	        },

	        // handler for the form
			submitHandler: function(form) {
				// check the JSON string unbtergrity
				try{
					var theJSON = jQuery.parseJSON($('#jsonStringPost').val());
				}catch (error) {
					alert('Wrong JSON string, check structure !');
					return;
				}
				var idCmd = $("#cmdIdPost").val();
				var idArduino = $("#arduinosListPost option:selected").val();
				var jsonString =  $('#jsonStringPost').val();
				console.log('[POST] idArduino : ' + idArduino + " - json string : " + jsonString);
				doPost(idCmd, idArduino, jsonString);
	        }
		});
	})

	// setup ajax error handler (verbose)
	// $.ajaxSetup({
 //        error: function(jqXHR, exception) {
 //            if (jqXHR.status === 0) {
 //                alert('Not connect.\n Verify Network.');
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
});


////////////////
// METHODES : //
////////////////

// reset form fields
function resetForm () { 
	$(':input')
	.not(':button, :submit, :reset, :hidden') .val('')
	.prop('checked', false)
	.prop('selected', false);
}

// get arduino list from REST server & populate selected drop-down list
function getArduinoList(idList) {

	// 0-clear the list :
	$(idList).empty();

	// 1-get the json object containing the arduino list
	$.getJSON( baseUrl, function(data) {

		// 2-Build the list
   		var jsonData = data.data;
   		jsonData.forEach(function(arduino) {
   			// 3-Add the option to the Drop-Down list
   			// var newOption = $('<option value="' + arduino.id + '">' + arduino.id + '</option>');
   			var newOption = '<option value="' + arduino.id + '">' + arduino.id + '</option>';
   			$(idList).append(newOption);
   			console.log('[GETARDUINOLIST] List id: ' + idList + ' - IP: ' + arduino.id + ' - description: ' + arduino.description + ' - Option: ' + newOption);
   		});
	});
}


function doBlink(idCmd, idArduino, pin, lenght, nbBlink) { // http://localhost:8080/rest/arduinos/blink/192.168.2.3/192.168.2.3/8/100/10
	if (idArduino == null) {
		alert("[DOBLINK] Wrong arduino ID : " + idArduino);
	} else {
		// build the request URL
		var requestUrl = baseUrl + "/blink/" + idCmd + "/" + idArduino + "/" + pin + "/" + lenght + "/" + nbBlink;

		// send request to REST server
		$.getJSON(requestUrl, function(data) {
			// $('#resultDisplay').html(JSON.stringify(data));
			$( "#blinkResult" ).html(JSON.stringify(data));
			console.log("[DOBLINK] json answer : " + JSON.stringify(data));
		});
	}
}

function doPinRead(idCmd, idArduino, pin, mode) { // http://localhost:8080/rest/arduinos/pinRead/192.168.2.3/192.168.2.3/8/b
	if (idArduino == null) {
		alert("[DOREAD] Wrong arduino ID : " + idArduino);
	} else {
		// WARNING : need to test each case (binary / analog) !!!
		// build the request URL
		var requestUrl = baseUrl + "/pinRead/" + idCmd + "/" + idArduino + "/" + pin + "/" + mode;

		// send request to REST server
		$.getJSON(requestUrl, function(data) {
			// $('#resultDisplay').html(JSON.stringify(data));
			// $( "div.result" ).html(JSON.stringify(data));
			$( "#readResult" ).html(JSON.stringify(data));
			console.log("[DOREAD] json answer : " + JSON.stringify(data));
		});
	}
}

function doPinWrite(idCmd, idArduino, pin, mode, value) { // http://localhost:8080/rest/arduinos/pinWrite/192.168.2.3/192.168.2.3/8/b/1
	if (idArduino == null) {
		alert("[DOWRITE] Wrong arduino ID : " + idArduino);
	} else {
		// WARNING : need to test each case (binary / analog) !!!
		// build the request URL
		var requestUrl = baseUrl + "/pinWrite/" + idCmd + "/" + idArduino + "/" + pin + "/" + mode + "/" + value;

		// send request to REST server
		$.getJSON(requestUrl, function(data) {
			// $('#resultDisplay').html(JSON.stringify(data));
			$( "#writeResult" ).html(JSON.stringify(data));
			console.log("[DOWRITE] json answer : " + JSON.stringify(data));
		});
	}
}
		
function doPost(idCmd, idArduino, jsonString) { // http://localhost:8080/rest/arduinos/192.168.2.3/192.168.2.3/
	if (idArduino == null) {
		alert("[DOPOST] Wrong arduino ID : " + idArduino);
	} else {
		// WARNING : need to check JSON structure !!!
		// build the request URL
		var requestUrl = baseUrl + "/" + idCmd + "/" + idArduino;

		// do AJAX POST
		$.ajax({
			type: "post",
			url: requestUrl, //'/rest/arduinos/192.168.2.3/192.168.2.3/', //requestUrl,
			contentType: "application/json; charset=utf-8",
			data: jsonString,	// WARNING : check string here, maybe need of JSON.stringify !!!
			dataType: "json"
		})

		.done(function(result) {
			$( "#postResult" ).html(JSON.stringify(result));
			console.log("[DOPOST] json answer: " + JSON.stringify(result));
		})

		.fail(function(err) {
			alert('Post cmd failled');
		})	
	}
}