(function() {
  var Matrix;

  Matrix = (function() {

    function Matrix(options) {
      this.options = options;
      this.actualFile = 'public/data/actual.json';
      this.guessesFile = 'public/data/guesses.json';
      this.vis = d3.select('#matrix');
      this.loadActual();
    }

    Matrix.prototype.loadActual = function() {
      var _this = this;
      return d3.json(this.actualFile, function(json) {
        _this.actual = json;
        return _this.maxScore = _this.actual.length * 2;
      });
    };

    Matrix.prototype.process = function() {
      var actual, guess, i, pick, _i, _len, _ref, _results;
      _ref = this.guesses;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        guess = _ref[_i];
        guess.score = 0;
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = guess.picks;
          _results1 = [];
          for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
            pick = _ref1[i];
            actual = this.actual[i];
            if (pick[0] === actual[0]) {
              guess.score += 1;
              if (pick[1] === actual[1]) {
                guess.score += 1;
              }
            }
            _results1.push(console.log("" + guess.name + "(" + i + ") - pick: " + pick + ", actual: " + actual + ", score: " + guess.score + " / " + this.maxScore));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Matrix.prototype.draw = function() {
      var _this = this;
      return d3.json(this.guessesFile, function(json) {
        var td, tr;
        _this.guesses = json;
        _this.process();
        console.log(_this.guesses);
        tr = d3.select('tbody').selectAll('tr').data(_this.guesses).enter().append('tr');
        return td = tr.selectAll('td').data(function(d) {
          var arr;
          arr = d.picks;
          arr.unshift(d.score);
          arr.unshift(d.name);
          return arr;
        }).enter().append('td').classed('wrong', function(d) {
          return typeof d !== 'string' && false;
        }).classed('right', function(d) {
          return typeof d !== 'string' && false;
        }).classed('and1', function(d) {
          return typeof d !== 'string' && false;
        }).classed('name', function(d) {
          return typeof d === 'string';
        }).text(function(d) {
          if (typeof d === 'string') {
            return d;
          } else if (typeof d === 'number') {
            return "" + d + " / " + _this.maxScore;
          } else {
            return "" + d[0] + " in " + d[1];
          }
        });
      });
    };

    return Matrix;

  })();

  window.matrix = new Matrix;

  matrix.draw();

}).call(this);
