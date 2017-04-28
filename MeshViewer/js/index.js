var finalWidth = 0; //
var finalHeight = 0; //

//
/*$(document).ready(function () {
    resizeCanvas();
    //initializeInformationControls();
    initializeProgram(finalWidth, finalHeight); //  Start up WebGL
});*/

function startRender(){
    resizeCanvas();
    initializeProgram(finalWidth, finalHeight);
}

//
$(window).resize(function () {
    resizeCanvas();
});

//
function resizeCanvas() {

    cWidth = window.innerWidth*0.76;
    cHeight = window.innerHeight;

    $('canvas').attr({
        width: cWidth,
        height: cHeight
    });

    finalWidth  = cWidth;
    finalHeight = cHeight;

    resizeRenderer(cWidth, cHeight);
}
