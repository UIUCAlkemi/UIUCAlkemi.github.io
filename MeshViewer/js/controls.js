/*jshint esversion: 6 */
var DATA;

window.onload = function(){

    var file_input = document.getElementById('file_input');
    file_input.addEventListener('change', function(e) {

        var file = file_input.files[0];
        //Change input styling
        $(".file-container").text(file.name);
        $(".file-container").css("color", "#CCCCCC");

		var reader = new FileReader();

	    reader.onload = function(e) {

            if(file.name.substring(file.name.length-4) == ".vtk"){
                useVTK = true;
                DATA = reader.result;
                startRender();

            }
            else if(file.name.substring(file.name.length-5) == ".json"){
                useVTK = false;
                DATA = JSON.parse(reader.result);
                startRender();
            }

            else{ //TODO Not at all robust way to ensure correct file type input
                $(".file-container").css("color", "#CD5C5C");
                //Don't proceed with rendering.
            }
		};
	    reader.readAsText(file);
    });
};

$("#camera_control").on('click', function(){
    if (this.checked) {
        controls.enabled = true;
    }
    else {
        controls.enabled = false;
    }
});

$("#color_control").on('click', function(){
    var colormapFunc = "";
    if (this.checked) {
        colormapFunc = rainbowColormap;
    }
    else {
        colormapFunc = greyscaleColormap;
    }
    var fieldName = "minDihedralAngle";
    showColors(fieldName, colormapFunc);
});

$("#BarycentricShrinkingInput").on("input change", function () {
    barycentricShrinkFactor = this.value;
    $("#shrink_num").text(barycentricShrinkFactor);
    updateZoneBaryCentricShrinkingAndZoneSeparation();
});

$("#ZoneSeparationInput").on("input change", function () {
    separatingFactor = this.value;
    $("#zone_num").text(separatingFactor);
    updateZoneBaryCentricShrinkingAndZoneSeparation();
});

// FIll the Information Space with the Information from the selected zone
function fillSelectedZoneInformation(zoneNumber) {
    //Clear out prior data
    $(".zone-information").empty();
    if (useVTK){
        console.log(zoneNumber)
        $(".zone-information").text(zoneNumber);
        return;
    }

    var zone_information = {
        idxString:`IDX: ${zones[zoneNumber].idx}`,
        domainIdxString:`Domain ID: ${zones[zoneNumber].domainID}`,
        globalIdxString:`Global ID: ${zones[zoneNumber].globalID}`,
        positonString:`Position: (${zones[zoneNumber].position.x}, ${zones[zoneNumber].position.y}, ${zones[zoneNumber].position.z})`,
        classificationString: "Classification: ",
        geometry: "<br>GEOMETRY",
        geometryString: "",
        connectivity: "<br>CONNECTIVITY",
        nodesString:`Nodes: [${zones[zoneNumber].connectivity.n}]`,
        edgesString: `Edges: [${zones[zoneNumber].connectivity.e}]`,
        facesString: `Faces: [${zones[zoneNumber].connectivity.f}]`,
        sidesString: `Sides: [${zones[zoneNumber].connectivity.s}]`,
        cornersString:`Corners: [${zones[zoneNumber].connectivity.c}]`,
        zonesString: `Zones: [${zones[zoneNumber].connectivity.z_n}]`
    };


    for (var i = 0; i < zones[zoneNumber].classification.length; i++) {
        zone_information.classificationString += " " + zones[zoneNumber].classification[i];
    }


    for (var i = 0; i < zones[zoneNumber].geom.length; i++) {
        zone_information.geometryString += `(${zones[zoneNumber].geom[i].x }, ${zones[zoneNumber].geom[i].y}, ${zones[zoneNumber].geom[i].z})`;
    }


    for(var key in zone_information){
        $(".zone-information").append(zone_information[key] + "<br>");
    }

    console.log(zonesStats[zoneNumber].minDihedralAngle);

}
