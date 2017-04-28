//var scene, camera, controls, renderer;
var CANVAS_WIDTH = 0;
var CANVAS_HEIGHT = 0;

//  The Geoms, the Materials and the Clouds are all Three.js objects
//  The Nodes, Edges, Faces and Zones are all arrays containing the parsed JSON file.
var nodes = []; // The Array of the Node Objects when parsed from the JSON File
var nodesGeom = null; // Nodes Geometry
var nodesMaterial = null; // Nodes Material
var nodesCloud = null; // Nodes Mesh

var edges = []; // Array of Edge Objects parsed from the JSON files
var edgesGeom = null; // Edges Geometry
var edgesMaterial = null; // Edges Material
var edgesCloud = null; //  Edges Mesh

var faces = []; // Array of Face Objects parsed from the JSON files
var facesGeoms = []; // Faces Geometry
var facesMaterials = []; // Faces Materials
var facesClouds = []; // Faces Meshes
var facesStats = []; // Some stats of the faces

var zones = []; // Array of Zone Objects parsed from the JSON files
var zonesCenter = new THREE.Vector3(); // Center for the whole geometry by averaging the center of all meshes as a Vector
var zonesGeoms = []; // Zones Geometry
var zonesMaterials = []; // Zones Materials
var zonesClouds = []; // Zones Meshes
var zonesStats = []; // Some stats of the zones

var ZONES = {};

var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();

var barycentricShrinkFactor = 1.00; //  A factor shrink the zone around the barycenter.
var separatingFactor = 0.0; // A factor to separate zones

var useVTK = false; // To load from a vtk file vs from a Json file

function initializeProgram(width, height) {

    CANVAS_WIDTH = width;
    CANVAS_HEIGHT = height;

    if (useVTK) {
        serverVTKResponse(DATA);

    } else {
        //$.getJSON("./models/decomposedTetra.json", serverJSONResponse); // Everything Runs from the CallBack here.
        serverJSONResponse(DATA);
    }
}

//  The Main Body of the Program
function serverJSONResponse(data) {
    resetData();

    parseData(data); // Parse the Data from the provided JSON

    initializeCameras(); // Initialize the Camera

    initializeLighting(); // Initialize the Lighting

    initializeRenderer(); //  Initialize the Renderer

    initializeCameraControls(); //  Initialize the Camera Controls

    initializeMeshes(); //  Initialize the Meshes/

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
            nodes[i] = data.nodes[i];
        }
    }

    nodesGeom = new THREE.Geometry();
    for (var i = 0; i < nodes.length; i++) {
        nodesGeom.vertices.push(
            new THREE.Vector3(nodes[i].position.x, nodes[i].position.y, nodes[i].position.z)
        );
    }

    nodesMaterial = new THREE.PointsMaterial({
        color: 0xf0f0f0,
        side: THREE.DoubleSide,
        size: 0.5
    });

    nodesCloud = new THREE.Points(nodesGeom, nodesMaterial);
}

//  Parses the Edges and creates the required Geometry
function parseEdges(data) {
    if (!useVTK) {
        for (var i = 0; i < data.edges.length; i++) {
            edges[i] = data.edges[i];
        }
    }

    edgesGeom = new THREE.Geometry();
    for (var i = 0; i < edges.length; i++) {
        edgesGeom.vertices.push(
            new THREE.Vector3(
                nodes[edges[i].connectivity.n[0]].position.x,
                nodes[edges[i].connectivity.n[0]].position.y,
                nodes[edges[i].connectivity.n[0]].position.z),
            new THREE.Vector3(
                nodes[edges[i].connectivity.n[1]].position.x,
                nodes[edges[i].connectivity.n[1]].position.y,
                nodes[edges[i].connectivity.n[1]].position.z)
        );
    }

    edgesMaterial = new THREE.LineBasicMaterial({
        color: 0xf0f0f0,
        linewidth: 4
    });

    edgesCloud = new THREE.Line(edgesGeom, edgesMaterial, THREE.LineSegments);
}

//  Parses the Faces and creates the required Geometry
function parseFaces(data) {
    if (!useVTK) {
        for (var i = 0; i < data.faces.length; i++) {
            faces[i] = data.faces[i];
        }
    }

    for (var i = 0; i < faces.length; i++) {
        facesGeoms[i] = new THREE.Geometry();

        for (var j = 0; j < nodes.length; j++) {
            facesGeoms[i].vertices.push(new THREE.Vector3(nodes[j].position.x, nodes[j].position.y, nodes[j].position.z));
        }

        var curZoneColor = Math.random() * 0xffffff;
        facesMaterials[i] = new THREE.MeshBasicMaterial({
            color: curZoneColor,
            side: THREE.DoubleSide
        });

        facesGeoms[i].faces.push(new THREE.Face3(faces[i].connectivity.n[0], faces[i].connectivity.n[1], faces[i].connectivity.n[2]));

        facesClouds[i] = new THREE.Mesh(facesGeoms[i], facesMaterials[i]);
        facesClouds[i].name = "Face : " + faces[i].idx;
    }

    for (var i = 0; i < faces.length; i++) {
        var faceNodes = faces[i].connectivity.n;
        var v1 = nodes[faceNodes[0]].position;
        var v2 = nodes[faceNodes[1]].position;
        var v3 = nodes[faceNodes[2]].position;
        facesStats.push({
            "inverseMeanRatio": computeFaceInverseMeanRatio(v1, v2, v3)
        });
    }
}

//  Parses the Zones and creates the required Geometry.
function parseZones(data) {
    if (!useVTK) {
        for (var i = 0; i < data.zones.length; i++) {
            zones[i] = data.zones[i];
            ZONES[i] = data.zones[i];
        }
    }
    console.log("ZONES",ZONES)
    // Calculate the center of the whole geometry
    //  Add together all the positions.
    for (var i = 0; i < zones.length; i++) {
        zonesCenter.x += zones[i].position.x;
        zonesCenter.y += zones[i].position.y;
        zonesCenter.z += zones[i].position.z;
    }
    //  Divide by the number of the positions.
    zonesCenter.x /= zones.length;
    zonesCenter.y /= zones.length;
    zonesCenter.z /= zones.length;

    // Calculate the minimum, maximum dihedral angles and their inverse mean ratio
    for (var i = 0; i < zones.length; i++) {
        var minDihedralAngle = Math.PI / 2;
        var maxDihedralAngle = 0.0;
        var inverseMeanRatio = 0.0;

        var zoneFaces = zones[i].connectivity.f;
        for (var j = 0; j < zoneFaces.length; j++) {
            var face = faces[zoneFaces[j]];

            var faceNodes = face.connectivity.n;
            var faceNormal = computeNormal(
                nodes[faceNodes[0]].position,
                nodes[faceNodes[1]].position,
                nodes[faceNodes[2]].position
            );

            var faceEdgesSet = {};
            for (var k = 0; k < 3; k++) {
                faceEdgesSet["" + Math.min(faceNodes[k], faceNodes[(k + 1) % 3]) + "-" + Math.max(faceNodes[k], faceNodes[(k + 1) % 3])] = true;
            }
            for (var k = j + 1; k < zoneFaces.length; k++) {
                var anotherFace = faces[zoneFaces[k]];
                for (var l = 0; l < 3; l++) {
                    var edgeStr = "" + Math.min(faceNodes[l], faceNodes[(l + 1) % 3]) + "-" + Math.max(faceNodes[l], faceNodes[(l + 1) % 3]);
                    if (faceEdgesSet.hasOwnProperty(edgeStr)) {
                        var anotherFaceNodes = anotherFace.connectivity.n;
                        var anotherFaceNormal = computeNormal(
                            nodes[anotherFaceNodes[0]].position,
                            nodes[anotherFaceNodes[1]].position,
                            nodes[anotherFaceNodes[2]].position
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

            inverseMeanRatio += facesStats[zoneFaces[j]].inverseMeanRatio;
        }
        zonesStats.push({
            "minDihedralAngle": minDihedralAngle,
            "maxDihedralAngle": maxDihedralAngle,
            "averageInverseMeanRatio": inverseMeanRatio / zoneFaces.length
        });
    }

    console.log(zonesStats);

    for (var i = 0; i < zones.length; i++) {
        zonesGeoms[i] = new THREE.Geometry();

        for (var j = 0; j < nodes.length; j++) {
            zonesGeoms[i].vertices.push(new THREE.Vector3(nodes[j].position.x, nodes[j].position.y, nodes[j].position.z));
        }

        var zoneFaces = zones[i].connectivity.f
        for (var j = 0; j < zoneFaces.length; j++) {
            var zoneFace = faces[zoneFaces[j]];
            var zoneFaceNodes = zoneFace.connectivity.n
            zonesGeoms[i].faces.push(new THREE.Face3(zoneFaceNodes[0], zoneFaceNodes[1], zoneFaceNodes[2]));
        }

        var curZoneColor = Math.random() * 0xffffff;
        zonesMaterials[i] = new THREE.MeshBasicMaterial({
            color: new THREE.Color(curZoneColor),
            side: THREE.DoubleSide
        });

        zonesClouds[i] = new THREE.Mesh(zonesGeoms[i], zonesMaterials[i]);
        zonesClouds[i].name = "Zone : " + zones[i].idx;
    }
}



// Parse data from VTK format
// Adapted from an example of Three.js
function getDataFromVTK(data) {
    var loader = new THREE.VTKLoader();
    var geometry = loader.parse(data);
    var pointAtt = geometry.getAttribute("position");

    for (var i = 0; i < pointAtt.count; i++) {
        nodes[i] = {
            "position": {
                "x": pointAtt.array[i * 3],
                "y": pointAtt.array[i * 3 + 1],
                "z": pointAtt.array[i * 3 + 2]
            }
        };
    }

    //var faceAtt = geometry.getAttribute("index");
    var faceAtt = geometry.getIndex();
    for (var i = 0; i < faceAtt.count / 3; i++) {
        faces[i] = {
            "connectivity": {
                "n": [faceAtt.array[i * 3], faceAtt.array[i * 3 + 1], faceAtt.array[i * 3 + 2]]
            }
        };
        zones[i] = {
            "position": {
                "x": (nodes[faceAtt.array[i * 3]].position.x + nodes[faceAtt.array[i * 3 + 1]].position.x + nodes[faceAtt.array[i * 3 + 2]].position.x) / 3.0,
                "y": (nodes[faceAtt.array[i * 3]].position.y + nodes[faceAtt.array[i * 3 + 1]].position.y + nodes[faceAtt.array[i * 3 + 2]].position.y) / 3.0,
                "z": (nodes[faceAtt.array[i * 3]].position.z + nodes[faceAtt.array[i * 3 + 1]].position.z + nodes[faceAtt.array[i * 3 + 2]].position.z) / 3.0
            },
            "connectivity": {
                "f": [i]
            }
        };
    }

    edges = [];
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

    initializeMeshes(); //  Initialize the Meshes.

    draw();
}

function resetData() {
    scene = new THREE.Scene(); // Three.js - Scene

    camera = null; // Three.js - Camera

    controls = null; // Three.js - Controls from TrackballControls.js

    renderer = null; // Three.js - Renderer.

    //  The Geoms, the Materials and the Clouds are all Three.js objects
    //  The Nodes, Edges, Faces and Zones are all arrays containing the parsed JSON file.
    nodes = []; // The Array of the Node Objects when parsed from the JSON File
    nodesGeom = null; // Nodes Geometry
    nodesMaterial = null; // Nodes Material
    nodesCloud = null; // Nodes Mesh

    edges = []; // Array of Edge Objects parsed from the JSON files
    edgesGeom = null; // Edges Geometry
    edgesMaterial = null; // Edges Material
    edgesCloud = null; //  Edges Mesh

    faces = []; // Array of Face Objects parsed from the JSON files
    facesGeoms = []; // Faces Geometry
    facesMaterials = []; // Faces Materials
    facesClouds = []; // Faces Meshes
    facesStats = []; // Some stats of the faces

    zones = []; // Array of Zone Objects parsed from the JSON files
    zonesCenter = new THREE.Vector3(); // Center for the whole geometry by averaging the center of all meshes as a Vector
    zonesGeoms = []; // Zones Geometry
    zonesMaterials = []; // Zones Materials
    zonesClouds = []; // Zones Meshes
    zonesStats = []; // Some stats of the zones

    separatingFactor = 0.0; // A factor to separate zones

    mouse = new THREE.Vector2();
    offset = new THREE.Vector3();

    barycentricShrinkFactor = 1.00;
}
