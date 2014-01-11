/////////////////
// VARIABLES : //
/////////////////
var baseUrl = "http://localhost:8080/rest/arduinos";


//////////////////////
// INITIALISATION : //
//////////////////////
// Document is ready
$(function() {
	$(document).ready (function() {
		// get arduino list from REST Server
		getArduinoList("#arduinosList");
	})
});


///////////////
// BUTTONS : //
///////////////
// refresh arduino list
// $("#refreshArduinoList").click(function() {
// 		alert("refresh button pressed");
// });

// $( ".refreshArduinoList" ).bind( "click", function(event, ui) {
// 	// fill drop down list with arduinos
// 	getArduinoList($(this).parents(".dropdown"));

// 	// bind data
// 	// DropdownList.DataBind()
// });

$( "#refreshArduinoList" ).bind( "click", function(event, ui) {
	// fill drop down list with arduinos
	getArduinoList("#arduinosList");

	// bind data
	// DropdownList.DataBind()
});

// Do blink
$( "#doBlink" ).bind( "click", function(event, ui) {
	//alert("Selected arduino : " + $("#refreshArduinoList option:selected").text());
	var idArduino = $("#arduinosList option:selected").val();
	var pin =  $('#pinBlink').val();
	var lenght = $('#lenghtBlink').val();
	var nbBlink = $('#nbBlink').val();
	console.log('[BLINK] idArduino : ' + idArduino + " - pin blink : " + pin + " - lenght : " + lenght + " - nb blink : " + nbBlink);
	doBlink(idArduino, pin, lenght, nbBlink);
});


////////////////
// METHODES : //
////////////////
// get arduino list from REST server
function getArduinoList(idList) {
	// 0-clear the list :
	$(idList).empty();

	// 1-get the json object containing the arduino list
	$.getJSON( "http://localhost:8080/rest/arduinos", function(data) {

		// 2-Build the list
   		var jsonData = data.data;
   		jsonData.forEach(function(arduino) {
   			// 3-Add the option to the Drop-Down list
   			var newOption = $('<option value="' + arduino.id + '">' + arduino.id + '</option>');
   			$(idList).append(newOption);
   			console.log('[GETARDUINOLIST] ip:' + arduino.id + ' - description:' + arduino.description);
   		});
	});

	// 4-refresh the dropdownlist
	// $(idList).selectmenu('refresh');	// how to refresh display ???
	// $(idList).trigger("chosen:updated");
}

function doBlink(idArduino, pin, lenght, nbBlink) { // http://localhost:8080/rest/arduinos/blink/192.168.2.3/192.168.2.3/8/100/10
	if (idArduino == null) {
		alert("[BLINK] Wrong arduino ID : " + idArduino);
	} else {
		// WARNING : need to test each argument here !!!
		// build the request URL
		var requestUrl = baseUrl + "/blink/" + idArduino + "/" + idArduino + "/" + pin + "/" + lenght + "/" + nbBlink;

		// send request to REST server
		$.getJSON(requestUrl, function(data) {
			// $('#resultDisplay').html(JSON.stringify(data));
			$( "div.result" ).html(JSON.stringify(data));
			console.log("[DOBLINK] json answer : " + JSON.stringify(data));
		});
	}
}





// $.ajax({
// 	type: "get",
// 	url: "http://localhost:8080/rest/arduinos",
// 	contentType: "application/json; charset=utf-8"
// })

	// .done(function(result) {
	// 	alert(result);
	// 	// 2-Build the list 
	// 	//var listItems= "";
	// })

	// .fail(function() {
	// })

	// .always(function() {
	// 	alert("Arduino list Ajax finished")
	// });