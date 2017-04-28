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

    /*if(ACTIVE_GEOMETRY == "zones"){ //TODO fix
        return;
    }*/
    //Clear out prior data
    $(".zone-information").empty();
    /*if (useVTK){
        $(".zone-information").text(zoneNumber);
        return;
    }*/
    var key;
    var general_info = {
        "IDX": ZONES[zoneNumber].idx,
        "Domain ID": ZONES[zoneNumber].domainID,
        "Global ID": ZONES[zoneNumber].globalID,
        "Position": `(${ZONES[zoneNumber].position.x}, ${ZONES[zoneNumber].position.y}, ${ZONES[zoneNumber].position.z})`,
        "Classification": ZONES[zoneNumber].classification.join(", "),
        "Min. DA": ZONES[zoneNumber].minDihedralAngle,
        "Max. DA": ZONES[zoneNumber].maxDihedralAngle,
        "Avg. IMR": ZONES[zoneNumber].averageInverseMeanRatio
    };

    for(key in general_info){
        $("#general_info").append(`${key}: ${general_info[key]}` + "<br>");
    }

    //Adding geometry info
    $("#geometry_info").append("<br><label>GEOMETRY<label><br>");
    for (var i = 0; i < ZONES[zoneNumber].geom.length; i++) {
        $("#geometry_info").append(`(${ZONES[zoneNumber].geom[i].x }, ${ZONES[zoneNumber].geom[i].y}, ${ZONES[zoneNumber].geom[i].z})<br>`);
    }

    //Adding connectivity info
    var connectivity_info = {
        "Nodes": `[${ZONES[zoneNumber].connectivity.n.join(", ")}]`,
        "Edges": `[${ZONES[zoneNumber].connectivity.e.join(", ")}]`,
        "Faces": `[${ZONES[zoneNumber].connectivity.f.join(", ")}]`,
        "Sides": `[${ZONES[zoneNumber].connectivity.s.join(", ")}]`,
        "Corners": `[${ZONES[zoneNumber].connectivity.c.join(", ")}]`,
        "Zones": `[${ZONES[zoneNumber].connectivity.z_n.join(", ")}]`
    };

    $("#connectivity_info").append("<br><label>CONNECTIVITY<label><br>");
    for(key in connectivity_info){
        $("#connectivity_info").append(`${key}: ${connectivity_info[key]}` + "<br>");
    }

}
