// use custom style on drop-down menu
// "mobileinit" is called BEFORE jQuery mobile load 
$(document).bind('mobileinit', function(){
    // overides drop-down menun style :
    $.mobile.selectmenu.prototype.options.nativeMenu = false;
    $.mobile.defaultPageTransition = "fade";

    // get arduino list
    // $( ".myButton" ).bind( "click", function(event, ui) {
    //     alert("some text");
    // });
});

//$('#test').html('jquery replacement');