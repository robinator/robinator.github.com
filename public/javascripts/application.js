(function() {
  $(document).ready(function() {
    var line, paper;
    paper = Raphael('paper', 900, 500);
    return line = paper.rect(50, 50, 10, 300).attr({
      stroke: 'none',
      fill: '#38d84e'
    });
  });
}).call(this);
