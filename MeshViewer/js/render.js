var scene = null; // Three.js - Scene

var camera = null; // Three.js - Camera

var controls = null; // Three.js - Controls from TrackballControls.js

var renderer = null; // Three.js - Renderer.

function initializeCameras() {
    camera = new THREE.PerspectiveCamera(60.0, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 1000);
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
    renderer = new THREE.WebGLRenderer({
        antialias: true, // Set antialiasing to be true
        canvas: $("canvas")[0],
        alpha: true
    });

    renderer.autoClear = false;

    //  The Callbacks on the renderer - for mouse down, mouse move, move up
    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);

    resizeRenderer(CANVAS_WIDTH, CANVAS_HEIGHT);
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

    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);

    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        //console.log(intersects)
        var obj_name = intersects[0].object.name;
        //console.log(obj_name);
        //console.log(obj_name.split(" ")[2]);
        fillSelectedZoneInformation(obj_name.split(" ")[2]);
    }

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

function initializeMeshes() {

    for(var zone in ZONES){
        scene.add(ZONES[zone].mesh);
    }
}
