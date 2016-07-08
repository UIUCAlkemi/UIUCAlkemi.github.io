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

});

//
$(window).load(function () {
    console.log("JQuery is now functional."); //  JQuery!
    initializeCanvas(); //  Initialize the Canvas!
    resizeCanvas();
    initializeInformationControls();
    initializeWebGL(); //  Start up WebGL

});

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

    console.log("Window Width : " + windowWidth);
    console.log("window Height : " + windowHeight);
    
    $('#canvasWrapper').width(windowWidth);
    $('#canvasWrapper').height(windowHeight);

    $('#canvas').attr({
        width: windowWidth,
        height: windowHeight
    });


    cWidth = windowWidth;
    cHeight = windowHeight;

    finalWidth  = windowWidth;
    finalHeight = windowHeight;

    resizeRenderer(cWidth, cHeight);
}


//  Web GL Begins Here!


function initializeWebGL() {
    initializeProgram(finalWidth, finalHeight); //
}