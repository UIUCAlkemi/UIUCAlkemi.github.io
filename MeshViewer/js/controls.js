// On Click events for the controlller

function initializeInformationControls() {

    $("#myonoffswitch-camera").click(function(){
        if (this.checked) {
          enableControls();
        } else {
          disableControls();
        }
    });

   $("#SelectZoneButton").click(function () {
        $("#CameraControlsDisplay").css("display", "none");
        $("#ZoneInformationDisplayWrapper").css("display", "table-cell");
        $("#BarycentricControlDisplay").css("display", "none");
        $("#ShowColorDisplay").css("display", "none");
        $("#ZoneSeparationControlDisplay").css("display", "none");
        $("#LoadSourceControlDisplay").css("display", "none");
        enableZoneSelect();
        $("#ZoneGeneralInformation").html();
        $("#ZoneGeometryInformation").html();
        $("#ZoneConnectivityInformation").html();

    });


    $("#BarycentricShrinkingInput").on("input change", function () {
        barycentricShrinkFactor = this.value;
        updateZoneBaryCentricShrinking();
    });


  /*  $("#ShowColorControlUpdate").click(function () {
        var colormapFunc = greyscaleColormap;
        if (document.getElementById("showRainbow").checked) {
            colormapFunc = rainbowColormap;
        }
        var fieldName = "minDihedralAngle";
        if (document.getElementById("showMaxDihedralAngle").checked) {
            fieldName = "maxDihedralAngle";
        } else if (document.getElementById("showAverageMeanInverseRatio").checked) {
            fieldName = "averageInverseMeanRatio";
        }
        showColors(fieldName, colormapFunc);
    });

    $("#ShowColorControlReset").click(function () {
        showRandomColors();
    }); */

    $("#myonoffswitch-color").click(function(){
        var colormapFunc = "";
        if (this.checked) {
          colormapFunc = rainbowColormap;
        } else {
          colormapFunc = greyscaleColormap;
        }
        var fieldName = "minDihedralAngle";
        showColors(fieldName, colormapFunc);
    });


    $("#ZoneSeparationInput").on("input change", function () {
        separatingFactor = this.value;
        separateZones();
    });

    $("#LoadSourceButton").click(function () {
        $("#CameraControlsDisplay").css("display", "none");
        $("#ZoneInformationDisplayWrapper").css("display", "none");
        $("#BarycentricControlDisplay").css("display", "none");
        $("#ShowColorDisplay").css("display", "none");
        $("#ZoneSeparationControlDisplay").css("display", "none");
        $("#LoadSourceControlDisplay").css("display", "table-cell");
        disableZoneSelect();
    });

    $("#LoadSourceControlUpdate").click(function () {
        if (document.getElementById("loadVTK").checked) {
            useVTK = true;
            $.get('./models/polyex.vtk', serverVTKResponse, 'text');
        } else if (document.getElementById("loadJSON").checked) {
            useVTK = false;
            $.getJSON("./models/decomposedTetra.json", serverJSONResponse);
        }
    });

}

// FIll the Information Space with the Information from the selected zone
function fillSelectedZoneInformation(zoneNumber) {
    if (useVTK) {
        $("#ZoneGeneralInformation").html("You have selected zone " + zoneNumber);
        $("#ZoneGeometryInformation").html("You have selected zone " + zoneNumber);
        $("#ZoneConnectivityInformation").html("You have selected zone " + zoneNumber);
        return;
    }

    var idxString = "";
    var domainIdxString = "";
    var globalIdxString = "";
    var positonString = "";
    var classificationString = "";

    idxString = "IDX : " + zones[zoneNumber].idx;
    domainIdxString = "DomainID : " + zones[zoneNumber].domainID;
    globalIdxString = "Global ID : " + zones[zoneNumber].globalID;
    positonString = "Position: (X : " + zones[zoneNumber].position.x + " , Y : " + zones[zoneNumber].position.y + " , Z : " + zones[zoneNumber].position.z + " )";
    classificationString = " Classification : ";
    for (var i = 0; i < zones[zoneNumber].classification.length; i++) {
        classificationString = classificationString + " " + zones[zoneNumber].classification[i] + " ";
    }

    $("#ZoneGeneralInformation").html("" + idxString + " <br> <br> " + domainIdxString + " <br> <br> " + globalIdxString + " <br> <br> " + positonString + " <br> <br> " + classificationString);

    var geometryString = "";
    for (var i = 0; i < zones[zoneNumber].geom.length; i++) {
        geometryString = geometryString + "(X : " + zones[zoneNumber].geom[i].x + " , Y : " + zones[zoneNumber].geom[i].y + " , Z : " + zones[zoneNumber].geom[i].z + " ) <br>";
    }
    $("#ZoneGeometryInformation").html("" + geometryString);

    var connectivityString = "Connectivity : <br>  Nodes : [" + zones[zoneNumber].connectivity.n + "] <br> Edges : [" + zones[zoneNumber].connectivity.e + "] <br> Faces : [" +
        zones[zoneNumber].connectivity.f + "] <br> Sides : [" + zones[zoneNumber].connectivity.s + "] <br> Corners : [ " + zones[zoneNumber].connectivity.c + "] <br> Zones : [" + zones[zoneNumber].connectivity.z_n + "]";
    $("#ZoneConnectivityInformation").html("" + connectivityString);

}
