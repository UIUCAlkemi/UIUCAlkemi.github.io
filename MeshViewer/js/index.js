var targetWidth = 1920; //
var targetHeight = 1080; //
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
    $('#fullpage').fullpage({
        scrollBar: true
    });

    $.fn.fullpage.setMouseWheelScrolling(false);
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
    //    resizeCanvas();                               //  This is really where it is needed, if you want dynamic resizing. Doesn't quite work yet.
});

//  
function initializeCanvas() {
    canvasElement = document.getElementById("Canvas"); //  Get the canvas element.
    canvasHolder = $("#canvasHolder"); //  Get the div holding the canvas.
    webglHolder = $("#webglHolder"); // Get the innermost div.
}

//  
function printDimensions() {
    // Lots of console output - very useful - sometimes.
    console.log("Canvas Element Width : " + canvasElement.width);
    console.log("Canvas Element Height : " + canvasElement.height);

    console.log("Canvas Holder Style Width : " + canvasHolder.width() + " .");
    console.log("Canvas Holder Style Height : " + canvasHolder.height() + " .");

    console.log("webglHolder Style Width : " + webglHolder.width() + " .");
    console.log("webglHolder Style Height : " + webglHolder.height() + " .");

    console.log("Browser Style Width : " + window.innerWidth + " .");
    console.log("Browser Style Height : " + window.innerHeight + " .");
}

//  
function resizeCanvas() {
    // Resize the Canvas.
    var maxavailableWidth = (webglHolder.width() > window.innerWidth) ? window.innerWidth : webglHolder.width();
    var maxavailableHeight = (webglHolder.height() > window.innerHeight) ? window.innerHeight : webglHolder.height();
    var availableWidth = maxavailableWidth * 0.95; //  Take up some % of the available width.
    var availableHeight = maxavailableHeight * 0.95; //  Take up some % of the available height.
    var cWidth = targetWidth; //  
    var cHeight = targetHeight; //

    var scaleFactor = 1.0; //  



    if (cHeight > availableHeight) //  Check if it bound by the height
    {
        scaleFactor = availableHeight / cHeight; //  Calculate the scale, and scale down
        console.log("Scale Factor H : " + scaleFactor); //  This ensures that we are always within the height
        cWidth = cWidth * scaleFactor; //  
        cHeight = cHeight * scaleFactor; //  
    }

    if (cWidth > availableWidth) //  Check if it is then bound by the width
    {
        scaleFactor = availableWidth / cWidth; //  Calculate the scale, and scale down
        console.log("Scale Factor W : " + scaleFactor); //  This ensures that we are always within the width
        cWidth = cWidth * scaleFactor; //  
        cHeight = cHeight * scaleFactor; //  
    }

    // Now we are both within the width and the height.

    console.log("Width : " + cWidth);
    console.log("Height : " + cHeight);
    console.log("Aspect Ratio : " + cWidth / cHeight); //

    canvasHolder.width(cWidth); //
    canvasHolder.height(cHeight); //

    finalHeight = cHeight;
    finalWidth = cWidth;

    var newXCoord = (webglHolder.width() - cWidth) / 2 + webglHolder.position().left; //
    var newYCoord = (webglHolder.height() - cHeight) / 2 + webglHolder.position().top; //

    console.log("New X Coords : " + newXCoord); //
    console.log("New Y Coords : " + newYCoord); //

    canvasHolder.offset({
        left: newXCoord,
        top: newYCoord
    }); //

    console.log("Current X Coords : " + canvasHolder.offset().left); //
    console.log("Current Y Coords : " + canvasHolder.offset().top); //

    //  printDimensions();
}


//  Web GL Begins Here!


function initializeWebGL() {
    initializeProgram(finalWidth, finalHeight); //
}