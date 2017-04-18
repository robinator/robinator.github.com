(function() {
  var Matrix,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Matrix = (function() {
    function Matrix(options) {
      this.options = options;
      this._process = bind(this._process, this);
      this.actualFile = this.options.actualFile;
      this.guessesFile = this.options.guessesFile;
      this.vis = d3.select('#matrix');
      this.draw();
    }

    Matrix.prototype._process = function() {
      var actual, eliminated, guess, i, j, len, pick, ref, results;
      ref = this.guesses;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        guess = ref[j];
        guess.score = 0;
        guess.pointsPossible = 30;
        eliminated = [];
        results.push((function() {
          var k, len1, ref1, ref2, results1;
          ref1 = guess.picks;
          results1 = [];
          for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
            pick = ref1[i];
            actual = this.actual[i];
            if (actual[1] !== '???') {
              eliminated.push(actual[1]);
            }
            pick[2] = 0;
            if (pick[0] === actual[0]) {
              guess.score += 1;
              pick[2] += 1;
              if (pick[1] === actual[2]) {
                guess.score += 1;
                results1.push(pick[2] += 1);
              } else {
                results1.push(guess.pointsPossible -= 1);
              }
            } else if (actual[0] !== '???' || (ref2 = pick[0], indexOf.call(eliminated, ref2) >= 0)) {
              pick[2] -= 1;
              results1.push(guess.pointsPossible -= 2);
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        }).call(this));
      }
      return results;
    };

    Matrix.prototype.draw = function() {
      return d3.json(this.actualFile, (function(_this) {
        return function(json) {
          _this.actual = json;
          _this.maxScore = _this.actual.length * 2;
          return d3.json(_this.guessesFile, function(json) {
            var td, tr;
            _this.guesses = json;
            _this._process();
            tr = d3.select('tbody').selectAll('tr').data(_this.guesses).enter().append('tr').sort(function(a, b) {
              if (a.score < b.score) {
                return 1;
              } else if (a.score === b.score) {
                return 0;
              } else {
                return -1;
              }
            });
            return td = tr.selectAll('td').data(function(d) {
              var arr;
              arr = d.picks;
              arr.unshift(d.pointsPossible);
              arr.unshift(d.score);
              arr.unshift(d.name);
              return arr;
            }).enter().append('td').classed('wrong', function(d) {
              return typeof d === 'object' && d[2] === -1;
            }).classed('right', function(d) {
              return typeof d === 'object' && d[2] === 1;
            }).classed('and1', function(d) {
              return typeof d === 'object' && d[2] === 2;
            }).classed('name', function(d) {
              return typeof d === 'string';
            }).attr('class', function(d) {
              if (typeof d === 'object') {
                return d[0].toLowerCase();
              }
            }).text(function(d) {
              if (typeof d === 'string') {
                return d;
              } else if (typeof d === 'number') {
                return d;
              } else {
                return d[0] + " in " + d[1];
              }
            });
          });
        };
      })(this));
    };

    return Matrix;

  })();

  window.Matrix = Matrix;

}).call(this);
