// use custom style on drop-down menu
// "mobileinit" is called when jQuery mobile load 
$(document).bind('mobileinit', function(){
	// overides drop-down menun style :
	//$.mobile.selectmenu.prototype.options.nativeMenu = false;
	$.mobile.defaultPageTransition = "fade";

	// page loading widget settings
	$.mobile.loader.prototype.options.text = 'loading';
	$.mobile.loader.prototype.options.textVisible = 'false';
	$.mobile.loader.prototype.options.theme = 'a';
	$.mobile.loader.prototype.options.html = '';
});