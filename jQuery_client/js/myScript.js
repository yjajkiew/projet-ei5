// use custom style on drop-down menu
// "mobileinit" is called when jQuery mobile load 
$(document).bind('mobileinit', function(){
	// overides drop-down menun style :
	$.mobile.selectmenu.prototype.options.nativeMenu = false;
	$.mobile.defaultPageTransition = "fade";

	// page loading widget settings
	$.mobile.loader.prototype.options.text = 'loading';
	$.mobile.loader.prototype.options.textVisible = 'false';
	$.mobile.loader.prototype.options.theme = 'a';
	$.mobile.loader.prototype.options.html = '';

	// get arduino list
	
});


$(document).ready(function() {
	// add reccurent html components : 
	// $('#arduinos').html('<h2> Choose arduino : </h2> <select name="arduinos" id="arduinos"> <option value="ard1">ard1</option> <option value="ard2">ard2</option> </select>');
	// $('#actions').html('<h2> Actions : </h2> <div data-role="controlgroup" data-type="horizontal"> <a href="#main" data-role="button" data-theme="a">Back</a> <a href="" data-role="button" data-theme="c">Reset</a> <a href="" data-role="button" data-theme="b">Send</a> </div>');
});

