// http://blockses.appspot.com/2503502
var click = function click(d) {
  console.log(d);
  window.foop = d;
}
var calcLeft = function(d){
  var l = d.y;
  if(!d.isRight){
    l = d.y-halfWidth;
    l = halfWidth - l;
  }
  return {x : d.x, y : l};
};
var toArray = function(item, arr) {
  arr = arr || [];
  var i = 0, l = item.children ? item.children.length : 0;
  arr.push(item);
  for (; i < l; i++) {
    toArray(item.children[i], arr);
  }
  return arr;
};
var elbow = function (d, i) {
  var source = calcLeft(d.source);
  var target = calcLeft(d.target);
  if (typeof target.y == 'object') {
    console.log(target)
  }
  var hy = (target.y-source.y)/2;
  if (d.isRight) hy = -hy;
  return "M" + source.y + "," + source.x
             + "H" + (source.y+hy)
             + "V" + target.x + "H" + target.y;
};
var getChildren = function(d){
  var a = [];
  if(d.west) for(var i = 0; i < d.west.length; i++) {
    d.west[i].isRight = false;
    d.west[i].parent = d;
    a.push(d.west[i]);
  }
  if(d.east) for(var i = 0; i < d.east.length; i++) {
    d.east[i].isRight = true;
    d.east[i].parent = d;
    a.push(d.east[i]);
  }
  return a.length?a:null;
}
function update(source) {
  // Compute the new tree layout.
  var nodes = toArray(source);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 140 + halfWidth; });

  // Update the nodes…
  var node = vis.selectAll('g.node')
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', function(d) { return 'translate(' + source.y0 + ',' + source.x0 + ')'; })
      .on('click', click);

  nodeEnter.append('circle')
      .attr('r', 1e-6)
      .style('fill', function(d) { return d._children ? 'lightsteelblue' : '#fff'; });

  nodeEnter.append('text')
      .attr('dy', function(d) { return d.isRight?14:-8;})
      .attr('text-anchor', 'middle')
      .text(function(d) { return d.name; })
      .style('fill-opacity', 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr('transform', function(d) { p = calcLeft(d); return 'translate(' + p.y + ',' + p.x + ')'; });

  nodeUpdate.select('circle')
      .attr('r', 4.5)
      .style('fill', function(d) { return d._children ? 'lightsteelblue' : '#fff'; });

  nodeUpdate.select('text')
      .style('fill-opacity', 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr('transform', function(d) { p = calcLeft(d.parent || source); return 'translate(' + p.y + ',' + p.x + ')'; })
      .remove();

  nodeExit.select('circle')
      .attr('r', 1e-6);

  nodeExit.select('text')
      .style('fill-opacity', 1e-6);

  // Update the links...
  var link = vis.selectAll('path.link')
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert('path', 'g')
      .attr('class', 'link')
      .attr('d', function(d) {
        var o = { x: source.x0, y: source.y0 };
        return connector({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr('d', connector);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr('d', function(d) {
        var o = calcLeft(d.source || source);
        if (d.source.isRight) {
          o.y -= halfWidth - (d.target.y - d.source.y);
        }
        else {
          o.y += halfWidth - (d.target.y - d.source.y);
        }
        return connector({source: o, target: o});
      })
      .remove();

}

var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 1024 - margin.left - margin.right,
    halfWidth = width / 2,
    height = 500 - margin.top - margin.bottom,
    i = 0,
    duration = 500,
    root;

var tree = d3.layout.tree().size([height, width]);

var diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });

var connector = elbow;

var vis = d3.select('#chart').append('svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

d3.json('public/bracket.json', function(json) {
  root = json;
  root.x0 = height / 2;
  root.y0 = width / 2;

  var t1 = d3.layout.tree().size([height, halfWidth]).children(function(d) { return d.west; }),
      t2 = d3.layout.tree().size([height, halfWidth]).children(function(d) { return d.east; });
  t1.nodes(root);
  t2.nodes(root);

  var rebuildChildren = function(node) {
    node.children = getChildren(node);
    if (node.children) {
      node.children.forEach(rebuildChildren);
    }
  }
  rebuildChildren(root);
  root.isRight = false;
  update(root);

});