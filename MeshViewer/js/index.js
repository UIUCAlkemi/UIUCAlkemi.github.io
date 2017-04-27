var targetWidth = window.innerWidth; //
var targetHeight = window.innerHeight; //
var targetAspectRatio = targetWidth / targetHeight; //

var canvasElement = null; //
var canvasHolder = null; //
var webglHolder = null; //

var ctx = null; //

var gl = null; //

var finalWidth = 0; //
var finalHeight = 0; //

//
$(document).ready(function () {
    initializeCanvas(); //  Initialize the Canvas!
    resizeCanvas();
    //initializeInformationControls();
    initializeWebGL(); //  Start up WebGL
});

/*function render(){
    initializeCanvas();
    resizeCanvas();
    initializeWebGL();
    //initializeControls();

}*/

function initializeControls(){
    ///Nothin yet
}
//
$(window).resize(function () {

    //  This is really where it is needed, if you want dynamic resizing. Doesn't quite work yet.
    resizeCanvas();
});

//
function initializeCanvas() {
    canvasElement = document.getElementById("canvas"); //  Get the canvas element.
}


//
function resizeCanvas() {

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    /*$('#canvasWrapper').width(windowWidth);
    $('#canvasWrapper').height(windowHeight);*/

    /*$('#canvas').attr({
        width: windowWidth,
        height: windowHeight
    });*/
    //console.log($("canvas").width())

    /*cWidth = windowWidth;
    cHeight = windowHeight;*/

    finalWidth  = $("canvas").width();
    finalHeight = $("canvas").height();

    resizeRenderer(finalWidth, finalHeight);
}


//  Web GL Begins Here!


function initializeWebGL() {
    initializeProgram(finalWidth, finalHeight); //
}
