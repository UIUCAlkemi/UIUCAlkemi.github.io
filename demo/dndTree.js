// Get JSON data
// Calculate total nodes, max label length
var totalNodes = 0;
var maxLabelLength = 0;
// variables for drag/drop
var selectedNode = null;
var draggingNode = null;
// panning variables
var panSpeed = 200;
var panBoundary = 20; // Within 20px from edges will pan when dragging.
// Misc. variables
var i = 0;
var duration = 750;
var root;

// size of the diagram
var viewerWidth = window.innerWidth;
var viewerHeight = window.innerHeight;

var tree = d3.layout.tree()
    .size([viewerHeight, viewerWidth]);

// define a d3 diagonal projection for use by the node paths later on.
var diagonal = d3.svg.diagonal()
    .projection(function(d) {
        return [d.y, d.x];
});

// A recursive helper function for performing some setup by walking through all nodes
var domainList = [];
var c10 = d3.scale.category10();

function visit(parent, visitFn, childrenFn) {
    if (!parent) return;

    var div = parent.info1.split(" ");
    var div1 = div[0];
    if(domainList.indexOf(div1) < 0) domainList.push(div1);


    visitFn(parent);

    var children = childrenFn(parent);
    if (children) {
        var count = children.length;
        for (var i = 0; i < count; i++) {
            visit(children[i], visitFn, childrenFn);
        }
    }
}    

function pan(domNode, direction) {
    var speed = panSpeed;
    if (panTimer) {
        clearTimeout(panTimer);
        translateCoords = d3.transform(svgGroup.attr("transform"));
        if (direction == 'left' || direction == 'right') {
            translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
            translateY = translateCoords.translate[1];
        } else if (direction == 'up' || direction == 'down') {
            translateX = translateCoords.translate[0];
            translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
        }
        scaleX = translateCoords.scale[0];
        scaleY = translateCoords.scale[1];
        scale = zoomListener.scale();
        svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
        d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
        zoomListener.scale(zoomListener.scale());
        zoomListener.translate([translateX, translateY]);
        panTimer = setTimeout(function() {
            pan(domNode, speed, direction);
        }, 50);
    }
}
// sort the tree according to the node names`
function sortTree() {
    tree.sort(function(a, b) {
        return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
    });
}
// Append a group which holds all nodes and which the zoom Listener can act upon.
var svgGroup;
var nodeColor;
var baseSvg;

// Define the zoom function for the zoomable tree
function zoom() {
    svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

<<<<<<< HEAD
function expand(d) {
    if (d._children) {
        d.children = d._children;
        d.children.forEach(expand);
        d._children = null;
=======
    var nodeColor = d3.scale.category10()
            .domain(domainList);
            //.range(c20);
    // var svg1 = d3.select("#color-Indicator")
    //          .append("svg")
    //          .attr("width", 50)
    //          .attr("height", 400);
             // .attr("class", "overlay");
    // svg1.selectAll("circle")
    // .data( d3.range(10) )
    // .enter()
    // .append("circle")
    // .attr("r", 18 )
    // .attr("cx", d3.scale.linear().domain([-1, 10]).range([0, 400]) )
    // .attr("cy", 25)
    // .attr("fill", c10 );
   // set legend
//    var legendRectSize = 18;
 //   var legendSpacing = 4;


    // sort the tree according to the node names

    function sortTree() {
        tree.sort(function(a, b) {
            return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
        });
>>>>>>> origin/master
    }
}

var overCircle = function(d) {
    selectedNode = d;
    updateTempConnector();
};
var outCircle = function(d) {
    selectedNode = null;
    updateTempConnector();
};


// Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

function centerNode(source) {
    scale = zoomListener.scale();
    x = -source.y0;
    y = -source.x0;
    x = x * scale + viewerWidth / 2;
    y = y * scale + viewerHeight / 2;
    d3.select('g').transition()
        .duration(duration)
        .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
    zoomListener.scale(scale);
    zoomListener.translate([x, y]);
}

// Toggle children function

function toggleChildren(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else if (d._children) {
        d.children = d._children;
        d._children = null;
    }
    return d;
}

// Toggle children on click.

function click(d) {
    if (d3.event.defaultPrevented) return; // click suppressed

        d = toggleChildren(d);

    update(d);
    centerNode(d);
}

function click2(d) {
    if (d3.event.defaultPrevented) return; // click suppressed
    d = hideText(d);
    update(d);
    centerNode(d);
}

function hideText(d) {
        var active   = d.active ? false : true;
      // d.enter().select("text").style("visibility", "visible") ;
                  d.active = active;

        return d;
}


function update(source) {
    // Compute the new height, function counts total children of root node and sets tree height accordingly.
    // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
    // This makes the layout more consistent.
    var levelWidth = [1];
    var childCount = function(level, n) {

        if (n.children && n.children.length > 0) {
            if (levelWidth.length <= level + 1) levelWidth.push(0);

            levelWidth[level + 1] += n.children.length;
            n.children.forEach(function(d) {
                childCount(level + 1, d);
            });
        }
    };
    childCount(0, root);
    var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line  
    tree = tree.size([newHeight, viewerWidth]);

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Set widths between levels based on maxLabelLength.
    nodes.forEach(function(d) {
        d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
        // alternatively to keep a fixed scale one can set a fixed depth per level
        // Normalize for fixed-depth by commenting out below line
        // d.y = (d.depth * 500); //500px per level.
    });

    // Update the nodes…
    node = svgGroup.selectAll("g.node")
        .data(nodes, function(d) {
            return d.id || (d.id = ++i);
        });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
       // .call(dragListener)
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        });
        // .on('click', click);

    nodeEnter.append("circle")
        .attr('class', 'nodeCircle')
        .attr("r", 0)
        .on('click', click)
        .style("fill", function(d) {
            // return d._children ? "lightsteelblue" : "#fff";
            var tag = d.info1.split(" ");
            return nodeColor(tag[0]);
        });

    nodeEnter.append("text")
        .attr("x", function(d) {
            return d.children || d._children ? -10 : 10;
        })
        .attr("dy", ".35em")
        .attr('class', 'nodeText')
        .attr("text-anchor", function(d) {
            return d.children || d._children ? "end" : "start";
        })
        .text(function(d) {
            // if(d.active) return "->";
            return d.active ? d.info1 + ", " + d.info2 +  ", " + d.info3 : "->";
        })
        .style("fill-opacity", 0)
        .on('click', click2)

    // phantom node to give us mouseover in a radius around it
    nodeEnter.append("circle")
        .attr('class', 'ghostCircle')
        .attr("r", 30)
        .attr("opacity", 0.2) // change this to zero to hide the target area
        .style("fill", "red")
        .attr('pointer-events', 'mouseover')
        .on("mouseover", function(node) {
            overCircle(node);
        })
        .on("mouseout", function(node) {
            outCircle(node);
        });

    // Update the text to reflect whether node has children or not.
    node.select("text.nodeText")
        .text(function(d) {
            return d.active ? d.info1 + ", " + d.info2 +  ", " + d.info3 : "->";
        });


    // Change the circle fill depending on whether it has children and is collapsed
    node.select("circle.nodeCircle")
        .attr("r", 4.5)
        .style("fill", function(d) {
            var tag = d.info1.split(" ");
            //return 
            // console.log(nodeColor(tag[0]));
            return d._children ? "lightsteelblue" : nodeColor(tag[0]);
        });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

    // Fade the text in
    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

    nodeExit.select("circle")
        .attr("r", 0);

    nodeExit.select("text")
        .style("fill-opacity", 0);

    // Update the links…
    var link = svgGroup.selectAll("path.link")
        .data(links, function(d) {
            return d.target.id;
        });

<<<<<<< HEAD
    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
            var o = {
                x: source.x0,
                y: source.y0
            };
            return diagonal({
                source: o,
                target: o
            });
        });
=======
        // Update the nodes…
        node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .call(dragListener)
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            });
            // .on('click', click);

        nodeEnter.append("circle")
            .attr('class', 'nodeCircle')
            .attr("r", 0)
            .on('click', click)
            .attr("data-legend", function (d) {
                var tag = d.info1.split(" ");
                return tag[0];
            })
            .style("fill", function(d) {
                // return d._children ? "lightsteelblue" : "#fff";
                var tag = d.info1.split(" ");
                return nodeColor(tag[0]);
            });
 

        nodeEnter.append("text")
            .attr("x", function(d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("dy", ".35em")
            .attr('class', 'nodeText')
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                // if(d.active) return "->";
                return d.active ? d.info1 + ", " + d.info2 +  ", " + d.info3 : "->";
            })
            .style("fill-opacity", 0)
            .on('click', click2)//function(d){
            // // if (d3.event.defaultPrevented) return; // click suppressed
            // // Determine if current line is visible
            // var active   = d.active ? false : true;
            //   // newOpacity = active ? 0 : 1;
            //   // if(active){
            //   //   node.select("text").text("->");
            //   //   // node.select("text") = null;
            //   // }
            //   // else{
            //   //   node.select("text").text(function(d) {
            //   //       return d.info1 + ", " + d.info2 +  ", " + d.info3;
            //   //   });
            //   //   // d.select("text") = d.select("_text");
            //   //   // d.select("_text") = null;
            //   // }
            // // Hide or show the elements
            // // d.select("text").style("opacity", newOpacity);
            // // d3.select("#blueAxis").style("opacity", newOpacity);
            // // Update whether or not the elements are active
            // d.active = active;
            // })

        // phantom node to give us mouseover in a radius around it
        nodeEnter.append("circle")
            .attr('class', 'ghostCircle')
            .attr("r", 30)
            .attr("opacity", 0.2) // change this to zero to hide the target area
            .style("fill", "red")
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function(node) {
                overCircle(node);
            })
            .on("mouseout", function(node) {
                outCircle(node);
            });
        
>>>>>>> origin/master

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
            var o = {
                x: source.x,
                y: source.y
            };
            return diagonal({
                source: o,
                target: o
            });
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// functin that resizes the tree and canvass
function resize() {
    width = window.innerWidth, height = window.innerHeight;
    baseSvg.attr("width", width).attr("height", height);
    tree.size([width, height]);
}

function show() {
    d3.json("data.json", function(error, treeData) {
        // Call visit function to establish maxLabelLength
        visit(treeData, function(d) {
            totalNodes++;
            maxLabelLength = Math.max(d.name.length, maxLabelLength);

        }, function(d) {
            return d.children && d.children.length > 0 ? d.children : null;
        });

        nodeColor = d3.scale.category10()
                .domain(domainList);

        // Sort the tree initially incase the JSON isn't in a sorted order.
        sortTree();

        // define the baseSvg, attaching a class for styling and the zoomListener
        baseSvg = d3.select("#tree-container").append("svg")
            .attr("width", viewerWidth)
            .attr("height", viewerHeight)
            .attr("class", "overlay")
            .call(zoomListener);

        svgGroup = baseSvg.append("g");

        // Define the root
        root = treeData;
        root.x0 = viewerHeight / 2;
        root.y0 = 0;

        // Layout the tree initially and center on the root node.
        update(root);
        centerNode(root);

<<<<<<< HEAD
        // Resize the window when the viewport changes
        d3.select(window).on("resize", resize);
    });
}
=======
        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        legend = svgGroup.append("g")
          .attr("class", "legend")
          .attr("transform", "translate(150,30)")
          .style("font-size", "12px")
          .call(d3.legend)
        /*
        //add legend
        var legend = svgGroup.selectAll('.legend')                     // NEW
          .data(color.domain())                                   // NEW
          .enter()                                                // NEW
          .append('g')                                            // NEW
          .attr('class', 'legend')                                // NEW
          .attr('transform', function (d, i) {                     // NEW
              var height = legendRectSize + legendSpacing;          // NEW
              var offset = height * color.domain().length / 2;     // NEW
              var horz = -2 * legendRectSize;                       // NEW
              var vert = i * height - offset;                       // NEW
              return 'translate(' + horz + ',' + vert + ')';        // NEW
          });                                                     // NEW

        legend.append('rect')                                     // NEW
          .attr('width', legendRectSize)                          // NEW
          .attr('height', legendRectSize)                         // NEW
          .style('fill', color)                                   // NEW
          .style('stroke', color);                                // NEW

        legend.append('text')                                     // NEW
          .attr('x', legendRectSize + legendSpacing)              // NEW
          .attr('y', legendRectSize - legendSpacing)              // NEW
          .text(function (d) { return d; });
          */
    }
>>>>>>> origin/master

show();
