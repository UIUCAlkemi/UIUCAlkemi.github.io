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
                console.log("DATA",DATA)
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

        $(".zone-information").text(zoneNumber);
        return;
    }

    var zone_information = {
        idxString:`IDX: ${ZONES[zoneNumber].idx}`,
        domainIdxString:`Domain ID: ${ZONES[zoneNumber].domainID}`,
        globalIdxString:`Global ID: ${ZONES[zoneNumber].globalID}`,
        positonString:`Position: (${ZONES[zoneNumber].position.x}, ${ZONES[zoneNumber].position.y}, ${ZONES[zoneNumber].position.z})`,
        classificationString: "Classification: ",
        geometry: "<br>GEOMETRY",
        geometryString: "",
        connectivity: "<br>CONNECTIVITY",
        nodesString:`Nodes: [${ZONES[zoneNumber].connectivity.n}]`,
        edgesString: `Edges: [${ZONES[zoneNumber].connectivity.e}]`,
        facesString: `Faces: [${ZONES[zoneNumber].connectivity.f}]`,
        sidesString: `Sides: [${ZONES[zoneNumber].connectivity.s}]`,
        cornersString:`Corners: [${ZONES[zoneNumber].connectivity.c}]`,
        zonesString: `Zones: [${ZONES[zoneNumber].connectivity.z_n}]`
    };


    for (var i = 0; i < ZONES[zoneNumber].classification.length; i++) {
        zone_information.classificationString += " " + ZONES[zoneNumber].classification[i];
    }


    for (var i = 0; i < ZONES[zoneNumber].geom.length; i++) {
        zone_information.geometryString += `(${ZONES[zoneNumber].geom[i].x }, ${ZONES[zoneNumber].geom[i].y}, ${ZONES[zoneNumber].geom[i].z})`;
    }


    for(var key in zone_information){
        $(".zone-information").append(zone_information[key] + "<br>");
    }

}
