var data = {
  id: "1",
  parent: null,
  children: [
    {
      id: "2",
      parent: 1
    },
    {
      id: "3",
      parent: 1,
      children: [
        {
          id: "4",
          parent: 3,
          children: [{ id: "7", parent: 4 }]
        },
        { id: "5", parent: 3 },
        { id: "6", parent: 3 }
      ]
    }
  ]
};
window.TreeAPI = {
  getData: function() {
    return new Promise(function(t) {
      setTimeout(function() {
        t(n);
      }, 1e3 * Math.random());
    });
  }
};

// Set the dimensions and margins of the diagram
var margin = { top: 30, right: 0, bottom: 50, left: 0 },
  width = 1500 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom,
  viewX = 0,
  viewY = 0;

var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("viewbox", viewX + " " + viewY + " " + height + " " + width)
  .append("g");

var i = 0,
  duration = 750,
  root;

// declares a tree layout and assigns the size
var treemap = d3.tree().size([height, width]);

// Assigns parent, children, height, depth
root = d3.hierarchy(data, function(d) {
  return d.children;
});
root.x0 = height / 2;
root.y0 = 0;

// Collapse after the second level
root.children.forEach(collapse);

update(root);

// Collapse the node and all it's children
function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}

function update(source) {
  // Assigns the x and y position for the nodes
  var data = treemap(root);

  // Compute the new tree layout.
  var nodes = data.descendants(),
    links = data.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * 100;
  });

  // Update the nodes...
  var node = svg.selectAll("g.node").data(nodes, function(d) {
    return d.id || (d.id = ++i);
  });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on("click", click);

  // Add rect for the nodes
  nodeEnter
    .append("rect")
    .attr("width", 50)
    .attr("height", 50)
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("class", "node")
    .style("fill", function(d) {
      return d._children;
    });

  // Add labels for the nodes
  nodeEnter
    .append("text")
    .attr("dy", "17")
    .attr("x", function(d) {
      return d.children || d._children ? 5 : 5;
    })
    .attr("text-anchor", function(d) {
      return d.children || d._children ? "end" : "end";
    })
    .text(function(d) {
      return d.data.id;
    });

  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate
    .transition()
    .duration(duration)
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    });

  // Update the node attributes and style
  nodeUpdate
    .select("rect.node")
    .attr("rx", 6)
    .attr("ry", 6)
    .style("fill", function(d) {
      return d._children ? "#1898FD" : "#1898FD";
    })
    .attr("cursor", "pointer");

  // Remove any exiting nodes
  var nodeExit = node
    .exit()
    .transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

  // On exit reduce the node rect size to 0
  nodeExit.select("rect");

  // On exit reduce the opacity of text labels
  nodeExit.select("text").style("fill-opacity", 0.2);

  // Update the links...
  var link = svg.selectAll("path.link").data(links, function(d) {
    return d.id;
  });

  // Enter any new links at the parent's previous position.
  var linkEnter = link
    .enter()
    .insert("path", "g")
    .attr("class", "link")
    .attr("d", function(d) {
      var o = { x: source.x0, y: source.y0 };
      return diagonal(o, o);
    });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);
  // Transition back to the parent element position
  linkUpdate
    .transition()
    .duration(duration)
    .attr("d", function(d) {
      return diagonal(d, d.parent);
    });

  // Transition to the proper position for the node
  nodeUpdate
    .transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  // Update the node attributes and style
  nodeUpdate
    .select("rect.node")
    .attr("x", -40)
    .attr("y", -30)
    .attr("width", 80)
    .attr("height", 70)
    .attr("cursor", "pointer");

  // Remove any exiting links
  var linkExit = link
    .exit()
    .transition()
    .duration(duration)
    .attr("d", function(d) {
      var o = { x: source.x, y: source.y };
      return diagonal(o, o);
    })
    .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {
    path = `M ${s.x} ${s.y}
            H ${d.x}
            L ${d.x} ${d.y}`;
    return path;
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }
}
