var scene = null; // Three.js - Scene

var camera = null; // Three.js - Camera

var controls = null; // Three.js - Controls from TrackballControls.js

var renderer = null; // Three.js - Renderer.
var screen_width = 0; // Width of the WebGL Space - not the whole screen.
var screen_height = 0; // Height of the WebGL Space - not the whole screen.

var myCanvas = null; // The Canvas from the HTML document.

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


var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();

var zoneSelect = false; //  Boolean to see whether the user wants to select the Zone
var barycentricShrinkFactor = 0.0; //  A factor shrink the zone around the barycenter.
var separatingFactor = 0.0; // A factor to separate zones

var useVTK = false; // To load from a vtk file vs from a Json file

function initializeProgram(width, height) {
    //showOverlay(); // Set the overlay - so that nothing is rendered till the JSON request completes.

    createScene(width, height); // Create the scene.
    if (useVTK) {
        $.get('./models/polyex.vtk', serverVTKResponse, 'text');
        //serverVTKResponse(DATA);

    } else {
        $.getJSON("./models/decomposedTetra.json", serverJSONResponse); // Everything Runs from the CallBack here.
        //serverJSONResponse(DATA);
    }
}

//  Create the Three.js Scene with the given Width and Height
function createScene(width, height) {
    screen_width = width;
    screen_height = height;
}

//  The Main Body of the Program
function serverJSONResponse(data) {
    console.log(data)
    resetData();

    parseData(data); // Parse the Data from the provided JSON

    initializeCameras(); // Initialize the Camera

    initializeLighting(); // Initialize the Lighting

    initializeRenderer(); //  Initialize the Renderer

    initializeCameraControls(); //  Initialize the Camera Controls

    initializeMeshes(); //  Initialize the Meshes/

    draw();
}

function initializeCameras() {
    camera = new THREE.PerspectiveCamera(60.0, screen_width / screen_height, 1, 1000);
    camera.position.z = 20;
    camera.position.y = 20;
    camera.position.x = 20;
    camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
    scene.add(camera);
}

function initializeCameraControls() {
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 2.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.6;
}


//  Currently the Lighting has no effect - intentionally.
function initializeLighting() {
    var light = new THREE.AmbientLight(0xffffff); // white light
    scene.add(light);
}

function initializeRenderer() {
    // Create and set Renderer.
    myCanvas = $("canvas");
    renderer = new THREE.WebGLRenderer({
        antialias: true, // Set antialiasing to be true
        canvas: myCanvas.get(0),
        alpha: true
    });

    renderer.autoClear = false;

    //  The Callbacks on the renderer - for mouse down, mouse move, move up
    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);

    resizeRenderer(screen_width, screen_height);
}

//  On Mouse Move Callback
function onDocumentMouseMove(event) {

    event.preventDefault();
    mouse.x = (cursorPositionInCanvas(renderer.domElement, event)[0]) / $("canvas").width() * 2 - 1;
    mouse.y = -(cursorPositionInCanvas(renderer.domElement, event)[1]) / $("canvas").height() * 2 + 1;
}

function cursorPositionInCanvas(canvas, event) {
    var x, y;

    canoffset = $(canvas).offset();
    x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
    y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

    return [x, y];
}

//  On Mouse Down Callback
function onDocumentMouseDown(event) {
    event.preventDefault();

    mouse.x = ((cursorPositionInCanvas(renderer.domElement, event)[0]) / $("canvas").width()) * 2 - 1;
    mouse.y = (-(cursorPositionInCanvas(renderer.domElement, event)[1]) / $("canvas").height()) * 2 + 1;

    //if (zoneSelect === true) {
        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);

        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

        var intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            
            var obj_name = intersects[0].object.name;
            console.log(obj_name.split(" ")[2]);
            fillSelectedZoneInformation(obj_name.split(" ")[2]);
        }
    //}
}

//  On Mouse Up Callback
function onDocumentMouseUp(event) {
    event.preventDefault();
}

function draw() {
    requestAnimationFrame(draw);
    update();
    render();
}

function render() {
    renderer.clear();

    renderer.render(scene, camera);
}

function update() {
    controls.update(); // Update the Controls
}

function resizeRenderer(newWidth, newHeight) {
    if (renderer !== null) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    }
}

function enableControls() {
    controls.enabled = true;
}

function disableControls() {
    controls.enabled = false;
}

function enableZoneSelect() {
    zoneSelect = true;
}

function disableZoneSelect() {
    zoneSelect = false;
}

function initializeMeshes() {
    //  Add the Zones
    for (var i = 0; i < zonesClouds.length; i++) {
        scene.add(zonesClouds[i]);
    }
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
        }
    }

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

    //console.log(zonesStats);

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

// Compute the normal of a face given three nodes each represented by an 3d object
// Assuming the three nodes are not on a line
function computeNormal(n1, n2, n3) {
    var v1 = [n2.x - n1.x, n2.y - n1.y, n2.z - n1.z];
    var v2 = [n3.x - n1.x, n3.y - n1.y, n3.z - n1.z];
    var normal = computeCrossProduct(v1, v2);
    var normalLen = Math.sqrt(computeInnerProduct(normal, normal));
    var normalVector = new THREE.Vector3(
        normal[0] / normalLen,
        normal[1] / normalLen,
        normal[2] / normalLen
    );
    return normalVector;
}

// Compute the cross product of two vectors each represented by an array
function computeCrossProduct(v1, v2) {
    var crossProduct = [];
    var len = v1.length;
    for (var i = 0; i < len; i++) {
        crossProduct.push(v1[(i + 1) % len] * v2[(i + 2) % len] - v1[(i + 2) % len] * v2[(i + 1) % len]);
    }
    return crossProduct;
}

// Compute the dihedral angle between two planes given their normals each represented by an array
function computeDihedralAngle(normal1, normal2) {
    return Math.acos(Math.abs(computeInnerProduct(
        [normal1.x, normal1.y, normal1.z], [normal2.x, normal2.y, normal2.z])));
}

// Compute the inner product of two vectors each represented by an array
function computeInnerProduct(v1, v2) {
    var innerProduct = 0.0;
    for (var i = 0; i < v1.length; i++) {
        innerProduct += v1[i] * v2[i];
    }
    return innerProduct;
}

// Compute the inverse mean ratio for a triangle face
function computeFaceInverseMeanRatio(v1, v2, v3) {
    var optimalMatrix = [[1.0, 0.5], [0.0, Math.sqrt(3.0) / 2.0]];
    var optimalMatrixInverse = inverse2d2(optimalMatrix);

    var e1 = [v2.x - v1.x, v2.y - v1.y, v2.z - v1.z];
    var x1 = Math.sqrt(computeInnerProduct(e1, e1));
    var e2 = [v3.x - v1.x, v3.y - v1.y, v3.z - v1.z];
    var x2 = computeInnerProduct(e1, e2) / x1;
    var y2e = [e2[0] - e1[0] / x1 * x2, e2[1] - e1[1] / x1 * x2, e2[2] - e1[2] / x1 * x2];
    var y2 = Math.sqrt(computeInnerProduct(y2e, y2e));
    var incidenceMatrix = [[x1, x2], [0.0, y2]];

    var matrixA = multiply2d2(incidenceMatrix, optimalMatrixInverse);
    var detA = determinant2d2(matrixA);

    var inverseMeanRatio = (matrixA[0][0] * matrixA[0][0] + matrixA[0][1] * matrixA[0][1] +
        matrixA[1][0] * matrixA[1][0] + matrixA[1][1] * matrixA[1][1]) / (2.0 * Math.abs(detA));

    return inverseMeanRatio;
}

// the determinant of a 2*2 matrix
function determinant2d2(matrix) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
}

// the inverse of a 2*2 matrix
function inverse2d2(matrix) {
    var det = determinant2d2(matrix);
    return [[matrix[1][1] / det, -matrix[0][1] / det], [-matrix[1][0] / det, matrix[0][0] / det]];
}

// multiply two 2*2 matrix
function multiply2d2(matrix1, matrix2) {
    return [
        [matrix1[0][0] * matrix2[0][0] + matrix1[0][1] * matrix2[1][0], matrix1[0][0] * matrix2[0][1] + matrix1[0][1] * matrix2[1][1]],
        [matrix1[1][0] * matrix2[0][0] + matrix1[1][1] * matrix2[1][0], matrix1[1][0] * matrix2[0][1] + matrix1[1][1] * matrix2[1][1]]
    ];
}

// show random colors in meshes
function showRandomColors() {
    for (var i = 0; i < zones.length; i++) {
        var curZoneColor = Math.random() * 0xffffff;
        zonesMaterials[i].color = new THREE.Color(curZoneColor);
        zonesClouds[i].material.needsUpdate = true;
    }
}

// Change the color of the mesh according to some stat field and some function here
function showColors(fieldName, colormapFunc) {
    var fMet = false;
    var fMax = 0.0;
    var fMin = 0.0;
    for (var i = 0; i < zonesStats.length; i++) {
        var fVal = zonesStats[i][fieldName];
        if (!fMet || fVal > fMax) {
            fMax = fVal;
        }
        if (!fMet || fVal < fMin) {
            fMin = fVal;
        }
        fMet = true;
    }
    for (var i = 0; i < zones.length; i++) {
        var fVal = zonesStats[i][fieldName];
        var fColor = colormapFunc(fVal, fMin, fMax);
        zonesMaterials[i].color = new THREE.Color("rgb(" + fColor[0] + ", " + fColor[1] + ", " + fColor[2] + ")");
        zonesClouds[i].material.needsUpdate = true;
    }
}

// The infamous rainbow color map, normalized to the data range
function rainbowColormap(fVal, fMin, fMax) {
    var dx = 0.8;
    var fValNormalized = (fVal - fMin) / (fMax - fMin);
    var g = (6.0 - 2.0 * dx) * fValNormalized + dx;
    var R = Math.max(0.0, (3.0 - Math.abs(g - 4.0) - Math.abs(g - 5.0)) / 2.0) * 255;
    var G = Math.max(0.0, (4.0 - Math.abs(g - 2.0) - Math.abs(g - 4.0)) / 2.0) * 255;
    var B = Math.max(0.0, (3.0 - Math.abs(g - 1.0) - Math.abs(g - 2.0)) / 2.0) * 255;
    color = [Math.round(R), Math.round(G), Math.round(B), 255];
    return color;
}

// The greyscale color map
function greyscaleColormap(fVal, fMin, fMax) {
    var c = 255 * ((fVal - fMin) / (fMax - fMin));
    var color = [Math.round(c), Math.round(c), Math.round(c), 255];
    return color;
}


// To conduct bary centric shrinking on each zone
function updateZoneBaryCentricShrinkingAndZoneSeparation() {

    //  For Each Zone,
    for (var i = 0; i < zonesClouds.length; i++) {


        //  I'm not really sure how this works again.
        //  But we don't fix what is not broken.
        var cartesianByCenter = new THREE.Vector3(
            zones[i].position.x - zonesCenter.x,
            zones[i].position.y - zonesCenter.y,
            zones[i].position.z - zonesCenter.z);

        var movePolar = cartesianToPolar(cartesianByCenter);
        movePolar.w *= separatingFactor;
        var move = polarToCartesian(movePolar);

        //   Find the center of the zone.
        var centerX = zones[i].position.x;
        var centerY = zones[i].position.y;
        var centerZ = zones[i].position.z;

        //  For Each Node within the Zone
        for (var j = 0; j < nodes.length; j++) {

            //  Get the Position of the Node.
            var givenX = nodes[j].position.x;
            var givenY = nodes[j].position.y;
            var givenZ = nodes[j].position.z;

            //  Compute the New Coordinates of the vertices, by adding the scaled distance to the center.
            var newX = centerX + move.x + barycentricShrinkFactor * (givenX - centerX);
            var newY = centerY + move.y + barycentricShrinkFactor * (givenY - centerY);
            var newZ = centerZ + move.z + barycentricShrinkFactor * (givenZ - centerZ);

            //  Set the new positions.
            zonesGeoms[i].vertices[j].x = newX;
            zonesGeoms[i].vertices[j].y = newY;
            zonesGeoms[i].vertices[j].z = newZ;

            //  Mark for update.
            zonesClouds[i].geometry.verticesNeedUpdate = true;
        }
    }
}


// Convert the Cartesian vector(x,y,z) representation to the polar vector(x=cosTheta,y=sinTheta,z=sinPhi,w=r) representation
function cartesianToPolar(cartesian) {
    var polar = new THREE.Vector4();
    polar.w = cartesian.length();
    polar.x = cartesian.x / polar.w;
    polar.y = cartesian.y / polar.w;
    polar.z = cartesian.z / polar.w;
    return polar;
}

// Convert the polar vector(x=cosTheta,y=sinTheta,z=sinPhi,w=r) representation to the Cartesian vector(x,y,z) representation
function polarToCartesian(polar) {
    var cartesian = new THREE.Vector3();
    cartesian.x = polar.x * polar.w;
    cartesian.y = polar.y * polar.w;
    cartesian.z = polar.z * polar.w;
    return cartesian;
}

// Parse data from VTK format
// Adapted from an example of Three.js
function getDataFromVTK(data) {
    var loader = new THREE.VTKLoader();
    var geometry = loader.parse(data);
    var pointAtt = geometry.getAttribute("position");
    for (var i = 0; i < pointAtt.length / 3; i++) {
        nodes[i] = {
            "position": {
                "x": pointAtt.array[i * 3],
                "y": pointAtt.array[i * 3 + 1],
                "z": pointAtt.array[i * 3 + 2]
            }
        };
    }

    var faceAtt = geometry.getAttribute("index");
    for (var i = 0; i < faceAtt.length / 3; i++) {
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

    myCanvas = null; // The Canvas from the HTML document.

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

    zoneSelect = false; //  Boolean to see whether the user wants to select the Zone
    barycentricShrinkFactor = 0.0;
}
