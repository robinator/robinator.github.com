(function() {
  var Bracket,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Bracket = (function() {
    function Bracket(options) {
      this.options = options;
      this._update = bind(this._update, this);
      this._rebuildChildren = bind(this._rebuildChildren, this);
      this._calcLeft = bind(this._calcLeft, this);
      this._elbow = bind(this._elbow, this);
      this.width = window.innerWidth * 0.95;
      this.halfWidth = this.width / 2;
      this.height = 500;
      this.i = 0;
      this.duration = 500;
      this.data = this.options.data;
      this.tree = d3.layout.tree().size([this.height, this.width]);
      this.vis = d3.select('#bracket').append('svg').attr('width', this.width).attr('height', this.height).append('g');
      this.draw();
    }

    Bracket.prototype._elbow = function(d, i) {
      var hw, hy, source, target;
      source = this._calcLeft(d.source);
      target = this._calcLeft(d.target);
      hy = (target.y - source.y) / 2;
      if (d.isRight) {
        hw = -hy;
      }
      return "M" + source.y + "," + source.x + "H" + (source.y + hy) + "V" + target.x + "H" + target.y;
    };

    Bracket.prototype._calcLeft = function(d) {
      var l;
      l = d.y;
      if (!d.isRight) {
        l = d.y - this.halfWidth;
        l = this.halfWidth - l;
      }
      return {
        x: d.x,
        y: l
      };
    };

    Bracket.prototype._getChildren = function(d) {
      var a, game, i, j, k, len, len1, ref, ref1;
      a = [];
      if (d.west) {
        ref = d.west;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          game = ref[i];
          d.west[i].isRight = false;
          d.west[i].parent = d;
          a.push(d.west[i]);
        }
      }
      if (d.east) {
        ref1 = d.east || [];
        for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
          game = ref1[i];
          d.east[i].isRight = true;
          d.east[i].parent = d;
          a.push(d.east[i]);
        }
      }
      return a;
    };

    Bracket.prototype._rebuildChildren = function(node) {
      node.children = this._getChildren(node);
      if (node.children) {
        return node.children.forEach(this._rebuildChildren);
      }
    };

    Bracket.prototype._toArray = function(item, arr) {
      var c, j, len, ref;
      arr = arr || [];
      arr.push(item);
      ref = item.children || [];
      for (j = 0, len = ref.length; j < len; j++) {
        c = ref[j];
        this._toArray(c, arr);
      }
      return arr;
    };

    Bracket.prototype._update = function(source) {
      var link, node, nodeEnter, nodeUpdate, nodes;
      nodes = this._toArray(source);
      nodes.forEach((function(_this) {
        return function(d) {
          return d.y = d.depth * 140 + _this.halfWidth;
        };
      })(this));
      node = this.vis.selectAll('g.node').data(nodes, (function(_this) {
        return function(d) {
          return d.id || (d.id = ++_this.i);
        };
      })(this));
      nodeEnter = node.enter().append('g').attr('class', 'node').classed('edge', function(d) {
        return d.children.length === 0;
      }).classed('east', function(d) {
        return d.isRight;
      }).classed('west', function(d) {
        return !d.isRight;
      }).attr('transform', function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      });
      nodeEnter.append('circle').attr('r', 1e-6);
      nodeEnter.append('text').text(function(d) {
        if (d.rank != null) {
          if (d.isRight) {
            return d.name + " (" + d.rank + ")";
          } else {
            return "(" + d.rank + ") " + d.name;
          }
        } else {
          return d.name;
        }
      }).style('fill-opacity', 1e-6);
      nodeUpdate = node.transition().duration(this.duration).attr('transform', (function(_this) {
        return function(d) {
          var p;
          p = _this._calcLeft(d);
          return "translate(" + p.y + "," + p.x + ")";
        };
      })(this));
      nodeUpdate.select('circle').attr('r', 4.5).style('fill', function(d) {
        if (d.games != null) {
          return 'lightsteelblue';
        } else {
          return '#fff';
        }
      }).style('opacity', function(d) {
        if (d.children.length === 0) {
          return 1e-6;
        } else {
          return 1;
        }
      });
      nodeUpdate.select('text').style('fill-opacity', 1).attr('dy', function(d) {
        if (d.children.length === 0) {
          return -5;
        } else {
          return -15;
        }
      }).attr('text-anchor', function(d) {
        if (d.children.length === 0) {
          if (d.isRight) {
            return 'end';
          } else {
            return 'start';
          }
        } else {
          return 'middle';
        }
      });
      link = this.vis.selectAll('path.link').data(this.tree.links(nodes), function(d) {
        return d.target.id;
      });
      link.enter().insert('path', 'g').attr('class', 'link').attr('d', (function(_this) {
        return function(d) {
          var o;
          o = {
            x: source.x0,
            y: source.y0
          };
          return _this._elbow({
            source: o,
            target: o
          });
        };
      })(this));
      link.transition().duration(this.duration).attr('d', this._elbow);
      return link.exit().transition().duration(this.duration).attr('d', (function(_this) {
        return function(d) {
          var o;
          o = _this._calcLeft(d.source || source);
          if (d.source.isRight) {
            return o.y -= _this.halfWidth - (d.target.y - d.source.y);
          } else {
            o.y += _this.halfWidth - (d.target.y - d.source.y);
            return _this._elbow({
              source: o,
              target: o
            });
          }
        };
      })(this)).remove();
    };

    Bracket.prototype.draw = function() {
      return d3.json(this.data, (function(_this) {
        return function(json) {
          var root, t1, t2;
          root = json;
          root.x0 = _this.height / 2;
          root.y0 = _this.width / 2;
          t1 = d3.layout.tree().size([_this.height, _this.halfWidth]).children(function(d) {
            return d.west;
          });
          t2 = d3.layout.tree().size([_this.height, _this.halfWidth]).children(function(d) {
            return d.east;
          });
          t1.nodes(root);
          t2.nodes(root);
          _this._rebuildChildren(root);
          root.isRight = false;
          return _this._update(root);
        };
      })(this));
    };

    return Bracket;

  })();

  window.Bracket = Bracket;

}).call(this);
