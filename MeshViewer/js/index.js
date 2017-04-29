
/**
*TODO, display stats, add edges and faces for vtk,
*shrinking/separation for points, edges, faces
* transparency/opacity for materials, wireframe instead of edges??
*/

var ZONES = {}; //ZONE Objects
var CENTER = new THREE.Vector3(); //Geometry center
var NODES = {};//Node Objects
var EDGES = {};
var FACES = {};

var ACTIVE_GEOMETRY = "zones";

var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();

var barycentricShrinkFactor = 1.00; //  A factor shrink the zone around the barycenter.
var separatingFactor = 0.0; // A factor to separate zones

var useVTK = false; // To load from a vtk file vs from a Json file


/**
* Makes deep copy of and object.
* @param {Object} obj - object to be compied.
* @return {Object} - deep copy of above.
*/
function makeDeepCopy(obj){
    return JSON.parse(JSON.stringify(obj));
}

//  The Main Body of the Program
function serverJSONResponse(data) {
    resetData();

    parseData(data); // Parse the Data from the provided JSON

    initializeCameras(); // Initialize the Camera

    initializeLighting(); // Initialize the Lighting

    initializeRenderer(); //  Initialize the Renderer

    initializeCameraControls(); //  Initialize the Camera Controls

    initializeMeshes(ZONES); //  Initialize the Meshes/

    printZones();

    draw();

}


function parseData(data) {
    parseNodes(data);
    parseEdges(data);
    parseFaces(data);
    parseZones(data);
}

//  Parses the Nodes and creates the required Geometry
function parseNodes(data) {
    if (!useVTK) {
        for (var i = 0; i < data.nodes.length; i++) {
            NODES[i] = makeDeepCopy(data.nodes[i]);
        }
    }

    for(var node in NODES){

        NODES[node].geometry = new THREE.Geometry();
        NODES[node].geometry.vertices.push(new THREE.Vector3(NODES[node].position.x, NODES[node].position.y, NODES[node].position.z));

        NODES[node].material = new THREE.PointsMaterial({
            color: new THREE.Color(Math.random() * 0xffffff),
            side: THREE.DoubleSide,
            size: 0.5
        });

        NODES[node].mesh = new THREE.Points(NODES[node].geometry, NODES[node].material);
    }
}

//  Parses the Edges and creates the required Geometry
function parseEdges(data) {
    if (!useVTK) {
        for (var i = 0; i < data.edges.length; i++) {
            EDGES[i] = makeDeepCopy(data.edges[i]);
        }
    }

    for (var edge in EDGES) {
        EDGES[edge].geometry = new THREE.Geometry();
        EDGES[edge].geometry.vertices.push(
            new THREE.Vector3(
                NODES[EDGES[edge].connectivity.n[0]].position.x,
                NODES[EDGES[edge].connectivity.n[0]].position.y,
                NODES[EDGES[edge].connectivity.n[0]].position.z),
            new THREE.Vector3(
                NODES[EDGES[edge].connectivity.n[1]].position.x,
                NODES[EDGES[edge].connectivity.n[1]].position.y,
                NODES[EDGES[edge].connectivity.n[1]].position.z)
        );

        EDGES[edge].material = new THREE.LineBasicMaterial({
            color: new THREE.Color(Math.random() * 0xffffff),
            linewidth: 1
        });

        EDGES[edge].mesh = new THREE.Line(EDGES[edge].geometry, EDGES[edge].material);
    }


}

//  Parses the Faces and creates the required Geometry
function parseFaces(data) {
    if (!useVTK) {
        for (var i = 0; i < data.faces.length; i++) {
            FACES[i] = makeDeepCopy(data.faces[i]);
        }
    }

    for (var face in FACES) {

        //Calculate inverseMeanRatio
        var faceNodes = FACES[face].connectivity.n;
        var v1 = NODES[faceNodes[0]].position;
        var v2 = NODES[faceNodes[1]].position;
        var v3 = NODES[faceNodes[2]].position;
        FACES[face].inverseMeanRatio = computeFaceInverseMeanRatio(v1, v2, v3);

        //Set up face geometry
        FACES[face].geometry = new THREE.Geometry();

        for(var node in NODES) {
            FACES[face].geometry.vertices.push(new THREE.Vector3(NODES[node].position.x, NODES[node].position.y, NODES[node].position.z));
        }

        FACES[face].material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(Math.random() * 0xffffff),
            side: THREE.DoubleSide
        });

        FACES[face].geometry.faces.push(new THREE.Face3(FACES[face].connectivity.n[0], FACES[face].connectivity.n[1], FACES[face].connectivity.n[2]));

        FACES[face].mesh = new THREE.Mesh(FACES[face].geometry, FACES[face].material);
        FACES[face].mesh.name = "Face : " + FACES[face].idx;
    }
}

//  Parses the Zones and creates the required Geometry.
function parseZones(data) {
    if (!useVTK) {
        for (var i = 0; i < data.zones.length; i++) {
            //zones[i] = data.zones[i];
            ZONES[i] = makeDeepCopy(data.zones[i]);
        }
    }
    //console.log("FACES",ZONES)

    setGeometryCenter();
    var zone, node; //iterators

    // Calculate the minimum, maximum dihedral angles and their inverse mean ratio
    for (zone in ZONES) {
        var minDihedralAngle = Math.PI / 2;
        var maxDihedralAngle = 0.0;
        var inverseMeanRatio = 0.0;

        var zoneFaces = ZONES[zone].connectivity.f;
        for (var j = 0; j < zoneFaces.length; j++) {
            var face = FACES[zoneFaces[j]];

            var faceNodes = face.connectivity.n;
            var faceNormal = computeNormal(
                NODES[faceNodes[0]].position,
                NODES[faceNodes[1]].position,
                NODES[faceNodes[2]].position
            );

            var faceEdgesSet = {};
            for (var k = 0; k < 3; k++) {
                faceEdgesSet["" + Math.min(faceNodes[k], faceNodes[(k + 1) % 3]) + "-" + Math.max(faceNodes[k], faceNodes[(k + 1) % 3])] = true;
            }
            for (var k = j + 1; k < zoneFaces.length; k++) {
                var anotherFace = FACES[zoneFaces[k]];
                for (var l = 0; l < 3; l++) {
                    var edgeStr = "" + Math.min(faceNodes[l], faceNodes[(l + 1) % 3]) + "-" + Math.max(faceNodes[l], faceNodes[(l + 1) % 3]);
                    if (faceEdgesSet.hasOwnProperty(edgeStr)) {
                        var anotherFaceNodes = anotherFace.connectivity.n;
                        var anotherFaceNormal = computeNormal(
                            NODES[anotherFaceNodes[0]].position,
                            NODES[anotherFaceNodes[1]].position,
                            NODES[anotherFaceNodes[2]].position
                        );
                        var dihedralAngle = computeDihedralAngle(faceNormal, anotherFaceNormal);
                        if (dihedralAngle > maxDihedralAngle) {
                            maxDihedralAngle = dihedralAngle;
                        }
                        if (dihedralAngle < minDihedralAngle) {
                            minDihedralAngle = dihedralAngle;
                        }
                    }
                }
            }

            inverseMeanRatio += FACES[zoneFaces[j]].inverseMeanRatio;
        }
        ZONES[zone].minDihedralAngle = minDihedralAngle;
        ZONES[zone].maxDihedralAngle = maxDihedralAngle;
        ZONES[zone].averageInverseMeanRatio = inverseMeanRatio / zoneFaces.length;
    }


    for (zone in ZONES) {
        ZONES[zone].geometry = new THREE.Geometry();

        for (node in NODES) {
            ZONES[zone].geometry.vertices.push(new THREE.Vector3(NODES[node].position.x, NODES[node].position.y, NODES[node].position.z));

        }

        var zoneFaces = ZONES[zone].connectivity.f
        for (var j = 0; j < zoneFaces.length; j++) {
            var zoneFace = FACES[zoneFaces[j]];
            var zoneFaceNodes = zoneFace.connectivity.n;
            ZONES[zone].geometry.faces.push(new THREE.Face3(zoneFaceNodes[0], zoneFaceNodes[1], zoneFaceNodes[2]));
        }

        ZONES[zone].material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(Math.random() * 0xffffff),
            side: THREE.DoubleSide
        });

        ZONES[zone].mesh = new THREE.Mesh(ZONES[zone].geometry, ZONES[zone].material);
        ZONES[zone].mesh.name = "Zone : " + ZONES[zone].idx;
    }
}

// Parse data from VTK format
// Adapted from an example of Three.js
function getDataFromVTK(data) {
    var loader = new THREE.VTKLoader();
    var geometry = loader.parse(data);


    var pointAtt = geometry.getAttribute("position");

    for (var i = 0; i < pointAtt.count; i++) {
        NODES[i] = {
            position: {
                x: pointAtt.array[i * 3],
                y : pointAtt.array[i * 3 + 1],
                z: pointAtt.array[i * 3 + 2]
            }
        };
    }

    var faceAtt = geometry.getIndex();
    for (var i = 0; i < faceAtt.count / 3; i++) {
        FACES[i] = {
            connectivity: {
                n: [faceAtt.array[i * 3], faceAtt.array[i * 3 + 1], faceAtt.array[i * 3 + 2]]
            }
        };
        ZONES[i] = {
            position: {
                x: (NODES[faceAtt.array[i * 3]].position.x + NODES[faceAtt.array[i * 3 + 1]].position.x + NODES[faceAtt.array[i * 3 + 2]].position.x) / 3.0,
                y: (NODES[faceAtt.array[i * 3]].position.y + NODES[faceAtt.array[i * 3 + 1]].position.y + NODES[faceAtt.array[i * 3 + 2]].position.y) / 3.0,
                z: (NODES[faceAtt.array[i * 3]].position.z + NODES[faceAtt.array[i * 3 + 1]].position.z + NODES[faceAtt.array[i * 3 + 2]].position.z) / 3.0
            },
            connectivity: {
                f: [i]
            }
        };
    }

    edges = []; //TODO What?
}


//  The Main Body of the Program when loading from vtk
function serverVTKResponse(data) {
    resetData();

    getDataFromVTK(data);

    parseData(data); // Parse the Data from the provided JSON

    initializeCameras(); // Initialize the Camera

    initializeLighting(); // Initialize the Lighting

    initializeRenderer(); //  Iniitialize the Renderer

    initializeCameraControls(); //  Initialize the Camera Controls.

    initializeMeshes(ZONES); //  Initialize the Meshes.

    printZones();
    draw();
}

function resetData() {
    scene = new THREE.Scene(); // Three.js - Scene

    camera = null; // Three.js - Camera

    controls = null; // Three.js - Controls from TrackballControls.js

    renderer = null; // Three.js - Renderer.

    CENTER = new THREE.Vector3();
    ZONES = {};
    NODES = {};
    EDGES = {};
    FACES = {};

    separatingFactor = 0.0; // A factor to separate zones

    mouse = new THREE.Vector2();
    offset = new THREE.Vector3();

    barycentricShrinkFactor = 1.00;
}
