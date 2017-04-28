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
